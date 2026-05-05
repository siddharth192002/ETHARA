import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';
import Modal from '../components/Modal';
import './MyTasks.css';

export default function MyTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [editingTask, setEditingTask] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [taskForm, setTaskForm] = useState({});
  const [projectMembers, setProjectMembers] = useState([]);

  const fetchTasks = () => {
    api.get(`/tasks?assignee=${user._id}`).then((res) => setTasks(res.data)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchTasks(); }, []);

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);

  const openEdit = async (task) => {
    setEditingTask(task);
    setTaskForm({ title: task.title, description: task.description || '', status: task.status, priority: task.priority, dueDate: task.dueDate ? task.dueDate.split('T')[0] : '' });
    try { const res = await api.get(`/projects/${task.project?._id || task.project}`); setProjectMembers(res.data.members || []); } catch { setProjectMembers([]); }
    setShowEdit(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try { await api.put(`/tasks/${editingTask._id}`, taskForm); setShowEdit(false); fetchTasks(); } catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <div className="loading-page"><div className="spinner"></div></div>;

  return (
    <div className="my-tasks-page fade-in">
      <div className="page-header">
        <h1><span>My Tasks</span></h1>
        <div className="filter-bar">
          {['all', 'todo', 'in-progress', 'done'].map(f => (
            <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : f === 'todo' ? 'To Do' : f === 'in-progress' ? 'In Progress' : 'Done'}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state"><div className="icon">✅</div><p>{filter === 'all' ? 'No tasks assigned to you yet' : `No ${filter} tasks`}</p></div>
      ) : (
        <div className="tasks-list">
          {filtered.map(t => <TaskCard key={t._id} task={t} onClick={openEdit} />)}
        </div>
      )}

      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Edit Task">
        <form onSubmit={handleUpdate}>
          <div className="form-group"><label>Title</label><input value={taskForm.title || ''} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} required /></div>
          <div className="form-group"><label>Description</label><textarea value={taskForm.description || ''} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} rows={3} /></div>
          <div className="form-row">
            <div className="form-group"><label>Status</label>
              <select value={taskForm.status} onChange={e => setTaskForm({ ...taskForm, status: e.target.value })}>
                <option value="todo">To Do</option><option value="in-progress">In Progress</option><option value="done">Done</option>
              </select>
            </div>
            <div className="form-group"><label>Priority</label>
              <select value={taskForm.priority} onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}>
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
              </select>
            </div>
          </div>
          <div className="form-group"><label>Due Date</label><input type="date" value={taskForm.dueDate || ''} onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })} /></div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowEdit(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
