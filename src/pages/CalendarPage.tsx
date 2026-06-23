import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, AltArrowLeft, AltArrowRight, CalendarMinimalistic } from '@solar-icons/react';
import type { Task, ProjectTask } from '../types';
import { formatDeadline, getDeadlineStatus, getTagColor, priorityOrder } from '../utils';
import '../styles/calendar.css';

type CalMode = 'week' | 'month';

const MONTH_KEYS = [
  'common.january', 'common.february', 'common.march', 'common.april', 'common.may', 'common.june',
  'common.july', 'common.august', 'common.september', 'common.october', 'common.november', 'common.december',
];
const DAY_KEYS_SHORT = ['common.mon', 'common.tue', 'common.wed', 'common.thu', 'common.fri', 'common.sat', 'common.sun'];
const DAY_KEYS_FULL = ['common.monday', 'common.tuesday', 'common.wednesday', 'common.thursday', 'common.friday', 'common.saturday', 'common.sunday'];

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getMonthEnd(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function formatFullDate(d: Date, t: (key: string) => string): string {
  return `${t(DAY_KEYS_FULL[(d.getDay() + 6) % 7])}, ${t(MONTH_KEYS[d.getMonth()])} ${d.getDate()}, ${d.getFullYear()}`;
}

function formatDateRange(start: Date, t: (key: string) => string): string {
  const end = addDays(start, 6);
  const sameMonth = start.getMonth() === end.getMonth();
  if (sameMonth) {
    return `${t(MONTH_KEYS[start.getMonth()])} ${start.getDate()} – ${end.getDate()}`;
  }
  return `${t(MONTH_KEYS[start.getMonth()]).slice(0, 3)} ${start.getDate()} – ${t(MONTH_KEYS[end.getMonth()]).slice(0, 3)} ${end.getDate()}`;
}

interface CalendarPageProps {
  tasks: Task[];
  projectTasks: ProjectTask[];
  onViewTask: (task: Task) => void;
}

export default function CalendarPage({ tasks, projectTasks, onViewTask }: CalendarPageProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [mode, setMode] = useState<CalMode>('week');
  const [selectedDay, setSelectedDay] = useState<Date>(today);
  const [weekStart, setWeekStart] = useState(() => getWeekStart(today));
  const [monthDate, setMonthDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const isCurrentWeek = useMemo(() => isSameDay(weekStart, getWeekStart(today)), [weekStart, today]);
  const isCurrentMonth = useMemo(
    () => today.getMonth() === monthDate.getMonth() && today.getFullYear() === monthDate.getFullYear(),
    [monthDate, today]
  );

  const weekDays = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const monthGrid = useMemo(() => {
    const first = getMonthStart(monthDate);
    const last = getMonthEnd(monthDate);
    const startDow = (first.getDay() + 6) % 7;
    const cells: { date: Date; currentMonth: boolean }[] = [];
    for (let i = startDow - 1; i >= 0; i--) {
      cells.push({ date: addDays(first, -(i + 1)), currentMonth: false });
    }
    for (let d = 1; d <= last.getDate(); d++) {
      cells.push({ date: new Date(monthDate.getFullYear(), monthDate.getMonth(), d), currentMonth: true });
    }
    const remaining = 42 - cells.length;
    for (let i = 1; i <= remaining; i++) {
      cells.push({ date: addDays(last, i), currentMonth: false });
    }
    return cells;
  }, [monthDate]);

  const allTasks = useMemo(() => [...tasks, ...projectTasks], [tasks, projectTasks]);

  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of allTasks) {
      if (!t.deadline) continue;
      const key = t.deadline;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
    return map;
  }, [allTasks]);

  const selectedKey = dateKey(selectedDay);
  const selectedTasks = useMemo(() => {
    const list = tasksByDate.get(selectedKey) ?? [];
    return [...list].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [tasksByDate, selectedKey]);

  const selectedTaskCount = selectedTasks.length;
  const completedCount = selectedTasks.filter(t => t.completed).length;

  const handlePrevWeek = useCallback(() => setWeekStart(w => addDays(w, -7)), []);
  const handleNextWeek = useCallback(() => setWeekStart(w => addDays(w, 7)), []);
  const handlePrevMonth = useCallback(() => setMonthDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1)), []);
  const handleNextMonth = useCallback(() => setMonthDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1)), []);
  const handleToday = useCallback(() => {
    setSelectedDay(today);
    setWeekStart(getWeekStart(today));
    setMonthDate(new Date(today.getFullYear(), today.getMonth(), 1));
  }, [today]);

  const handleDayClick = useCallback((d: Date) => {
    setSelectedDay(d);
    setWeekStart(getWeekStart(d));
    setMonthDate(new Date(d.getFullYear(), d.getMonth(), 1));
  }, []);

  const showTodayBadge = (mode === 'week' && !isCurrentWeek) || (mode === 'month' && !isCurrentMonth);

  return (
    <>
      <div className="page-hero">
        <button className="btn-icon" onClick={() => navigate('/app/home')}>
          <ArrowLeft size={22} />
        </button>
        <h1 className="page-hero-title">{t('calendar.title')}</h1>
      </div>

      <div className="cal-controls">
        <div className="cal-mode-toggle">
          <button
            className={`cal-mode-btn${mode === 'week' ? ' active' : ''}`}
            onClick={() => setMode('week')}
          >
            {t('calendar.week')}
          </button>
          <button
            className={`cal-mode-btn${mode === 'month' ? ' active' : ''}`}
            onClick={() => setMode('month')}
          >
            {t('calendar.month')}
          </button>
        </div>

        <div className="cal-nav">
          <button
            className="cal-nav-arrow"
            onClick={mode === 'week' ? handlePrevWeek : handlePrevMonth}
            aria-label={mode === 'week' ? t('calendar.prevWeek') : t('calendar.prevMonth')}
          >
            <AltArrowLeft size={18} />
          </button>
          <div className="cal-nav-label">
            {mode === 'week'
              ? <span className="cal-nav-text">{formatDateRange(weekStart, t)}</span>
              : <span className="cal-nav-text">{t(MONTH_KEYS[monthDate.getMonth()])} {monthDate.getFullYear()}</span>
            }
            {showTodayBadge && (
              <button className="cal-today-badge" onClick={handleToday}>{t('common.today')}</button>
            )}
          </div>
          <button
            className="cal-nav-arrow"
            onClick={mode === 'week' ? handleNextWeek : handleNextMonth}
            aria-label={mode === 'week' ? t('calendar.nextWeek') : t('calendar.nextMonth')}
          >
            <AltArrowRight size={18} />
          </button>
        </div>
      </div>

      {mode === 'week' ? (
        <div className="cal-week">
          {weekDays.map((day, i) => {
            const isToday = isSameDay(day, today);
            const isSelected = isSameDay(day, selectedDay);
            const isPast = day < today && !isToday;
            const taskCount = (tasksByDate.get(dateKey(day)) ?? []).length;
            return (
              <button
                key={i}
                className={`cal-week-day${isToday ? ' cal-week-day--today' : ''}${isSelected && !isToday ? ' cal-week-day--selected' : ''}${isPast ? ' cal-week-day--past' : ''}`}
                onClick={() => handleDayClick(day)}
              >
                <span className="cal-week-day-name">{t(DAY_KEYS_SHORT[i])}</span>
                <div className="cal-week-day-pill">
                  <span className="cal-week-day-num">{day.getDate()}</span>
                  {taskCount > 0 && (
                    <span className="cal-week-day-dot" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="cal-month">
          <div className="cal-month-header">
            {DAY_KEYS_SHORT.map(d => (
              <span key={d} className="cal-month-header-day">{t(d)}</span>
            ))}
          </div>
          <div className="cal-month-grid">
            {monthGrid.map((cell, i) => {
              const isToday = isSameDay(cell.date, today);
              const isSelected = isSameDay(cell.date, selectedDay);
              const isPast = cell.date < today && !isToday;
              const taskCount = (tasksByDate.get(dateKey(cell.date)) ?? []).length;
              return (
                <button
                  key={i}
                  className={`cal-month-cell${cell.currentMonth ? '' : ' cal-month-cell--other'}${isToday ? ' cal-month-cell--today' : ''}${isSelected && !isToday ? ' cal-month-cell--selected' : ''}${isPast ? ' cal-month-cell--past' : ''}`}
                  onClick={() => handleDayClick(cell.date)}
                >
                  <span className="cal-month-cell-num">{cell.date.getDate()}</span>
                  {taskCount > 0 && cell.currentMonth && (
                    <div className="cal-month-cell-dots">
                      {taskCount <= 3 ? (
                        Array.from({ length: taskCount }).map((_, j) => (
                          <span key={j} className="cal-month-cell-dot" />
                        ))
                      ) : (
                        <span className="cal-month-cell-count">{taskCount}</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="cal-day-label">
        <span className="cal-day-label-text">{formatFullDate(selectedDay, t)}</span>
        {selectedTaskCount > 0 && (
          <span className="cal-day-label-count">
            {completedCount}/{selectedTaskCount}
          </span>
        )}
      </div>

      <div className="cal-tasks">
        {selectedTasks.length === 0 ? (
          <div className="cal-empty">
            <div className="cal-empty-icon">
              <CalendarMinimalistic size={28} />
            </div>
            <p className="cal-empty-title">{t('calendar.noTasks')}</p>
            <p className="cal-empty-sub">{t('calendar.noTasksSub')}</p>
          </div>
        ) : (
          selectedTasks.map((task, i) => {
            const dlStatus = getDeadlineStatus(task.deadline, task.completed);
            return (
              <div
                key={task.id}
                className={`cal-task task-stripe-${task.priority}${task.completed ? ' completed' : ''}${dlStatus === 'overdue' ? ' task-overdue' : ''}`}
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <button
                  className={`task-check${task.completed ? ' checked' : ''}`}
                  disabled
                  aria-hidden
                >
                  <svg viewBox="0 0 24 24" fill="none" className="check-icon">
                    <polyline points="5 12 10 17 19 7" className="check-path" />
                  </svg>
                </button>
                <div className="cal-task-body" onClick={() => onViewTask(task)} style={{ cursor: 'pointer' }}>
                  <h3 className="cal-task-title">{task.title}</h3>
                  {task.description && (
                    <p className="cal-task-desc">{task.description}</p>
                  )}
                  <div className="cal-task-tags">
                    <span className={`priority-badge priority-${task.priority}`}>
                      {t(`common.${task.priority}`)}
                    </span>
                    {task.deadline && (
                      <span className={`deadline-badge deadline-${dlStatus}`}>
                        {formatDeadline(task.deadline)}
                      </span>
                    )}
                    {task.tags.map((tag) => {
                      const c = getTagColor(tag);
                      return (
                        <span key={tag} className="user-tag" style={{ background: c.bg, color: c.text }}>
                          #{tag}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
