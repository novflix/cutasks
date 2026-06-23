import { CloseCircle, CalendarMinimalistic, PenNewRound, Flag2, Tag, ArrowDown, ArrowUp } from '@solar-icons/react';
import { useTranslation } from 'react-i18next';
import type { Task } from '../types';
import { formatDate, formatDeadline, getDeadlineStatus, getTagColor } from '../utils';

interface TaskDetailModalProps {
  task: Task;
  tasks: Task[];
  onClose: () => void;
  onEdit: (task: Task) => void;
  onToggle: (id: string) => void;
  isClosing?: boolean;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function TaskDetailModal({ task, tasks, onClose, onEdit, onToggle, isClosing }: TaskDetailModalProps) {
  const { t } = useTranslation();
  const dlStatus = getDeadlineStatus(task.deadline, task.completed);
  const subtasks = tasks.filter((t) => t.parentId === task.id);
  const parentTask = task.parentId ? tasks.find((t) => t.id === task.parentId) ?? null : null;

  const overlayClass = `modal-overlay${isClosing ? ' closing' : ''}`;
  const modalClass = `modal detail-modal${isClosing ? ' closing' : ''}`;

  return (
    <div className={overlayClass} onClick={onClose}>
      <div className={modalClass} onClick={(e) => e.stopPropagation()}>
        <div className="detail-top">
          <div className="detail-top-left">
            <button
              className={`task-check ${task.completed ? 'checked' : ''} detail-check`}
              onClick={() => onToggle(task.id)}
              title={task.completed ? t('modals.taskDetail.completed') : t('modals.taskDetail.active')}
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
          {parentTask && (
            <div className="detail-meta-row">
              <span className="detail-meta-label">
                <ArrowUp size={14} />
                {t('common.parent')}
              </span>
              <span className="detail-meta-value detail-parent-link" onClick={() => { onClose(); onEdit(parentTask); }}>
                {parentTask.title}
              </span>
            </div>
          )}

          <div className="detail-meta-row">
            <span className="detail-meta-label">
              <Flag2 size={14} />
              {t('common.priority')}
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
              {task.completed ? t('modals.taskDetail.completed') : t('modals.taskDetail.active')}
            </span>
          </div>

          {task.deadline && (
            <div className="detail-meta-row">
              <span className="detail-meta-label">
                <CalendarMinimalistic size={14} />
                {t('common.deadline')}
              </span>
              <span className={`deadline-text deadline-text-${dlStatus}`}>
                {formatDeadline(task.deadline)}
                {dlStatus === 'overdue' && ` (${t('common.overdue')})`}
                {dlStatus === 'today' && ` (${t('common.today')})`}
                {dlStatus === 'soon' && ' (soon)'}
              </span>
            </div>
          )}

          <div className="detail-meta-row">
            <span className="detail-meta-label">
              <CalendarMinimalistic size={14} />
              {t('common.created')}
            </span>
            <span className="detail-meta-value">{formatDate(task.createdAt)}</span>
          </div>

          {task.updatedAt !== task.createdAt && (
            <div className="detail-meta-row">
              <span className="detail-meta-label">
                <PenNewRound size={14} />
                {t('common.updated')}
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
                {t('common.tags')}
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

        {subtasks.length > 0 && (
          <>
            <div className="detail-divider" />
            <div className="detail-section">
              <span className="detail-section-title">
                <ArrowDown size={14} />
                {t('modals.taskDetail.subtasks')} ({subtasks.length})
              </span>
              <div className="detail-subtasks">
                {subtasks.map((sub) => (
                  <div
                    key={sub.id}
                    className={`detail-subtask ${sub.completed ? 'completed' : ''}`}
                    onClick={() => { onClose(); onEdit(sub); }}
                  >
                    <button
                      className={`task-check task-check-sm ${sub.completed ? 'checked' : ''}`}
                      onClick={(e) => { e.stopPropagation(); onToggle(sub.id); }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" className="check-icon">
                        <polyline points="5 12 10 17 19 7" className="check-path" />
                      </svg>
                    </button>
                    <span className="detail-subtask-title">{sub.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="detail-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            {t('common.close')}
          </button>
          <button className="btn btn-primary" onClick={() => { onClose(); onEdit(task); }}>
            {t('tasks.editTask')}
          </button>
        </div>
      </div>
    </div>
  );
}
