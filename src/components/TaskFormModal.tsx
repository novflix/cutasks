import { useRef, useEffect } from 'react';
import { CloseCircle } from '@solar-icons/react';
import { useTranslation } from 'react-i18next';
import type { Task, Priority } from '../types';
import DatePicker from './DatePicker';
import TagInput from './TagInput';
import ParentTaskSelect from './ParentTaskSelect';

interface TaskFormModalProps {
  editingTask: Task | null;
  title: string;
  description: string;
  priority: Priority;
  deadline: string;
  tags: string[];
  parentId: string | null;
  allTags: string[];
  allTasks: Task[];
  onTitleChange: (v: string) => void;
  onDescChange: (v: string) => void;
  onPriorityChange: (v: Priority) => void;
  onDeadlineChange: (v: string) => void;
  onTagsChange: (v: string[]) => void;
  onParentChange: (v: string | null) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  isClosing?: boolean;
}

export default function TaskFormModal({
  editingTask, title, description, priority, deadline, tags, parentId, allTags, allTasks,
  onTitleChange, onDescChange, onPriorityChange, onDeadlineChange, onTagsChange, onParentChange,
  onSubmit, onClose, isClosing,
}: TaskFormModalProps) {
  const { t } = useTranslation();
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => titleRef.current?.focus(), 100);
  }, []);

  const overlayClass = `modal-overlay${isClosing ? ' closing' : ''}`;
  const modalClass = `modal form-modal${isClosing ? ' closing' : ''}`;

  return (
    <div className={overlayClass} onClick={onClose} role="dialog" aria-modal="true">
      <div className={modalClass} onClick={(e) => e.stopPropagation()}>
        <div className="fm-header">
          <h2 className="fm-title">{editingTask ? t('modals.taskForm.edit') : t('modals.taskForm.create')}</h2>
          <button className="btn-icon fm-close" onClick={onClose}>
            <CloseCircle size={20} />
          </button>
        </div>

        <form id="fm-hidden" onSubmit={onSubmit} className="fm-body">
          <div className="fm-scroll">
          <div className="fm-field">
            <label className="fm-label">{t('modals.taskForm.title')}</label>
            <input
              ref={titleRef}
              type="text"
              placeholder={t('tasks.titlePlaceholder')}
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              className="fm-input"
              maxLength={200}
              required
            />
          </div>

          <div className="fm-field">
            <label className="fm-label">{t('modals.taskForm.description')}</label>
            <textarea
              placeholder={t('tasks.descPlaceholder')}
              value={description}
              onChange={(e) => onDescChange(e.target.value)}
              className="fm-textarea"
              maxLength={2000}
              rows={3}
            />
          </div>

          <div className="fm-row">
            <div className="fm-col">
              <label className="fm-label">{t('modals.taskForm.priority')}</label>
              <div className="priority-selector">
                {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`priority-option priority-option-${p} ${priority === p ? 'selected' : ''}`}
                    onClick={() => onPriorityChange(p)}
                  >
                    {t(`common.${p}`)}
                  </button>
                ))}
              </div>
            </div>
            <div className="fm-col">
              <DatePicker
                id="task-deadline"
                label={t('modals.taskForm.deadline')}
                value={deadline}
                onChange={onDeadlineChange}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div className="fm-field">
            <TagInput
              label={t('modals.taskForm.tags')}
              tags={tags}
              allTags={allTags}
              onChange={onTagsChange}
            />
          </div>

          <div className="fm-field">
            <ParentTaskSelect
              parentId={parentId}
              currentTaskId={editingTask?.id ?? null}
              allTasks={allTasks}
              onChange={onParentChange}
            />
          </div>
          </div>
        </form>

        <div className="fm-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            {t('common.cancel')}
          </button>
          <button type="submit" className="btn btn-primary" disabled={!title.trim()} form="fm-hidden">
            {editingTask ? t('common.save') : t('common.create')}
          </button>
        </div>
      </div>
    </div>
  );
}
