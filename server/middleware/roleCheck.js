const Project = require('../models/Project');

// Check if user is a member of the project
const projectMember = async (req, res, next) => {
  try {
    const projectId = req.params.id || req.params.projectId || req.body.project;

    if (!projectId) {
      return res.status(400).json({ message: 'Project ID is required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isMember = project.members.some(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ message: 'Access denied. You are not a member of this project.' });
    }

    req.project = project;
    req.memberRole = project.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    ).role;

    next();
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// Check if user is an admin of the project
const projectAdmin = async (req, res, next) => {
  try {
    const projectId = req.params.id || req.params.projectId || req.body.project;

    if (!projectId) {
      return res.status(400).json({ message: 'Project ID is required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const member = project.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (!member || member.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    req.project = project;
    req.memberRole = 'admin';

    next();
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { projectMember, projectAdmin };
