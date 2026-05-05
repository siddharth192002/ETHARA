import './ProjectCard.css';

export default function ProjectCard({ project, onClick }) {
  const counts = project.taskCounts || { todo: 0, 'in-progress': 0, done: 0, total: 0 };
  const progress = counts.total > 0 ? Math.round((counts.done / counts.total) * 100) : 0;

  return (
    <div className="project-card card" onClick={onClick} id={`project-${project._id}`}>
      <div className="project-card-header">
        <h3>{project.name}</h3>
        <span className={`badge badge-${project.status === 'active' ? 'done' : 'todo'}`}>
          {project.status}
        </span>
      </div>
      {project.description && <p className="project-desc">{project.description}</p>}
      <div className="project-progress">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <span className="progress-text">{progress}% complete</span>
      </div>
      <div className="project-meta">
        <div className="task-counts">
          <span className="count-item"><span className="dot dot-todo"></span>{counts.todo}</span>
          <span className="count-item"><span className="dot dot-progress"></span>{counts['in-progress']}</span>
          <span className="count-item"><span className="dot dot-done"></span>{counts.done}</span>
        </div>
        <div className="member-avatars">
          {project.members?.slice(0, 4).map((m, i) => (
            <div key={i} className="avatar avatar-sm" style={{ marginLeft: i > 0 ? '-8px' : 0 }} title={m.user?.name}>
              {m.user?.name?.charAt(0).toUpperCase()}
            </div>
          ))}
          {project.members?.length > 4 && <span className="more-members">+{project.members.length - 4}</span>}
        </div>
      </div>
    </div>
  );
}
