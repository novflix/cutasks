import { Pen, TrashBinMinimalistic, CalendarMinimalistic } from '@solar-icons/react';
import type { Task } from '../types';
import { formatDeadline, getDeadlineStatus, getTagColor, highlightMatch } from '../utils';

interface TaskCardProps {
  task: Task;
  searchQuery: string;
  onToggle: (id: string) => void;
  onView: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export default function TaskCard({ task, searchQuery, onToggle, onView, onEdit, onDelete }: TaskCardProps) {
  const dlStatus = getDeadlineStatus(task.deadline, task.completed);
  const titleParts = highlightMatch(task.title, searchQuery);

  return (
    <li className={`task-item task-stripe-${task.priority} ${task.completed ? 'completed' : ''} ${dlStatus === 'overdue' ? 'task-overdue' : ''}`}>
      <button
        className={`task-check ${task.completed ? 'checked' : ''}`}
        onClick={() => onToggle(task.id)}
        title={task.completed ? 'Undo' : 'Complete'}
      >
        <span className="particles">
          <i /><i /><i /><i /><i /><i />
        </span>
        <svg viewBox="0 0 24 24" fill="none" className="check-icon">
          <polyline points="5 12 10 17 19 7" className="check-path" />
        </svg>
      </button>
      <div className="task-body" onClick={() => onView(task)}>
        <h3 className="task-title">
          {titleParts.map((part, i) =>
            part.highlighted ? <mark key={i} className="search-highlight">{part.plain}</mark> : part.plain
          )}
        </h3>
        {task.description && (
          <p className="task-desc">{task.description}</p>
        )}
        <div className="task-tags">
          <span className={`priority-badge priority-${task.priority}`}>
            {task.priority}
          </span>
          {task.deadline && (
            <span className={`deadline-badge deadline-${dlStatus}`}>
              <CalendarMinimalistic size={11} />
              {formatDeadline(task.deadline)}
            </span>
          )}
          {task.tags.map((tag) => {
            const c = getTagColor(tag);
            return (
              <span key={tag} className="user-tag" style={{ background: c.bg, color: c.text }}>
                #{tag}
              </span>
            );
          })}
        </div>
      </div>
      <div className="task-actions">
        <button className="btn-icon" onClick={() => onEdit(task)} title="Edit">
          <Pen size={20} />
        </button>
        <button className="btn-icon btn-icon-danger" onClick={() => onDelete(task.id)} title="Delete">
          <TrashBinMinimalistic size={20} />
        </button>
      </div>
    </li>
  );
}
