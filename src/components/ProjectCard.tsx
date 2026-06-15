import { Pen, TrashBinMinimalistic } from '@solar-icons/react';
import type { Project } from '../types';
import { PROJECT_ICONS } from '../constants';
import { formatDate } from '../utils';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
}

export default function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const iconDef = PROJECT_ICONS.find((i) => i.name === project.icon) ?? PROJECT_ICONS[0];
  const Icon = iconDef.icon;

  return (
    <div className="project-card" style={{ '--project-color': project.color } as React.CSSProperties}>
      <div className="project-card-header">
        <div className="project-card-icon" style={{ background: `${project.color}18`, color: project.color }}>
          <Icon size={24} strokeWidth={1.8} />
        </div>
        <div className="project-card-actions">
          <button className="btn-icon" onClick={() => onEdit(project)} title="Edit">
            <Pen size={18} />
          </button>
          <button className="btn-icon btn-icon-danger" onClick={() => onDelete(project.id)} title="Delete">
            <TrashBinMinimalistic size={18} />
          </button>
        </div>
      </div>
      <h3 className="project-card-name" style={{ color: project.color }}>{project.name}</h3>
      {project.description && (
        <p className="project-card-desc">{project.description}</p>
      )}
      <span className="project-card-date">Created {formatDate(project.createdAt)}</span>
    </div>
  );
}
