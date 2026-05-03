import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects';
import { ProjectDetail } from './ProjectsPage';

export const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const ops = useProjects();

  const project = ops.projects.find(p => p.id === projectId) ?? null;

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="font-display text-lg font-medium mb-2" style={{ color: 'var(--text-main)' }}>
          Project not found
        </p>
        <button
          onClick={() => navigate('/projects')}
          className="text-sm font-body transition-opacity hover:opacity-70"
          style={{ color: 'var(--text-muted)' }}
        >
          ← Back to projects
        </button>
      </div>
    );
  }

  return (
    <ProjectDetail
      project={project}
      onBack={() => navigate('/projects')}
      ops={ops}
    />
  );
};