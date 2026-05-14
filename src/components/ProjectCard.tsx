import React from 'react';
import type { Project } from '../types';
import { resolveProjectColors } from '../types';
import { PROJECT_ICON_MAP } from '../projectIcons';
import { useAppSettings } from '../context/AppSettings';

const ProjectIcon: React.FC<{ iconKey?: string; size?: number }> = ({ iconKey, size = 18 }) => {
  if (!iconKey) return null;
  const Icon = PROJECT_ICON_MAP[iconKey];
  if (!Icon) return null;
  return <Icon size={size} />;
};

interface Props {
  project: Project;
  onClick: () => void;
}

/**
 * ProjectCard — summary card shown in the ProjectsPage list.
 * Displays name, description, progress bar, section chips, overdue badge.
 */
export const ProjectCard: React.FC<Props> = ({ project, onClick }) => {
  const { dark } = useAppSettings();
  const colors   = resolveProjectColors(project.color, dark);
  const total    = project.tasks.length + (project.completedCount ?? 0);
  const done     = project.tasks.filter(t => t.completed).length + (project.completedCount ?? 0);
  const progress = total === 0 ? 0 : Math.round((done / total) * 100);
  const overdue  = project.tasks.filter(t =>
    t.deadline && !t.completed && t.deadline < new Date().toISOString().split('T')[0],
  ).length;

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl p-4 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
      style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: colors.bg, border: `1px solid ${colors.border}`, color: colors.dot }}
        >
          {project.emoji
            ? <ProjectIcon iconKey={project.emoji} size={18} />
            : <span className="w-2.5 h-2.5 rounded-full block" style={{ background: colors.dot }} />
          }
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-display font-semibold text-base truncate" style={{ color: 'var(--text-main)' }}>
              {project.name}
            </h3>
            {overdue > 0 && (
              <span
                className="text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 font-body"
                style={{ background: 'rgba(196,90,105,0.12)', color: '#c45a69' }}
              >
                {overdue} overdue
              </span>
            )}
          </div>
          {project.description && (
            <p className="text-xs mt-0.5 truncate font-body" style={{ color: 'var(--text-muted)' }}>
              {project.description}
            </p>
          )}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-body" style={{ color: 'var(--text-muted)' }}>
                {total === 0 ? 'No tasks yet' : `${done}/${total} done`}
              </span>
              <span className="text-xs font-semibold font-body" style={{ color: colors.text }}>{progress}%</span>
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background: `${colors.dot}20` }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: colors.dot }} />
            </div>
          </div>
        </div>
      </div>

      {project.sections.length > 0 && (
        <div className="flex gap-1.5 mt-3 flex-wrap">
          {project.sections.map(sec => (
            <span key={sec.id} className="text-xs px-2 py-0.5 rounded-full font-body" style={{ background: colors.bg, color: colors.text }}>
              {sec.title}
            </span>
          ))}
        </div>
      )}
    </button>
  );
};
