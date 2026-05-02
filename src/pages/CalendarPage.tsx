import React, { useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import type { Task } from '../types';
import { AltArrowLeft, AltArrowRight, CalendarMinimalistic, Fire } from '@solar-icons/react';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const DOW = ['Mo','Tu','We','Th','Fr','Sa','Su'];

const PRIORITY_COLOR: Record<string, string> = {
  high:   '#d45c5c',
  medium: '#f5b800',
  low:    '#6da07a',
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
}

const TaskRow: React.FC<TaskRowProps> = ({ task }) => {
  const color = PRIORITY_COLOR[task.priority];
  const isOverdue = !task.completed && task.deadline
    ? new Date(task.deadline + 'T00:00:00') < new Date(new Date().setHours(0,0,0,0))
    : false;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        padding: '10px 12px',
        borderRadius: '12px',
        background: 'var(--bg-card)',
        border: '1.5px solid var(--border)',
        opacity: task.completed ? 0.5 : 1,
        transition: 'opacity 0.2s',
      }}
    >
      {/* Priority dot */}
      <span style={{
        width: '8px', height: '8px', borderRadius: '50%',
        background: task.completed ? 'var(--border)' : color,
        flexShrink: 0, marginTop: '4px',
      }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: '"DM Sans", sans-serif',
          fontSize: '0.85rem',
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
      {isOverdue && (
        <span style={{ color: '#d45c5c', flexShrink: 0, marginTop: '2px' }}>
          <Fire size={13} />
        </span>
      )}
    </div>
  );
};

export const CalendarPage: React.FC = () => {
  const { tasks } = useTasks();
  const today = new Date(); today.setHours(0,0,0,0);

  const [view, setView] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selected, setSelected] = useState<string>(toYMD(today));

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
  const startDow = (firstDay.getDay() + 6) % 7; // Mon=0
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(startDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const prevMonth = () => setView(v => v.month === 0 ? { year: v.year-1, month: 11 } : { ...v, month: v.month-1 });
  const nextMonth = () => setView(v => v.month === 11 ? { year: v.year+1, month: 0 } : { ...v, month: v.month+1 });

  const selectedTasks = byDate[selected] ?? [];
  const todayYMD = toYMD(today);

  return (
    <div style={{ opacity: 0, animation: 'fadeIn 0.22s ease-out forwards' }}>
      {/* Page title */}
      <h1 style={{
        fontFamily: '"Fraunces", serif',
        fontSize: '1.75rem',
        fontWeight: 500,
        color: 'var(--text-main)',
        marginBottom: '24px',
      }}>
        Calendar
      </h1>

      {/* Calendar card */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1.5px solid var(--border)',
        borderRadius: '20px',
        padding: '20px',
        marginBottom: '20px',
      }}>
        {/* Month nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <button
            onClick={prevMonth}
            style={{
              width: '32px', height: '32px', borderRadius: '10px',
              border: '1.5px solid var(--border)',
              background: 'var(--bg-panel)',
              color: 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--border)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-panel)')}
          >
            <AltArrowLeft size={16} />
          </button>

          <span style={{
            fontFamily: '"Fraunces", serif',
            fontSize: '1.1rem',
            fontWeight: 500,
            color: 'var(--text-main)',
          }}>
            {MONTHS[view.month]} {view.year}
          </span>

          <button
            onClick={nextMonth}
            style={{
              width: '32px', height: '32px', borderRadius: '10px',
              border: '1.5px solid var(--border)',
              background: 'var(--bg-panel)',
              color: 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--border)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-panel)')}
          >
            <AltArrowRight size={16} />
          </button>
        </div>

        {/* Day-of-week headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '6px' }}>
          {DOW.map(d => (
            <div key={d} style={{
              textAlign: 'center',
              fontSize: '0.65rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
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

            // Dot colors: up to 3 dots for tasks
            const dots = dayTasks.slice(0, 3);
            const hasOverdue = dayTasks.some(t => !t.completed && isPast);

            return (
              <button
                key={ymd}
                onClick={() => setSelected(ymd)}
                style={{
                  position: 'relative',
                  height: '44px',
                  borderRadius: '11px',
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
                  fontSize: '0.85rem',
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

                {/* Task dots */}
                {dots.length > 0 && (
                  <span style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                    {dots.map((t, di) => (
                      <span
                        key={di}
                        style={{
                          width: '4px',
                          height: '4px',
                          borderRadius: '50%',
                          background: isSelected
                            ? 'rgba(255,255,255,0.7)'
                            : hasOverdue && !t.completed
                            ? '#d45c5c'
                            : PRIORITY_COLOR[t.priority],
                          opacity: t.completed ? 0.4 : 1,
                        }}
                      />
                    ))}
                    {dayTasks.length > 3 && (
                      <span style={{
                        fontSize: '8px',
                        color: isSelected ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)',
                        lineHeight: 1,
                        marginLeft: '1px',
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

      {/* Selected day tasks */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <CalendarMinimalistic size={14} style={{ color: 'var(--text-muted)' } as React.CSSProperties} />
          <span style={{
            fontSize: '0.8rem',
            fontFamily: '"DM Sans", sans-serif',
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}>
            {formatDayLabel(selected)}
          </span>
          {selectedTasks.length > 0 && (
            <span style={{
              fontSize: '0.7rem',
              fontFamily: '"DM Sans", sans-serif',
              fontWeight: 600,
              padding: '1px 7px',
              borderRadius: '999px',
              background: 'var(--bg-panel)',
              color: 'var(--text-muted)',
              border: '1px solid var(--border)',
            }}>
              {selectedTasks.length}
            </span>
          )}
        </div>

        {selectedTasks.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '32px 16px',
            color: 'var(--text-muted)',
            fontFamily: '"DM Sans", sans-serif',
            fontSize: '0.875rem',
            background: 'var(--bg-card)',
            border: '1.5px solid var(--border)',
            borderRadius: '16px',
          }}>
            No tasks due this day
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {selectedTasks.map(task => (
              <TaskRow key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};