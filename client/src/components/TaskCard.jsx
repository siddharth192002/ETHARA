import './TaskCard.css';

const priorityIcons = { high: '🔴', medium: '🟡', low: '🟢' };
const statusLabels = { 'todo': 'To Do', 'in-progress': 'In Progress', 'done': 'Done' };

export default function TaskCard({ task, onClick }) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
  const dueStr = task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null;

  return (
    <div className={`task-card ${isOverdue ? 'overdue' : ''}`} onClick={() => onClick?.(task)} id={`task-${task._id}`}>
      <div className="task-card-top">
        <span className="task-priority" title={task.priority}>{priorityIcons[task.priority]}</span>
        <span className={`badge badge-${task.status === 'todo' ? 'todo' : task.status === 'in-progress' ? 'progress' : 'done'}`}>
          {statusLabels[task.status]}
        </span>
      </div>
      <h4 className="task-title">{task.title}</h4>
      {task.description && <p className="task-desc">{task.description}</p>}
      <div className="task-card-bottom">
        {task.assignee ? (
          <div className="task-assignee">
            <div className="avatar avatar-sm">{task.assignee.name?.charAt(0).toUpperCase()}</div>
            <span>{task.assignee.name}</span>
          </div>
        ) : <span className="unassigned">Unassigned</span>}
        {dueStr && <span className={`task-due ${isOverdue ? 'text-overdue' : ''}`}>📅 {dueStr}</span>}
      </div>
    </div>
  );
}
