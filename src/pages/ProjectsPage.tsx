import { NotesMinimalistic } from '@solar-icons/react';
import type { Project } from '../types';
import ProjectCard from '../components/ProjectCard';

interface ProjectsPageProps {
  projects: Project[];
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  onOpen: (project: Project) => void;
}

export default function ProjectsPage({ projects, onEdit, onDelete, onOpen }: ProjectsPageProps) {
  if (projects.length === 0) {
    return (
      <div className="empty">
        <NotesMinimalistic size={64} className="empty-icon" />
        <p className="empty-title">No projects yet</p>
        <p className="empty-sub">Click "New Project" to get started</p>
      </div>
    );
  }

  return (
    <div className="projects-grid">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onEdit={onEdit}
          onDelete={onDelete}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
}
