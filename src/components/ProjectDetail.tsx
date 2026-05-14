import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Project, ProjectTask } from '../types';
import { resolveProjectColors } from '../types';
import { PROJECT_ICON_MAP, PROJECT_ICON_OPTIONS } from '../projectIcons';
import { useAppSettings } from '../context/AppSettings';
import { useProjects } from '../hooks/useProjects';
import { useDragDrop } from '../hooks/useDragDrop';
import { sortTasks } from '../hooks/useTaskSort';
import { ProjectModal } from './ProjectModal';
import { ProjectTaskModal } from './ProjectTaskModal';
import { ConfirmDialog } from './ConfirmDialog';
import { SectionBlock } from './SectionBlock';
import { ProjectTaskRow } from './ProjectTaskRow';
import { InlineAddTask } from './InlineAddTask';
import {
  AddSquare, TrashBinMinimalistic, PenNewSquare,
  AltArrowLeft, AddCircle, CloseCircle,
} from '@solar-icons/react';

// ─── Local helpers ────────────────────────────────────────────────────────────

const ProjectIcon: React.FC<{ iconKey?: string; size?: number }> = ({ iconKey, size = 18 }) => {
  if (!iconKey) return null;
  const Icon = PROJECT_ICON_MAP[iconKey];
  if (!Icon) return null;
  return <Icon size={size} />;
};

const IconPickerOutsideClick: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      let target = e.target as HTMLElement | null;
      while (target) {
        if ((target as HTMLElement).dataset?.iconPicker) return;
        target = target.parentElement;
      }
      onClose();
    };
    const id = setTimeout(() => document.addEventListener('mousedown', handler), 10);
    return () => { clearTimeout(id); document.removeEventListener('mousedown', handler); };
  }, [onClose]);
  return null;
};

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  project: Project;
  onBack: () => void;
  ops: ReturnType<typeof useProjects>;
}

