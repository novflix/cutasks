import { Pen, TrashBinMinimalistic } from '@solar-icons/react';
import { useTranslation } from 'react-i18next';
import type { Project, ProjectTask } from '../types';
import { PROJECT_ICONS } from '../constants';
import { formatDate, highlightMatch } from '../utils';

interface ProjectCardProps {
  project: Project;
  searchQuery: string;
  projectTasks: ProjectTask[];
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  onOpen: (project: Project) => void;
}

export default function ProjectCard({ project, searchQuery, projectTasks, onEdit, onDelete, onOpen }: ProjectCardProps) {
  const { t } = useTranslation();
  const iconDef = PROJECT_ICONS.find((i) => i.name === project.icon) ?? PROJECT_ICONS[0];
  const Icon = iconDef.icon;

  const nameParts = highlightMatch(project.name, searchQuery);

  const matchingTasks = searchQuery.trim()
    ? projectTasks.filter(
        (t) => t.projectId === project.id && t.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div
      className="project-card"
      style={{ '--project-color': project.color } as React.CSSProperties}
      onClick={() => onOpen(project)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onOpen(project); }}
    >
      <div className="project-card-top">
        <div className="project-card-icon" style={{ background: `${project.color}15`, color: project.color }}>
          <Icon size={22} strokeWidth={1.8} />
        </div>
        <div className="project-card-title-row">
          <h3 className="project-card-name" style={{ color: project.color }}>
            {searchQuery.trim()
              ? nameParts.map((part, i) =>
                  part.highlighted ? <mark key={i} className="search-highlight">{part.plain}</mark> : part.plain
                )
              : project.name}
          </h3>
          <div className="project-card-actions">
            <button className="btn-icon" onClick={(e) => { e.stopPropagation(); onEdit(project); }} title={t('common.edit')}>
              <Pen size={18} />
            </button>
            <button className="btn-icon btn-icon-danger" onClick={(e) => { e.stopPropagation(); onDelete(project.id); }} title={t('common.delete')}>
              <TrashBinMinimalistic size={18} />
            </button>
          </div>
        </div>
      </div>
      {project.description && (
        <p className="project-card-desc">{project.description}</p>
      )}
      {matchingTasks.length > 0 && (
        <div className="project-card-tasks">
          {matchingTasks.slice(0, 3).map((task) => {
            const taskParts = highlightMatch(task.title, searchQuery);
            return (
              <span key={task.id} className="project-card-task-item">
                {taskParts.map((part, i) =>
                  part.highlighted ? <mark key={i} className="search-highlight">{part.plain}</mark> : part.plain
                )}
              </span>
            );
          })}
          {matchingTasks.length > 3 && (
            <span className="project-card-task-more">+{matchingTasks.length - 3} {t('common.more')}</span>
          )}
        </div>
      )}
      <div className="project-card-footer">
        <span className={`project-status-badge project-status-${project.status}`}>
          {t(`modals.projectForm.${project.status}`)}
        </span>
        <span className="project-card-date">{formatDate(project.createdAt)}</span>
      </div>
    </div>
  );
}
