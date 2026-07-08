import { memo } from 'react';
import Pen from '@solar-icons/react/icons/messages/Pen';
import TrashBinMinimalistic from '@solar-icons/react/icons/ui/TrashBinMinimalistic';
import CalendarMinimalistic from '@solar-icons/react/icons/time/CalendarMinimalistic';
import ArrowDown from '@solar-icons/react/icons/arrows/ArrowDown';
import { useTranslation } from 'react-i18next';
import type { Task } from '../types';
import { formatDeadline, getDeadlineStatus, getTagColor, highlightMatch } from '../utils';

interface TaskCardProps {
  task: Task;
  searchQuery: string;
  subtaskCount: number;
  isDragOver: boolean;
  onToggle: (id: string) => void;
  onView: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onDragOver: (e: React.DragEvent, taskId: string) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetId: string) => void;
}

export default memo(function TaskCard({
  task, searchQuery, subtaskCount, isDragOver,
  onToggle, onView, onEdit, onDelete,
  onDragOver, onDragLeave, onDrop,
}: TaskCardProps) {
  const { t } = useTranslation();
  const dlStatus = getDeadlineStatus(task.deadline, task.completed);
  const titleParts = highlightMatch(task.title, searchQuery);

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    onDragOver(e, task.id);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.stopPropagation();
    onDragLeave(e);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    onDrop(e, task.id);
  }

  return (
    <li
      className={`task-item task-stripe-${task.priority} ${task.completed ? 'completed' : ''} ${dlStatus === 'overdue' ? 'task-overdue' : ''} ${isDragOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <button
        className={`task-check ${task.completed ? 'checked' : ''}`}
        onClick={() => onToggle(task.id)}
        title={task.completed ? t('components.taskCard.undo') : t('components.taskCard.complete')}
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
            {t(`common.${task.priority}`)}
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
          {subtaskCount > 0 && (
            <span className="subtask-badge">
              <ArrowDown size={11} />
              {t('tasks.subtasks', { count: subtaskCount })}
            </span>
          )}
        </div>
      </div>
      <div className="task-actions">
        <button className="btn-icon" onClick={() => onEdit(task)} title={t('components.taskCard.edit')} aria-label={t('components.taskCard.edit')}>
          <Pen size={20} />
        </button>
        <button className="btn-icon btn-icon-danger" onClick={() => onDelete(task.id)} title={t('components.taskCard.delete')} aria-label={t('components.taskCard.delete')}>
          <TrashBinMinimalistic size={20} />
        </button>
      </div>
    </li>
  );
});

function GripDots() {
  return (
    <svg width="12" height="16" viewBox="0 0 12 16" fill="currentColor">
      <circle cx="3" cy="2.5" r="1.5" />
      <circle cx="9" cy="2.5" r="1.5" />
      <circle cx="3" cy="8" r="1.5" />
      <circle cx="9" cy="8" r="1.5" />
      <circle cx="3" cy="13.5" r="1.5" />
      <circle cx="9" cy="13.5" r="1.5" />
    </svg>
  );
}

export function DragHandle({ taskId, onMouseDown, onTouchDragStart, child = false }: { taskId: string; onMouseDown: (id: string, e: React.MouseEvent) => void; onTouchDragStart?: (id: string, e: React.TouchEvent) => void; child?: boolean }) {
  const { t } = useTranslation();
  function handleMouseDown(e: React.MouseEvent) {
    e.stopPropagation();
    onMouseDown(taskId, e);
  }

  function handleTouchStart(e: React.TouchEvent) {
    if (onTouchDragStart) {
      onTouchDragStart(taskId, e);
    }
  }

  return (
    <div
      className={`task-drag-handle ${child ? 'task-drag-handle-child' : ''}`}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      title={t('components.taskCard.dragReparent')}
    >
      <GripDots />
    </div>
  );
}
