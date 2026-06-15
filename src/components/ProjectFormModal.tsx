import { useRef, useEffect } from 'react';
import { CloseCircle } from '@solar-icons/react';
import type { Project } from '../types';
import { PROJECT_ICONS, PROJECT_COLORS } from '../constants';

interface ProjectFormModalProps {
  editingProject: Project | null;
  name: string;
  description: string;
  icon: string;
  color: string;
  onNameChange: (v: string) => void;
  onDescChange: (v: string) => void;
  onIconChange: (v: string) => void;
  onColorChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  isClosing?: boolean;
}

export default function ProjectFormModal({
  editingProject, name, description, icon, color,
  onNameChange, onDescChange, onIconChange, onColorChange,
  onSubmit, onClose, isClosing,
}: ProjectFormModalProps) {
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => nameRef.current?.focus(), 100);
  }, []);

  const overlayClass = `modal-overlay${isClosing ? ' closing' : ''}`;
  const modalClass = `modal form-modal${isClosing ? ' closing' : ''}`;

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

          <div className="project-preview">
            <div className="project-preview-icon" style={{ background: `${color}18`, color }}>
              {(() => {
                const Ic = PROJECT_ICONS.find((i) => i.name === icon)?.icon ?? PROJECT_ICONS[0].icon;
                return <Ic size={28} strokeWidth={1.8} />;
              })()}
            </div>
            <span className="project-preview-name" style={{ color }}>{name || 'Project name'}</span>
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