export const ProjectDetail: React.FC<Props> = ({ project, onBack, ops }) => {
  const { dark, sortField } = useAppSettings();
  const colors = resolveProjectColors(project.color, dark);

  const [showEdit, setShowEdit]                     = useState(false);
  const [editTask, setEditTask]                     = useState<ProjectTask | null>(null);
  const [showAddTask, setShowAddTask]               = useState(false);
  const [addTaskSectionId, setAddTaskSectionId]     = useState<string | undefined>(undefined);
  const [showAddSection, setShowAddSection]         = useState(false);
  const [addSectionVal, setAddSectionVal]           = useState('');
  const [addSectionIcon, setAddSectionIcon]         = useState<string | undefined>(undefined);
  const [showNewSectionIconPicker, setShowNewSectionIconPicker] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm]   = useState(false);
  const sectionInputRef = useRef<HTMLDivElement>(null);

  const totalTasks  = project.tasks.length + (project.completedCount ?? 0);
  const doneTasks   = project.tasks.filter(t => t.completed).length + (project.completedCount ?? 0);
  const progress    = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);
  const sort        = { field: sortField };

  const sortByCompletion = (tasks: ProjectTask[]) => {
    const toSortable = (t: ProjectTask) => ({ ...t, description: t.description ?? undefined, deadline: t.deadline ?? undefined });
    const active    = sortTasks(tasks.filter(t => !t.completed).map(toSortable), sort);
    const completed = tasks.filter(t => t.completed);
    return [...active, ...completed] as ProjectTask[];
  };

  const unsectioned    = sortByCompletion(project.tasks.filter(t => !t.sectionId));
  const getSectionTasks = (id: string) => sortByCompletion(project.tasks.filter(t => t.sectionId === id));
  const sortedSections = [...project.sections].sort((a, b) => a.order - b.order);

  const handleAddSection = () => {
    if (addSectionVal.trim()) {
      ops.addSection(project.id, addSectionVal.trim(), addSectionIcon);
      setAddSectionVal('');
      setAddSectionIcon(undefined);
      setShowNewSectionIconPicker(false);
      setShowAddSection(false);
    }
  };

  const cancelAddSection = () => {
    setShowAddSection(false);
    setAddSectionVal('');
    setAddSectionIcon(undefined);
    setShowNewSectionIconPicker(false);
  };

  useEffect(() => {
    if (showAddSection) {
      setTimeout(() => sectionInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 60);
    }
  }, [showAddSection]);

  // ── Drag & drop ──────────────────────────────────────────────────────────────

  const handleReorderTask = useCallback((
    taskId: string,
    targetSectionId: string | undefined,
    beforeTaskId: string | undefined,
  ) => {
    ops.reorderTask(project.id, taskId, targetSectionId, beforeTaskId);
  }, [ops, project.id]);

  const handleReorderSection = useCallback((
    sectionId: string,
    beforeSectionId: string | undefined,
  ) => {
    ops.reorderSection(project.id, sectionId, beforeSectionId);
  }, [ops, project.id]);

  const { onPointerDown } = useDragDrop({
    onReorderTask: handleReorderTask,
    onReorderSection: handleReorderSection,
  });

  const handleTaskDragPointerDown = useCallback((
    e: React.PointerEvent,
    taskId: string,
    sectionId: string | undefined,
  ) => {
    const rowEl = (e.currentTarget as HTMLElement).closest('[data-task-id]') as HTMLElement | null;
    if (!rowEl) return;
    onPointerDown(e, { type: 'task', id: taskId, sectionId }, rowEl);
  }, [onPointerDown]);

  const handleSectionDragPointerDown = useCallback((
    e: React.PointerEvent,
    sectionId: string,
  ) => {
    const headerEl = (e.currentTarget as HTMLElement).closest('[data-section-header-id]') as HTMLElement | null;
    if (!headerEl) return;
    onPointerDown(e, { type: 'section', id: sectionId }, headerEl);
  }, [onPointerDown]);

  const openAddTaskModal = useCallback((sectionId?: string) => {
    setAddTaskSectionId(sectionId);
    setShowAddTask(true);
  }, []);

  return (
    <div>
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-body mb-5 transition-opacity hover:opacity-70"
        style={{ color: 'var(--text-muted)' }}
      >
        <AltArrowLeft size={16} />
        All projects
      </button>

      {/* Project header */}
      <div
        className="rounded-2xl mb-5 overflow-hidden"
        style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)' }}
      >
        <div style={{ height: '4px', background: colors.dot, opacity: 0.85 }} />
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {project.emoji && (
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: colors.bg, border: `1.5px solid ${colors.border}`, color: colors.dot }}
                >
                  <ProjectIcon iconKey={project.emoji} size={20} />
                </div>
              )}
              <div>
                <h1 className="font-display text-2xl font-semibold leading-tight" style={{ color: 'var(--text-main)' }}>
                  {project.name}
                </h1>
                {project.description && (
                  <p className="text-sm mt-0.5 font-body" style={{ color: 'var(--text-muted)' }}>
                    {project.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => setShowEdit(true)}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-90"
                style={{ color: 'var(--text-muted)', background: 'var(--bg-panel)', border: '1.5px solid var(--border)' }}
              >
                <PenNewSquare size={15} />
              </button>
              <button
                onClick={() => {
                  if (project.tasks.length > 1) setShowDeleteConfirm(true);
                  else { ops.deleteProject(project.id); onBack(); }
                }}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-90"
                style={{ color: '#c45a69', background: 'rgba(196,90,105,0.08)', border: '1.5px solid rgba(196,90,105,0.2)' }}
              >
                <TrashBinMinimalistic size={15} />
              </button>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-4 flex items-center gap-3">
            <div style={{ position: 'relative', width: 36, height: 36, flexShrink: 0 }}>
              <svg width="36" height="36" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="18" cy="18" r="14" fill="none" stroke="var(--border)" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="14" fill="none"
                  stroke={colors.dot} strokeWidth="3" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 14}`}
                  strokeDashoffset={`${2 * Math.PI * 14 * (1 - progress / 100)}`}
                  style={{ transition: 'stroke-dashoffset 0.7s ease' }}
                />
              </svg>
              <span style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '8px', fontWeight: 700, fontFamily: '"DM Sans", sans-serif',
                color: 'var(--text-main)',
              }}>
                {progress}%
              </span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span className="text-xs font-body" style={{ color: 'var(--text-muted)' }}>
                  {doneTasks} of {totalTasks} task{totalTasks !== 1 ? 's' : ''} done
                </span>
                {totalTasks > 0 && doneTasks === totalTasks && (
                  <span style={{
                    fontSize: '0.65rem', fontWeight: 700, fontFamily: '"DM Sans", sans-serif',
                    color: colors.dot, background: colors.bg,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '999px', padding: '1px 7px',
                  }}>
                    All done ✓
                  </span>
                )}
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-panel)' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${progress}%`, background: colors.dot, opacity: 0.85 }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 mb-5">
        <button
          onClick={() => openAddTaskModal(undefined)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-body font-medium transition-all hover:opacity-90 active:scale-95"
          style={{ background: colors.bg, color: colors.text, border: `1.5px solid ${colors.border}` }}
        >
          <AddCircle size={15} /> Add task
        </button>
        <button
          onClick={() => setShowAddSection(true)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-body transition-all hover:opacity-80 active:scale-95"
          style={{ color: 'var(--text-muted)', border: '1.5px solid var(--border)' }}
        >
          <AddSquare size={14} /> Add section
        </button>
      </div>

      {/* Task list */}
      <div className="flex flex-col gap-0.5">
        {/* Unsectioned tasks */}
        {(unsectioned.length > 0 || sortedSections.length === 0) && (
          <div className="group mb-2" data-section-drop-zone="">
            <div className="flex flex-col">
              {unsectioned.length === 0 && sortedSections.length === 0 && (
                <p className="text-sm py-2 italic px-2" style={{ color: 'var(--text-muted)', opacity: 0.5 }}>
                  No tasks yet
                </p>
              )}
              {unsectioned.map(task => (
                <ProjectTaskRow
                  key={task.id}
                  task={task}
                  dotColor={colors.dot}
                  onToggle={() => ops.toggleTask(project.id, task.id)}
                  onEdit={() => setEditTask(task)}
                  onDelete={() => ops.deleteTask(project.id, task.id)}
                  onDragHandlePointerDown={(e) => handleTaskDragPointerDown(e, task.id, undefined)}
                />
              ))}
            </div>
            <InlineAddTask
              accentColor={colors.dot}
              onAdd={(title) => ops.addTask(project.id, title, 'medium', undefined, undefined, undefined)}
              onOpenModal={() => openAddTaskModal(undefined)}
            />
          </div>
        )}

        {/* Sections */}
        {sortedSections.map(sec => (
          <SectionBlock
            key={sec.id}
            section={sec}
            tasks={getSectionTasks(sec.id)}
            colors={colors}
            onToggleTask={(tid) => ops.toggleTask(project.id, tid)}
            onEditTask={(task) => setEditTask(task)}
            onDeleteTask={(tid) => ops.deleteTask(project.id, tid)}
            onEditSection={(newTitle, icon) => ops.editSection(project.id, sec.id, newTitle, icon)}
            onDeleteSection={() => ops.deleteSection(project.id, sec.id)}
            onAddTask={(title) => ops.addTask(project.id, title, 'medium', undefined, undefined, sec.id)}
            onOpenAddTaskModal={() => openAddTaskModal(sec.id)}
            onTaskDragPointerDown={handleTaskDragPointerDown}
            onSectionDragPointerDown={handleSectionDragPointerDown}
          />
        ))}

        {/* New section input */}
        {showAddSection && (
          <div
            ref={sectionInputRef}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl mt-1"
            style={{ background: 'var(--bg-panel)', border: `1.5px solid ${colors.border}` }}
          >
            {/* Icon picker */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setShowNewSectionIconPicker(p => !p)}
                className="w-6 h-6 flex items-center justify-center rounded-lg transition-all hover:scale-110 active:scale-90"
                style={{
                  background: addSectionIcon ? `${colors.dot}20` : 'var(--bg-card)',
                  color: addSectionIcon ? colors.dot : 'var(--text-muted)',
                  border: addSectionIcon ? 'none' : '1px dashed var(--border)',
                }}
                title={addSectionIcon ? 'Change icon' : 'Add icon'}
              >
                {addSectionIcon
                  ? (() => { const I = PROJECT_ICON_MAP[addSectionIcon]; return <I size={13} />; })()
                  : <AddSquare size={12} />
                }
              </button>
              {showNewSectionIconPicker && (
                <div
                  className="absolute left-0 z-50 rounded-2xl p-2.5 shadow-cozy"
                  style={{
                    top: '32px', background: 'var(--bg-card)',
                    border: '1.5px solid var(--border)',
                    display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: '4px', width: '196px',
                  }}
                >
                  {addSectionIcon && (
                    <button
                      onClick={() => { setAddSectionIcon(undefined); setShowNewSectionIconPicker(false); }}
                      className="col-span-5 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-body transition-all hover:opacity-80 mb-1"
                      style={{ color: 'var(--text-muted)', background: 'var(--bg-panel)' }}
                    >
                      <CloseCircle size={12} /> Remove icon
                    </button>
                  )}
                  {PROJECT_ICON_OPTIONS.map(({ key, Icon }) => (
                    <button
                      key={key}
                      onClick={() => { setAddSectionIcon(key === addSectionIcon ? undefined : key); setShowNewSectionIconPicker(false); }}
                      className="w-8 h-8 flex items-center justify-center rounded-xl transition-all hover:scale-110 active:scale-90"
                      style={{
                        background: addSectionIcon === key ? `${colors.dot}25` : 'var(--bg-panel)',
                        color: addSectionIcon === key ? colors.dot : 'var(--text-muted)',
                      }}
                    >
                      <Icon size={15} />
                    </button>
                  ))}
                  <IconPickerOutsideClick onClose={() => setShowNewSectionIconPicker(false)} />
                </div>
              )}
            </div>

            <input
              value={addSectionVal}
              onChange={e => setAddSectionVal(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter')  handleAddSection();
                if (e.key === 'Escape') cancelAddSection();
              }}
              placeholder="Section name…"
              autoFocus
              className="flex-1 bg-transparent text-sm font-semibold font-body outline-none"
              style={{ color: colors.text }}
              maxLength={50}
            />
            <button
              onClick={handleAddSection}
              className="text-xs font-body px-2.5 py-1 rounded-lg transition-all hover:opacity-90 active:scale-95"
              style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
            >
              Add
            </button>
            <button
              onClick={cancelAddSection}
              style={{ color: 'var(--text-muted)' }}
            >
              <CloseCircle size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {showEdit && (
        <ProjectModal
          mode="edit"
          initial={project}
          onClose={() => setShowEdit(false)}
          onSubmit={({ name, description, color, emoji }) =>
            ops.editProject(project.id, { name, description: description ?? undefined, color, emoji })
          }
        />
      )}
      {showAddTask && (
        <ProjectTaskModal
          mode="create"
          defaultSectionId={addTaskSectionId}
          onClose={() => setShowAddTask(false)}
          onSubmit={({ title, description, priority, deadline, sectionId }) =>
            ops.addTask(project.id, title, priority, deadline, description, sectionId)
          }
        />
      )}
      {editTask && (
        <ProjectTaskModal
          mode="edit"
          initial={editTask}
          onClose={() => setEditTask(null)}
          onSubmit={({ title, description, priority, deadline }) =>
            ops.editTask(project.id, editTask.id, { title, description, priority, deadline })
          }
        />
      )}
      {showDeleteConfirm && (
        <ConfirmDialog
          title={`Delete «${project.name}»?`}
          message={`This will permanently delete the project and all ${project.tasks.length} tasks. This action cannot be undone.`}
          confirmLabel="Delete"
          destructive
          onConfirm={() => { ops.deleteProject(project.id); onBack(); }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
};
