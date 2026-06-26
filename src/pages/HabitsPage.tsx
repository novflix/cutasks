import { useState, useMemo, useRef, useEffect, type ComponentType } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, AltArrowLeft, AltArrowRight, AddSquare, CloseCircle,
  Book, Running, Meditation, Waterdrop, Heart, MoonStars,
  CupHot, Flame, Target, MedalStar, Shield, Leaf, Star, Bolt, Alarm,
  SmileCircle, Football, CodeSquare, Palette, MusicNote, Notes,
} from '@solar-icons/react';
import type { Habit } from '../types';
import HabitDetailModal from '../components/HabitDetailModal';

const ALL_DAY_KEYS = ['common.mon', 'common.tue', 'common.wed', 'common.thu', 'common.fri', 'common.sat', 'common.sun'];
const MONTH_KEYS = [
  'common.january', 'common.february', 'common.march', 'common.april', 'common.may', 'common.june',
  'common.july', 'common.august', 'common.september', 'common.october', 'common.november', 'common.december',
];

const HABIT_ICONS: { name: string; icon: ComponentType<{ size?: number; strokeWidth?: number }> }[] = [
  { name: 'Book', icon: Book },
  { name: 'Running', icon: Running },
  { name: 'Meditation', icon: Meditation },
  { name: 'Waterdrop', icon: Waterdrop },
  { name: 'Heart', icon: Heart },
  { name: 'MoonStars', icon: MoonStars },
  { name: 'CupHot', icon: CupHot },
  { name: 'Flame', icon: Flame },
  { name: 'Target', icon: Target },
  { name: 'MedalStar', icon: MedalStar },
  { name: 'Shield', icon: Shield },
  { name: 'Leaf', icon: Leaf },
  { name: 'Star', icon: Star },
  { name: 'Bolt', icon: Bolt },
  { name: 'Alarm', icon: Alarm },
  { name: 'SmileCircle', icon: SmileCircle },
  { name: 'Football', icon: Football },
  { name: 'CodeSquare', icon: CodeSquare },
  { name: 'Palette', icon: Palette },
  { name: 'MusicNote', icon: MusicNote },
  { name: 'Notes', icon: Notes },
];

const HABIT_COLORS = [
  '#ed9b6d', '#66bb6a', '#64b5f6', '#ba68c8', '#ffb74d',
  '#4db6ac', '#e57373', '#9575cd', '#4fc3f7', '#f06292',
  '#aed581', '#ff8a65',
];

function getWeekStart(date: Date, mode: string): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  if (mode === 'saturday') {
    const day = d.getDay();
    const diff = d.getDate() - ((day + 1) % 7);
    d.setDate(diff);
  } else {
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
  }
  return d;
}

function addWeeks(date: Date, weeks: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + weeks * 7);
  return d;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDateRange(start: Date, t: (key: string) => string): string {
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const sameMonth = start.getMonth() === end.getMonth();
  if (sameMonth) {
    return `${t(MONTH_KEYS[start.getMonth()])} ${start.getDate()} – ${end.getDate()}`;
  }
  return `${t(MONTH_KEYS[start.getMonth()]).slice(0, 3)} ${start.getDate()} – ${t(MONTH_KEYS[end.getMonth()]).slice(0, 3)} ${end.getDate()}`;
}

function formatFullDate(d: Date, t: (key: string) => string): string {
  return `${t(MONTH_KEYS[d.getMonth()])} ${d.getDate()}, ${d.getFullYear()}`;
}

function getDayOfWeek(d: Date): number {
  const day = d.getDay();
  return day === 0 ? 6 : day - 1;
}

function calcStreak(completions: Record<string, number>, weekdays: number[], targetReps: number): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let streak = 0;
  const d = new Date(today);

  const todayDow = getDayOfWeek(d);
  if (!weekdays.includes(todayDow) || (completions[dateKey(d)] || 0) < targetReps) {
    d.setDate(d.getDate() - 1);
  }

  while (weekdays.includes(getDayOfWeek(d))) {
    if ((completions[dateKey(d)] || 0) >= targetReps) {
      streak++;
    } else {
      break;
    }
    d.setDate(d.getDate() - 1);
  }

  return streak;
}

