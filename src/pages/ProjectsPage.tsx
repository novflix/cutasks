import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useProjects } from '../hooks/useProjects';
import { useDragDrop } from '../hooks/useDragDrop';
import { useTheme } from '../hooks/useTheme';
import type { Project, ProjectTask, Priority, ProjectColor } from '../types';
import { resolveProjectColors } from '../types';
import { PROJECT_ICON_MAP, PROJECT_ICON_OPTIONS } from '../projectIcons';
import { ProjectModal } from '../components/ProjectModal';
import { DatePicker } from '../components/DatePicker';
import {
  AddSquare,
  FolderOpen,
  TrashBinMinimalistic,
  PenNewSquare,
  AltArrowLeft,
  AltArrowDown,
  CloseCircle,
  CheckCircle,
  AddCircle,
} from '@solar-icons/react';

// ─── Drag dots icon ───────────────────────────────────────────────────────────
const DragDotsIcon: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <svg width={size * 0.57} height={size} viewBox="0 0 8 14" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <circle cx="2" cy="2"  r="1.5" />
    <circle cx="6" cy="2"  r="1.5" />
    <circle cx="2" cy="7"  r="1.5" />
    <circle cx="6" cy="7"  r="1.5" />
    <circle cx="2" cy="12" r="1.5" />
    <circle cx="6" cy="12" r="1.5" />
  </svg>
);

// ─── Project icon ─────────────────────────────────────────────────────────────
const ProjectIcon: React.FC<{ iconKey?: string; size?: number }> = ({ iconKey, size = 18 }) => {
  if (!iconKey) return null;
  const Icon = PROJECT_ICON_MAP[iconKey];
  if (!Icon) return null;
  return <Icon size={size} />;
};

// ─── Priority config ──────────────────────────────────────────────────────────
const PRIORITIES: { value: Priority; label: string; cls: string }[] = [
  { value: 'low',    label: 'Low',    cls: 'border-sage-200  text-sage-500  bg-sage-100  dark:bg-sage-500/10  dark:border-sage-500/30' },
  { value: 'medium', label: 'Medium', cls: 'border-amber-200 text-amber-500 bg-amber-100 dark:bg-amber-500/10 dark:border-amber-500/30' },
  { value: 'high',   label: 'High',   cls: 'border-blush-200 text-blush-500 bg-blush-100 dark:bg-blush-500/10 dark:border-blush-500/30' },
];

