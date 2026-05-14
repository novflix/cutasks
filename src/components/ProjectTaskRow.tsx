import React, { useState, useRef, useCallback, useMemo } from 'react';
import type { ProjectTask } from '../types';
import { getDeletionDelay } from '../hooks/useTaskDeletion';
import { PenNewSquare, TrashBinMinimalistic } from '@solar-icons/react';

// ─── Shared helpers ───────────────────────────────────────────────────────────

export const PRIORITY_DOT: Record<string, string> = {
  high: '#c45a69', medium: '#be8c32', low: '#649158',
};

const PRIORITY_LABEL: Record<string, string> = {
  high: 'High', medium: 'Medium', low: 'Low',
};

export function formatTaskDeadline(date: string): { label: string; overdue: boolean; soon: boolean } {
  const d = new Date(date + 'T00:00:00');
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const diff = Math.round((d.getTime() - now.getTime()) / 86400000);
  const overdue = diff < 0;
  const soon = diff >= 0 && diff <= 2;
  let label: string;
  if (diff === 0)       label = 'Today';
  else if (diff === 1)  label = 'Tomorrow';
  else if (diff === -1) label = 'Yesterday';
  else if (diff < -1)   label = `${Math.abs(diff)}d overdue`;
  else                  label = d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
  return { label, overdue, soon };
}

// ─── Drag dots icon ───────────────────────────────────────────────────────────

export const DragDotsIcon: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <svg width={size * 0.57} height={size} viewBox="0 0 8 14" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <circle cx="2" cy="2"  r="1.5" />
    <circle cx="6" cy="2"  r="1.5" />
    <circle cx="2" cy="7"  r="1.5" />
    <circle cx="6" cy="7"  r="1.5" />
    <circle cx="2" cy="12" r="1.5" />
    <circle cx="6" cy="12" r="1.5" />
  </svg>
);

// ─── Burst animation constants ────────────────────────────────────────────────

const MINI_BURST_COLORS = ['#ed9b6d', '#f5b800', '#6da07a', '#9b84d8', '#d45c5c', '#3d96e0'];

const MINI_BURST_OFFSETS = Array.from({ length: 8 }, (_, i) => ({
  angleJitter: (i * 41 + 7) % 18,
  dist: 12 + (i * 11 + 5) % 8,
  size: 2.5 + (i * 5 + 2) % 2,
}));

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  task: ProjectTask;
  dotColor: string;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDragHandlePointerDown: (e: React.PointerEvent) => void;
}

