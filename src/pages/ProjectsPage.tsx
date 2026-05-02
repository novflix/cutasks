import React, { useState, useRef, useEffect } from 'react';
import { useProjects } from '../hooks/useProjects';
import type { Project, ProjectTask, Priority, ProjectColor } from '../types';
import { PROJECT_COLORS } from '../types';
<<<<<<< HEAD
import { PROJECT_ICON_MAP } from '../projectIcons';
import { ProjectModal } from '../components/ProjectModal';
=======
import { ProjectModal, ICON_MAP } from '../components/ProjectModal';
>>>>>>> d5dae2bc79b8728d6429d3676700c6b0a7160013
import { TaskModal } from '../components/TaskModal';
import {
  AddSquare,
  FolderOpen,
  TrashBinMinimalistic,
  PenNewSquare,
  AltArrowLeft,
  AltArrowDown,
  AddCircle,
  CloseCircle,
  CheckCircle,
} from '@solar-icons/react';

// ─── Project icon renderer ────────────────────────────────────────────────────
const ProjectIcon: React.FC<{ iconKey?: string; size?: number }> = ({ iconKey, size = 18 }) => {
  if (!iconKey) return null;
<<<<<<< HEAD
  const Icon = PROJECT_ICON_MAP[iconKey];
=======
  const Icon = ICON_MAP[iconKey];
>>>>>>> d5dae2bc79b8728d6429d3676700c6b0a7160013
  if (!Icon) return null;
  return <Icon size={size} />;
};

// ─── Inline add task row ──────────────────────────────────────────────────────
const InlineAddTask: React.FC<{
  onAdd: (title: string) => void;
  dotColor: string;
}> = ({ onAdd, dotColor }) => {
  const [active, setActive] = useState(false);
  const [value, setValue]   = useState('');
  const inputRef            = useRef<HTMLInputElement>(null);

  const activate = () => { setActive(true); setTimeout(() => inputRef.current?.focus(), 60); };
  const cancel   = () => { setActive(false); setValue(''); };

  const commit = () => {
    if (value.trim()) { onAdd(value.trim()); setValue(''); inputRef.current?.focus(); }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter')  commit();
    if (e.key === 'Escape') cancel();
  };

  if (!active) {
    return (
      <button
        onClick={activate}
<<<<<<< HEAD
        className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm transition-all duration-150 active:scale-[0.98]"
=======
        className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm transition-all duration-150 hover:opacity-100 active:scale-[0.98]"
>>>>>>> d5dae2bc79b8728d6429d3676700c6b0a7160013
        style={{ color: 'var(--text-muted)', opacity: 0.65 }}
      >
        <AddCircle size={15} />
        <span className="font-body">Add task</span>
      </button>
    );
  }

  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-xl"
      style={{
        background: 'var(--bg-panel)',
        border: `1.5px solid ${dotColor}`,
        boxShadow: `0 0 0 3px ${dotColor}1a`,
      }}
    >
      <div className="w-4 h-4 rounded-full border-2 flex-shrink-0" style={{ borderColor: dotColor }} />
      <input
        ref={inputRef}
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKey}
        placeholder="Task name, press Enter to add"
        className="flex-1 bg-transparent text-sm font-body outline-none"
        style={{ color: 'var(--text-main)' }}
      />
<<<<<<< HEAD
      <button onClick={commit} className="transition-opacity hover:opacity-70" style={{ color: dotColor }}><CheckCircle size={18} /></button>
      <button onClick={cancel} className="transition-opacity hover:opacity-70" style={{ color: 'var(--text-muted)' }}><CloseCircle size={18} /></button>
=======
      <button onClick={commit}  className="transition-opacity hover:opacity-70" style={{ color: dotColor }}><CheckCircle size={18} /></button>
      <button onClick={cancel}  className="transition-opacity hover:opacity-70" style={{ color: 'var(--text-muted)' }}><CloseCircle size={18} /></button>
>>>>>>> d5dae2bc79b8728d6429d3676700c6b0a7160013
    </div>
  );
};

