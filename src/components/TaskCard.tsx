import React, { useState, useRef, useCallback } from 'react';
import type { Task } from '../types';
import { PriorityBadge } from './PriorityBadge';
import { Pen2, TrashBinMinimalistic, CheckRead, CalendarMinimalistic, Fire } from '@solar-icons/react';
import { getDeletionDelay } from '../hooks/useTaskDeletion';

function formatDeadline(date: string): { label: string; overdue: boolean; soon: boolean } {
  const d = new Date(date + 'T00:00:00');
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const diff = Math.round((d.getTime() - now.getTime()) / 86400000);
  const overdue = diff < 0;
  const soon = diff >= 0 && diff <= 2;
  const label =
    diff === 0  ? 'Today' :
    diff === 1  ? 'Tomorrow' :
    diff === -1 ? 'Yesterday' :
    diff < -1   ? `${Math.abs(diff)}d overdue` :
    d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
  return { label, overdue, soon };
}

const PRIORITY_ACCENT: Record<string, string> = {
  high:   '#d45c5c',
  medium: '#f5b800',
  low:    '#6da07a',
};

// Particle burst component
interface Particle { id: number; angle: number; dist: number; size: number; color: string }

const BURST_COLORS = ['#ed9b6d', '#f5b800', '#6da07a', '#9b84d8', '#d45c5c', '#3d96e0'];

// Pre-computed random offsets — stable across renders
const BURST_OFFSETS = Array.from({ length: 10 }, (_, i) => ({
  angleJitter: (i * 37 + 11) % 20,       // deterministic jitter 0–19
  dist: 18 + (i * 13 + 7) % 10,          // 18–27
  size: 3 + (i * 7 + 3) % 3,             // 3–5
}));

const CheckBurst: React.FC<{ active: boolean; color: string }> = ({ active, color }) => {
  if (!active) return null;
  const particles: Particle[] = BURST_OFFSETS.map((o, i) => ({
    id: i,
    angle: (i / 10) * 360 + o.angleJitter,
    dist: o.dist,
    size: o.size,
    color: i % 3 === 0 ? color : BURST_COLORS[i % BURST_COLORS.length],
  }));

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}>
      {particles.map(p => {
        const rad = (p.angle * Math.PI) / 180;
        const tx = Math.cos(rad) * p.dist;
        const ty = Math.sin(rad) * p.dist;
        return (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: `${p.size}px`,
              height: `${p.size}px`,
              borderRadius: p.id % 2 === 0 ? '50%' : '1px',
              background: p.color,
              transform: 'translate(-50%, -50%)',
              animation: `task-burst 0.5s cubic-bezier(0.22,1,0.36,1) forwards`,
              animationDelay: `${p.id * 12}ms`,
              '--tx': `${tx}px`,
              '--ty': `${ty}px`,
            } as React.CSSProperties}
          />
        );
      })}
    </div>
  );
};

// Ripple ring
const RippleRing: React.FC<{ active: boolean; color: string }> = ({ active, color }) => {
  if (!active) return null;
  return (
    <div
      style={{
        position: 'absolute',
        inset: '-6px',
        borderRadius: '50%',
        border: `2px solid ${color}`,
        animation: 'task-ripple 0.55s ease-out forwards',
        pointerEvents: 'none',
        zIndex: 9,
      }}
    />
  );
};

