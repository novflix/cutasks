import { useState, useRef } from 'react';

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
  onReorder?: (fromIndex: number, toIndex: number) => void;
}

export default function ProjectsPage({ projects, projectTasks, searchQuery, onEdit, onDelete, onOpen, onReorder }: ProjectsPageProps) {
  const { t } = useTranslation();
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const dragIdRef = useRef<string | null>(null);

  function handleDragStart(e: React.DragEvent, id: string) {
    dragIdRef.current = id;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  }

  function handleDragOver(e: React.DragEvent, id: string) {
    e.preventDefault();
    if (dragIdRef.current && dragIdRef.current !== id) {
      setDragOverId(id);
    }
  }

  function handleDragLeave() {
    setDragOverId(null);
  }

  function handleDrop(e: React.DragEvent, targetId: string) {
    e.preventDefault();
    setDragOverId(null);
    const fromId = dragIdRef.current;
    dragIdRef.current = null;
    if (!fromId || fromId === targetId || !onReorder) return;
    const fromIndex = projects.findIndex((p) => p.id === fromId);
    const toIndex = projects.findIndex((p) => p.id === targetId);
    if (fromIndex !== -1 && toIndex !== -1) {
      onReorder(fromIndex, toIndex);
    }
  }

  function handleDragEnd() {
    setDragOverId(null);
    dragIdRef.current = null;
  }

  if (projects.length === 0) {
    return (
      <div className="empty">
        <img src="/illustrations/Projects-Variant-1.svg" className="empty-illustration" alt="" />
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
        <div
          key={project.id}
          className={`project-drag-wrap${dragOverId === project.id ? ' drag-over' : ''}`}
          draggable
          onDragStart={(e) => handleDragStart(e, project.id)}
          onDragOver={(e) => handleDragOver(e, project.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, project.id)}
          onDragEnd={handleDragEnd}
        >
          <ProjectCard
            project={project}
            searchQuery={searchQuery}
            projectTasks={projectTasks}
            onEdit={onEdit}
            onDelete={onDelete}
            onOpen={onOpen}
          />
        </div>
      ))}
    </div>
  );
}
