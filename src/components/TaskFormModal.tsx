import { useRef, useEffect } from 'react';
import { CloseCircle, CalendarMinimalistic, PenNewRound } from '@solar-icons/react';
import type { Task, Priority } from '../types';
import { formatDate } from '../utils';
import DatePicker from './DatePicker';
import TagInput from './TagInput';

interface TaskFormModalProps {
  editingTask: Task | null;
  title: string;
  description: string;
  priority: Priority;
  deadline: string;
  tags: string[];
  allTags: string[];
  onTitleChange: (v: string) => void;
  onDescChange: (v: string) => void;
  onPriorityChange: (v: Priority) => void;
  onDeadlineChange: (v: string) => void;
  onTagsChange: (v: string[]) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export default function TaskFormModal({
  editingTask, title, description, priority, deadline, tags, allTags,
  onTitleChange, onDescChange, onPriorityChange, onDeadlineChange, onTagsChange,
  onSubmit, onClose,
}: TaskFormModalProps) {
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => titleRef.current?.focus(), 100);
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editingTask ? 'Edit Task' : 'New Task'}</h2>
          <button className="btn-icon" onClick={onClose}>
            <CloseCircle size={24} />
          </button>
        </div>
        <form onSubmit={onSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="task-title">Title</label>
            <input
              ref={titleRef}
              id="task-title"
              type="text"
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              className="form-input"
              maxLength={100}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="task-desc">Description</label>
            <textarea
              id="task-desc"
              placeholder="Additional details..."
              value={description}
              onChange={(e) => onDescChange(e.target.value)}
              className="form-input form-textarea"
              maxLength={500}
              rows={3}
            />
          </div>
          <div className="form-row">
            <div className="form-group form-group-half">
              <label>Priority</label>
              <div className="priority-selector">
                {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`priority-option priority-option-${p} ${priority === p ? 'selected' : ''}`}
                    onClick={() => onPriorityChange(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group form-group-half">
              <DatePicker
                id="task-deadline"
                label="Deadline"
                value={deadline}
                onChange={onDeadlineChange}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
          <div className="form-group">
            <TagInput
              label="Tags"
              tags={tags}
              allTags={allTags}
              onChange={onTagsChange}
            />
          </div>
          {editingTask && (
            <div className="detail-dates">
              <div className="date-item">
                <CalendarMinimalistic size={14} />
                <span>Created: {formatDate(editingTask.createdAt)}</span>
              </div>
              {editingTask.updatedAt !== editingTask.createdAt && (
                <div className="date-item">
                  <PenNewRound size={14} />
                  <span>Updated: {formatDate(editingTask.updatedAt)}</span>
                </div>
              )}
            </div>
          )}
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={!title.trim()}>
              {editingTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