interface Props {
  task: Task;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const TaskCard: React.FC<Props> = ({ task, onToggle, onEdit, onDelete }) => {
  const [deleting, setDeleting] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [bursting, setBursting] = useState(false);
  const [vanishing, setVanishing] = useState(false);
  const burstTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const deadline = task.deadline ? formatDeadline(task.deadline) : null;
  const accentColor = PRIORITY_ACCENT[task.priority] ?? 'var(--accent)';

  const handleDelete = () => {
    setDeleting(true);
    setTimeout(onDelete, 300);
  };

  const handleToggle = useCallback(() => {
    if (!task.completed) {
      // Completing → burst!
      setBursting(true);
      if (burstTimer.current) clearTimeout(burstTimer.current);
      burstTimer.current = setTimeout(() => setBursting(false), 600);

      if (getDeletionDelay() === 'immediate') {
        // Play full animation, then delete
        setVanishing(true);
        setTimeout(onToggle, 520);
        return;
      }
    }
    onToggle();
  }, [task.completed, onToggle]);

  return (
    <div
      className={`group relative flex gap-3.5 items-start transition-all duration-300 ${
        task.completed ? 'opacity-55' : ''
      } ${deleting ? 'opacity-0 scale-95 -translate-x-3' : ''} ${
        vanishing ? 'opacity-0 scale-95 -translate-y-1' : ''
      } ${pressed ? 'scale-[0.985]' : ''}`}
      style={{
        background: 'var(--bg-card)',
        border: '1.5px solid var(--border)',
        borderRadius: '18px',
        padding: '14px 14px 14px 0',
        boxShadow: task.completed
          ? 'none'
          : '0 2px 12px 0 rgba(0,0,0,0.05), 0 1px 3px 0 rgba(0,0,0,0.04)',
        transition: 'box-shadow 0.25s ease, transform 0.25s ease, opacity 0.3s ease',
      }}
      onMouseEnter={e => {
        if (!task.completed) {
          (e.currentTarget as HTMLDivElement).style.boxShadow =
            '0 6px 28px 0 rgba(0,0,0,0.10), 0 2px 8px 0 rgba(0,0,0,0.06)';
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)';
        }
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          task.completed ? 'none' : '0 2px 12px 0 rgba(0,0,0,0.05), 0 1px 3px 0 rgba(0,0,0,0.04)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
        setPressed(false);
      }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
    >
      {/* Priority accent bar */}
      <div
        style={{
          width: '3.5px',
          minWidth: '3.5px',
          borderRadius: '0 3px 3px 0',
          background: task.completed ? 'var(--border)' : accentColor,
          alignSelf: 'stretch',
          transition: 'background 0.2s ease',
          opacity: task.completed ? 0.4 : 1,
          marginLeft: '-1.5px',
          flexShrink: 0,
        }}
      />

      {/* Checkbox */}
      <div style={{ position: 'relative', flexShrink: 0, marginTop: '1px' }}>
        <RippleRing active={bursting} color={accentColor} />
        <CheckBurst active={bursting} color={accentColor} />
        <button
          onClick={handleToggle}
          className="flex-shrink-0 flex items-center justify-center"
          style={{
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            border: `2px solid ${task.completed ? accentColor : 'var(--border)'}`,
            background: task.completed ? accentColor : 'transparent',
            color: 'white',
            flexShrink: 0,
            animation: bursting ? 'task-check-pop 0.38s cubic-bezier(0.34,1.56,0.64,1) forwards' : 'none',
            transition: bursting ? 'none' : 'border-color 0.2s, background 0.2s',
            position: 'relative',
            zIndex: 11,
          }}
          onMouseEnter={e => {
            if (!task.completed) {
              (e.currentTarget as HTMLButtonElement).style.borderColor = accentColor;
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.12)';
            }
          }}
          onMouseLeave={e => {
            if (!task.completed) {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
            }
          }}
          aria-label="Toggle task"
        >
          {task.completed && (
            <CheckRead size={11} style={{ animation: 'task-check-icon 0.25s cubic-bezier(0.34,1.56,0.64,1) forwards' }} />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={`font-body font-medium text-sm leading-snug ${task.completed ? 'line-through' : ''}`}
          style={{
            color: task.completed ? 'var(--text-muted)' : 'var(--text-main)',
            transition: 'color 0.25s ease, text-decoration 0.25s ease',
          }}
        >
          {task.title}
        </p>
        {task.description && (
          <p
            className="mt-1 text-xs leading-relaxed line-clamp-2"
            style={{ color: 'var(--text-muted)' }}
          >
            {task.description}
          </p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <PriorityBadge priority={task.priority} />
          {deadline && (
            <span
              className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                deadline.overdue
                  ? 'text-blush-500 bg-blush-100 dark:bg-blush-500/15 dark:text-blush-400'
                  : deadline.soon
                  ? 'text-amber-500 bg-amber-100 dark:bg-amber-500/15 dark:text-amber-400'
                  : ''
              }`}
              style={
                !deadline.overdue && !deadline.soon
                  ? { color: 'var(--text-muted)', background: 'var(--bg-panel)' }
                  : {}
              }
            >
              {deadline.overdue ? <Fire size={10} /> : <CalendarMinimalistic size={10} />}
              {deadline.label}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 mt-0.5 pr-1">
        <button
          onClick={onEdit}
          className="w-7 h-7 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          style={{
            color: 'var(--text-muted)',
            background: 'transparent',
            borderRadius: '10px',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-panel)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-main)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
          }}
          aria-label="Edit"
        >
          <Pen2 size={14} />
        </button>
        <button
          onClick={handleDelete}
          className="w-7 h-7 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          style={{
            color: 'var(--text-muted)',
            background: 'transparent',
            borderRadius: '10px',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = '#fde8e8';
            (e.currentTarget as HTMLButtonElement).style.color = '#d45c5c';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
          }}
          aria-label="Delete"
        >
          <TrashBinMinimalistic size={14} />
        </button>
      </div>
    </div>
  );
};