// ─── Task row ─────────────────────────────────────────────────────────────────
const ProjectTaskRow: React.FC<{
  task: ProjectTask;
  dotColor: string;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ task, dotColor, onToggle, onEdit, onDelete }) => {
  const isOverdue = task.deadline && !task.completed && task.deadline < new Date().toISOString().split('T')[0];

  const priorityDot: Record<string, string> = {
    high: '#c45a69',
    medium: '#be8c32',
    low: '#649158',
  };

  return (
    <div
      className="group flex items-start gap-3 px-3 py-2.5 transition-all duration-150 hover:bg-[var(--bg-panel)]"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      <button
        onClick={onToggle}
        className="flex-shrink-0 mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-200 hover:scale-110"
        style={{
          borderColor: task.completed ? dotColor : 'var(--border)',
          background: task.completed ? dotColor : 'transparent',
        }}
      >
        {task.completed && (
          <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
            <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-body leading-snug"
          style={{
            color: task.completed ? 'var(--text-muted)' : 'var(--text-main)',
            textDecoration: task.completed ? 'line-through' : 'none',
          }}
        >
          {task.title}
        </p>
        {task.description && (
          <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{task.description}</p>
        )}
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {task.deadline && (
            <span className="text-xs font-body" style={{ color: isOverdue ? '#c45a69' : 'var(--text-muted)' }}>
              {isOverdue ? '! ' : ''}
              {new Date(task.deadline + 'T00:00:00').toLocaleDateString('en', { month: 'short', day: 'numeric' })}
            </span>
          )}
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: priorityDot[task.priority] }} />
          <span className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{task.priority}</span>
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button
          onClick={onEdit}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-105 active:scale-90"
          style={{ color: 'var(--text-muted)', background: 'var(--bg-panel)' }}
        >
          <PenNewSquare size={14} />
        </button>
        <button
          onClick={onDelete}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-105 active:scale-90"
          style={{ color: '#c45a69', background: 'rgba(196,90,105,0.1)' }}
        >
          <TrashBinMinimalistic size={14} />
        </button>
      </div>
    </div>
  );
};

