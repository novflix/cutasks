import { useRef, useEffect } from 'react';
import { CloseCircle } from '@solar-icons/react';
import type { Task, Priority } from '../types';
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
      <div className="modal form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="fm-header">
          <h2 className="fm-title">{editingTask ? 'Edit Task' : 'New Task'}</h2>
          <button className="btn-icon fm-close" onClick={onClose}>
            <CloseCircle size={20} />
          </button>
        </div>

        <form id="fm-hidden" onSubmit={onSubmit} className="fm-body">
          <div className="fm-field">
            <label className="fm-label">Title</label>
            <input
              ref={titleRef}
              type="text"
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              className="fm-input"
              maxLength={100}
              required
            />
          </div>

          <div className="fm-field">
            <label className="fm-label">Description</label>
            <textarea
              placeholder="Add details..."
              value={description}
              onChange={(e) => onDescChange(e.target.value)}
              className="fm-textarea"
              maxLength={500}
              rows={3}
            />
          </div>

          <div className="fm-row">
            <div className="fm-col">
              <label className="fm-label">Priority</label>
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
            <div className="fm-col">
              <DatePicker
                id="task-deadline"
                label="Deadline"
                value={deadline}
                onChange={onDeadlineChange}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div className="fm-field">
            <TagInput
              label="Tags"
              tags={tags}
              allTags={allTags}
              onChange={onTagsChange}
            />
          </div>
        </form>

        <div className="fm-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={!title.trim()} form="fm-hidden">
            {editingTask ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  );
}
