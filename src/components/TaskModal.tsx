import React, { useEffect, useRef, useState } from 'react';
import type { Priority, Task } from '../types';
import { CloseCircle, ArrowDown, ArrowRight, ArrowUp, CalendarMinimalistic } from '@solar-icons/react';

interface Props {
  mode: 'create' | 'edit';
  initial?: Task;
  onClose: () => void;
  onSubmit: (data: { title: string; description?: string; priority: Priority; deadline?: string }) => void;
}

const PRIORITIES: {
  value: Priority;
  label: string;
  Icon: React.FC<{ size?: number }>;
  cls: string;
}[] = [
  { value: 'low',    label: 'Low',    Icon: ArrowDown,  cls: 'border-sage-200  text-sage-500  bg-sage-100  dark:bg-sage-500/10  dark:border-sage-500/30' },
  { value: 'medium', label: 'Medium', Icon: ArrowRight, cls: 'border-amber-200 text-amber-500 bg-amber-100 dark:bg-amber-500/10 dark:border-amber-500/30' },
  { value: 'high',   label: 'High',   Icon: ArrowUp,    cls: 'border-blush-200 text-blush-500 bg-blush-100 dark:bg-blush-500/10 dark:border-blush-500/30' },
];

export const TaskModal: React.FC<Props> = ({ mode, initial, onClose, onSubmit }) => {
  const [title, setTitle]       = useState(initial?.title ?? '');
  const [desc, setDesc]         = useState(initial?.description ?? '');
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? 'medium');
  const [deadline, setDeadline] = useState(initial?.deadline ?? '');
  const [shake, setShake]       = useState(false);
  const titleRef   = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setTimeout(() => titleRef.current?.focus(), 100); }, []);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }
    onSubmit({ title, description: desc || undefined, priority, deadline: deadline || undefined });
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
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="font-display text-xl font-semibold" style={{ color: 'var(--text-main)' }}>
            {mode === 'create' ? 'New task' : 'Edit task'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl transition-all hover:scale-105 active:scale-90"
            style={{ color: 'var(--text-muted)' }}
          >
            <CloseCircle size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Task name</label>
            <input
              ref={titleRef}
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className={`input-field ${shake ? 'animate-wiggle' : ''}`}
              maxLength={120}
            />
          </div>

          {/* Description */}
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

          {/* Priority */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Priority</label>
            <div className="flex gap-2">
              {PRIORITIES.map(p => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-2xl border-2 text-sm font-medium font-body transition-all duration-150 ${
                    priority === p.value
                      ? `${p.cls} shadow-soft scale-[1.03]`
                      : 'hover:opacity-80'
                  }`}
                  style={priority !== p.value ? { borderColor: 'var(--border)', color: 'var(--text-muted)', background: 'var(--bg-panel)' } : {}}
                >
                  <p.Icon size={13} />
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Deadline */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
              Deadline <span className="normal-case opacity-60">(optional)</span>
            </label>
            <div className="relative">
              <CalendarMinimalistic
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--text-muted)' } as React.CSSProperties}
              />
              <input
                type="date"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="input-field pl-9"
              />
            </div>
          </div>

          {/* Actions */}
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
              type="submit"
              className="flex-1 py-2.5 rounded-2xl text-sm font-medium font-body transition-all active:scale-95 hover:opacity-90 shadow-soft"
              style={{ background: 'var(--text-main)', color: 'var(--bg-main)' }}
            >
              {mode === 'create' ? 'Add task' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
