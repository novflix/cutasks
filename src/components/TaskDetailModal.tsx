import { CloseCircle, CalendarMinimalistic, PenNewRound, Flag2, Tag } from '@solar-icons/react';
import type { Task } from '../types';
import { formatDate, formatDeadline, getDeadlineStatus, getTagColor } from '../utils';

interface TaskDetailModalProps {
  task: Task;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onToggle: (id: string) => void;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function TaskDetailModal({ task, onClose, onEdit, onToggle }: TaskDetailModalProps) {
  const dlStatus = getDeadlineStatus(task.deadline, task.completed);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="detail-top">
          <div className="detail-top-left">
            <button
              className={`task-check ${task.completed ? 'checked' : ''} detail-check`}
              onClick={() => onToggle(task.id)}
              title={task.completed ? 'Completed' : 'Active'}
            >
              <svg viewBox="0 0 24 24" fill="none" className="check-icon">
                <polyline points="5 12 10 17 19 7" className="check-path" />
              </svg>
            </button>
            <div className="detail-top-info">
              <h2 className="detail-title">{task.title}</h2>
              {task.description && (
                <p className="detail-desc">{task.description}</p>
              )}
            </div>
          </div>
          <button className="btn-icon detail-close" onClick={onClose}>
            <CloseCircle size={22} />
          </button>
        </div>

        <div className="detail-divider" />

        <div className="detail-meta">
          <div className="detail-meta-row">
            <span className="detail-meta-label">
              <Flag2 size={14} />
              Priority
            </span>
            <span className={`priority-badge priority-${task.priority}`}>
              {capitalize(task.priority)}
            </span>
          </div>

          <div className="detail-meta-row">
            <span className="detail-meta-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="detail-meta-icon">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Status
            </span>
            <span className={`status-badge ${task.completed ? 'status-done' : 'status-active'}`}>
              {task.completed ? 'Completed' : 'Active'}
            </span>
          </div>

          {task.deadline && (
            <div className="detail-meta-row">
              <span className="detail-meta-label">
                <CalendarMinimalistic size={14} />
                Deadline
              </span>
              <span className={`deadline-text deadline-text-${dlStatus}`}>
                {formatDeadline(task.deadline)}
                {dlStatus === 'overdue' && ' (overdue)'}
                {dlStatus === 'today' && ' (today)'}
                {dlStatus === 'soon' && ' (soon)'}
              </span>
            </div>
          )}

          <div className="detail-meta-row">
            <span className="detail-meta-label">
              <CalendarMinimalistic size={14} />
              Created
            </span>
            <span className="detail-meta-value">{formatDate(task.createdAt)}</span>
          </div>

          {task.updatedAt !== task.createdAt && (
            <div className="detail-meta-row">
              <span className="detail-meta-label">
                <PenNewRound size={14} />
                Updated
              </span>
              <span className="detail-meta-value">{formatDate(task.updatedAt)}</span>
            </div>
          )}
        </div>

        {task.tags.length > 0 && (
          <>
            <div className="detail-divider" />
            <div className="detail-section">
              <span className="detail-section-title">
                <Tag size={14} />
                Tags
              </span>
              <div className="detail-tags">
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
          </>
        )}

        <div className="detail-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-primary" onClick={() => { onClose(); onEdit(task); }}>
            Edit Task
          </button>
        </div>
      </div>
    </div>
  );
}