// ─── Task modal ───────────────────────────────────────────────────────────────
const ProjectTaskModal: React.FC<{
  mode: 'create' | 'edit';
  initial?: ProjectTask;
  defaultSectionId?: string;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description?: string;
    priority: Priority;
    deadline?: string;
    sectionId?: string;
  }) => void;
}> = ({ mode, initial, defaultSectionId, onClose, onSubmit }) => {
  const [title, setTitle]       = useState(initial?.title ?? '');
  const [desc, setDesc]         = useState(initial?.description ?? '');
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? 'medium');
  const [deadline, setDeadline] = useState(initial?.deadline ?? '');
  const sectionId               = initial?.sectionId ?? defaultSectionId;
  const [shake, setShake]       = useState(false);
  const titleRef                = useRef<HTMLInputElement>(null);
  const overlayRef              = useRef<HTMLDivElement>(null);

  useEffect(() => { setTimeout(() => titleRef.current?.focus(), 100); }, []);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }
    onSubmit({ title, description: desc || undefined, priority, deadline: deadline || undefined, sectionId: sectionId || undefined });
    onClose();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
      style={{ background: 'rgba(26,22,20,0.35)' }}
    >
      <div
        className="w-full max-w-md animate-slide-up rounded-3xl shadow-cozy overflow-hidden"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="font-display text-xl font-semibold" style={{ color: 'var(--text-main)' }}>
            {mode === 'create' ? 'New task' : 'Edit task'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl transition-all hover:scale-105 active:scale-90" style={{ color: 'var(--text-muted)' }}>
            <CloseCircle size={20} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Task name</label>
            <input
              ref={titleRef}
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
              placeholder="What needs to be done?"
              className={`input-field ${shake ? 'animate-wiggle' : ''}`}
              maxLength={120}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
              Note <span className="normal-case opacity-60">(optional)</span>
            </label>
            <textarea
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="Add a little note..."
              rows={2}
              className="input-field resize-none"
              maxLength={300}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Priority</label>
            <div className="flex gap-2">
              {PRIORITIES.map(p => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-2xl border-2 text-sm font-medium font-body transition-all duration-150 ${
                    priority === p.value ? `${p.cls} shadow-soft scale-[1.03]` : 'hover:opacity-80'
                  }`}
                  style={priority !== p.value ? { borderColor: 'var(--border)', color: 'var(--text-muted)', background: 'var(--bg-panel)' } : {}}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
              Deadline <span className="normal-case opacity-60">(optional)</span>
            </label>
            <DatePicker value={deadline} onChange={setDeadline} min={new Date().toISOString().split('T')[0]} />
          </div>

          <div className="flex gap-2 mt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-2xl text-sm font-medium font-body border transition-all active:scale-95 hover:opacity-80"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', background: 'var(--bg-panel)' }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex-1 py-2.5 rounded-2xl text-sm font-medium font-body transition-all active:scale-95 hover:opacity-90 shadow-soft"
              style={{ background: 'var(--text-main)', color: 'var(--bg-main)' }}
            >
              {mode === 'create' ? 'Add task' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Task row ─────────────────────────────────────────────────────────────────
const PRIORITY_DOT: Record<string, string> = {
  high: '#c45a69', medium: '#be8c32', low: '#649158',
};

const ProjectTaskRow: React.FC<{
  task: ProjectTask;
  dotColor: string;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDragHandlePointerDown: (e: React.PointerEvent) => void;
}> = ({ task, dotColor, onToggle, onEdit, onDelete, onDragHandlePointerDown }) => {
  const isOverdue = task.deadline && !task.completed && task.deadline < new Date().toISOString().split('T')[0];

  return (
    <div
      className="group flex items-center gap-2 px-2 py-2 rounded-xl transition-colors duration-100 hover:bg-[var(--bg-panel)]"
      data-task-id={task.id}
      data-task-section={task.sectionId ?? ''}
    >
      {/* Drag handle */}
      <div
        onPointerDown={onDragHandlePointerDown}
        className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded cursor-grab active:cursor-grabbing select-none opacity-20 group-hover:opacity-50 sm:opacity-0 sm:group-hover:opacity-40 transition-opacity duration-150"
        style={{ color: 'var(--text-muted)', touchAction: 'none' }}
        data-drag-handle="true"
        aria-label="Drag to reorder"
      >
        <DragDotsIcon size={13} />
      </div>

      {/* Checkbox */}
      <button
        onClick={onToggle}
        className="flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-200 hover:scale-110"
        style={{ borderColor: task.completed ? dotColor : 'var(--border)', background: task.completed ? dotColor : 'transparent' }}
      >
        {task.completed && (
          <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
            <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-body leading-snug" style={{ color: task.completed ? 'var(--text-muted)' : 'var(--text-main)', textDecoration: task.completed ? 'line-through' : 'none' }}>
          {task.title}
        </p>
        {(task.description || task.deadline) && (
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {task.deadline && (
              <span className="text-xs font-body" style={{ color: isOverdue ? '#c45a69' : 'var(--text-muted)' }}>
                {isOverdue ? '⚠ ' : ''}
                {new Date(task.deadline + 'T00:00:00').toLocaleDateString('en', { month: 'short', day: 'numeric' })}
              </span>
            )}
            {task.description && (
              <span className="text-xs truncate max-w-[140px]" style={{ color: 'var(--text-muted)' }}>{task.description}</span>
            )}
          </div>
        )}
      </div>

      {/* Priority dot */}
      <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full" style={{ background: PRIORITY_DOT[task.priority] }} />

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button
          onClick={onEdit}
          className="w-6 h-6 rounded-lg flex items-center justify-center transition-all hover:scale-105 active:scale-90"
          style={{ color: 'var(--text-muted)' }}
        >
          <PenNewSquare size={13} />
        </button>
        <button
          onClick={onDelete}
          className="w-6 h-6 rounded-lg flex items-center justify-center transition-all hover:scale-105 active:scale-90"
          style={{ color: '#c45a69' }}
        >
          <TrashBinMinimalistic size={13} />
        </button>
      </div>
    </div>
  );
};

// ─── Inline add task row ──────────────────────────────────────────────────────
const InlineAddTask: React.FC<{
  accentColor: string;
  onAdd: (title: string) => void;
  onOpenModal: () => void;
}> = ({ accentColor, onAdd, onOpenModal }) => {
  const [active, setActive] = useState(false);
  const [val, setVal]       = useState('');
  const inputRef            = useRef<HTMLInputElement>(null);

  const activate = () => { setActive(true); setTimeout(() => inputRef.current?.focus(), 50); };
  const cancel   = () => { setActive(false); setVal(''); };

  const commit = () => {
    if (val.trim()) { onAdd(val.trim()); setVal(''); inputRef.current?.focus(); }
    else cancel();
  };

  if (!active) {
    return (
      <button
        onClick={activate}
        className="w-full flex items-center gap-2 px-2 py-2 rounded-xl text-sm font-body transition-all duration-150 opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100"
        style={{ color: accentColor }}
      >
        <AddCircle size={15} />
        <span>Add task</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 px-2 py-1.5 rounded-xl" style={{ background: 'var(--bg-panel)', border: `1.5px solid ${accentColor}40` }}>
      <input
        ref={inputRef}
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter')  commit();
          if (e.key === 'Escape') cancel();
        }}
        placeholder="Task name…"
        className="flex-1 bg-transparent text-sm font-body outline-none"
        style={{ color: 'var(--text-main)' }}
        maxLength={120}
      />
      <button
        onClick={onOpenModal}
        className="text-xs font-body px-2 py-0.5 rounded-lg transition-all hover:opacity-80"
        style={{ color: 'var(--text-muted)' }}
        title="More options"
      >
        ···
      </button>
      <button onClick={commit} style={{ color: accentColor }}><CheckCircle size={16} /></button>
      <button onClick={cancel} style={{ color: 'var(--text-muted)' }}><CloseCircle size={16} /></button>
    </div>
  );
};

// ─── Section block ────────────────────────────────────────────────────────────
const SectionBlock: React.FC<{
  section: { id: string; title: string; order: number; icon?: string };
  tasks: ProjectTask[];
  colors: { bg: string; text: string; border: string; dot: string };
  onToggleTask: (taskId: string) => void;
  onEditTask: (task: ProjectTask) => void;
  onDeleteTask: (taskId: string) => void;
  onEditSection: (newTitle: string, icon?: string) => void;
  onDeleteSection: () => void;
  onAddTask: (title: string) => void;
  onOpenAddTaskModal: () => void;
  onTaskDragPointerDown: (e: React.PointerEvent, taskId: string, sectionId: string | undefined) => void;
  onSectionDragPointerDown: (e: React.PointerEvent, sectionId: string) => void;
}> = ({
  section, tasks, colors,
  onToggleTask, onEditTask, onDeleteTask,
  onEditSection, onDeleteSection,
  onAddTask, onOpenAddTaskModal,
  onTaskDragPointerDown, onSectionDragPointerDown,
}) => {
  const [collapsed, setCollapsed]         = useState(false);
  const [editing, setEditing]             = useState(false);
  const [editVal, setEditVal]             = useState(section.title);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const done = tasks.filter(t => t.completed).length;
  const SectionIcon = section.icon ? PROJECT_ICON_MAP[section.icon] : null;

  // Close picker on outside click
  useEffect(() => {
    if (!showIconPicker) return;
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowIconPicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showIconPicker]);

  const commitEdit = () => {
    if (editVal.trim()) onEditSection(editVal.trim(), section.icon);
    else setEditVal(section.title);
    setEditing(false);
  };

  const handleIconSelect = (key: string) => {
    onEditSection(section.title, key === section.icon ? undefined : key);
    setShowIconPicker(false);
  };

  return (
    <div className="group mb-1" data-section-id={section.id}>
      {/* Section header */}
      <div
        className="group/sec flex items-center gap-1.5 py-1.5 px-1 rounded-xl hover:bg-[var(--bg-panel)] transition-colors duration-100"
        data-section-header-id={section.id}
      >
        {/* Drag handle */}
        <div
          onPointerDown={(e) => onSectionDragPointerDown(e, section.id)}
          className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded cursor-grab active:cursor-grabbing select-none opacity-0 group-hover/sec:opacity-40 transition-opacity duration-150"
          style={{ color: 'var(--text-muted)', touchAction: 'none' }}
          data-drag-handle="true"
        >
          <DragDotsIcon size={12} />
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="flex-shrink-0 w-5 h-5 flex items-center justify-center transition-all duration-200 rounded"
          style={{ color: 'var(--text-muted)', transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}
        >
          <AltArrowDown size={13} />
        </button>

        {/* Icon + picker — only takes space when icon is set */}
        {SectionIcon ? (
          <div ref={pickerRef} className="relative flex-shrink-0">
            <button
              onClick={() => setShowIconPicker(p => !p)}
              className="w-6 h-6 flex items-center justify-center rounded-lg transition-all hover:scale-110 active:scale-90"
              style={{ background: `${colors.dot}20`, color: colors.dot }}
              title="Change icon"
            >
              <SectionIcon size={13} />
            </button>

            {showIconPicker && (
              <div
                className="absolute left-0 top-8 z-50 rounded-2xl p-2.5 shadow-cozy"
                style={{
                  background: 'var(--bg-card)',
                  border: '1.5px solid var(--border)',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: '4px',
                  width: '196px',
                }}
              >
                <button
                  onClick={() => handleIconSelect(section.icon!)}
                  className="col-span-5 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-body transition-all hover:opacity-80 mb-1"
                  style={{ color: 'var(--text-muted)', background: 'var(--bg-panel)' }}
                >
                  <CloseCircle size={12} />
                  Remove icon
                </button>
                {PROJECT_ICON_OPTIONS.map(({ key, Icon }) => (
                  <button
                    key={key}
                    onClick={() => handleIconSelect(key)}
                    className="w-8 h-8 flex items-center justify-center rounded-xl transition-all hover:scale-110 active:scale-90"
                    style={{
                      background: section.icon === key ? `${colors.dot}25` : 'var(--bg-panel)',
                      color: section.icon === key ? colors.dot : 'var(--text-muted)',
                    }}
                  >
                    <Icon size={15} />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* No icon — picker ref still needed for dropdown positioning */
          <div ref={pickerRef} className="relative flex-shrink-0" style={{ width: 0, overflow: 'visible' }}>
            {showIconPicker && (
              <div
                className="absolute left-0 top-2 z-50 rounded-2xl p-2.5 shadow-cozy"
                style={{
                  background: 'var(--bg-card)',
                  border: '1.5px solid var(--border)',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: '4px',
                  width: '196px',
                }}
              >
                {PROJECT_ICON_OPTIONS.map(({ key, Icon }) => (
                  <button
                    key={key}
                    onClick={() => handleIconSelect(key)}
                    className="w-8 h-8 flex items-center justify-center rounded-xl transition-all hover:scale-110 active:scale-90"
                    style={{
                      background: 'var(--bg-panel)',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <Icon size={15} />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Title */}
        {editing ? (
          <input
            value={editVal}
            onChange={e => setEditVal(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter')  commitEdit();
              if (e.key === 'Escape') { setEditVal(section.title); setEditing(false); }
            }}
            onBlur={commitEdit}
            autoFocus
            className="flex-1 bg-transparent text-sm font-semibold font-body outline-none"
            style={{ color: colors.text, borderBottom: `1px solid ${colors.dot}` }}
          />
        ) : (
          <button
            className="flex-1 text-left text-sm font-semibold font-body hover:opacity-70 transition-opacity"
            style={{ color: colors.text }}
            onClick={() => setEditing(true)}
          >
            {section.title}
          </button>
        )}

        {/* Task count badge */}
        {tasks.length > 0 && (
          <span
            className="text-xs px-1.5 py-0.5 rounded-full font-body tabular-nums flex-shrink-0"
            style={{ background: colors.bg, color: colors.text }}
          >
            {done}/{tasks.length}
          </span>
        )}

        {/* Add icon hint — hover only, when no icon */}
        {!SectionIcon && (
          <button
            onClick={() => setShowIconPicker(p => !p)}
            className="flex-shrink-0 opacity-0 group-hover/sec:opacity-100 transition-all w-7 h-7 flex items-center justify-center rounded-xl"
            style={{ color: 'var(--text-muted)' }}
            onMouseOver={e => { e.currentTarget.style.background = 'var(--bg-panel)'; e.currentTarget.style.color = 'var(--text-main)'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            title="Add icon"
          >
            <AddSquare size={16} />
          </button>
        )}

        {/* Delete section */}
        <button
          onClick={onDeleteSection}
          className="flex-shrink-0 opacity-0 group-hover/sec:opacity-100 transition-all w-7 h-7 flex items-center justify-center rounded-xl"
          style={{ color: 'var(--text-muted)' }}
          onMouseOver={e => { e.currentTarget.style.background = 'rgba(196,90,105,0.12)'; e.currentTarget.style.color = '#c45a69'; }}
          onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          <TrashBinMinimalistic size={15} />
        </button>
      </div>

      {/* Section body */}
      {!collapsed && (
        <div
          className="ml-6 rounded-xl"
          data-section-drop-zone={section.id}
          style={{ minHeight: tasks.length === 0 ? '0' : undefined }}
        >
          {tasks.length === 0 ? null : (
            <div className="flex flex-col">
              {tasks.map(task => (
                <ProjectTaskRow
                  key={task.id}
                  task={task}
                  dotColor={colors.dot}
                  onToggle={() => onToggleTask(task.id)}
                  onEdit={() => onEditTask(task)}
                  onDelete={() => onDeleteTask(task.id)}
                  onDragHandlePointerDown={(e) => onTaskDragPointerDown(e, task.id, task.sectionId)}
                />
              ))}
            </div>
          )}
          {/* Inline add task */}
          <div className="mt-0.5">
            <InlineAddTask
              accentColor={colors.dot}
              onAdd={onAddTask}
              onOpenModal={onOpenAddTaskModal}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Project detail ───────────────────────────────────────────────────────────
const ProjectDetail: React.FC<{
  project: Project;
  onBack: () => void;
  ops: ReturnType<typeof useProjects>;
}> = ({ project, onBack, ops }) => {
  const { dark }  = useTheme();
  const colors    = resolveProjectColors(project.color, dark);

  const [showEdit, setShowEdit]             = useState(false);
  const [editTask, setEditTask]             = useState<ProjectTask | null>(null);
  const [showAddTask, setShowAddTask]       = useState(false);
  const [addTaskSectionId, setAddTaskSectionId] = useState<string | undefined>(undefined);
  const [showAddSection, setShowAddSection] = useState(false);
  const [addSectionVal, setAddSectionVal]   = useState('');
  const [addSectionIcon, setAddSectionIcon] = useState<string | undefined>(undefined);
  const [showNewSectionIconPicker, setShowNewSectionIconPicker] = useState(false);
  const sectionInputRef = useRef<HTMLDivElement>(null);
  const newSectionPickerRef = useRef<HTMLDivElement>(null);

  const totalTasks      = project.tasks.length;
  const doneTasks       = project.tasks.filter(t => t.completed).length;
  const progress        = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);
  const unsectioned     = project.tasks.filter(t => !t.sectionId);
  const getSectionTasks = (id: string) => project.tasks.filter(t => t.sectionId === id);
  const sortedSections  = [...project.sections].sort((a, b) => a.order - b.order);

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

  useEffect(() => {
    if (!showNewSectionIconPicker) return;
    const handler = (e: MouseEvent) => {
      if (newSectionPickerRef.current && !newSectionPickerRef.current.contains(e.target as Node)) {
        setShowNewSectionIconPicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showNewSectionIconPicker]);

  // ── Drag & drop ────────────────────────────────────
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
        className="rounded-2xl p-5 mb-5"
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

        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-body" style={{ color: colors.text, opacity: 0.75 }}>
              {doneTasks} of {totalTasks} task{totalTasks !== 1 ? 's' : ''} done
            </span>
            <span className="text-xs font-semibold font-body" style={{ color: colors.text }}>{progress}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: `${colors.dot}25` }}>
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progress}%`, background: colors.dot }} />
          </div>
        </div>

      </div>

      {/* ── Action buttons under header ── */}
      <div className="flex items-center gap-2 mb-5">
        {/* Add task button */}
        <button
          onClick={() => openAddTaskModal(undefined)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-body font-medium transition-all hover:opacity-90 active:scale-95"
          style={{ background: colors.bg, color: colors.text, border: `1.5px solid ${colors.border}` }}
        >
          <AddCircle size={15} />
          Add task
        </button>

        {/* Add section */}
        <button
          onClick={() => setShowAddSection(true)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-body transition-all hover:opacity-80 active:scale-95"
          style={{ color: 'var(--text-muted)', border: '1.5px solid var(--border)' }}
        >
          <AddSquare size={14} />
          Add section
        </button>
      </div>

      {/* ── Task list ── */}
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

        {/* Inline new section input */}
        {showAddSection && (
          <div
            ref={sectionInputRef}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl mt-1"
            style={{ background: 'var(--bg-panel)', border: `1.5px solid ${colors.border}` }}
          >
            {/* Icon picker for new section */}
            <div ref={newSectionPickerRef} className="relative flex-shrink-0">
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
                  className="absolute left-0 top-8 z-50 rounded-2xl p-2.5 shadow-cozy"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1.5px solid var(--border)',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: '4px',
                    width: '196px',
                  }}
                >
                  {addSectionIcon && (
                    <button
                      onClick={() => { setAddSectionIcon(undefined); setShowNewSectionIconPicker(false); }}
                      className="col-span-5 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-body transition-all hover:opacity-80 mb-1"
                      style={{ color: 'var(--text-muted)', background: 'var(--bg-panel)' }}
                    >
                      <CloseCircle size={12} />
                      Remove icon
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
                </div>
              )}
            </div>

            <input
              autoFocus
              value={addSectionVal}
              onChange={e => setAddSectionVal(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter')  handleAddSection();
                if (e.key === 'Escape') cancelAddSection();
              }}
              placeholder="Section name…"
              className="flex-1 bg-transparent text-sm font-body font-semibold outline-none"
              style={{ color: 'var(--text-main)' }}
              maxLength={60}
            />
            <button onClick={handleAddSection} style={{ color: colors.dot }}><CheckCircle size={16} /></button>
            <button onClick={cancelAddSection} style={{ color: 'var(--text-muted)' }}><CloseCircle size={16} /></button>
          </div>
        )}
      </div>

      {/* Modals */}
      {showEdit && (
        <ProjectModal
          mode="edit"
          initial={project}
          onClose={() => setShowEdit(false)}
          onSubmit={(data) => ops.editProject(project.id, data)}
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
          onSubmit={({ title, description, priority, deadline, sectionId }) =>
            ops.editTask(project.id, editTask.id, { title, description, priority, deadline, sectionId })
          }
        />
      )}
    </div>
  );
};

// ─── Project card ─────────────────────────────────────────────────────────────
const ProjectCard: React.FC<{ project: Project; onClick: () => void }> = ({ project, onClick }) => {
  const { dark } = useTheme();
  const colors   = resolveProjectColors(project.color, dark);
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

// ─── Main ─────────────────────────────────────────────────────────────────────
export const ProjectsPage: React.FC = () => {
  const ops = useProjects();
  const [showCreate, setShowCreate]           = useState(false);
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