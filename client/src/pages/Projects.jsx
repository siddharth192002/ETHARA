import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import ProjectCard from '../components/ProjectCard';
import Modal from '../components/Modal';
import './Projects.css';

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const isAdmin = user?.role === 'admin';

  const fetchProjects = () => {
    api.get('/projects').then((res) => setProjects(res.data)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Project name is required'); return; }
    setCreating(true);
    setError('');
    try {
      await api.post('/projects', { name: name.trim(), description: desc.trim() });
      setShowCreate(false);
      setName('');
      setDesc('');
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <div className="loading-page"><div className="spinner"></div></div>;

  return (
    <div className="projects-page fade-in">
      <div className="page-header">
        <h1><span>Projects</span></h1>
        {isAdmin && <button className="btn btn-primary" onClick={() => setShowCreate(true)} id="create-project-btn">+ New Project</button>}
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📁</div>
          <p>No projects yet.</p>
          {isAdmin && <button className="btn btn-primary" onClick={() => setShowCreate(true)}>Create Project</button>}
        </div>
      ) : (
        <div className="grid grid-3 projects-grid">
          {projects.map((p) => (
            <ProjectCard key={p._id} project={p} onClick={() => navigate(`/projects/${p._id}`)} />
          ))}
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Project">
        <form onSubmit={handleCreate}>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group">
            <label>Project Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="My Awesome Project" required />
          </div>
          <div className="form-group">
            <label>Description (optional)</label>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Brief description..." rows={3} />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={creating}>{creating ? 'Creating...' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
