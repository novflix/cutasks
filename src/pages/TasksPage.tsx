import React, { useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import { useTaskSort, sortTasks } from '../hooks/useTaskSort';
import type { FilterType, Priority, Task } from '../types';
import type { SortField } from '../hooks/useTaskSort';
import { TaskCard } from '../components/TaskCard';
import { TaskModal } from '../components/TaskModal';
import { EmptyState } from '../components/EmptyState';
import { AddSquare, ListArrowDown, CheckCircle, ClipboardList } from '@solar-icons/react';
import { LogoSVG } from '../components/LogoSVG';
import { TasksPageSkeleton, SkeletonStyles } from '../components/SkeletonLoader';

const FILTERS: { value: FilterType; label: string; Icon: React.FC<{ size?: number }> }[] = [
  { value: 'all',       label: 'All',    Icon: ClipboardList },
  { value: 'active',    label: 'Active', Icon: ListArrowDown },
  { value: 'completed', label: 'Done',   Icon: CheckCircle },
];

const SORT_OPTIONS: {
  value: SortField;
  label: string;
  icon: string;
  hint: string;
}[] = [
  { value: 'createdAt', label: 'New first',  icon: '✦', hint: 'Newest created' },
  { value: 'priority',  label: 'Priority',   icon: '↑', hint: 'High → Low' },
  { value: 'deadline',  label: 'Due date',   icon: '◷', hint: 'Closest first' },
];

interface Props {
  dark: boolean;
}

export const TasksPage: React.FC<Props> = ({ dark }) => {
  const { tasks, addTask, editTask, deleteTask, toggleTask, initialized } = useTasks();
  const { sort, setField } = useTaskSort();

  const [filter, setFilter]     = useState<FilterType>('all');
  const [showCreate, setCreate] = useState(false);
  const [editTarget, setEdit]   = useState<Task | null>(null);

  const filtered = tasks.filter((t: Task) => {
    if (filter === 'active')    return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const sorted = sortTasks(filtered, sort);

  const counts = {
    all:       tasks.length,
    active:    tasks.filter((t: Task) => !t.completed).length,
    completed: tasks.filter((t: Task) => t.completed).length,
  };

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 6)  return 'Good night';
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  const activeSortOption = SORT_OPTIONS.find(o => o.value === sort.field)!;

  return (
    <>
      <SkeletonStyles />

      <style>{`
        @keyframes sortPillIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.94); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
        @keyframes sortIndicatorSlide {
          from { opacity: 0; transform: scaleX(0); }
          to   { opacity: 1; transform: scaleX(1); }
        }
        @keyframes sortChipPop {
          0%   { transform: scale(1); }
          40%  { transform: scale(0.93); }
          70%  { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        .sort-btn {
          position: relative;
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 6px 12px;
          border-radius: 20px;
          border: 1.5px solid var(--border);
          background: transparent;
          color: var(--text-muted);
          font-family: "DM Sans", sans-serif;
          font-size: 0.78rem;
          font-weight: 500;
          cursor: pointer;
          transition: color 0.18s, border-color 0.18s, background 0.18s, transform 0.12s;
          white-space: nowrap;
          overflow: hidden;
        }
        .sort-btn:hover {
          color: var(--text-main);
          border-color: var(--text-muted);
          transform: translateY(-1px);
        }
        .sort-btn.active {
          color: var(--bg-main);
          background: var(--text-main);
          border-color: var(--text-main);
          animation: sortChipPop 0.28s ease;
        }
        .sort-btn.active:hover {
          opacity: 0.88;
          transform: translateY(-1px);
        }
        .sort-btn-icon {
          font-size: 0.9rem;
          line-height: 1;
          transition: transform 0.22s cubic-bezier(0.34,1.56,0.64,1);
        }
        .sort-btn.active .sort-btn-icon {
          transform: scale(1.15);
        }
        .sort-row {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 20px;
          animation: sortPillIn 0.22s ease-out;
        }
        .sort-label {
          font-family: "DM Sans", sans-serif;
          font-size: 0.68rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-muted);
          padding-left: 2px;
          flex-shrink: 0;
          opacity: 0.7;
        }
        .sort-hint {
          margin-left: auto;
          font-family: "DM Sans", sans-serif;
          font-size: 0.7rem;
          color: var(--text-muted);
          opacity: 0.55;
          flex-shrink: 0;
          transition: opacity 0.2s;
        }
      `}</style>

      <header className="flex items-start justify-between mb-8">
        <div>
          <p className="text-xs font-body font-medium uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
            {greeting}
          </p>
          <LogoSVG dark={dark} style={{ height: '36px', width: 'auto' }} />
          <p className="mt-2 text-sm font-body" style={{ color: 'var(--text-muted)' }}>
            {!initialized
              ? <span style={{ display: 'inline-block', width: '120px', height: '14px', borderRadius: '6px', background: 'var(--bg-panel)', animation: 'skeletonPulse 1.4s ease-in-out infinite' }} />
              : counts.active === 0
                ? 'Nothing pending — enjoy!'
                : `${counts.active} task${counts.active === 1 ? '' : 's'} to do`
            }
          </p>
        </div>
      </header>

      {/* Filters */}
      <div
        className="flex gap-1.5 mb-4 p-1 rounded-2xl"
        style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}
      >
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-sm font-medium font-body transition-all duration-200"
            style={filter === f.value
              ? { background: 'var(--bg-card)', color: 'var(--text-main)', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }
              : { color: 'var(--text-muted)' }
            }
          >
            <f.Icon size={14} />
            {f.label}
            {initialized && counts[f.value] > 0 && (
              <span
                className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                style={{ background: 'var(--bg-panel)', color: 'var(--text-muted)' }}
              >
                {counts[f.value]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Sort row */}
      <div className="sort-row">
        <span className="sort-label">Sort</span>
        {SORT_OPTIONS.map(opt => (
          <button
            key={opt.value}
            className={`sort-btn${sort.field === opt.value ? ' active' : ''}`}
            onClick={() => setField(opt.value)}
            title={opt.hint}
          >
            <span className="sort-btn-icon">{opt.icon}</span>
            {opt.label}
          </button>
        ))}
        <span className="sort-hint">{activeSortOption.hint}</span>
      </div>

      {/* Task list or skeleton */}
      {!initialized ? (
        <TasksPageSkeleton />
      ) : (
        <div className="flex flex-col gap-2.5">
          {sorted.length === 0 ? (
            <EmptyState filter={filter} />
          ) : (
            sorted.map((task: Task) => (
              <div key={task.id} className="animate-fade-in">
                <TaskCard
                  task={task}
                  onToggle={() => toggleTask(task.id)}
                  onEdit={() => setEdit(task)}
                  onDelete={() => deleteTask(task.id)}
                />
              </div>
            ))
          )}
        </div>
      )}

      {/* FAB */}
      <div className="fixed bottom-20 right-5 sm:bottom-8 sm:right-8 z-40">
        <button
          onClick={() => setCreate(true)}
          className="w-14 h-14 rounded-full flex items-center justify-center shadow-cozy transition-all duration-200 active:scale-90 hover:scale-110"
          style={{ background: 'var(--text-main)', color: 'var(--bg-main)' }}
          aria-label="Add task"
        >
          <AddSquare size={26} />
        </button>
      </div>

      {showCreate && (
        <TaskModal
          mode="create"
          onClose={() => setCreate(false)}
          onSubmit={({ title, description, priority, deadline }) =>
            addTask(title, priority as Priority, deadline, description)
          }
        />
      )}
      {editTarget && (
        <TaskModal
          mode="edit"
          initial={editTarget}
          onClose={() => setEdit(null)}
          onSubmit={({ title, description, priority, deadline }) =>
            editTask(editTarget.id, { title, description, priority: priority as Priority, deadline })
          }
        />
      )}
    </>
  );
};