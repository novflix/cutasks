import { NotesMinimalistic } from '@solar-icons/react';
import { useTranslation } from 'react-i18next';
import type { Project, ProjectTask } from '../types';
import ProjectCard from '../components/ProjectCard';

interface ProjectsPageProps {
  projects: Project[];
  projectTasks: ProjectTask[];
  searchQuery: string;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  onOpen: (project: Project) => void;
}

export default function ProjectsPage({ projects, projectTasks, searchQuery, onEdit, onDelete, onOpen }: ProjectsPageProps) {
  const { t } = useTranslation();
  if (projects.length === 0) {
    return (
      <div className="empty">
        <NotesMinimalistic size={64} className="empty-icon" />
        <p className="empty-title">
          {searchQuery ? t('projects.noResults') : t('projects.noProjects')}
        </p>
        <p className="empty-sub">
          {searchQuery ? t('projects.noResultsSub') : t('projects.noProjectsSub')}
        </p>
      </div>
    );
  }

  return (
    <div className="projects-grid">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          searchQuery={searchQuery}
          projectTasks={projectTasks}
          onEdit={onEdit}
          onDelete={onDelete}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
}
