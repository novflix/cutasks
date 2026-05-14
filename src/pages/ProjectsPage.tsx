import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects';
import type { ProjectColor } from '../types';
import { ProjectModal } from '../components/ProjectModal';
import { ProjectCard } from '../components/ProjectCard';
import { ProjectsPageSkeleton, SkeletonStyles } from '../components/SkeletonLoader';
import { AddSquare, FolderOpen } from '@solar-icons/react';

// ─── Main ─────────────────────────────────────────────────────────────────────
export const ProjectsPage: React.FC = () => {
  const ops = useProjects();
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  // overId + position: 'before' = line above card, 'after' = line below card
  const [dropTarget, setDropTarget] = useState<{ id: string; position: 'before' | 'after' } | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDragId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (id === dragId) { setDropTarget(null); return; }
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const position = e.clientY < rect.top + rect.height / 2 ? 'before' : 'after';
    setDropTarget({ id, position });
  };

  const handleDrop = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (dragId && dragId !== id && dropTarget) {
      // 'before' → insert before id; 'after' → insert before the next element
      if (dropTarget.position === 'before') {
        ops.reorderProject(dragId, id);
      } else {
        const idx = ops.projects.findIndex(p => p.id === id);
        const nextId = ops.projects[idx + 1]?.id;
        ops.reorderProject(dragId, nextId);
      }
    }
    setDragId(null);
    setDropTarget(null);
  };

  const handleDragEnd = () => {
    setDragId(null);
    setDropTarget(null);
  };

  if (ops.loading) {
    return (
      <>
        <SkeletonStyles />
        <header className="mb-8">
          <p className="text-xs font-body font-medium uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>
            Workspace
          </p>
          <h1 className="font-display text-3xl font-semibold" style={{ color: 'var(--text-main)' }}>Projects</h1>
        </header>
        <ProjectsPageSkeleton />
      </>
    );
  }

  return (
    <>
      <header className="mb-8">
        <p className="text-xs font-body font-medium uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>
          Workspace
        </p>
        <h1 className="font-display text-3xl font-semibold" style={{ color: 'var(--text-main)' }}>Projects</h1>
        <p className="mt-1 text-sm font-body" style={{ color: 'var(--text-muted)' }}>
          {ops.projects.length === 0
            ? 'Create your first project to get started'
            : `${ops.projects.length} project${ops.projects.length === 1 ? '' : 's'}`}
        </p>
      </header>

      {ops.projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl" style={{ border: '1.5px dashed var(--border)' }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'var(--bg-panel)' }}>
            <FolderOpen size={28} style={{ color: 'var(--text-muted)' }} />
          </div>
          <p className="font-display text-lg font-medium mb-1" style={{ color: 'var(--text-main)' }}>No projects yet</p>
          <p className="text-sm font-body text-center max-w-xs mb-6" style={{ color: 'var(--text-muted)' }}>
            Group your tasks into projects to stay organised across different areas of your life.
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-medium font-body transition-all hover:opacity-90 active:scale-95 shadow-soft"
            style={{ background: 'var(--text-main)', color: 'var(--bg-main)' }}
          >
            <AddSquare size={16} />
            Create first project
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {ops.projects.map(project => (
            <div
              key={project.id}
              draggable
              onDragStart={e => handleDragStart(e, project.id)}
              onDragOver={e => handleDragOver(e, project.id)}
              onDrop={e => handleDrop(e, project.id)}
              onDragEnd={handleDragEnd}
              style={{ position: 'relative' }}
            >
              {/* Drop indicator — top */}
              {dropTarget?.id === project.id && dropTarget.position === 'before' && (
                <div style={{
                  position: 'absolute', top: '-6px', left: '8px', right: '8px', height: '2px',
                  background: 'var(--accent)', borderRadius: '999px', zIndex: 10,
                  boxShadow: '0 0 6px var(--accent)',
                }}>
                  <div style={{ position: 'absolute', left: '-3px', top: '50%', transform: 'translateY(-50%)', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)' }} />
                </div>
              )}

              <div style={{ opacity: dragId === project.id ? 0.4 : 1, transition: 'opacity 0.15s', cursor: 'grab' }}>
                <ProjectCard
                  project={project}
                  onClick={() => navigate(`/projects/${project.id}`)}
                />
              </div>

              {/* Drop indicator — bottom */}
              {dropTarget?.id === project.id && dropTarget.position === 'after' && (
                <div style={{
                  position: 'absolute', bottom: '-6px', left: '8px', right: '8px', height: '2px',
                  background: 'var(--accent)', borderRadius: '999px', zIndex: 10,
                  boxShadow: '0 0 6px var(--accent)',
                }}>
                  <div style={{ position: 'absolute', left: '-3px', top: '50%', transform: 'translateY(-50%)', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)' }} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {ops.projects.length > 0 && (
        <div className="fixed bottom-20 right-5 sm:bottom-8 sm:right-8 z-40">
          <button
            onClick={() => setShowCreate(true)}
            className="w-14 h-14 rounded-full flex items-center justify-center shadow-cozy transition-all duration-200 active:scale-90 hover:scale-110"
            style={{ background: 'var(--text-main)', color: 'var(--bg-main)' }}
            aria-label="New project"
          >
            <AddSquare size={26} />
          </button>
        </div>
      )}

      {showCreate && (
        <ProjectModal
          mode="create"
          onClose={() => setShowCreate(false)}
          onSubmit={async ({ name, description, color, emoji }) => {
            const id = await ops.createProject(name, color as ProjectColor, emoji, description ?? undefined);
            if (id) navigate(`/projects/${id}`);
          }}
        />
      )}
    </>
  );
};