interface HabitsPageProps {
  habits: Habit[];
  onHabitsChange: (habits: Habit[] | ((prev: Habit[]) => Habit[])) => void;
  weekStartDay: string;
  formOpenerRef?: React.MutableRefObject<(() => void) | null>;
}

export default function HabitsPage({ habits, onHabitsChange, weekStartDay, formOpenerRef }: HabitsPageProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [weekStart, setWeekStart] = useState(() => getWeekStart(today, weekStartDay));
  const [selectedDay, setSelectedDay] = useState<Date>(today);
  const [showForm, setShowForm] = useState(false);
  const [formClosing, setFormClosing] = useState(false);
  const [viewingHabit, setViewingHabit] = useState<Habit | null>(null);
  const [detailClosing, setDetailClosing] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState(HABIT_ICONS[0].name);
  const [newColor, setNewColor] = useState(HABIT_COLORS[0]);
  const [newWeekdays, setNewWeekdays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [newTargetReps, setNewTargetReps] = useState(1);
  const nameRef = useRef<HTMLInputElement>(null);
  const formTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const detailTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const dragStateRef = useRef<{ habitId: string; ghost: HTMLElement | null; currentTarget: string | null; isMouse: boolean } | null>(null);
  const [particleKeys, setParticleKeys] = useState<Record<string, number>>({});
  const [floatingNum, setFloatingNum] = useState<{ id: string; x: number; y: number; value: number; color: string; key: number; dx: number } | null>(null);
  const floatingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (formTimer.current) clearTimeout(formTimer.current);
      if (detailTimerRef.current) clearTimeout(detailTimerRef.current);
      if (floatingTimerRef.current) clearTimeout(floatingTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (formOpenerRef) formOpenerRef.current = openForm;
    return () => { if (formOpenerRef) formOpenerRef.current = null; };
  });

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [weekStart]);

  const dayNames = useMemo(() => {
    if (weekStartDay === 'saturday') {
      return ['common.sat', 'common.sun', 'common.mon', 'common.tue', 'common.wed', 'common.thu', 'common.fri'];
    }
    return ALL_DAY_KEYS;
  }, [weekStartDay]);

  const isCurrentWeek = useMemo(() => {
    const todayWeekStart = getWeekStart(today, weekStartDay);
    return isSameDay(weekStart, todayWeekStart);
  }, [weekStart, today, weekStartDay]);

  const selectedKey = dateKey(selectedDay);
  const selectedDow = getDayOfWeek(selectedDay);

  const visibleHabits = useMemo(
    () => habits.filter((h) => h.weekdays.includes(selectedDow)),
    [habits, selectedDow]
  );

  const MAX_REPS = 10;

  const LEVEL_COLORS = [
    '#ed9b6d', '#66bb6a', '#64b5f6', '#ba68c8', '#ffb74d',
    '#4db6ac', '#e57373', '#9575cd', '#4fc3f7', '#f06292',
  ];

  function toggleHabit(id: string) {
    onHabitsChange((prev) =>
      prev.map((h) => {
        if (h.id !== id) return h;
        const current = h.completions[selectedKey] || 0;
        const target = h.targetReps || 1;
        const newCompletions = { ...h.completions };
        if (current >= target) {
          newCompletions[selectedKey] = 0;
        } else {
          newCompletions[selectedKey] = current + 1;
        }
        const newStreak = calcStreak(newCompletions, h.weekdays, target);
        return { ...h, completions: newCompletions, streak: newStreak, updatedAt: Date.now() };
      })
    );

    const habit = habits.find((h) => h.id === id);
    if (!habit) return;
    const current = habit.completions[selectedKey] || 0;
    const target = habit.targetReps || 1;
    const next = current >= target ? 0 : current + 1;

    setParticleKeys((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));

    if (target > 1 && next > 0) {
      const el = document.querySelector(`[data-habit-id="${id}"] .habits-check`);
      if (el) {
        const rect = el.getBoundingClientRect();
        const levelColor = LEVEL_COLORS[(next - 1) % LEVEL_COLORS.length];
        const dx = Math.round((Math.random() - 0.5) * 50);
        if (floatingTimerRef.current) clearTimeout(floatingTimerRef.current);
        setFloatingNum({ id, x: rect.left + rect.width / 2, y: rect.top, value: next, color: levelColor, key: Date.now(), dx });
        floatingTimerRef.current = setTimeout(() => setFloatingNum(null), 1200);
      }
    }
  }

  function openForm() {
    setNewName('');
    setNewIcon(HABIT_ICONS[0].name);
    setNewColor(HABIT_COLORS[0]);
    setNewWeekdays([0, 1, 2, 3, 4, 5, 6]);
    setNewTargetReps(1);
    setFormClosing(false);
    setShowForm(true);
    setTimeout(() => nameRef.current?.focus(), 100);
  }

  function closeForm() {
    setFormClosing(true);
    formTimer.current = setTimeout(() => {
      setShowForm(false);
      setFormClosing(false);
    }, 200);
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;
    const now = Date.now();
    const newHabit: Habit = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name: trimmed,
      icon: newIcon,
      color: newColor,
      streak: 0,
      weekdays: newWeekdays,
      completions: {},
      targetReps: newTargetReps,
      createdAt: now,
      updatedAt: now,
    };
    onHabitsChange((prev) => [...prev, newHabit]);
    closeForm();
  }

  function closeDetail() {
    setDetailClosing(true);
    detailTimerRef.current = setTimeout(() => {
      setViewingHabit(null);
      setDetailClosing(false);
    }, 200);
  }

  function updateHabit(id: string, changes: Partial<Habit>) {
    onHabitsChange((prev) =>
      prev.map((h) => (h.id === id ? { ...h, ...changes } : h))
    );
  }

  function deleteHabit(id: string) {
    onHabitsChange((prev) => prev.filter((h) => h.id !== id));
  }

  function moveHabit(fromId: string, toId: string) {
    onHabitsChange((prev) => {
      const fromIdx = prev.findIndex((h) => h.id === fromId);
      const toIdx = prev.findIndex((h) => h.id === toId);
      if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });
  }

  function findTargetAtPoint(clientX: number, clientY: number, excludeId: string): string | null {
    const el = document.elementFromPoint(clientX, clientY);
    if (!el) return null;
    const row = el.closest('.habits-drag-row');
    if (!row) return null;
    const id = row.getAttribute('data-habit-id');
    if (id && id !== excludeId) return id;
    return null;
  }

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      const ds = dragStateRef.current;
      if (!ds || !ds.isMouse) return;
      if (ds.ghost) {
        ds.ghost.style.left = `${e.clientX - 30}px`;
        ds.ghost.style.top = `${e.clientY - 20}px`;
      }
      if (ds.ghost) ds.ghost.style.pointerEvents = 'none';
      const targetId = findTargetAtPoint(e.clientX, e.clientY, ds.habitId);
      if (ds.ghost) ds.ghost.style.pointerEvents = '';
      setDragOverId(targetId);
      ds.currentTarget = targetId;
    }

    function handleMouseUp() {
      const ds = dragStateRef.current;
      if (!ds || !ds.isMouse) return;
      if (ds.ghost) { ds.ghost.remove(); ds.ghost = null; }
      if (ds.currentTarget) {
        moveHabit(ds.habitId, ds.currentTarget);
      }
      dragStateRef.current = null;
      setDraggingId(null);
      setDragOverId(null);
    }

    function handleTouchMove(e: TouchEvent) {
      const ds = dragStateRef.current;
      if (!ds || ds.isMouse) return;
      e.preventDefault();
      const touch = e.touches[0];
      if (ds.ghost) {
        ds.ghost.style.left = `${touch.clientX - 30}px`;
        ds.ghost.style.top = `${touch.clientY - 20}px`;
      }
      if (ds.ghost) ds.ghost.style.pointerEvents = 'none';
      const targetId = findTargetAtPoint(touch.clientX, touch.clientY, ds.habitId);
      if (ds.ghost) ds.ghost.style.pointerEvents = '';
      setDragOverId(targetId);
      ds.currentTarget = targetId;
    }

    function handleTouchEnd() {
      const ds = dragStateRef.current;
      if (!ds || ds.isMouse) return;
      if (ds.ghost) { ds.ghost.remove(); ds.ghost = null; }
      if (ds.currentTarget) {
        moveHabit(ds.habitId, ds.currentTarget);
      }
      dragStateRef.current = null;
      setDraggingId(null);
      setDragOverId(null);
    }

    function handleCancel() {
      if (dragStateRef.current?.ghost) {
        dragStateRef.current.ghost.remove();
        dragStateRef.current.ghost = null;
      }
      dragStateRef.current = null;
      setDraggingId(null);
      setDragOverId(null);
    }

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('touchcancel', handleCancel);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleCancel);
    };
  }, []);

  function createGhost(habitId: string, clientX: number, clientY: number): HTMLElement {
    const el = document.querySelector(`[data-habit-id="${habitId}"] .habits-item`);
    const rect = el?.getBoundingClientRect();
    const habit = habits.find((h) => h.id === habitId);
    const ghost = document.createElement('div');
    ghost.className = 'habits-drag-ghost';
    ghost.textContent = habit?.name ?? '';
    ghost.style.left = `${clientX - 30}px`;
    ghost.style.top = `${clientY - 20}px`;
    if (rect) ghost.style.width = `${rect.width}px`;
    document.body.appendChild(ghost);
    return ghost;
  }

  function handleMouseDown(habitId: string, e: React.MouseEvent) {
    e.preventDefault();
    const ghost = createGhost(habitId, e.clientX, e.clientY);
    dragStateRef.current = { habitId, ghost, currentTarget: null, isMouse: true };
    setDraggingId(habitId);
  }

  function handleTouchStart(habitId: string, e: React.TouchEvent) {
    const touch = e.touches[0];
    const ghost = createGhost(habitId, touch.clientX, touch.clientY);
    dragStateRef.current = { habitId, ghost, currentTarget: null, isMouse: false };
    setDraggingId(habitId);
  }

  return (
    <>
      <div className="page-hero">
        <button className="btn-icon" onClick={() => navigate('/app/home')}>
          <ArrowLeft size={22} />
        </button>
        <h1 className="page-hero-title">{t('habits.title')}</h1>
      </div>

      <div className="habits-week-nav">
        <div className="habits-week-center">
          <button
            className="habits-week-arrow"
            onClick={() => setWeekStart((w) => addWeeks(w, -1))}
            aria-label={t('calendar.prevWeek')}
          >
            <AltArrowLeft size={18} />
          </button>
          <div className="habits-week-label">
            <span className="habits-week-text">{formatDateRange(weekStart, t)}</span>
            {isCurrentWeek && <span className="habits-week-badge">{t('habits.thisWeek')}</span>}
          </div>
          <button
            className="habits-week-arrow"
            onClick={() => setWeekStart((w) => addWeeks(w, 1))}
            aria-label={t('calendar.nextWeek')}
            disabled={days[6] >= today}
          >
            <AltArrowRight size={18} />
          </button>
        </div>
        <button className="habits-add-btn" onClick={openForm} aria-label={t('habits.newHabit')}>
          <AddSquare size={18} />
          <span className="habits-add-label">{t('common.new')}</span>
        </button>
      </div>

      <div className="habits-calendar">
        {days.map((day, i) => {
          const isToday = isSameDay(day, today);
          const isSelected = isSameDay(day, selectedDay);
          const isPast = day < today;
          const dayNum = day.getDate();
          return (
            <button
              key={i}
              className={`habits-day ${isToday ? 'habits-day--today' : ''} ${isSelected && !isToday ? 'habits-day--selected' : ''} ${isPast ? 'habits-day--past' : ''}`}
              onClick={() => setSelectedDay(day)}
            >
              <span className="habits-day-name">{t(dayNames[i])}</span>
              <div className="habits-day-pill">
                <span className="habits-day-num">{dayNum}</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="habits-day-label">
        {isSameDay(selectedDay, today)
          ? t('common.today')
          : formatFullDate(selectedDay, t)}
      </div>

      <div className="habits-list">
        {visibleHabits.length === 0 ? (
          <div className="habits-empty">
            <img src="/illustrations/Habits-Variant-1.svg" className="habits-empty-illustration" alt="" />
            <p className="habits-empty-title">{t('habits.noHabits')}</p>
            <p className="habits-empty-sub">{habits.length === 0 ? t('habits.noHabitsSub') : t('habits.noHabitsScheduled')}</p>
          </div>
        ) : (
          visibleHabits.map((habit, i) => {
            const currentReps = habit.completions[selectedKey] || 0;
            const target = habit.targetReps || 1;
            const isFullyDone = currentReps >= target;
            const isPartial = currentReps > 0 && !isFullyDone;
            const isDragging = draggingId === habit.id;
            const isDragOver = dragOverId === habit.id;
            const isFuture = selectedDay > today;
            return (
              <div key={habit.id} className="habits-drag-row" data-habit-id={habit.id}>
                <div
                  className="habits-drag-handle"
                  onMouseDown={(e) => handleMouseDown(habit.id, e)}
                  onTouchStart={(e) => handleTouchStart(habit.id, e)}
                  title={t('habits.dragToReorder')}
                >
                  <svg width="12" height="16" viewBox="0 0 12 16" fill="currentColor">
                    <circle cx="3" cy="2.5" r="1.5" /><circle cx="9" cy="2.5" r="1.5" />
                    <circle cx="3" cy="8" r="1.5" /><circle cx="9" cy="8" r="1.5" />
                    <circle cx="3" cy="13.5" r="1.5" /><circle cx="9" cy="13.5" r="1.5" />
                  </svg>
                </div>
                <div
                  className={`habits-item ${isFullyDone ? 'habits-item--done' : ''} ${isPartial ? 'habits-item--partial' : ''} ${isDragging ? 'habits-item--dragging' : ''} ${isDragOver ? 'habits-item--drag-over' : ''}`}
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                <button
                  className={`habits-check ${target <= 1 ? 'habits-check--simple' : ''} ${isFullyDone ? 'habits-check--checked' : ''} ${isPartial ? `habits-check--partial habits-check--level-${currentReps}` : ''} ${isFuture ? 'habits-check--disabled' : ''}`}
                  onClick={() => { if (!isFuture) toggleHabit(habit.id); }}
                  disabled={isFuture}
                  aria-label={isFullyDone ? `${t('components.taskCard.undo')} ${habit.name}` : `${t('components.taskCard.complete')} ${habit.name}`}
                  style={isFullyDone ? { background: habit.color, borderColor: habit.color } : isPartial ? { borderColor: LEVEL_COLORS[(currentReps - 1) % LEVEL_COLORS.length] } : !isFuture ? { borderColor: habit.color } : undefined}
                >
                  <span className="habits-check-particles" key={particleKeys[habit.id] || 0}>
                    <i /><i /><i /><i /><i /><i /><i /><i />
                  </span>
                  <svg viewBox="0 0 24 24" fill="none" className="habits-check-icon">
                    <polyline points="5 12 10 17 19 7" />
                  </svg>
                </button>
                <div className="habits-item-body" onClick={() => setViewingHabit(habit)} style={{ cursor: 'pointer' }}>
                  <span className="habits-item-icon" style={{ background: `${habit.color}18`, color: habit.color }}>
                    {(() => { const Ic = HABIT_ICONS.find((ic) => ic.name === habit.icon)?.icon ?? Book; return <Ic size={18} strokeWidth={1.8} />; })()}
                  </span>
                  <span className="habits-item-name">{habit.name}</span>
                  {target > 1 && (
                    <span className="habits-reps-badge" style={{ background: `${habit.color}20`, color: habit.color }}>
                      ×{target}
                    </span>
                  )}
                </div>
                <div className={`habits-item-streak${habit.streak >= 100 ? ' streak-100' : habit.streak >= 30 ? ' streak-30' : habit.streak >= 7 ? ' streak-7' : ''}`}>
                  <img src="/icons/streak.svg" alt="" className="habits-streak-icon" width="16" height="16" />
                  <span className="habits-streak-num">{habit.streak}</span>
                </div>
              </div>
              </div>
            );
          })
        )}
      </div>

      {(showForm || formClosing) && (
        <div className={`modal-overlay${formClosing ? ' closing' : ''}`} onClick={closeForm}>
          <div className={`modal habits-form-modal${formClosing ? ' closing' : ''}`} onClick={(e) => e.stopPropagation()}>
            <div className="fm-header">
              <h2 className="fm-title">{t('habits.newHabit')}</h2>
              <button className="btn-icon fm-close" onClick={closeForm}>
                <CloseCircle size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="fm-body">
              <div className="fm-field">
                <label className="fm-label">{t('common.name')}</label>
                <input
                  ref={nameRef}
                  type="text"
                  placeholder={t('habits.habitName')}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="fm-input"
                  maxLength={50}
                  required
                />
              </div>

              <div className="fm-field">
                <label className="fm-label">{t('common.icon')}</label>
                <div className="habits-icon-picker">
                  {HABIT_ICONS.map((item) => {
                    const Ic = item.icon;
                    return (
                      <button
                        key={item.name}
                        type="button"
                        className={`habits-icon-btn${newIcon === item.name ? ' selected' : ''}`}
                        style={newIcon === item.name ? { background: `${newColor}18`, color: newColor, borderColor: `${newColor}40` } : undefined}
                        onClick={() => setNewIcon(item.name)}
                        aria-label={item.name}
                      >
                        <Ic size={18} strokeWidth={1.8} />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="fm-field">
                <label className="fm-label">{t('common.color')}</label>
                <div className="habits-color-picker">
                  {HABIT_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`habits-color-btn${newColor === c ? ' selected' : ''}`}
                      style={{ background: c }}
                      onClick={() => setNewColor(c)}
                      aria-label={`${t('common.color')} ${c}`}
                    />
                  ))}
                </div>
              </div>

              <div className="fm-field">
                <label className="fm-label">{t('habits.repeatOn')}</label>
                <div className="habits-weekday-picker">
                  {dayNames.map((name, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`habits-weekday-btn${newWeekdays.includes(i) ? ' selected' : ''}`}
                      onClick={() => {
                        setNewWeekdays((prev) =>
                          prev.includes(i) ? prev.filter((d) => d !== i) : [...prev, i].sort()
                        );
                      }}
                      aria-label={t(name)}
                    >
                      <span className="habits-weekday-letter">{t(name).charAt(0)}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="fm-field">
                <label className="fm-label">{t('habits.repetitionsPerDay')}</label>
                <div className="habits-reps-input-wrap">
                  <button
                    type="button"
                    className="habits-reps-adj"
                    onClick={() => setNewTargetReps((p) => Math.max(1, p - 1))}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={MAX_REPS}
                    value={newTargetReps}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10);
                      if (!isNaN(v)) setNewTargetReps(Math.min(MAX_REPS, Math.max(1, v)));
                    }}
                    className="fm-input habits-reps-input"
                  />
                  <button
                    type="button"
                    className="habits-reps-adj"
                    onClick={() => setNewTargetReps((p) => Math.min(MAX_REPS, p + 1))}
                  >
                    +
                  </button>
                </div>
              </div>
            </form>

            <div className="fm-footer">
              <button type="button" className="btn btn-secondary" onClick={closeForm}>
                {t('common.cancel')}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={!newName.trim()}
                onClick={handleFormSubmit}
              >
                {t('habits.createHabit')}
              </button>
            </div>
          </div>
        </div>
      )}

      {(viewingHabit || detailClosing) && (
        <HabitDetailModal
          habit={viewingHabit!}
          onClose={closeDetail}
          onUpdate={updateHabit}
          onDelete={deleteHabit}
          isClosing={detailClosing}
        />
      )}

      {floatingNum && (
        <div
          key={floatingNum.key}
          className="habits-floating-num"
          style={{
            left: floatingNum.x,
            top: floatingNum.y,
            color: '#fff',
            borderColor: floatingNum.color,
            background: floatingNum.color,
            '--dx': `${floatingNum.dx}px`,
          } as React.CSSProperties}
        >
          ×{floatingNum.value}
        </div>
      )}
    </>
  );
}
