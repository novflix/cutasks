import { useState, useMemo, useRef, useEffect, type ComponentType } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, AltArrowLeft, AltArrowRight, AddSquare, CloseCircle,
  Book, Running, Meditation, Waterdrop, Heart, MoonStars,
  CupHot, Flame, Target, MedalStar, Shield, Leaf, Star, Bolt, Alarm,
  SmileCircle, Football, CodeSquare, Palette, MusicNote, Notes,
} from '@solar-icons/react';
import type { Habit } from '../types';
import HabitDetailModal from '../components/HabitDetailModal';

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
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

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
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

function formatDateRange(start: Date): string {
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const sameMonth = start.getMonth() === end.getMonth();
  if (sameMonth) {
    return `${MONTH_NAMES[start.getMonth()]} ${start.getDate()} – ${end.getDate()}`;
  }
  return `${MONTH_NAMES[start.getMonth()].slice(0, 3)} ${start.getDate()} – ${MONTH_NAMES[end.getMonth()].slice(0, 3)} ${end.getDate()}`;
}

function formatFullDate(d: Date): string {
  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function getDayOfWeek(d: Date): number {
  const day = d.getDay();
  return day === 0 ? 6 : day - 1;
}

function calcStreak(completions: Record<string, boolean>, weekdays: number[]): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let streak = 0;
  const d = new Date(today);

  const todayDow = getDayOfWeek(d);
  if (!weekdays.includes(todayDow) || !completions[dateKey(d)]) {
    d.setDate(d.getDate() - 1);
  }

  while (weekdays.includes(getDayOfWeek(d))) {
    if (completions[dateKey(d)]) {
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
}

export default function HabitsPage({ habits, onHabitsChange }: HabitsPageProps) {
  const navigate = useNavigate();
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [weekStart, setWeekStart] = useState(() => getMonday(today));
  const [selectedDay, setSelectedDay] = useState<Date>(today);
  const [showForm, setShowForm] = useState(false);
  const [formClosing, setFormClosing] = useState(false);
  const [viewingHabit, setViewingHabit] = useState<Habit | null>(null);
  const [detailClosing, setDetailClosing] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState(HABIT_ICONS[0].name);
  const [newColor, setNewColor] = useState(HABIT_COLORS[0]);
  const [newWeekdays, setNewWeekdays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const nameRef = useRef<HTMLInputElement>(null);
  const formTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const detailTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (formTimer.current) clearTimeout(formTimer.current);
      if (detailTimerRef.current) clearTimeout(detailTimerRef.current);
    };
  }, []);

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [weekStart]);

  const isCurrentWeek = useMemo(() => {
    const todayMonday = getMonday(today);
    return isSameDay(weekStart, todayMonday);
  }, [weekStart, today]);

  const selectedKey = dateKey(selectedDay);

  function toggleHabit(id: string) {
    onHabitsChange((prev) =>
      prev.map((h) => {
        if (h.id !== id) return h;
        const wasDone = !!h.completions[selectedKey];
        const newCompletions = { ...h.completions };
        if (wasDone) {
          delete newCompletions[selectedKey];
        } else {
          newCompletions[selectedKey] = true;
        }
        const newStreak = calcStreak(newCompletions, h.weekdays);
        return { ...h, completions: newCompletions, streak: newStreak, updatedAt: Date.now() };
      })
    );
  }

  function openForm() {
    setNewName('');
    setNewIcon(HABIT_ICONS[0].name);
    setNewColor(HABIT_COLORS[0]);
    setNewWeekdays([0, 1, 2, 3, 4, 5, 6]);
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

  return (
    <>
      <div className="page-hero">
        <button className="btn-icon" onClick={() => navigate('/home')}>
          <ArrowLeft size={22} />
        </button>
        <h1 className="page-hero-title">Habits</h1>
      </div>

      <div className="habits-week-nav">
        <div className="habits-week-center">
          <button
            className="habits-week-arrow"
            onClick={() => setWeekStart((w) => addWeeks(w, -1))}
            aria-label="Previous week"
          >
            <AltArrowLeft size={18} />
          </button>
          <div className="habits-week-label">
            <span className="habits-week-text">{formatDateRange(weekStart)}</span>
            {isCurrentWeek && <span className="habits-week-badge">This week</span>}
          </div>
          <button
            className="habits-week-arrow"
            onClick={() => setWeekStart((w) => addWeeks(w, 1))}
            aria-label="Next week"
            disabled={days[6] >= today}
          >
            <AltArrowRight size={18} />
          </button>
        </div>
        <button className="habits-add-btn" onClick={openForm} aria-label="New habit">
          <AddSquare size={18} />
          <span className="habits-add-label">New</span>
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
              <span className="habits-day-name">{DAY_NAMES[i]}</span>
              <div className="habits-day-pill">
                <span className="habits-day-num">{dayNum}</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="habits-day-label">
        {isSameDay(selectedDay, today)
          ? 'Today'
          : formatFullDate(selectedDay)}
      </div>

      <div className="habits-list">
        {habits.length === 0 ? (
          <div className="habits-empty">
            <p className="habits-empty-title">No habits yet</p>
            <p className="habits-empty-sub">Tap "New" to create your first habit</p>
          </div>
        ) : (
          habits.map((habit, i) => {
            const isDone = !!habit.completions[selectedKey];
            return (
              <div
                key={habit.id}
                className={`habits-item ${isDone ? 'habits-item--done' : ''}`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <button
                  className={`habits-check ${isDone ? 'habits-check--checked' : ''}`}
                  onClick={() => toggleHabit(habit.id)}
                  aria-label={isDone ? `Undo ${habit.name}` : `Complete ${habit.name}`}
                >
                  <span className="habits-check-particles">
                    <i /><i /><i /><i /><i /><i />
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
                </div>
                <div className="habits-item-streak">
                  <img src="/icons/streak.svg" alt="" className="habits-streak-icon" width="16" height="16" />
                  <span className="habits-streak-num">{habit.streak}</span>
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
              <h2 className="fm-title">New Habit</h2>
              <button className="btn-icon fm-close" onClick={closeForm}>
                <CloseCircle size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="fm-body">
              <div className="fm-field">
                <label className="fm-label">Name</label>
                <input
                  ref={nameRef}
                  type="text"
                  placeholder="What habit do you want to build?"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="fm-input"
                  maxLength={50}
                  required
                />
              </div>

              <div className="fm-field">
                <label className="fm-label">Icon</label>
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
                <label className="fm-label">Color</label>
                <div className="habits-color-picker">
                  {HABIT_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`habits-color-btn${newColor === c ? ' selected' : ''}`}
                      style={{ background: c }}
                      onClick={() => setNewColor(c)}
                      aria-label={`Color ${c}`}
                    />
                  ))}
                </div>
              </div>

              <div className="fm-field">
                <label className="fm-label">Repeat on</label>
                <div className="habits-weekday-picker">
                  {DAY_NAMES.map((name, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`habits-weekday-btn${newWeekdays.includes(i) ? ' selected' : ''}`}
                      onClick={() => {
                        setNewWeekdays((prev) =>
                          prev.includes(i) ? prev.filter((d) => d !== i) : [...prev, i].sort()
                        );
                      }}
                      aria-label={name}
                    >
                      <span className="habits-weekday-letter">{name.charAt(0)}</span>
                    </button>
                  ))}
                </div>
              </div>
            </form>

            <div className="fm-footer">
              <button type="button" className="btn btn-secondary" onClick={closeForm}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!newName.trim()}
                form="habits-new-form"
                onClick={handleFormSubmit}
              >
                Create Habit
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
    </>
  );
}
