import TaskCard from './TaskCard';
import './KanbanBoard.css';

const columns = [
  { key: 'todo', label: 'To Do', icon: '📋', color: 'var(--status-todo)' },
  { key: 'in-progress', label: 'In Progress', icon: '⚡', color: 'var(--status-progress)' },
  { key: 'done', label: 'Done', icon: '✅', color: 'var(--status-done)' },
];

export default function KanbanBoard({ tasks, onTaskClick }) {
  return (
    <div className="kanban-board">
      {columns.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.key);
        return (
          <div key={col.key} className="kanban-column">
            <div className="kanban-header" style={{ '--col-color': col.color }}>
              <span className="kanban-icon">{col.icon}</span>
              <span className="kanban-title">{col.label}</span>
              <span className="kanban-count">{colTasks.length}</span>
            </div>
            <div className="kanban-tasks">
              {colTasks.length === 0 ? (
                <div className="kanban-empty">No tasks</div>
              ) : (
                colTasks.map((task) => (
                  <TaskCard key={task._id} task={task} onClick={onTaskClick} />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
