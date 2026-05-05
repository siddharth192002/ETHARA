const { validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Get tasks (filterable)
// @route   GET /api/tasks
// @access  Protected
const getTasks = async (req, res) => {
  try {
    const { project, status, assignee, priority, search } = req.query;

    // Build filter - only show tasks from user's projects
    const userProjects = await Project.find({ 'members.user': req.user._id }).select('_id');
    const projectIds = userProjects.map((p) => p._id);

    const filter = { project: { $in: projectIds } };

    if (project) filter.project = project;
    if (status) filter.status = status;
    if (assignee) filter.assignee = assignee;
    if (priority) filter.priority = priority;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const tasks = await Task.find(filter)
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('project', 'name')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Protected
const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('project', 'name');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user is member of the project
    const project = await Project.findById(task.project._id);
    const isMember = project.members.some(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a task
// @route   POST /api/tasks
// @access  Protected (project admin)
const createTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, project, assignee, priority, dueDate, status } = req.body;

    // Check user is member of project and is admin
    const proj = await Project.findById(project);
    if (!proj) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const member = proj.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (!member) {
      return res.status(403).json({ message: 'You must be a member of this project' });
    }

    if (member.role !== 'admin') {
      return res.status(403).json({ message: 'Only project admins can create tasks' });
    }

    // If assigning, verify assignee is project member
    if (assignee) {
      const assigneeIsMember = proj.members.some(
        (m) => m.user.toString() === assignee
      );
      if (!assigneeIsMember) {
        return res.status(400).json({ message: 'Assignee must be a project member' });
      }
    }

    const task = await Task.create({
      title,
      description,
      project,
      assignee: assignee || null,
      createdBy: req.user._id,
      priority: priority || 'medium',
      dueDate: dueDate || null,
      status: status || 'todo',
    });

    const populated = await Task.findById(task._id)
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('project', 'name');

    res.status(201).json(populated);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Protected (project member)
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check user is member of the project
    const project = await Project.findById(task.project);
    const isMember = project.members.some(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { title, description, assignee, status, priority, dueDate } = req.body;
    const memberRole = project.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    ).role;

    // If assignee is changing, verify user is admin
    if (assignee !== undefined && assignee !== (task.assignee?.toString() || null)) {
      if (memberRole !== 'admin') {
        return res.status(403).json({ message: 'Only project admins can change task assignments' });
      }
    }

    const updates = {};
    if (status) {
      // Members can only update status of tasks assigned to them
      if (memberRole !== 'admin' && task.assignee?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You can only change the status of tasks assigned to you' });
      }
      updates.status = status;
    }

    // Only admins can update these fields
    if (memberRole === 'admin') {
      if (title) updates.title = title;
      if (description !== undefined) updates.description = description;
      if (priority) updates.priority = priority;
      if (dueDate !== undefined) updates.dueDate = dueDate || null;
      if (assignee !== undefined) {
        // Verify assignee is project member
        if (assignee) {
          const assigneeIsMember = project.members.some(
            (m) => m.user.toString() === assignee
          );
          if (!assigneeIsMember) {
            return res.status(400).json({ message: 'Assignee must be a project member' });
          }
        }
        updates.assignee = assignee || null;
      }
    } else {
      // If member tried to update restricted fields, we could either error or just ignore them.
      // Given the requirement, I'll restrict checking if they tried to change other things or just ignore.
      // To be safe and clear, let's just ignore other fields and only take status.
      // (The logic above already does this by only adding fields if role is admin)
    }

    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    )
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('project', 'name');

    res.json(updated);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Protected (project admin)
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check user is admin of the project
    const project = await Project.findById(task.project);
    const member = project.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (!member || member.role !== 'admin') {
      return res.status(403).json({ message: 'Only project admins can delete tasks' });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json({ message: 'Task deleted' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/tasks/dashboard
// @access  Protected
const getDashboard = async (req, res) => {
  try {
    // Get user's projects
    const userProjects = await Project.find({ 'members.user': req.user._id }).select('_id name');
    const projectIds = userProjects.map((p) => p._id);

    console.log(`Dashboard for user ${req.user._id}: ${userProjects.length} projects, IDs: ${projectIds}`);

    // Task counts by status
    const statusCounts = await Task.aggregate([
      { $match: { project: { $in: projectIds } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const stats = { todo: 0, 'in-progress': 0, done: 0, total: 0 };
    statusCounts.forEach((sc) => {
      stats[sc._id] = sc.count;
      stats.total += sc.count;
    });

    // Overdue tasks
    const overdueTasks = await Task.find({
      project: { $in: projectIds },
      dueDate: { $lt: new Date() },
      status: { $ne: 'done' },
    })
      .populate('assignee', 'name email avatar')
      .populate('project', 'name')
      .sort({ dueDate: 1 })
      .limit(10);

    // My tasks (assigned to me across all projects)
    const myTasks = await Task.find({
      project: { $in: projectIds },
      assignee: req.user._id,
      status: { $ne: 'done' },
    })
      .populate('project', 'name')
      .populate('assignee', 'name email avatar')
      .sort({ dueDate: 1, priority: -1 })
      .limit(10);

    // Recent tasks - all tasks from user's projects sorted by last update
    const recentTasks = await Task.find({
      project: { $in: projectIds },
    })
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('project', 'name')
      .sort({ updatedAt: -1 })
      .limit(10);

    console.log(`Dashboard results - Stats: ${JSON.stringify(stats)}, Recent: ${recentTasks.length}, My: ${myTasks.length}, Overdue: ${overdueTasks.length}`);

    // Priority counts
    const priorityCounts = await Task.aggregate([
      { $match: { project: { $in: projectIds }, status: { $ne: 'done' } } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);

    const priorities = { low: 0, medium: 0, high: 0 };
    priorityCounts.forEach((pc) => {
      priorities[pc._id] = pc.count;
    });

    res.json({
      stats,
      priorities,
      overdueTasks,
      myTasks,
      recentTasks,
      projectCount: userProjects.length,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getDashboard,
};