export const ProjectTaskRow: React.FC<Props> = ({
  task, dotColor, onToggle, onEdit, onDelete, onDragHandlePointerDown,
}) => {
  const [deleting, setDeleting]   = useState(false);
  const [bursting, setBursting]   = useState(false);
  const [vanishing, setVanishing] = useState(false);
  const burstTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const deadline = task.deadline ? formatTaskDeadline(task.deadline) : null;
  const priorityColor = PRIORITY_DOT[task.priority] ?? dotColor;

  const handleDelete = () => {
    setDeleting(true);
    setTimeout(onDelete, 250);
  };

  const handleToggle = useCallback(() => {
    if (!task.completed) {
      setBursting(true);
      if (burstTimer.current) clearTimeout(burstTimer.current);
      burstTimer.current = setTimeout(() => setBursting(false), 550);

      if (getDeletionDelay() === 'immediate') {
        setVanishing(true);
        setTimeout(onToggle, 500);
        return;
      }
    }
    onToggle();
  }, [task.completed, onToggle]);

  const miniBurstParticles = useMemo(() => MINI_BURST_OFFSETS.map((o, i) => ({
    id: i,
    angle: (i / 8) * 360 + o.angleJitter,
    dist: o.dist,
    size: o.size,
    color: i % 3 === 0 ? priorityColor : MINI_BURST_COLORS[i % MINI_BURST_COLORS.length],
  })), [priorityColor]);

  return (
    <div
      className={`group flex items-start gap-2 px-1 py-2 transition-all duration-300 ${
        deleting ? 'opacity-0 -translate-x-1' : ''
      } ${vanishing ? 'opacity-0 scale-95 -translate-y-1' : ''}`}
      data-task-id={task.id}
      data-task-section={task.sectionId ?? ''}
      style={{
        borderBottom: '1px solid var(--border)',
        opacity: deleting ? 0 : task.completed ? 0.5 : 1,
      }}
    >
      {/* Drag handle */}
      <div
        onPointerDown={onDragHandlePointerDown}
        className="flex-shrink-0 flex items-center justify-center w-4 h-5 mt-0.5 cursor-grab active:cursor-grabbing select-none opacity-0 group-hover:opacity-30 transition-opacity"
        style={{ color: 'var(--text-muted)', touchAction: 'none' }}
        data-drag-handle="true"
        aria-label="Drag to reorder"
      >
        <DragDotsIcon size={11} />
      </div>

      {/* Checkbox with burst animation */}
      <div style={{ position: 'relative', flexShrink: 0, marginTop: '2px', width: '18px', height: '18px' }}>
        {bursting && (
          <div style={{
            position: 'absolute', inset: '-5px', borderRadius: '50%',
            border: `1.5px solid ${priorityColor}`,
            animation: 'task-mini-ripple 0.5s ease-out forwards',
            pointerEvents: 'none', zIndex: 9,
          }} />
        )}
        {bursting && miniBurstParticles.map(p => {
          const rad = (p.angle * Math.PI) / 180;
          const tx = Math.cos(rad) * p.dist;
          const ty = Math.sin(rad) * p.dist;
          return (
            <div key={p.id} style={{
              position: 'absolute', top: '50%', left: '50%',
              width: `${p.size}px`, height: `${p.size}px`,
              borderRadius: p.id % 2 === 0 ? '50%' : '1px',
              background: p.color,
              transform: 'translate(-50%, -50%)',
              animation: `task-mini-burst 0.42s cubic-bezier(0.22,1,0.36,1) forwards`,
              animationDelay: `${p.id * 10}ms`,
              '--tx': `${tx}px`,
              '--ty': `${ty}px`,
              pointerEvents: 'none', zIndex: 10,
            } as React.CSSProperties} />
          );
        })}
        <button
          onClick={handleToggle}
          className="flex-shrink-0 flex items-center justify-center"
          style={{
            width: '18px', height: '18px', borderRadius: '50%',
            border: `2px solid ${task.completed ? priorityColor : priorityColor + '80'}`,
            background: task.completed ? priorityColor : 'transparent',
            flexShrink: 0,
            animation: bursting ? 'task-mini-pop 0.36s cubic-bezier(0.34,1.56,0.64,1) forwards' : 'none',
            transition: bursting ? 'none' : 'border-color 0.15s, background 0.15s',
            position: 'relative', zIndex: 11,
          }}
          onMouseEnter={e => {
            if (!task.completed) {
              (e.currentTarget as HTMLButtonElement).style.borderColor = priorityColor;
              (e.currentTarget as HTMLButtonElement).style.background = priorityColor + '18';
            }
          }}
          onMouseLeave={e => {
            if (!task.completed) {
              (e.currentTarget as HTMLButtonElement).style.borderColor = priorityColor + '80';
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            }
          }}
          aria-label="Toggle task"
        >
          {task.completed && (
            <svg
              width="8" height="6" viewBox="0 0 8 6" fill="none"
              style={{ animation: 'task-check-icon 0.22s cubic-bezier(0.34,1.56,0.64,1) forwards' }}
            >
              <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 py-0.5">
        <p
          className="font-body text-sm leading-snug"
          style={{
            color: task.completed ? 'var(--text-muted)' : 'var(--text-main)',
            textDecoration: task.completed ? 'line-through' : 'none',
          }}
        >
          {task.title}
        </p>

        {task.description && (
          <p
            className="text-xs mt-0.5"
            style={{
              color: 'var(--text-muted)',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {task.description}
          </p>
        )}

        {(deadline || task.priority) && (
          <div className="flex items-center gap-2.5 mt-1">
            {deadline && (
              <span
                className="inline-flex items-center gap-1 text-xs"
                style={
                  deadline.overdue
                    ? { color: '#c45a69' }
                    : deadline.soon
                    ? { color: '#c08a20' }
                    : { color: 'var(--text-muted)' }
                }
              >
                <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                  <rect x="1" y="2" width="8" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M3.5 1v2M6.5 1v2M1 5h8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
                {deadline.label}
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-xs" style={{ color: priorityColor }}>
              <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                <path d="M2 9V5M5 9V2M8 9V6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              {PRIORITY_LABEL[task.priority]}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <button
          onClick={onEdit}
          className="w-6 h-6 rounded-md flex items-center justify-center transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-main)'; (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-panel)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
          aria-label="Edit"
        >
          <PenNewSquare size={13} />
        </button>
        <button
          onClick={handleDelete}
          className="w-6 h-6 rounded-md flex items-center justify-center transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#c45a69'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(196,90,105,0.08)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
          aria-label="Delete"
        >
          <TrashBinMinimalistic size={13} />
        </button>
      </div>
    </div>
  );
};
