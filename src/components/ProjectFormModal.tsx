import { useRef, useEffect } from 'react';
import { CloseCircle } from '@solar-icons/react';
import type { Project, ProjectStatus } from '../types';
import { PROJECT_ICONS, PROJECT_COLORS } from '../constants';

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'completed', label: 'Completed' },
];

interface ProjectFormModalProps {
  editingProject: Project | null;
  name: string;
  description: string;
  icon: string;
  color: string;
  status: ProjectStatus;
  onNameChange: (v: string) => void;
  onDescChange: (v: string) => void;
  onIconChange: (v: string) => void;
  onColorChange: (v: string) => void;
  onStatusChange: (v: ProjectStatus) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  isClosing?: boolean;
}

export default function ProjectFormModal({
  editingProject, name, description, icon, color, status,
  onNameChange, onDescChange, onIconChange, onColorChange, onStatusChange,
  onSubmit, onClose, isClosing,
}: ProjectFormModalProps) {
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => nameRef.current?.focus(), 100);
  }, []);

  const overlayClass = `modal-overlay${isClosing ? ' closing' : ''}`;
  const modalClass = `modal form-modal${isClosing ? ' closing' : ''}`;

  const PreviewIcon = PROJECT_ICONS.find((i) => i.name === icon)?.icon ?? PROJECT_ICONS[0].icon;

  return (
    <div className={overlayClass} onClick={onClose}>
      <div className={modalClass} onClick={(e) => e.stopPropagation()}>
        <div className="fm-header">
          <h2 className="fm-title">{editingProject ? 'Edit Project' : 'New Project'}</h2>
          <button className="btn-icon fm-close" onClick={onClose}>
            <CloseCircle size={20} />
          </button>
        </div>

        <form id="project-form" onSubmit={onSubmit} className="fm-body">
          <div className="fm-field">
            <label className="fm-label">Name</label>
            <input
              ref={nameRef}
              type="text"
              placeholder="Project name"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              className="fm-input"
              maxLength={50}
              required
            />
          </div>

          <div className="fm-field">
            <label className="fm-label">Description</label>
            <textarea
              placeholder="Optional description"
              value={description}
              onChange={(e) => onDescChange(e.target.value)}
              className="fm-textarea"
              maxLength={200}
              rows={2}
            />
          </div>

          <div className="fm-row">
            <div className="fm-col">
              <label className="fm-label">Status</label>
              <div className="status-selector">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`status-option status-option-${opt.value}${status === opt.value ? ' selected' : ''}`}
                    onClick={() => onStatusChange(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="fm-field">
            <label className="fm-label">Icon</label>
            <div className="icon-picker">
              {PROJECT_ICONS.map((item) => {
                const Ic = item.icon;
                return (
                  <button
                    key={item.name}
                    type="button"
                    className={`icon-picker-btn${icon === item.name ? ' selected' : ''}`}
                    style={icon === item.name ? { background: `${color}18`, color, borderColor: `${color}40` } : undefined}
                    onClick={() => onIconChange(item.name)}
                  >
                    <Ic size={20} strokeWidth={1.8} />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="fm-field">
            <label className="fm-label">Color</label>
            <div className="color-picker">
              {PROJECT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`color-picker-btn${color === c ? ' selected' : ''}`}
                  style={{ background: c }}
                  onClick={() => onColorChange(c)}
                />
              ))}
            </div>
          </div>

          <div className="project-preview" style={{ '--preview-color': color } as React.CSSProperties}>
            <span className="project-preview-label">Preview</span>
            <div className="project-preview-card">
              <div className="project-preview-icon" style={{ background: `${color}15`, color }}>
                <PreviewIcon size={26} strokeWidth={1.8} />
              </div>
              <div className="project-preview-info">
                <span className="project-preview-name" style={{ color }}>{name || 'Project name'}</span>
                {description && <span className="project-preview-desc">{description}</span>}
                <span className={`project-preview-status preview-status-${status}`}>{status}</span>
              </div>
            </div>
          </div>
        </form>

        <div className="fm-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={!name.trim()} form="project-form">
            {editingProject ? 'Save Changes' : 'Create Project'}
          </button>
        </div>
      </div>
    </div>
  );
}
