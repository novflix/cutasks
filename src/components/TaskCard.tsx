import React, { useState } from 'react';
import type { Task } from '../types';
import { PriorityBadge } from './PriorityBadge';
import { Pen2, TrashBinMinimalistic, CheckRead, CalendarMinimalistic, Fire } from '@solar-icons/react';

function formatDeadline(date: string): { label: string; overdue: boolean; soon: boolean } {
  const d = new Date(date + 'T00:00:00');
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const diff = Math.round((d.getTime() - now.getTime()) / 86400000);
  const overdue = diff < 0;
  const soon = diff >= 0 && diff <= 2;
  let label = '';
  if (diff === 0)       label = 'Today';
  else if (diff === 1)  label = 'Tomorrow';
  else if (diff === -1) label = 'Yesterday';
  else if (diff < -1)   label = `${Math.abs(diff)}d overdue`;
  else                  label = d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
  return { label, overdue, soon };
}

const PRIORITY_ACCENT: Record<string, string> = {
  high:   '#d45c5c',
  medium: '#f5b800',
  low:    '#6da07a',
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
  const deadline = task.deadline ? formatDeadline(task.deadline) : null;
  const accentColor = PRIORITY_ACCENT[task.priority] ?? 'var(--accent)';

  const handleDelete = () => {
    setDeleting(true);
    setTimeout(onDelete, 300);
  };

  return (
    <div
      className={`group relative flex gap-3.5 items-start transition-all duration-300 ${
        task.completed ? 'opacity-55' : ''
      } ${deleting ? 'opacity-0 scale-95 -translate-x-3' : ''} ${
        pressed ? 'scale-[0.985]' : ''
      }`}
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
      <button
        onClick={onToggle}
        className="flex-shrink-0 flex items-center justify-center transition-all duration-200"
        style={{
          width: '22px',
          height: '22px',
          marginTop: '1px',
          borderRadius: '50%',
          border: `2px solid ${task.completed ? accentColor : 'var(--border)'}`,
          background: task.completed ? accentColor : 'transparent',
          color: 'white',
          flexShrink: 0,
          transition: 'border-color 0.2s, background 0.2s, transform 0.15s',
        }}
        onMouseEnter={e => {
          if (!task.completed) {
            (e.currentTarget as HTMLButtonElement).style.borderColor = accentColor;
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.1)';
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
          <CheckRead size={11} className="animate-scale-in" />
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={`font-body font-medium text-sm leading-snug ${task.completed ? 'line-through' : ''}`}
          style={{ color: task.completed ? 'var(--text-muted)' : 'var(--text-main)' }}
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