// ─── Section block ────────────────────────────────────────────────────────────
const SectionBlock: React.FC<{
  title: string;
<<<<<<< HEAD
=======
  sectionId: string;
>>>>>>> d5dae2bc79b8728d6429d3676700c6b0a7160013
  tasks: ProjectTask[];
  colors: typeof PROJECT_COLORS[ProjectColor];
  onAddTask: (title: string) => void;
  onToggleTask: (taskId: string) => void;
  onEditTask: (task: ProjectTask) => void;
  onDeleteTask: (taskId: string) => void;
  onEditSection: (newTitle: string) => void;
  onDeleteSection: () => void;
<<<<<<< HEAD
}> = ({ title, tasks, colors, onAddTask, onToggleTask, onEditTask, onDeleteTask, onEditSection, onDeleteSection }) => {
=======
}> = ({ title, sectionId, tasks, colors, onAddTask, onToggleTask, onEditTask, onDeleteTask, onEditSection, onDeleteSection }) => {
>>>>>>> d5dae2bc79b8728d6429d3676700c6b0a7160013
  const [collapsed, setCollapsed] = useState(false);
  const [editing, setEditing]     = useState(false);
  const [editVal, setEditVal]     = useState(title);

  const done = tasks.filter(t => t.completed).length;

  const commitEdit = () => {
    if (editVal.trim()) onEditSection(editVal.trim());
    else setEditVal(title);
    setEditing(false);
  };

  return (
    <div className="mb-3">
<<<<<<< HEAD
=======
      {/* Section header */}
>>>>>>> d5dae2bc79b8728d6429d3676700c6b0a7160013
      <div className="flex items-center gap-2 mb-2 group/sec">
        <button
          onClick={() => setCollapsed(c => !c)}
          className="transition-transform duration-200 flex-shrink-0"
          style={{
            color: 'var(--text-muted)',
            transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
          }}
        >
          <AltArrowDown size={14} />
        </button>

        {editing ? (
          <input
            value={editVal}
            onChange={e => setEditVal(e.target.value)}
<<<<<<< HEAD
            onKeyDown={e => {
              if (e.key === 'Enter')  commitEdit();
              if (e.key === 'Escape') { setEditVal(title); setEditing(false); }
            }}
=======
            onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') { setEditVal(title); setEditing(false); } }}
>>>>>>> d5dae2bc79b8728d6429d3676700c6b0a7160013
            onBlur={commitEdit}
            autoFocus
            className="flex-1 bg-transparent text-sm font-semibold font-body outline-none"
            style={{ color: colors.text, borderBottom: `1px solid ${colors.dot}` }}
          />
        ) : (
          <span
            className="text-sm font-semibold font-body tracking-wide cursor-pointer hover:opacity-70 transition-opacity"
            style={{ color: colors.text }}
            onClick={() => setEditing(true)}
          >
            {title}
          </span>
        )}

        {tasks.length > 0 && (
          <span
            className="text-xs px-1.5 py-0.5 rounded-full font-body tabular-nums"
            style={{ background: colors.bg, color: colors.text }}
          >
            {done}/{tasks.length}
          </span>
        )}

        <button
          onClick={onDeleteSection}
          className="opacity-0 group-hover/sec:opacity-100 transition-opacity ml-auto w-6 h-6 flex items-center justify-center rounded-lg"
          style={{ color: 'var(--text-muted)' }}
<<<<<<< HEAD
=======
          title={`Delete section "${title}"`}
>>>>>>> d5dae2bc79b8728d6429d3676700c6b0a7160013
        >
          <CloseCircle size={14} />
        </button>
      </div>

<<<<<<< HEAD
=======
      {/* Tasks */}
>>>>>>> d5dae2bc79b8728d6429d3676700c6b0a7160013
      {!collapsed && (
        <div className="ml-5">
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: `1px solid var(--border)`, background: 'var(--bg-card)' }}
          >
            {tasks.length === 0 && (
              <p className="text-xs px-3 py-2.5 italic" style={{ color: 'var(--text-muted)' }}>No tasks yet</p>
            )}
            {tasks.map(task => (
              <ProjectTaskRow
                key={task.id}
                task={task}
                dotColor={colors.dot}
                onToggle={() => onToggleTask(task.id)}
                onEdit={() => onEditTask(task)}
                onDelete={() => onDeleteTask(task.id)}
              />
            ))}
            <div className="p-2">
              <InlineAddTask onAdd={onAddTask} dotColor={colors.dot} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

<<<<<<< HEAD
// ─── Unsectioned tasks block ──────────────────────────────────────────────────
const UnsectionedBlock: React.FC<{
  tasks: ProjectTask[];
  colors: typeof PROJECT_COLORS[ProjectColor];
  hasSections: boolean;
=======
// ─── Unsectioned tasks block (no header, always visible) ──────────────────────
const UnsectionedBlock: React.FC<{
  tasks: ProjectTask[];
  colors: typeof PROJECT_COLORS[ProjectColor];
>>>>>>> d5dae2bc79b8728d6429d3676700c6b0a7160013
  onAddTask: (title: string) => void;
  onToggleTask: (taskId: string) => void;
  onEditTask: (task: ProjectTask) => void;
  onDeleteTask: (taskId: string) => void;
<<<<<<< HEAD
}> = ({ tasks, colors, hasSections, onAddTask, onToggleTask, onEditTask, onDeleteTask }) => {
  if (hasSections && tasks.length === 0) return null;

  return (
    <div className="mb-3">
      {hasSections && (
=======
  hasSections: boolean;
}> = ({ tasks, colors, onAddTask, onToggleTask, onEditTask, onDeleteTask, hasSections }) => {
  // Only render the block if there are tasks or no sections yet (show a default add-row)
  const show = tasks.length > 0 || !hasSections;
  if (!show) return null;

  return (
    <div className="mb-3">
      {hasSections && tasks.length > 0 && (
>>>>>>> d5dae2bc79b8728d6429d3676700c6b0a7160013
        <p className="text-xs font-semibold font-body uppercase tracking-widest mb-2 ml-0.5" style={{ color: 'var(--text-muted)' }}>
          Unsorted
        </p>
      )}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: `1px solid var(--border)`, background: 'var(--bg-card)' }}
      >
<<<<<<< HEAD
        {tasks.length === 0 && (
=======
        {tasks.length === 0 && !hasSections && (
>>>>>>> d5dae2bc79b8728d6429d3676700c6b0a7160013
          <p className="text-xs px-3 py-2.5 italic" style={{ color: 'var(--text-muted)' }}>
            No tasks yet — add one below or create a section
          </p>
        )}
        {tasks.map(task => (
          <ProjectTaskRow
            key={task.id}
            task={task}
            dotColor={colors.dot}
            onToggle={() => onToggleTask(task.id)}
            onEdit={() => onEditTask(task)}
            onDelete={() => onDeleteTask(task.id)}
          />
        ))}
        <div className="p-2">
          <InlineAddTask onAdd={onAddTask} dotColor={colors.dot} />
        </div>
      </div>
    </div>
  );
};

// ─── Project Detail ───────────────────────────────────────────────────────────
const ProjectDetail: React.FC<{
  project: Project;
  onBack: () => void;
  ops: ReturnType<typeof useProjects>;
}> = ({ project, onBack, ops }) => {
  const colors = PROJECT_COLORS[project.color];
  const [showEdit, setShowEdit]             = useState(false);
  const [editTask, setEditTask]             = useState<ProjectTask | null>(null);
  const [addSectionVal, setAddSectionVal]   = useState('');
  const [showAddSection, setShowAddSection] = useState(false);
  const sectionInputRef = useRef<HTMLInputElement>(null);

<<<<<<< HEAD
  const totalTasks     = project.tasks.length;
  const doneTasks      = project.tasks.filter(t => t.completed).length;
  const progress       = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);
  const unsectioned    = project.tasks.filter(t => !t.sectionId);
  const getSectionTasks = (id: string) => project.tasks.filter(t => t.sectionId === id);
  const sortedSections  = [...project.sections].sort((a, b) => a.order - b.order);
  const hasSections     = sortedSections.length > 0;
=======
  const totalTasks = project.tasks.length;
  const doneTasks  = project.tasks.filter(t => t.completed).length;
  const progress   = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

  const unsectionedTasks = project.tasks.filter(t => !t.sectionId);
  const getSectionTasks  = (sectionId: string) => project.tasks.filter(t => t.sectionId === sectionId);
  const sortedSections   = [...project.sections].sort((a, b) => a.order - b.order);
  const hasSections      = sortedSections.length > 0;
>>>>>>> d5dae2bc79b8728d6429d3676700c6b0a7160013

  const handleAddSection = () => {
    if (addSectionVal.trim()) {
      ops.addSection(project.id, addSectionVal.trim());
      setAddSectionVal('');
      setShowAddSection(false);
    }
  };

  useEffect(() => {
    if (showAddSection) setTimeout(() => sectionInputRef.current?.focus(), 60);
  }, [showAddSection]);

  return (
    <div>
<<<<<<< HEAD
=======
      {/* Back */}
>>>>>>> d5dae2bc79b8728d6429d3676700c6b0a7160013
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-body mb-5 transition-opacity hover:opacity-70"
        style={{ color: 'var(--text-muted)' }}
      >
        <AltArrowLeft size={16} />
        All projects
      </button>

<<<<<<< HEAD
      {/* Project header */}
=======
      {/* Project header card */}
>>>>>>> d5dae2bc79b8728d6429d3676700c6b0a7160013
      <div
        className="rounded-2xl p-5 mb-6"
        style={{ background: colors.bg, border: `1.5px solid ${colors.border}` }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {project.emoji && (
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${colors.dot}22`, color: colors.dot }}
              >
                <ProjectIcon iconKey={project.emoji} size={20} />
              </div>
            )}
            <div>
              <h1 className="font-display text-2xl font-semibold leading-tight" style={{ color: colors.text }}>
                {project.name}
              </h1>
              {project.description && (
                <p className="text-sm mt-0.5 font-body" style={{ color: colors.text, opacity: 0.7 }}>
                  {project.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => setShowEdit(true)}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-90"
              style={{ color: colors.text, background: `${colors.dot}1a` }}
            >
              <PenNewSquare size={15} />
            </button>
            <button
              onClick={() => { ops.deleteProject(project.id); onBack(); }}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-90"
              style={{ color: '#c45a69', background: 'rgba(196,90,105,0.1)' }}
            >
              <TrashBinMinimalistic size={15} />
            </button>
          </div>
        </div>

<<<<<<< HEAD
=======
        {/* Progress */}
>>>>>>> d5dae2bc79b8728d6429d3676700c6b0a7160013
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-body" style={{ color: colors.text, opacity: 0.75 }}>
              {doneTasks} of {totalTasks} task{totalTasks !== 1 ? 's' : ''} done
            </span>
            <span className="text-xs font-semibold font-body" style={{ color: colors.text }}>{progress}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: `${colors.dot}25` }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${progress}%`, background: colors.dot }}
            />
          </div>
        </div>
      </div>

<<<<<<< HEAD
      {/* Unsectioned tasks */}
      <UnsectionedBlock
        tasks={unsectioned}
        colors={colors}
        hasSections={hasSections}
        onAddTask={(title) => ops.addTask(project.id, title, 'medium')}
=======
      {/* Unsectioned tasks (always first) */}
      <UnsectionedBlock
        tasks={unsectionedTasks}
        colors={colors}
        hasSections={hasSections}
        onAddTask={(title) => ops.addTask(project.id, title, 'medium', undefined, undefined, undefined)}
>>>>>>> d5dae2bc79b8728d6429d3676700c6b0a7160013
        onToggleTask={(tid) => ops.toggleTask(project.id, tid)}
        onEditTask={(task) => setEditTask(task)}
        onDeleteTask={(tid) => ops.deleteTask(project.id, tid)}
      />

      {/* Named sections */}
      {sortedSections.map(sec => (
        <SectionBlock
          key={sec.id}
          title={sec.title}
<<<<<<< HEAD
=======
          sectionId={sec.id}
>>>>>>> d5dae2bc79b8728d6429d3676700c6b0a7160013
          tasks={getSectionTasks(sec.id)}
          colors={colors}
          onAddTask={(title) => ops.addTask(project.id, title, 'medium', undefined, undefined, sec.id)}
          onToggleTask={(tid) => ops.toggleTask(project.id, tid)}
          onEditTask={(task) => setEditTask(task)}
          onDeleteTask={(tid) => ops.deleteTask(project.id, tid)}
          onEditSection={(newTitle) => ops.editSection(project.id, sec.id, newTitle)}
          onDeleteSection={() => ops.deleteSection(project.id, sec.id)}
        />
      ))}

      {/* Add section */}
      <div className="mt-2 mb-8">
        {showAddSection ? (
          <div
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
            style={{ background: 'var(--bg-panel)', border: `1.5px solid ${colors.border}` }}
          >
            <input
              ref={sectionInputRef}
              value={addSectionVal}
              onChange={e => setAddSectionVal(e.target.value)}
<<<<<<< HEAD
              onKeyDown={e => {
                if (e.key === 'Enter')  handleAddSection();
                if (e.key === 'Escape') { setShowAddSection(false); setAddSectionVal(''); }
              }}
=======
              onKeyDown={e => { if (e.key === 'Enter') handleAddSection(); if (e.key === 'Escape') { setShowAddSection(false); setAddSectionVal(''); } }}
>>>>>>> d5dae2bc79b8728d6429d3676700c6b0a7160013
              placeholder="Section name"
              className="flex-1 bg-transparent text-sm font-body outline-none"
              style={{ color: 'var(--text-main)' }}
            />
            <button onClick={handleAddSection} style={{ color: colors.dot }}><CheckCircle size={18} /></button>
            <button onClick={() => { setShowAddSection(false); setAddSectionVal(''); }} style={{ color: 'var(--text-muted)' }}><CloseCircle size={18} /></button>
          </div>
        ) : (
          <button
            onClick={() => setShowAddSection(true)}
            className="flex items-center gap-2 text-sm font-body transition-opacity hover:opacity-100"
            style={{ color: 'var(--text-muted)', opacity: 0.6 }}
          >
            <AddCircle size={15} />
            Add section
          </button>
        )}
      </div>

      {showEdit && (
        <ProjectModal
          mode="edit"
          initial={project}
          onClose={() => setShowEdit(false)}
          onSubmit={(data) => ops.editProject(project.id, data)}
        />
      )}
<<<<<<< HEAD
=======

>>>>>>> d5dae2bc79b8728d6429d3676700c6b0a7160013
      {editTask && (
        <TaskModal
          mode="edit"
          initial={editTask}
          onClose={() => setEditTask(null)}
          onSubmit={({ title, description, priority, deadline }) =>
            ops.editTask(project.id, editTask.id, { title, description, priority: priority as Priority, deadline })
          }
        />
      )}
    </div>
  );
};

// ─── Project card ─────────────────────────────────────────────────────────────
const ProjectCard: React.FC<{ project: Project; onClick: () => void }> = ({ project, onClick }) => {
  const colors   = PROJECT_COLORS[project.color];
  const total    = project.tasks.length;
  const done     = project.tasks.filter(t => t.completed).length;
  const progress = total === 0 ? 0 : Math.round((done / total) * 100);
  const overdue  = project.tasks.filter(t =>
    t.deadline && !t.completed && t.deadline < new Date().toISOString().split('T')[0],
  ).length;

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl p-4 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
      style={{
        background: 'var(--bg-card)',
        border: '1.5px solid var(--border)',
        boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
      }}
    >
      <div className="flex items-start gap-3">
<<<<<<< HEAD
=======
        {/* Icon */}
>>>>>>> d5dae2bc79b8728d6429d3676700c6b0a7160013
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: colors.bg, border: `1px solid ${colors.border}`, color: colors.dot }}
        >
          {project.emoji
            ? <ProjectIcon iconKey={project.emoji} size={18} />
<<<<<<< HEAD
            : <span className="w-2.5 h-2.5 rounded-full block" style={{ background: colors.dot }} />
=======
            : <span className="w-2.5 h-2.5 rounded-full" style={{ background: colors.dot, display: 'block' }} />
>>>>>>> d5dae2bc79b8728d6429d3676700c6b0a7160013
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
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, background: colors.dot }}
              />
            </div>
          </div>
        </div>
      </div>

      {project.sections.length > 0 && (
<<<<<<< HEAD
        <div className="flex gap-1.5 mt-3 flex-wrap">
=======
        <div className="flex gap-1.5 mt-3 flex-wrap ml-13">
>>>>>>> d5dae2bc79b8728d6429d3676700c6b0a7160013
          {project.sections.map(sec => (
            <span
              key={sec.id}
              className="text-xs px-2 py-0.5 rounded-full font-body"
              style={{ background: colors.bg, color: colors.text }}
            >
              {sec.title}
            </span>
          ))}
        </div>
      )}
    </button>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
export const ProjectsPage: React.FC = () => {
  const ops = useProjects();
<<<<<<< HEAD
  const [showCreate, setShowCreate]         = useState(false);
=======
  const [showCreate, setShowCreate]       = useState(false);
>>>>>>> d5dae2bc79b8728d6429d3676700c6b0a7160013
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  const liveProject = activeProjectId
    ? ops.projects.find(p => p.id === activeProjectId) ?? null
    : null;

  if (liveProject) {
    return (
      <ProjectDetail
        project={liveProject}
        onBack={() => setActiveProjectId(null)}
        ops={ops}
      />
    );
  }

  return (
    <>
<<<<<<< HEAD
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
=======
      <header className="flex items-start justify-between mb-8">
        <div>
          <p className="text-xs font-body font-medium uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>
            Workspace
          </p>
          <h1 className="font-display text-3xl font-semibold" style={{ color: 'var(--text-main)' }}>Projects</h1>
          <p className="mt-1 text-sm font-body" style={{ color: 'var(--text-muted)' }}>
            {ops.projects.length === 0
              ? 'Create your first project to get started'
              : `${ops.projects.length} project${ops.projects.length === 1 ? '' : 's'}`}
          </p>
        </div>
>>>>>>> d5dae2bc79b8728d6429d3676700c6b0a7160013
      </header>

      {ops.projects.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 rounded-2xl"
          style={{ border: '1.5px dashed var(--border)' }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'var(--bg-panel)' }}
          >
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
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => setActiveProjectId(project.id)}
            />
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
          onSubmit={({ name, description, color, emoji }) => {
            const id = ops.createProject(name, color as ProjectColor, emoji, description);
            setTimeout(() => setActiveProjectId(id), 30);
          }}
        />
      )}
    </>
  );
};