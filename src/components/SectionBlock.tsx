import React, { useEffect, useRef, useState } from 'react';
import type { ProjectTask } from '../types';
import { PROJECT_ICON_MAP, PROJECT_ICON_OPTIONS } from '../projectIcons';
import { ProjectTaskRow, DragDotsIcon } from './ProjectTaskRow';
import { InlineAddTask } from './InlineAddTask';
import { AltArrowDown, AddSquare, TrashBinMinimalistic, CloseCircle } from '@solar-icons/react';

// ─── Icon picker outside-click helper ────────────────────────────────────────

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

// ─── Types ────────────────────────────────────────────────────────────────────

interface Section {
  id: string;
  title: string;
  order: number;
  icon?: string | null;
}

interface Colors {
  bg: string;
  text: string;
  border: string;
  dot: string;
}

interface Props {
  section: Section;
  tasks: ProjectTask[];
  colors: Colors;
  onToggleTask: (taskId: string) => void;
  onEditTask: (task: ProjectTask) => void;
  onDeleteTask: (taskId: string) => void;
  onEditSection: (newTitle: string, icon?: string) => void;
  onDeleteSection: () => void;
  onAddTask: (title: string) => void;
  onOpenAddTaskModal: () => void;
  onTaskDragPointerDown: (e: React.PointerEvent, taskId: string, sectionId: string | undefined) => void;
  onSectionDragPointerDown: (e: React.PointerEvent, sectionId: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const SectionBlock: React.FC<Props> = ({
  section, tasks, colors,
  onToggleTask, onEditTask, onDeleteTask,
  onEditSection, onDeleteSection,
  onAddTask, onOpenAddTaskModal,
  onTaskDragPointerDown, onSectionDragPointerDown,
}) => {
  const [collapsed, setCollapsed]           = useState(false);
  const [editing, setEditing]               = useState(false);
  const [editVal, setEditVal]               = useState(section.title);
  const [showIconPicker, setShowIconPicker] = useState(false);

  const done = tasks.filter(t => t.completed).length;
  const SectionIcon = section.icon ? PROJECT_ICON_MAP[section.icon] : null;

  const commitEdit = () => {
    if (editVal.trim()) onEditSection(editVal.trim(), section.icon ?? undefined);
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

        {/* Icon picker */}
        {SectionIcon ? (
          <div className="relative flex-shrink-0">
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
                className="absolute left-0 z-50 rounded-2xl p-2.5 shadow-cozy"
                style={{
                  top: '32px', background: 'var(--bg-card)',
                  border: '1.5px solid var(--border)',
                  display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: '4px', width: '196px',
                }}
              >
                <button
                  onClick={() => handleIconSelect(section.icon!)}
                  className="col-span-5 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-body transition-all hover:opacity-80 mb-1"
                  style={{ color: 'var(--text-muted)', background: 'var(--bg-panel)' }}
                >
                  <CloseCircle size={12} /> Remove icon
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
                <IconPickerOutsideClick onClose={() => setShowIconPicker(false)} />
              </div>
            )}
          </div>
        ) : (
          <div className="relative flex-shrink-0" style={{ width: 0, overflow: 'visible' }}>
            {showIconPicker && (
              <div
                className="absolute left-0 z-50 rounded-2xl p-2.5 shadow-cozy"
                style={{
                  top: '8px', background: 'var(--bg-card)',
                  border: '1.5px solid var(--border)',
                  display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: '4px', width: '196px',
                }}
              >
                {PROJECT_ICON_OPTIONS.map(({ key, Icon }) => (
                  <button
                    key={key}
                    onClick={() => handleIconSelect(key)}
                    className="w-8 h-8 flex items-center justify-center rounded-xl transition-all hover:scale-110 active:scale-90"
                    style={{ background: 'var(--bg-panel)', color: 'var(--text-muted)' }}
                  >
                    <Icon size={15} />
                  </button>
                ))}
                <IconPickerOutsideClick onClose={() => setShowIconPicker(false)} />
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
          {tasks.length > 0 && (
            <div className="flex flex-col">
              {tasks.map(task => (
                <ProjectTaskRow
                  key={task.id}
                  task={task}
                  dotColor={colors.dot}
                  onToggle={() => onToggleTask(task.id)}
                  onEdit={() => onEditTask(task)}
                  onDelete={() => onDeleteTask(task.id)}
                  onDragHandlePointerDown={(e) => onTaskDragPointerDown(e, task.id, task.sectionId ?? undefined)}
                />
              ))}
            </div>
          )}
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
