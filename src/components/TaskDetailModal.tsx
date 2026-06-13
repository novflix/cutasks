import { CloseCircle, CalendarMinimalistic, PenNewRound } from '@solar-icons/react';
import type { Task } from '../types';
import { formatDate, formatDeadline, getDeadlineStatus } from '../utils';

interface TaskDetailModalProps {
  task: Task;
  onClose: () => void;
  onEdit: (task: Task) => void;
}

export default function TaskDetailModal({ task, onClose, onEdit }: TaskDetailModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Task Details</h2>
          <button className="btn-icon" onClick={onClose}>
            <CloseCircle size={24} />
          </button>
        </div>
        <div className="modal-body">
          <h3 className="detail-title">{task.title}</h3>
          {task.description && (
            <p className="detail-desc">{task.description}</p>
          )}
          <div className="detail-badges">
            <span className={`priority-badge priority-${task.priority}`}>
              {task.priority}
            </span>
            <span className={`status-badge ${task.completed ? 'status-done' : 'status-active'}`}>
              {task.completed ? 'Completed' : 'Active'}
            </span>
            {task.deadline && (
              <span className={`deadline-badge deadline-${getDeadlineStatus(task.deadline, task.completed)}`}>
                <CalendarMinimalistic size={11} />
                Due: {formatDeadline(task.deadline)}
              </span>
            )}
          </div>
          {task.tags.length > 0 && (
            <div className="detail-tags">
              {task.tags.map((tag) => (
                <span key={tag} className="user-tag">#{tag}</span>
              ))}
            </div>
          )}
          <div className="detail-dates">
            <div className="date-item">
              <CalendarMinimalistic size={14} />
              <span>Created: {formatDate(task.createdAt)}</span>
            </div>
            {task.updatedAt !== task.createdAt && (
              <div className="date-item">
                <PenNewRound size={14} />
                <span>Updated: {formatDate(task.updatedAt)}</span>
              </div>
            )}
          </div>
          <div className="form-actions">
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
            <button className="btn btn-primary" onClick={() => { onClose(); onEdit(task); }}>
              Edit Task
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
