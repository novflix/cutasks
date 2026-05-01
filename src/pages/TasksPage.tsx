import React, { useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import type { FilterType, Priority, Task } from '../types';
import { TaskCard } from '../components/TaskCard';
import { TaskModal } from '../components/TaskModal';
import { EmptyState } from '../components/EmptyState';
import { AddSquare, ListArrowDown, CheckCircle, ClipboardList } from '@solar-icons/react';
import logoFull from '../assets/logo.svg';

const FILTERS: { value: FilterType; label: string; Icon: React.FC<{ size?: number }> }[] = [
  { value: 'all',       label: 'All',    Icon: ClipboardList },
  { value: 'active',    label: 'Active', Icon: ListArrowDown },
  { value: 'completed', label: 'Done',   Icon: CheckCircle },
];

interface Props {
  dark: boolean;
}

export const TasksPage: React.FC<Props> = ({ dark }) => {
  const { tasks, addTask, editTask, deleteTask, toggleTask } = useTasks();

  const [filter, setFilter]   = useState<FilterType>('all');
  const [showCreate, setCreate] = useState(false);
  const [editTarget, setEdit]   = useState<Task | null>(null);

  const filtered = tasks.filter((t: Task) => {
    if (filter === 'active')    return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const counts = {
    all: tasks.length,
    active: tasks.filter((t: Task) => !t.completed).length,
    completed: tasks.filter((t: Task) => t.completed).length,
  };

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 6)  return 'Good night';
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <>
      <header className="flex items-start justify-between mb-8">
        <div>
          <p className="text-xs font-body font-medium uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
            {greeting}
          </p>
          <div
            className="h-9"
            style={{ filter: dark ? 'none' : 'invert(1) brightness(0.22) sepia(0.15)' }}
          >
            <img src={logoFull} alt="Cutasks" className="h-full w-auto" draggable={false} />
          </div>
          <p className="mt-2 text-sm font-body" style={{ color: 'var(--text-muted)' }}>
            {counts.active === 0
              ? 'Nothing pending — enjoy!'
              : `${counts.active} task${counts.active === 1 ? '' : 's'} to do`}
          </p>
        </div>
      </header>

      {/* Filters */}
      <div
        className="flex gap-1.5 mb-6 p-1 rounded-2xl"
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
            {counts[f.value] > 0 && (
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

      {/* Task list */}
      <div className="flex flex-col gap-2.5">
        {filtered.length === 0 ? (
          <EmptyState filter={filter} />
        ) : (
          filtered.map((task: Task) => (
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

      {/* FAB — выше bottom nav на мобилке */}
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