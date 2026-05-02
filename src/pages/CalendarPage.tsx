import React, { useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import type { Priority, Task } from '../types';
import {
  AltArrowLeft, AltArrowRight,
  AddSquare, CheckCircle, TrashBinMinimalistic, PenNewSquare,
  Fire, CalendarMinimalistic, ClipboardList,
} from '@solar-icons/react';
import { TaskModal } from '../components/TaskModal';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const DOW = ['Mo','Tu','We','Th','Fr','Sa','Su'];

const PRIORITY_COLOR: Record<string, string> = {
  high:   '#e07070',
  medium: '#f5b800',
  low:    '#6da07a',
};

const PRIORITY_BG: Record<string, string> = {
  high:   'rgba(224,112,112,0.12)',
  medium: 'rgba(245,184,0,0.12)',
  low:    'rgba(109,160,122,0.12)',
};

function toYMD(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function formatDayLabel(ymd: string): string {
  const d = new Date(ymd + 'T00:00:00');
  const today = new Date(); today.setHours(0,0,0,0);
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  return d.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' });
}

interface TaskRowProps {
  task: Task;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const TaskRow: React.FC<TaskRowProps> = ({ task, onToggle, onEdit, onDelete }) => {
  const [hovered, setHovered] = useState(false);
  const color = PRIORITY_COLOR[task.priority];
  const bg = PRIORITY_BG[task.priority];
  const today = new Date(); today.setHours(0,0,0,0);
  const isOverdue = !task.completed && task.deadline
    ? new Date(task.deadline + 'T00:00:00') < today
    : false;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 14px',
        borderRadius: '14px',
        background: 'var(--bg-card)',
        border: '1.5px solid var(--border)',
        opacity: task.completed ? 0.55 : 1,
        transition: 'opacity 0.2s, box-shadow 0.15s, transform 0.15s',
        boxShadow: hovered && !task.completed ? '0 2px 12px rgba(0,0,0,0.07)' : 'none',
        transform: hovered && !task.completed ? 'translateY(-1px)' : 'none',
      }}
    >
      {/* Check button */}
      <button
        onClick={onToggle}
        title={task.completed ? 'Mark incomplete' : 'Mark complete'}
        style={{
          flexShrink: 0,
          width: '22px',
          height: '22px',
          borderRadius: '50%',
          border: task.completed ? 'none' : `2px solid ${color}`,
          background: task.completed ? color : bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          color: task.completed ? '#fff' : color,
        }}
      >
        {task.completed && <CheckCircle size={14} />}
      </button>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: '"DM Sans", sans-serif',
          fontSize: '0.875rem',
          fontWeight: 500,
          color: 'var(--text-main)',
          textDecoration: task.completed ? 'line-through' : 'none',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {task.title}
        </p>
        {task.description && (
          <p style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            marginTop: '2px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {task.description}
          </p>
        )}
      </div>

      {/* Overdue badge */}
      {isOverdue && (
        <span style={{
          display: 'flex',
          alignItems: 'center',
          gap: '3px',
          fontSize: '0.7rem',
          fontWeight: 600,
          color: '#e07070',
          background: 'rgba(224,112,112,0.1)',
          padding: '2px 7px',
          borderRadius: '999px',
          flexShrink: 0,
        }}>
          <Fire size={11} /> Overdue
        </span>
      )}

      {/* Actions — visible on hover */}
      <div style={{
        display: 'flex',
        gap: '4px',
        opacity: hovered ? 1 : 0,
        transition: 'opacity 0.15s',
        flexShrink: 0,
      }}>
        <button
          onClick={onEdit}
          title="Edit"
          style={{
            width: '28px', height: '28px',
            borderRadius: '8px',
            border: '1.5px solid var(--border)',
            background: 'var(--bg-panel)',
            color: 'var(--text-muted)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            transition: 'color 0.12s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-main)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <PenNewSquare size={13} />
        </button>
        <button
          onClick={onDelete}
          title="Delete"
          style={{
            width: '28px', height: '28px',
            borderRadius: '8px',
            border: '1.5px solid var(--border)',
            background: 'var(--bg-panel)',
            color: 'var(--text-muted)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            transition: 'color 0.12s, background 0.12s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = '#e07070';
            e.currentTarget.style.background = 'rgba(224,112,112,0.08)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'var(--text-muted)';
            e.currentTarget.style.background = 'var(--bg-panel)';
          }}
        >
          <TrashBinMinimalistic size={13} />
        </button>
      </div>
    </div>
  );
};

export const CalendarPage: React.FC = () => {
  const { tasks, addTask, editTask, deleteTask, toggleTask } = useTasks();
  const today = new Date(); today.setHours(0,0,0,0);

  const [view, setView] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selected, setSelected] = useState<string>(toYMD(today));
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<Task | null>(null);

  // Map deadline → tasks
  const byDate = tasks.reduce<Record<string, Task[]>>((acc, t) => {
    if (t.deadline) {
      if (!acc[t.deadline]) acc[t.deadline] = [];
      acc[t.deadline].push(t);
    }
    return acc;
  }, {});

  // Build grid
  const firstDay = new Date(view.year, view.month, 1);
  const startDow = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(startDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const prevMonth = () => setView(v => v.month === 0 ? { year: v.year-1, month: 11 } : { ...v, month: v.month-1 });
  const nextMonth = () => setView(v => v.month === 11 ? { year: v.year+1, month: 0 } : { ...v, month: v.month+1 });
  const goToday  = () => {
    setView({ year: today.getFullYear(), month: today.getMonth() });
    setSelected(toYMD(today));
  };

  const selectedTasks = byDate[selected] ?? [];
  const todayYMD = toYMD(today);

  const dayLabel = formatDayLabel(selected);
  const isSelectedPast = new Date(selected + 'T00:00:00') < today;

  return (
    <div style={{ opacity: 0, animation: 'fadeIn 0.22s ease-out forwards' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 style={{
          fontFamily: '"Fraunces", serif',
          fontSize: '1.75rem',
          fontWeight: 500,
          color: 'var(--text-main)',
          lineHeight: 1,
        }}>
          Calendar
        </h1>
        {selected !== todayYMD && (
          <button
            onClick={goToday}
            style={{
              fontSize: '0.75rem',
              fontFamily: '"DM Sans", sans-serif',
              fontWeight: 600,
              color: 'var(--accent)',
              background: 'rgba(237,155,109,0.1)',
              border: '1.5px solid rgba(237,155,109,0.25)',
              borderRadius: '999px',
              padding: '4px 12px',
              cursor: 'pointer',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Today
          </button>
        )}
      </div>

      {/* Calendar card */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1.5px solid var(--border)',
        borderRadius: '22px',
        padding: '20px',
        marginBottom: '20px',
      }}>
        {/* Month nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <button
            onClick={prevMonth}
            style={{
              width: '34px', height: '34px', borderRadius: '11px',
              border: '1.5px solid var(--border)',
              background: 'var(--bg-panel)',
              color: 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--border)'; e.currentTarget.style.color = 'var(--text-main)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-panel)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <AltArrowLeft size={16} />
          </button>

          <span style={{
            fontFamily: '"Fraunces", serif',
            fontSize: '1.1rem',
            fontWeight: 500,
            color: 'var(--text-main)',
            letterSpacing: '-0.01em',
          }}>
            {MONTHS[view.month]} {view.year}
          </span>

          <button
            onClick={nextMonth}
            style={{
              width: '34px', height: '34px', borderRadius: '11px',
              border: '1.5px solid var(--border)',
              background: 'var(--bg-panel)',
              color: 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--border)'; e.currentTarget.style.color = 'var(--text-main)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-panel)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <AltArrowRight size={16} />
          </button>
        </div>

        {/* DOW headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
          {DOW.map(d => (
            <div key={d} style={{
              textAlign: 'center',
              fontSize: '0.65rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              padding: '2px 0',
            }}>
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
          {cells.map((day, i) => {
            if (!day) return <div key={`e-${i}`} />;

            const ymd = `${view.year}-${String(view.month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
            const isToday = ymd === todayYMD;
            const isSelected = ymd === selected;
            const dayTasks = byDate[ymd] ?? [];
            const isPast = new Date(ymd + 'T00:00:00') < today;
            const dots = dayTasks.slice(0, 3);
            const hasOverdue = dayTasks.some(t => !t.completed && isPast);

            return (
              <button
                key={ymd}
                onClick={() => setSelected(ymd)}
                style={{
                  position: 'relative',
                  height: '46px',
                  borderRadius: '12px',
                  border: isToday && !isSelected
                    ? '1.5px solid var(--accent)'
                    : '1.5px solid transparent',
                  background: isSelected ? 'var(--text-main)' : 'transparent',
                  color: isSelected
                    ? 'var(--bg-main)'
                    : isPast && !isToday
                    ? 'var(--text-muted)'
                    : 'var(--text-main)',
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: '0.875rem',
                  fontWeight: isToday || isSelected ? 600 : 400,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '3px',
                  transition: 'background 0.14s ease, color 0.14s ease, transform 0.12s cubic-bezier(0.23,1,0.32,1)',
                }}
                onMouseEnter={e => {
                  if (!isSelected) {
                    (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-panel)';
                    (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.06)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isSelected) {
                    (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                    (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                  }
                }}
              >
                <span>{day}</span>
                {dots.length > 0 && (
                  <span style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                    {dots.map((t, di) => (
                      <span key={di} style={{
                        width: '4px', height: '4px', borderRadius: '50%',
                        background: isSelected
                          ? 'rgba(255,255,255,0.65)'
                          : hasOverdue && !t.completed
                          ? '#e07070'
                          : PRIORITY_COLOR[t.priority],
                        opacity: t.completed ? 0.35 : 1,
                      }} />
                    ))}
                    {dayTasks.length > 3 && (
                      <span style={{
                        fontSize: '8px',
                        color: isSelected ? 'rgba(255,255,255,0.65)' : 'var(--text-muted)',
                        lineHeight: 1, marginLeft: '1px',
                      }}>
                        +{dayTasks.length - 3}
                      </span>
                    )}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day section */}
      <div>
        {/* Section header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CalendarMinimalistic size={14} style={{ color: 'var(--accent)' } as React.CSSProperties} />
            <span style={{
              fontSize: '0.8rem',
              fontFamily: '"DM Sans", sans-serif',
              fontWeight: 700,
              color: 'var(--text-main)',
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
            }}>
              {dayLabel}
            </span>
            {selectedTasks.length > 0 && (
              <span style={{
                fontSize: '0.7rem',
                fontFamily: '"DM Sans", sans-serif',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '999px',
                background: 'var(--bg-panel)',
                color: 'var(--text-muted)',
                border: '1px solid var(--border)',
              }}>
                {selectedTasks.length}
              </span>
            )}
          </div>

          {/* Add task button */}
          {!isSelectedPast && (
            <button
              onClick={() => setShowCreate(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.78rem',
                fontFamily: '"DM Sans", sans-serif',
                fontWeight: 600,
                color: 'var(--accent)',
                background: 'rgba(237,155,109,0.1)',
                border: '1.5px solid rgba(237,155,109,0.25)',
                borderRadius: '999px',
                padding: '5px 12px',
                cursor: 'pointer',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              <AddSquare size={14} />
              Add task
            </button>
          )}
        </div>

        {/* Task list */}
        {selectedTasks.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            padding: '36px 16px',
            background: 'var(--bg-card)',
            border: '1.5px solid var(--border)',
            borderRadius: '18px',
          }}>
            <span style={{ color: 'var(--text-muted)', opacity: 0.5 }}>
              {isSelectedPast ? <CheckCircle size={32} /> : <ClipboardList size={32} />}
            </span>
            <p style={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '0.875rem',
              color: 'var(--text-muted)',
              textAlign: 'center',
            }}>
              {isSelectedPast
                ? 'No tasks were due this day'
                : 'No tasks for this day yet'}
            </p>
            {!isSelectedPast && (
              <button
                onClick={() => setShowCreate(true)}
                style={{
                  marginTop: '4px',
                  fontSize: '0.8rem',
                  fontFamily: '"DM Sans", sans-serif',
                  fontWeight: 600,
                  color: 'var(--accent)',
                  background: 'rgba(237,155,109,0.1)',
                  border: '1.5px solid rgba(237,155,109,0.25)',
                  borderRadius: '999px',
                  padding: '6px 16px',
                  cursor: 'pointer',
                }}
              >
                Add a task
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {selectedTasks.map(task => (
              <div key={task.id} style={{ animation: 'fadeIn 0.18s ease-out' }}>
                <TaskRow
                  task={task}
                  onToggle={() => toggleTask(task.id)}
                  onEdit={() => setEditTarget(task)}
                  onDelete={() => deleteTask(task.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreate && (
        <TaskModal
          mode="create"
          initial={{ id: '', title: '', priority: 'medium', deadline: selected, completed: false, createdAt: '' }}
          onClose={() => setShowCreate(false)}
          onSubmit={({ title, description, priority, deadline }) =>
            addTask(title, priority as Priority, deadline ?? selected, description)
          }
        />
      )}
      {editTarget && (
        <TaskModal
          mode="edit"
          initial={editTarget}
          onClose={() => setEditTarget(null)}
          onSubmit={({ title, description, priority, deadline }) =>
            editTask(editTarget.id, { title, description, priority: priority as Priority, deadline })
          }
        />
      )}
    </div>
  );
};