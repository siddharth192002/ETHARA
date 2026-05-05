import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import StatsCard from '../components/StatsCard';
import TaskCard from '../components/TaskCard';
import './Dashboard.css';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/tasks/dashboard').then((res) => setData(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-page"><div className="spinner"></div></div>;

  const d = data || { stats: { total: 0, todo: 0, 'in-progress': 0, done: 0 }, priorities: { high: 0, medium: 0, low: 0 }, overdueTasks: [], myTasks: [], recentTasks: [], projectCount: 0 };

  return (
    <div className="dashboard fade-in">
      <div className="page-header">
        <h1>Welcome back, <span>{user?.name?.split(' ')[0]}</span> 👋</h1>
      </div>

      <div className="grid grid-4 dash-stats">
        <StatsCard icon="📁" label="Projects" value={d.projectCount} color="purple" />
        <StatsCard icon="📋" label="Total Tasks" value={d.stats.total} color="blue" />
        <StatsCard icon="⚡" label="In Progress" value={d.stats['in-progress']} color="yellow" />
        <StatsCard icon="✅" label="Completed" value={d.stats.done} color="green" />
      </div>

      <div className="dash-grid">
        <div className="dash-section">
          <h3 className="section-title">🎯 My Tasks</h3>
          {d.myTasks.length === 0 ? (
            <div className="empty-state"><p>No active tasks assigned to you</p></div>
          ) : (
            <div className="task-list">
              {d.myTasks.map((t) => <TaskCard key={t._id} task={t} onClick={(task) => navigate(`/projects`)} />)}
            </div>
          )}
        </div>

        <div className="dash-section">
          <h3 className="section-title">🔴 Overdue Tasks</h3>
          {d.overdueTasks.length === 0 ? (
            <div className="empty-state"><p>No overdue tasks — great job!</p></div>
          ) : (
            <div className="task-list">
              {d.overdueTasks.map((t) => <TaskCard key={t._id} task={t} onClick={() => navigate(`/projects`)} />)}
            </div>
          )}
        </div>
      </div>

      <div className="dash-section">
        <h3 className="section-title">🕐 Recent Activity</h3>
        {d.recentTasks.length === 0 ? (
          <div className="empty-state"><p>No recent activity</p></div>
        ) : (
          <div className="recent-list">
            {d.recentTasks.map((t) => (
              <div key={t._id} className="recent-item">
                <div className={`badge badge-${t.status === 'todo' ? 'todo' : t.status === 'in-progress' ? 'progress' : 'done'}`}>{t.status}</div>
                <span className="recent-title">{t.title}</span>
                <span className="recent-project">{t.project?.name}</span>
                <span className="recent-time">{new Date(t.updatedAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
