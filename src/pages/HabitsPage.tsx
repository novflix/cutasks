import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/useAuth';
import {
  useHabits,
  habitColorTokens,
  getTodayKey,
  getLastNDays,
  isScheduledToday,
  type Habit,
  type HabitInput,
  type HabitColor,
  type HabitFrequency,
} from '../hooks/useHabits';

import {
  AddCircle,
  CheckCircle,
  CloseCircle,
  MenuDots,
  CupStar,
  Target,
  TrashBinMinimalistic,
  Broom,
  CheckSquare,
  Bolt,
  Leaf,
  Flame,
  Fire,
  MedalStar,
  HeartShine,
  Star,
  Pen2,
  Running,
  Dumbbell,
  Meditation,
  Bicycling,
  Book,
  Palette,
  ClockCircle,
  CalendarMark,
  HandHeart,
  type IconProps,
} from '@solar-icons/react';

// ─── Icon system ────────────────────────────────────────────────────────────

type IconComponent = React.ComponentType<IconProps>;

interface HabitIconOption {
  key: string;
  component: IconComponent;
  label: string;
}

const HABIT_ICONS: HabitIconOption[] = [
  { key: 'running',     component: Running,      label: 'Running'     },
  { key: 'dumbbell',   component: Dumbbell,     label: 'Fitness'     },
  { key: 'meditation', component: Meditation,   label: 'Meditation'  },
  { key: 'bicycling',  component: Bicycling,    label: 'Cycling'     },
  { key: 'book',       component: Book,         label: 'Reading'     },
  { key: 'palette',    component: Palette,      label: 'Creative'    },
  { key: 'clock',      component: ClockCircle,  label: 'Schedule'    },
  { key: 'calendar',   component: CalendarMark, label: 'Planning'    },
  { key: 'broom',      component: Broom,        label: 'Cleaning'    },
  { key: 'heart',      component: HandHeart,    label: 'Self-care'   },
  { key: 'heartshine', component: HeartShine,   label: 'Wellness'    },
  { key: 'target',     component: Target,       label: 'Goals'       },
  { key: 'leaf',       component: Leaf,         label: 'Nature'      },
  { key: 'star',       component: Star,         label: 'Star'        },
  { key: 'bolt',       component: Bolt,         label: 'Energy'      },
  { key: 'medal',      component: MedalStar,    label: 'Achievement' },
  { key: 'fire',       component: Fire,         label: 'Streak'      },
  { key: 'check',      component: CheckSquare,  label: 'Task'        },
  { key: 'cup',        component: CupStar,      label: 'Trophy'      },
  { key: 'flame',      component: Flame,        label: 'Passion'     },
];

function getIconComponent(key: string): IconComponent {
  return HABIT_ICONS.find(i => i.key === key)?.component ?? Target;
}

function HabitIcon({ iconKey, size, color, weight }: {
  iconKey: string;
  size?: number;
  color?: string;
  weight?: IconProps['weight'];
}) {
  const Ic = getIconComponent(iconKey);
  return React.createElement(Ic, { size, color, weight });
}

// ─── Constants ──────────────────────────────────────────────────────────────

const COLORS: { value: HabitColor; label: string }[] = [
  { value: 'coral',    label: 'Coral'    },
  { value: 'sage',     label: 'Sage'     },
  { value: 'sky',      label: 'Sky'      },
  { value: 'lavender', label: 'Lavender' },
  { value: 'amber',    label: 'Amber'    },
  { value: 'teal',     label: 'Teal'     },
  { value: 'blush',    label: 'Blush'    },
  { value: 'slate',    label: 'Slate'    },
];

const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];
const DAY_SHORT  = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DAY_FULL   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const LAST_7_CHRON = [...getLastNDays(7)].reverse();

// ─── Habit Modal ─────────────────────────────────────────────────────────────

interface ModalProps {
  onClose: () => void;
  onSave:  (input: HabitInput) => void;
  initial?: Habit | null;
}

