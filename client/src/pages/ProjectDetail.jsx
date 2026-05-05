import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import KanbanBoard from '../components/KanbanBoard';
import Modal from '../components/Modal';
import './ProjectDetail.css';

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTask, setShowTask] = useState(false);
  const [showMember, setShowMember] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showTaskDeleteConfirm, setShowTaskDeleteConfirm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [showMemberDeleteConfirm, setShowMemberDeleteConfirm] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [error, setError] = useState('');

  // Task form
  const [taskForm, setTaskForm] = useState({ title: '', description: '', assignee: '', priority: 'medium', dueDate: '', status: 'todo' });
  // Member form
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('member');

  const isAdmin = project?.members?.find(m => m.user?._id === user?._id)?.role === 'admin';

  const fetchAll = async () => {
    try {
      const [pRes, tRes] = await Promise.all([api.get(`/projects/${id}`), api.get(`/tasks?project=${id}`)]);
      setProject(pRes.data);
      setTasks(tRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, [id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/tasks', { ...taskForm, project: id });
      setShowTask(false);
      setTaskForm({ title: '', description: '', assignee: '', priority: 'medium', dueDate: '', status: 'todo' });
      fetchAll();
    } catch (err) { setError(err.response?.data?.message || 'Failed'); }
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.put(`/tasks/${editingTask._id}`, taskForm);
      setEditingTask(null);
      setShowEdit(false);
      fetchAll();
    } catch (err) { setError(err.response?.data?.message || 'Failed'); }
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    try { 
      await api.delete(`/tasks/${taskToDelete}`); 
      setShowTaskDeleteConfirm(false);
      setTaskToDelete(null);
      fetchAll(); 
    } catch (err) { 
      alert(err.response?.data?.message || 'Failed to delete task'); 
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post(`/projects/${id}/members`, { email: memberEmail, role: memberRole });
      setShowMember(false);
      setMemberEmail('');
      fetchAll();
    } catch (err) { setError(err.response?.data?.message || 'Failed'); }
  };

  const handleRemoveMember = async () => {
    if (!memberToDelete) return;
    try { 
      await api.delete(`/projects/${id}/members/${memberToDelete}`); 
      setShowMemberDeleteConfirm(false);
      setMemberToDelete(null);
      fetchAll(); 
    } catch (err) { 
      alert(err.response?.data?.message || 'Failed to remove member'); 
    }
  };

  const handleDeleteProject = async () => {
    try { 
      await api.delete(`/projects/${id}`); 
      navigate('/projects'); 
    } catch (err) { 
      alert(err.response?.data?.message || 'Failed to delete project'); 
      setShowDeleteConfirm(false);
    }
  };

  const openEditTask = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title, description: task.description || '', assignee: task.assignee?._id || '',
      priority: task.priority, dueDate: task.dueDate ? task.dueDate.split('T')[0] : '', status: task.status,
    });
    setError('');
    setShowEdit(true);
  };

  if (loading) return <div className="loading-page"><div className="spinner"></div></div>;
  if (!project) return <div className="empty-state"><p>Project not found</p></div>;

  return (
    <div className="project-detail fade-in">
      <div className="page-header">
        <div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/projects')}>← Back</button>
          <h1><span>{project.name}</span></h1>
          {project.description && <p className="project-detail-desc">{project.description}</p>}
        </div>
        <div className="header-actions">
          {isAdmin && <button className="btn btn-primary" onClick={() => { setShowTask(true); setError(''); }}>+ Add Task</button>}
          {isAdmin && <button className="btn btn-secondary" onClick={() => { setShowMember(true); setError(''); }}>+ Add Member</button>}
          {isAdmin && <button className="btn btn-danger btn-sm" onClick={() => setShowDeleteConfirm(true)}>Delete Project</button>}
        </div>
      </div>

      {/* Members */}
      <div className="members-bar">
        <span className="members-label">Team ({project.members?.length}):</span>
        <div className="members-list">
          {project.members?.map((m) => (
            <div key={m.user?._id} className="member-chip">
              <div className="avatar avatar-sm">{m.user?.name?.charAt(0).toUpperCase()}</div>
              <span>{m.user?.name}</span>
              <span className={`badge badge-${m.role}`}>{m.role}</span>
              {isAdmin && m.user?._id !== project.owner?._id && (
                <button className="chip-remove" onClick={() => { setMemberToDelete(m.user?._id); setShowMemberDeleteConfirm(true); }}>✕</button>
              )}
            </div>
          ))}
        </div>
      </div>

      <KanbanBoard tasks={tasks} onTaskClick={openEditTask} />

      {/* Create Task Modal */}
      <Modal isOpen={showTask} onClose={() => setShowTask(false)} title="Create Task">
        <form onSubmit={handleCreateTask}>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group">
            <label>Title</label>
            <input value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} placeholder="Task title" required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} placeholder="Details..." rows={3} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Assignee</label>
              <select value={taskForm.assignee} onChange={(e) => setTaskForm({ ...taskForm, assignee: e.target.value })} disabled={!isAdmin}>
                <option value="">Unassigned</option>
                {project.members?.map((m) => <option key={m.user?._id} value={m.user?._id}>{m.user?.name}</option>)}
              </select>
              {!isAdmin && <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.2rem', display: 'block' }}>Only admins can assign tasks</small>}
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}>
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Due Date</label>
            <input type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowTask(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create Task</button>
          </div>
        </form>
      </Modal>

      {/* Edit Task Modal */}
      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Edit Task">
        <form onSubmit={handleUpdateTask}>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group">
            <label>Title</label>
            <input value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} required disabled={!isAdmin} />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} rows={3} disabled={!isAdmin} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Status</label>
              <select 
                value={taskForm.status} 
                onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                disabled={!isAdmin && editingTask?.assignee?._id !== user?._id}
              >
                <option value="todo">To Do</option><option value="in-progress">In Progress</option><option value="done">Done</option>
              </select>
              {!isAdmin && editingTask?.assignee?._id !== user?._id && (
                <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.2rem', display: 'block' }}>Only the assignee can change status</small>
              )}
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })} disabled={!isAdmin}>
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Assignee</label>
              <select value={taskForm.assignee} onChange={(e) => setTaskForm({ ...taskForm, assignee: e.target.value })} disabled={!isAdmin}>
                <option value="">Unassigned</option>
                {project.members?.map((m) => <option key={m.user?._id} value={m.user?._id}>{m.user?.name}</option>)}
              </select>
              {!isAdmin && <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.2rem', display: 'block' }}>Only admins can change details</small>}
            </div>
            <div className="form-group">
              <label>Due Date</label>
              <input type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} disabled={!isAdmin} />
            </div>
          </div>
          <div className="modal-actions">
            {isAdmin && <button type="button" className="btn btn-danger btn-sm" onClick={() => { setTaskToDelete(editingTask._id); setShowEdit(false); setShowTaskDeleteConfirm(true); }}>Delete</button>}
            <div style={{ flex: 1 }}></div>
            <button type="button" className="btn btn-secondary" onClick={() => setShowEdit(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showMember} onClose={() => setShowMember(false)} title="Add Team Member">
        <form onSubmit={handleAddMember}>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" value={memberEmail} onChange={(e) => setMemberEmail(e.target.value)} placeholder="colleague@email.com" required />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select value={memberRole} onChange={(e) => setMemberRole(e.target.value)}>
              <option value="member">Member</option><option value="admin">Admin</option>
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowMember(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Add Member</button>
          </div>
        </form>
      </Modal>

      {/* Delete Project Modal */}
      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Delete Project">
        <div style={{ padding: '1rem 0' }}>
          <p style={{ marginBottom: '1rem' }}>Are you sure you want to delete <strong>{project.name}</strong>?</p>
          <p className="error-msg">This action cannot be undone. All tasks and data associated with this project will be permanently removed.</p>
        </div>
        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
          <button type="button" className="btn btn-danger" onClick={handleDeleteProject}>Yes, Delete Project</button>
        </div>
      </Modal>

      {/* Delete Task Modal */}
      <Modal isOpen={showTaskDeleteConfirm} onClose={() => { setShowTaskDeleteConfirm(false); setTaskToDelete(null); }} title="Delete Task">
        <div style={{ padding: '1rem 0' }}>
          <p style={{ marginBottom: '1rem' }}>Are you sure you want to delete this task?</p>
          <p className="error-msg">This action cannot be undone.</p>
        </div>
        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={() => { setShowTaskDeleteConfirm(false); setTaskToDelete(null); }}>Cancel</button>
          <button type="button" className="btn btn-danger" onClick={handleDeleteTask}>Yes, Delete Task</button>
        </div>
      </Modal>

      {/* Remove Member Modal */}
      <Modal isOpen={showMemberDeleteConfirm} onClose={() => { setShowMemberDeleteConfirm(false); setMemberToDelete(null); }} title="Remove Member">
        <div style={{ padding: '1rem 0' }}>
          <p style={{ marginBottom: '1rem' }}>Are you sure you want to remove this member from the project?</p>
          <p>They will lose access to the project and its tasks.</p>
        </div>
        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={() => { setShowMemberDeleteConfirm(false); setMemberToDelete(null); }}>Cancel</button>
          <button type="button" className="btn btn-danger" onClick={handleRemoveMember}>Yes, Remove Member</button>
        </div>
      </Modal>
    </div>
  );
}