const HabitModal: React.FC<ModalProps> = ({ onClose, onSave, initial }) => {
  const [title,    setTitle]    = useState(initial?.title ?? '');
  const [iconKey,  setIconKey]  = useState(initial?.emoji ?? 'target');
  const [color,    setColor]    = useState<HabitColor>(initial?.color ?? 'coral');
  const [freq,     setFreq]     = useState<'daily' | 'weekly'>(
    initial ? (initial.frequency === 'daily' ? 'daily' : 'weekly') : 'daily'
  );
  const [days, setDays] = useState<number[]>(
    initial && Array.isArray(initial.frequency) ? initial.frequency : [1, 2, 3, 4, 5]
  );
  const [showIcons, setShowIcons] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => { titleRef.current?.focus(); }, []);

  const toggleDay = (d: number) =>
    setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d].sort());

  const handleSave = () => {
    if (!title.trim()) return;
    const frequency: HabitFrequency = freq === 'daily' ? 'daily' : days;
    onSave({ title: title.trim(), emoji: iconKey, color, frequency });
    onClose();
  };

  const tk = habitColorTokens(color);

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: 200,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0,0,0,0.55)',
    backdropFilter: 'blur(8px)',
    padding: '20px 20px 20px calc(20px + var(--sidebar-w, 0px))',
    animation: 'hFadeIn 0.18s ease',
  };

  const cardStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: 480,
    overflowY: 'auto',
    background: 'var(--bg-card)',
    borderRadius: 24,
    padding: '24px 20px 28px',
    maxHeight: '90dvh',
    animation: 'hFadeIn 0.22s ease',
  };

  return createPortal(
    <div style={overlayStyle} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontFamily: '"Fraunces", serif', fontSize: '1.35rem', fontWeight: 500, color: 'var(--text-main)' }}>
            {initial ? 'Edit habit' : 'New habit'}
          </h2>
          <button
            onClick={onClose}
            style={{ width: 32, height: 32, border: '1.5px solid var(--border)', background: 'var(--bg-panel)', color: 'var(--text-muted)', cursor: 'pointer', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <CloseCircle size={17} weight="Bold" />
          </button>
        </div>

        {/* Icon + Name */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 20 }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <button
              onClick={() => setShowIcons(v => !v)}
              style={{
                width: 50, height: 50, cursor: 'pointer', borderRadius: 16,
                background: tk.bg, border: `2px solid ${tk.border}`,
                boxShadow: showIcons ? `0 0 0 3px ${tk.dot}28` : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <HabitIcon iconKey={iconKey} size={22} color={tk.dot} weight="Bold" />
            </button>
            {showIcons && (
              <div style={{
                position: 'absolute', top: 58, left: 0, zIndex: 20,
                display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6,
                padding: 10, width: 210,
                background: 'var(--bg-card)', border: '1.5px solid var(--border)',
                borderRadius: 18, boxShadow: '0 16px 40px rgba(0,0,0,0.18)',
              }}>
                {HABIT_ICONS.map(({ key, label }) => (
                  <button
                    key={key} title={label}
                    onClick={() => { setIconKey(key); setShowIcons(false); }}
                    style={{
                      width: 34, height: 34, cursor: 'pointer', borderRadius: 10,
                      background: iconKey === key ? tk.bg : 'var(--bg-panel)',
                      border: iconKey === key ? `1.5px solid ${tk.dot}` : '1.5px solid transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <HabitIcon iconKey={key} size={16} color={iconKey === key ? tk.dot : 'var(--text-muted)'} weight="Bold" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <input
            ref={titleRef}
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSave(); }}
            placeholder="Habit name…"
            style={{
              flex: 1, borderRadius: 16, fontSize: '0.875rem', outline: 'none',
              padding: '13px 16px',
              background: 'var(--bg-panel)', border: '1.5px solid var(--border)',
              color: 'var(--text-main)', fontFamily: '"DM Sans", sans-serif',
              WebkitUserSelect: 'text', userSelect: 'text',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = tk.dot; e.currentTarget.style.boxShadow = `0 0 0 3px ${tk.dot}1e`; }}
            onBlur={e  => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
          />
        </div>

        {/* Color */}
        <p style={{ marginBottom: 10, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', fontFamily: '"DM Sans", sans-serif' }}>Color</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
          {COLORS.map(c => {
            const ct = habitColorTokens(c.value);
            return (
              <button key={c.value} title={c.label} onClick={() => setColor(c.value)}
                style={{
                  width: 28, height: 28, cursor: 'pointer', borderRadius: '50%',
                  background: ct.dot,
                  border: color === c.value ? `3px solid var(--text-main)` : '3px solid transparent',
                  boxShadow: color === c.value ? `0 0 0 2px ${ct.dot}55` : 'none',
                  transform: color === c.value ? 'scale(1.2)' : 'scale(1)',
                  transition: 'all 0.15s',
                }}
              />
            );
          })}
        </div>

        {/* Frequency */}
        <p style={{ marginBottom: 10, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', fontFamily: '"DM Sans", sans-serif' }}>Frequency</p>
        <div style={{ display: 'flex', gap: 8, marginBottom: freq === 'weekly' ? 14 : 28 }}>
          {(['daily', 'weekly'] as const).map(f => (
            <button key={f} onClick={() => setFreq(f)}
              style={{
                flex: 1, padding: '11px 0', cursor: 'pointer', borderRadius: 12,
                fontWeight: 600, fontSize: '0.875rem', textTransform: 'capitalize',
                background: freq === f ? tk.bg : 'var(--bg-panel)',
                border: freq === f ? `1.5px solid ${tk.dot}` : '1.5px solid var(--border)',
                color: freq === f ? tk.dot : 'var(--text-muted)',
                fontFamily: '"DM Sans", sans-serif',
                transition: 'all 0.15s',
              }}
            >{f}</button>
          ))}
        </div>

        {freq === 'weekly' && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
            {WEEK_ORDER.map(dow => {
              const on = days.includes(dow);
              return (
                <button key={dow} onClick={() => toggleDay(dow)}
                  style={{
                    flex: 1, height: 38, cursor: 'pointer', borderRadius: 12,
                    fontWeight: 700, fontSize: '0.75rem',
                    background: on ? tk.dot : 'var(--bg-panel)',
                    border: on ? `1.5px solid ${tk.dot}` : '1.5px solid var(--border)',
                    color: on ? '#fff' : 'var(--text-muted)',
                    fontFamily: '"DM Sans", sans-serif',
                    transition: 'all 0.15s',
                  }}
                >
                  {DAY_SHORT[dow]}
                </button>
              );
            })}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={!title.trim()}
          style={{
            width: '100%', padding: '15px 0', borderRadius: 16,
            fontWeight: 700, letterSpacing: '0.02em',
            background: title.trim() ? tk.dot : 'var(--border)',
            color: '#fff', border: 'none',
            fontFamily: '"DM Sans", sans-serif', fontSize: '0.9rem',
            cursor: title.trim() ? 'pointer' : 'not-allowed',
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => { if (title.trim()) (e.currentTarget as HTMLElement).style.opacity = '0.85'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
        >
          {initial ? 'Save changes' : 'Create habit'}
        </button>
      </div>
    </div>,
    document.body
  );
};

// ─── Habit Card ───────────────────────────────────────────────────────────────

interface CardProps {
  habit:    Habit;
  onToggle: (dateKey: string) => void;
  onEdit:   () => void;
  onDelete: () => void;
}

const HabitCard: React.FC<CardProps> = ({ habit, onToggle, onEdit, onDelete }) => {
  const tk        = habitColorTokens(habit.color);
  const todayKey  = getTodayKey();
  const done      = !!habit.completions[todayKey];
  const scheduled = isScheduledToday(habit);
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menu) return;
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [menu]);

  const freqLabel = habit.frequency === 'daily'
    ? 'Every day'
    : (habit.frequency as number[]).map(d => DAY_FULL[d].slice(0, 3)).join(' · ');

  return (
    <div
      className="rounded-2xl transition-all overflow-hidden"
      style={{
        background: 'var(--bg-card)',
        border: `1.5px solid ${done && scheduled ? tk.border : 'var(--border)'}`,
        boxShadow: done && scheduled ? `0 4px 20px ${tk.dot}18` : '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      <div className="flex items-center gap-3" style={{ padding: '14px 14px 12px' }}>
        <button
          onClick={() => scheduled && onToggle(todayKey)}
          className="flex-shrink-0 flex items-center justify-center rounded-full transition-all"
          style={{
            width: 48, height: 48,
            background: done ? tk.dot : tk.bg,
            border: done ? 'none' : `2px solid ${tk.border}`,
            opacity: !scheduled ? 0.3 : 1,
            cursor: scheduled ? 'pointer' : 'default',
            transform: done ? 'scale(1.06)' : 'scale(1)',
            boxShadow: done ? `0 4px 14px ${tk.dot}44` : 'none',
          }}
        >
          {done
            ? <CheckCircle size={22} color="#fff" weight="Bold" />
            : <HabitIcon iconKey={habit.emoji} size={21} color={tk.dot} weight="Bold" />
          }
        </button>

        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-semibold truncate"
            style={{
              fontFamily: '"DM Sans", sans-serif',
              color: 'var(--text-main)',
              opacity: done ? 0.45 : 1,
              textDecoration: done ? 'line-through' : 'none',
              transition: 'opacity 0.2s',
            }}
          >
            {habit.title}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            {habit.streak > 0 && (
              <span
                className="inline-flex items-center gap-1 rounded-full text-xs font-bold"
                style={{ padding: '2px 6px', background: 'rgba(245,158,11,0.12)', color: '#f59e0b', fontFamily: '"DM Sans", sans-serif' }}
              >
                <Flame size={10} color="#f59e0b" weight="Bold" />
                {habit.streak}d
              </span>
            )}
            <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: '"DM Sans", sans-serif' }}>
              {freqLabel}
            </span>
          </div>
        </div>

        <div ref={menuRef} className="relative flex-shrink-0">
          <button
            onClick={() => setMenu(v => !v)}
            className="flex items-center justify-center rounded-xl transition-all"
            style={{
              width: 30, height: 30, border: 'none', cursor: 'pointer',
              background: menu ? 'var(--bg-panel)' : 'transparent',
              color: 'var(--text-muted)',
            }}
          >
            <MenuDots size={16} weight="Bold" />
          </button>
          {menu && (
            <div
              className="absolute right-0 z-50 rounded-2xl"
              style={{
                top: 34, minWidth: 130,
                background: 'var(--bg-card)', border: '1.5px solid var(--border)',
                padding: 5, boxShadow: '0 8px 28px rgba(0,0,0,0.14)',
              }}
            >
              <button
                onClick={() => { onEdit(); setMenu(false); }}
                className="w-full flex items-center gap-2 rounded-xl text-left text-sm font-medium transition-all"
                style={{ padding: '8px 10px', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-main)', fontFamily: '"DM Sans", sans-serif' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-panel)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}
              >
                <Pen2 size={13} weight="Bold" /> Edit
              </button>
              <button
                onClick={() => { onDelete(); setMenu(false); }}
                className="w-full flex items-center gap-2 rounded-xl text-left text-sm font-medium transition-all"
                style={{ padding: '8px 10px', border: 'none', background: 'none', cursor: 'pointer', color: '#e05050', fontFamily: '"DM Sans", sans-serif' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(224,80,80,0.08)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}
              >
                <TrashBinMinimalistic size={13} weight="Bold" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex" style={{ borderTop: '1px solid var(--border)' }}>
        {LAST_7_CHRON.map((dateKey, idx) => {
          const dayDone      = !!habit.completions[dateKey];
          const isToday      = dateKey === todayKey;
          const dow          = new Date(dateKey + 'T12:00:00').getDay();
          const dayScheduled = habit.frequency === 'daily' || (habit.frequency as number[]).includes(dow);
          const isLast       = idx === LAST_7_CHRON.length - 1;

          return (
            <button
              key={dateKey}
              onClick={() => dayScheduled && onToggle(dateKey)}
              className="flex-1 flex flex-col items-center justify-center gap-1.5 transition-all"
              style={{
                paddingTop: 10, paddingBottom: 10,
                background: 'transparent', border: 'none',
                borderRight: isLast ? 'none' : '1px solid var(--border)',
                cursor: dayScheduled ? 'pointer' : 'default',
                opacity: dayScheduled ? 1 : 0.22,
              }}
            >
              <span style={{
                fontSize: '0.58rem', lineHeight: 1,
                fontFamily: '"DM Sans", sans-serif', fontWeight: isToday ? 700 : 500,
                color: isToday ? tk.dot : 'var(--text-muted)',
              }}>
                {DAY_SHORT[dow]}
              </span>
              <div
                className="flex items-center justify-center rounded-full transition-all"
                style={{
                  width: 22, height: 22,
                  background: dayDone ? tk.dot : 'transparent',
                  border: isToday
                    ? `2px solid ${tk.dot}`
                    : dayDone ? 'none'
                    : '1.5px solid var(--border)',
                  boxShadow: dayDone ? `0 2px 6px ${tk.dot}44` : 'none',
                }}
              >
                {dayDone && <CheckCircle size={13} color="#fff" weight="Bold" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ─── Progress ring ────────────────────────────────────────────────────────────

const ProgressRing: React.FC<{ pct: number; size: number; stroke: number; color: string }> = ({ pct, size, stroke, color }) => {
  const r    = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={circ - (pct / 100) * circ}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.34,1.2,0.64,1)' }}
      />
    </svg>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export const HabitsPage: React.FC = () => {
  const { user } = useAuth();
  const { habits, loading, addHabit, updateHabit, deleteHabit, toggleCompletion } = useHabits(user?.uid ?? null);
  const [showModal,     setShowModal]     = useState(false);
  const [editingHabit,  setEditingHabit]  = useState<Habit | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const todayKey    = getTodayKey();
  const todayHabits = habits.filter(isScheduledToday);
  const doneCount   = todayHabits.filter(h => !!h.completions[todayKey]).length;
  const pct         = todayHabits.length > 0 ? Math.round((doneCount / todayHabits.length) * 100) : 0;
  const allDone     = todayHabits.length > 0 && doneCount === todayHabits.length;
  const maxStreak   = habits.reduce((m, h) => Math.max(m, h.streak), 0);

  const handleSave = async (input: HabitInput) => {
    if (editingHabit) await updateHabit(editingHabit.id, input);
    else              await addHabit(input);
    setEditingHabit(null);
  };

  const dateLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="mx-auto" style={{ maxWidth: 480, opacity: 0, animation: 'hFadeIn 0.28s ease-out forwards' }}>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 style={{ fontFamily: '"Fraunces", serif', fontSize: '2rem', fontWeight: 500, color: 'var(--text-main)', lineHeight: 1.05, letterSpacing: '-0.02em' }}>
            Habits
          </h1>
          <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)', fontFamily: '"DM Sans", sans-serif' }}>
            {dateLabel}
          </p>
        </div>
        <button
          onClick={() => { setEditingHabit(null); setShowModal(true); }}
          className="flex items-center gap-1.5 rounded-xl font-bold text-xs transition-all"
          style={{
            padding: '9px 14px', marginTop: 6, border: 'none', cursor: 'pointer',
            background: 'var(--accent)', color: '#fff',
            fontFamily: '"DM Sans", sans-serif', letterSpacing: '0.02em',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.85'; (e.currentTarget as HTMLElement).style.transform = 'scale(0.97)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
        >
          <AddCircle size={14} weight="Bold" /> New habit
        </button>
      </div>

      {/* Summary card */}
      {habits.length > 0 && (
        <div
          className="rounded-2xl flex items-center gap-4 mb-5 transition-all"
          style={{
            padding: '16px 18px',
            background: 'var(--bg-card)',
            border: `1.5px solid ${allDone ? 'rgba(94,168,78,0.3)' : 'var(--border)'}`,
            boxShadow: allDone ? '0 4px 20px rgba(94,168,78,0.1)' : '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <div className="relative flex-shrink-0 flex items-center justify-center" style={{ width: 52, height: 52 }}>
            <ProgressRing pct={pct} size={52} stroke={4} color={allDone ? '#5ea84e' : 'var(--accent)'} />
            <span
              className="absolute font-bold"
              style={{ fontSize: '0.62rem', fontFamily: '"DM Sans", sans-serif', color: allDone ? '#5ea84e' : 'var(--text-main)' }}
            >
              {pct}%
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p style={{ fontFamily: '"Fraunces", serif', fontSize: '1rem', fontWeight: 500, color: allDone ? '#5ea84e' : 'var(--text-main)', lineHeight: 1.2 }}>
              {allDone ? 'All done today! 🎉' : `${doneCount} of ${todayHabits.length} done`}
            </p>
            <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)', fontFamily: '"DM Sans", sans-serif' }}>
              {todayHabits.length === 0 ? 'No habits scheduled' : todayHabits.length - doneCount > 0 ? `${todayHabits.length - doneCount} remaining` : 'Keep it up!'}
            </p>
          </div>
          {maxStreak > 0 && (
            <div className="flex-shrink-0 flex flex-col items-center gap-0.5">
              <Flame size={18} color="#f59e0b" weight="Bold" />
              <span className="font-bold text-xs" style={{ color: '#f59e0b', fontFamily: '"DM Sans", sans-serif' }}>{maxStreak}d</span>
            </div>
          )}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map(i => (
            <div key={i} className="rounded-2xl" style={{ height: 120, background: 'var(--bg-card)', border: '1.5px solid var(--border)', animation: `hPulse 1.4s ease-in-out ${i * 0.15}s infinite` }} />
          ))}
        </div>
      ) : habits.length === 0 ? (
        <div className="flex flex-col items-center text-center" style={{ padding: '60px 24px' }}>
          <div className="flex items-center justify-center rounded-2xl mb-4" style={{ width: 60, height: 60, background: 'var(--bg-card)', border: '1.5px solid var(--border)' }}>
            <Leaf size={26} color="var(--text-muted)" weight="Bold" />
          </div>
          <p style={{ fontFamily: '"Fraunces", serif', fontSize: '1.1rem', fontWeight: 500, color: 'var(--text-main)', marginBottom: 6 }}>No habits yet</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: '"DM Sans", sans-serif' }}>Start building consistent routines</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {habits.map(habit => (
            <HabitCard
              key={habit.id} habit={habit}
              onToggle={dk => toggleCompletion(habit.id, dk)}
              onEdit={() => { setEditingHabit(habit); setShowModal(true); }}
              onDelete={() => setConfirmDelete(habit.id)}
            />
          ))}
        </div>
      )}

      {/* HabitModal uses createPortal internally */}
      {showModal && (
        <HabitModal
          onClose={() => { setShowModal(false); setEditingHabit(null); }}
          onSave={handleSave}
          initial={editingHabit}
        />
      )}

      {/* Confirm delete portal */}
      {confirmDelete && createPortal(
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(8px)',
            padding: '20px 20px 20px calc(20px + var(--sidebar-w, 0px))',
            animation: 'hFadeIn 0.18s ease',
          }}
          onClick={e => { if (e.target === e.currentTarget) setConfirmDelete(null); }}
        >
          <div className="w-full text-center" style={{ maxWidth: 300, background: 'var(--bg-card)', borderRadius: 24, padding: '26px 22px 22px' }}>
            <div className="flex items-center justify-center rounded-2xl mx-auto mb-4" style={{ width: 48, height: 48, background: 'rgba(224,80,80,0.1)' }}>
              <TrashBinMinimalistic size={22} color="#e05050" weight="Bold" />
            </div>
            <p style={{ fontFamily: '"Fraunces", serif', fontSize: '1.1rem', fontWeight: 500, color: 'var(--text-main)', marginBottom: 8 }}>Delete habit?</p>
            <p className="text-xs mb-5" style={{ color: 'var(--text-muted)', fontFamily: '"DM Sans", sans-serif', lineHeight: 1.6 }}>
              All completion history and streaks will be permanently lost.
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 rounded-2xl font-semibold text-sm transition-all"
                style={{ padding: '12px 0', background: 'var(--bg-panel)', border: '1.5px solid var(--border)', color: 'var(--text-muted)', fontFamily: '"DM Sans", sans-serif', cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.7'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
              >Cancel</button>
              <button
                onClick={() => { deleteHabit(confirmDelete!); setConfirmDelete(null); }}
                className="flex-1 rounded-2xl font-bold text-sm transition-all"
                style={{ padding: '12px 0', background: '#e05050', border: 'none', color: '#fff', fontFamily: '"DM Sans", sans-serif', cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.85'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
              >Delete</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <style>{`
        @keyframes hFadeIn  { from { opacity:0; transform:translateY(5px); } to { opacity:1; transform:translateY(0); } }
        @keyframes hSlideUp { from { transform:translateY(100%); } to { transform:translateY(0); } }
        @keyframes hPulse   { 0%,100% { opacity:1; } 50% { opacity:0.45; } }
      `}</style>
    </div>
  );
};