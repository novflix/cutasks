import React, { useState, useRef, useEffect } from 'react';
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

// ── Solar Icons (all from main package) ──────────────────────────────────────
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
  MedalRibbonStar,
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

// ── Icon Picker ───────────────────────────────────────────────────────────────

type IconComponent = React.ComponentType<IconProps>;

interface HabitIconOption {
  key: string;
  component: IconComponent;
  label: string;
}

// Declared at module level — never recreated during render
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

// Stable named component — avoids "component created during render" lint error
function HabitIcon({ iconKey, size, color, weight }: {
  iconKey: string;
  size?: number;
  color?: string;
  weight?: IconProps['weight'];
}) {
  const Ic = getIconComponent(iconKey);
  return React.createElement(Ic, { size, color, weight });
}

// ── Constants ─────────────────────────────────────────────────────────────────

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

const DAY_LABELS      = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_LABELS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

// ── Habit Modal ───────────────────────────────────────────────────────────────

interface ModalProps {
  onClose: () => void;
  onSave:  (input: HabitInput) => void;
  initial?: Habit | null;
}

const HabitModal: React.FC<ModalProps> = ({ onClose, onSave, initial }) => {
  // The `emoji` field in Habit stores the iconKey string
  const [title,   setTitle]   = useState(initial?.title ?? '');
  const [iconKey, setIconKey] = useState<string>(initial?.emoji ?? 'target');
  const [color,   setColor]   = useState<HabitColor>(initial?.color ?? 'coral');
  const [freq,    setFreq]    = useState<'daily' | 'weekly'>(
    initial ? (initial.frequency === 'daily' ? 'daily' : 'weekly') : 'daily'
  );
  const [days, setDays] = useState<number[]>(
    initial && Array.isArray(initial.frequency) ? initial.frequency : [1, 2, 3, 4, 5]
  );
  const [showIcons, setShowIcons] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => { titleRef.current?.focus(); }, []);

  const toggleDay = (d: number) => {
    setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d].sort());
  };

  const handleSave = () => {
    if (!title.trim()) return;
    const frequency: HabitFrequency = freq === 'daily' ? 'daily' : days;
    onSave({ title: title.trim(), emoji: iconKey, color, frequency });
    onClose();
  };

  const tokens = habitColorTokens(color);

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', animation: 'fadeIn 0.18s ease' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ width: '100%', maxWidth: '480px', background: 'var(--bg-card)', borderRadius: '28px 28px 0 0', padding: '8px 20px 36px', animation: 'slideUp 0.28s cubic-bezier(0.34,1.2,0.64,1)', maxHeight: '90dvh', overflowY: 'auto', boxShadow: '0 -4px 40px rgba(0,0,0,0.15)' }}>
        {/* Handle */}
        <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: 'var(--border)', margin: '12px auto 20px' }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ fontFamily: '"Fraunces", serif', fontSize: '1.4rem', fontWeight: 500, color: 'var(--text-main)' }}>
            {initial ? 'Edit habit' : 'New habit'}
          </h2>
          <button onClick={onClose} style={{ width: '34px', height: '34px', borderRadius: '50%', border: '1.5px solid var(--border)', background: 'var(--bg-panel)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <CloseCircle size={18} weight="Bold" />
          </button>
        </div>

        {/* Icon + Title */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'flex-start' }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <button
              onClick={() => setShowIcons(v => !v)}
              style={{ width: '52px', height: '52px', borderRadius: '16px', border: `2px solid ${tokens.border}`, background: tokens.bg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'box-shadow 0.15s', boxShadow: showIcons ? `0 0 0 3px ${tokens.dot}33` : 'none' }}
            >
              <HabitIcon iconKey={iconKey} size={24} color={tokens.dot} weight="Bold" />
            </button>

            {showIcons && (
              <div style={{ position: 'absolute', top: '58px', left: 0, zIndex: 20, background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: '20px', padding: '12px', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', boxShadow: '0 12px 32px rgba(0,0,0,0.18)', width: '220px' }}>
                {HABIT_ICONS.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => { setIconKey(key); setShowIcons(false); }}
                    title={label}
                    style={{ width: '36px', height: '36px', borderRadius: '10px', border: iconKey === key ? `1.5px solid ${tokens.dot}` : '1.5px solid transparent', background: iconKey === key ? tokens.bg : 'var(--bg-panel)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.12s' }}
                  >
                    <HabitIcon iconKey={key} size={18} color={iconKey === key ? tokens.dot : 'var(--text-muted)'} weight="Bold" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <input
            ref={titleRef}
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Habit name..."
            style={{ flex: 1, padding: '14px 16px', borderRadius: '16px', border: '1.5px solid var(--border)', outline: 'none', background: 'var(--bg-panel)', color: 'var(--text-main)', fontFamily: '"DM Sans", sans-serif', fontSize: '0.95rem', transition: 'border-color 0.15s, box-shadow 0.15s', WebkitUserSelect: 'text', userSelect: 'text' }}
            onFocus={e => { e.currentTarget.style.borderColor = tokens.dot; e.currentTarget.style.boxShadow = `0 0 0 3px ${tokens.dot}22`; }}
            onBlur={e  => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
          />
        </div>

        {/* Color */}
        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '10px' }}>Color</label>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '22px', flexWrap: 'wrap' }}>
          {COLORS.map(c => {
            const t = habitColorTokens(c.value);
            return (
              <button key={c.value} onClick={() => setColor(c.value)} title={c.label}
                style={{ width: '30px', height: '30px', borderRadius: '50%', background: t.dot, border: color === c.value ? `3px solid var(--text-main)` : '3px solid transparent', cursor: 'pointer', outline: 'none', boxShadow: color === c.value ? `0 0 0 2px ${t.dot}55` : 'none', transition: 'transform 0.15s, border-color 0.15s', transform: color === c.value ? 'scale(1.2)' : 'scale(1)' }}
              />
            );
          })}
        </div>

        {/* Frequency */}
        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '10px' }}>Frequency</label>
        <div style={{ display: 'flex', gap: '8px', marginBottom: freq === 'weekly' ? '14px' : '28px' }}>
          {(['daily', 'weekly'] as const).map(f => (
            <button key={f} onClick={() => setFreq(f)}
              style={{ flex: 1, padding: '11px', borderRadius: '14px', cursor: 'pointer', border: freq === f ? `1.5px solid ${tokens.dot}` : '1.5px solid var(--border)', background: freq === f ? tokens.bg : 'var(--bg-panel)', color: freq === f ? tokens.dot : 'var(--text-muted)', fontFamily: '"DM Sans", sans-serif', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.15s', textTransform: 'capitalize' }}
            >{f}</button>
          ))}
        </div>

        {freq === 'weekly' && (
          <div style={{ display: 'flex', gap: '6px', marginBottom: '28px' }}>
            {DAY_LABELS_SHORT.map((d, i) => {
              const on = days.includes(i);
              return (
                <button key={i} onClick={() => toggleDay(i)}
                  style={{ flex: 1, height: '38px', borderRadius: '12px', cursor: 'pointer', border: on ? `1.5px solid ${tokens.dot}` : '1.5px solid var(--border)', background: on ? tokens.dot : 'var(--bg-panel)', color: on ? '#fff' : 'var(--text-muted)', fontFamily: '"DM Sans", sans-serif', fontWeight: 700, fontSize: '0.75rem', transition: 'all 0.15s' }}
                >{d}</button>
              );
            })}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={!title.trim()}
          style={{ width: '100%', padding: '15px', borderRadius: '18px', border: 'none', background: title.trim() ? tokens.dot : 'var(--border)', color: '#fff', fontFamily: '"DM Sans", sans-serif', fontWeight: 700, fontSize: '0.95rem', cursor: title.trim() ? 'pointer' : 'not-allowed', transition: 'opacity 0.15s', letterSpacing: '0.02em' }}
          onMouseEnter={e => { if (title.trim()) (e.currentTarget as HTMLButtonElement).style.opacity = '0.88'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
        >
          {initial ? 'Save changes' : 'Create habit'}
        </button>
      </div>
    </div>
  );
};

// ── Habit Card ─────────────────────────────────────────────────────────────────

interface CardProps {
  habit:    Habit;
  onToggle: (dateKey: string) => void;
  onEdit:   () => void;
  onDelete: () => void;
}

const LAST_7 = getLastNDays(7).reverse();

const HabitCard: React.FC<CardProps> = ({ habit, onToggle, onEdit, onDelete }) => {
  const tokens         = habitColorTokens(habit.color);
  const todayKey       = getTodayKey();
  const completedToday = !!habit.completions[todayKey];
  const scheduled      = isScheduledToday(habit);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showMenu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showMenu]);

  return (
    <div style={{ background: 'var(--bg-card)', borderRadius: '22px', border: `1.5px solid ${completedToday && scheduled ? tokens.border : 'var(--border)'}`, padding: '16px 16px 14px', transition: 'border-color 0.2s, box-shadow 0.2s', boxShadow: completedToday && scheduled ? `0 4px 20px ${tokens.dot}22` : '0 1px 4px rgba(0,0,0,0.04)', position: 'relative' }}>

      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>

        <button
          onClick={() => { if (scheduled) onToggle(todayKey); }}
          style={{ width: '44px', height: '44px', borderRadius: '14px', flexShrink: 0, border: completedToday ? 'none' : `2px solid ${tokens.border}`, background: completedToday ? tokens.dot : tokens.bg, color: completedToday ? '#fff' : tokens.dot, cursor: scheduled ? 'pointer' : 'default', opacity: !scheduled ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.22s cubic-bezier(0.34,1.4,0.64,1)', transform: completedToday ? 'scale(1.06)' : 'scale(1)' }}
        >
          {completedToday
            ? <CheckCircle size={22} color="#fff" weight="Bold" />
            : <HabitIcon iconKey={habit.emoji} size={22} color={tokens.dot} weight="Bold" />
          }
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', opacity: completedToday ? 0.65 : 1, transition: 'opacity 0.2s' }}>
            {habit.title}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
            {habit.streak > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#f59e0b', fontSize: '0.7rem', fontWeight: 700, fontFamily: '"DM Sans", sans-serif' }}>
                <Flame size={12} color="#f59e0b" weight="Bold" /> {habit.streak}d
              </span>
            )}
            {habit.bestStreak > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--text-muted)', fontSize: '0.7rem', fontFamily: '"DM Sans", sans-serif' }}>
                <MedalRibbonStar size={11} color="var(--text-muted)" weight="Bold" /> {habit.bestStreak}
              </span>
            )}
            <span style={{ fontSize: '0.67rem', color: 'var(--text-muted)', fontFamily: '"DM Sans", sans-serif' }}>
              {habit.frequency === 'daily' ? 'Daily' : (habit.frequency as number[]).map(d => DAY_LABELS[d].slice(0, 2)).join(', ')}
            </span>
          </div>
        </div>

        <div ref={menuRef} style={{ position: 'relative' }}>
          <button onClick={() => setShowMenu(v => !v)} style={{ width: '32px', height: '32px', borderRadius: '10px', border: 'none', background: showMenu ? 'var(--bg-panel)' : 'transparent', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}>
            <MenuDots size={18} weight="Bold" />
          </button>
          {showMenu && (
            <div style={{ position: 'absolute', right: 0, top: '36px', zIndex: 50, background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: '16px', padding: '6px', minWidth: '140px', boxShadow: '0 8px 28px rgba(0,0,0,0.15)' }}>
              <button onClick={() => { onEdit(); setShowMenu(false); }}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 12px', borderRadius: '10px', border: 'none', background: 'none', color: 'var(--text-main)', fontFamily: '"DM Sans", sans-serif', fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer', textAlign: 'left', transition: 'background 0.12s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-panel)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}
              >
                <Pen2 size={14} weight="Bold" /> Edit
              </button>
              <button onClick={() => { onDelete(); setShowMenu(false); }}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 12px', borderRadius: '10px', border: 'none', background: 'none', color: '#e05050', fontFamily: '"DM Sans", sans-serif', fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer', textAlign: 'left', transition: 'background 0.12s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(224,80,80,0.08)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}
              >
                <TrashBinMinimalistic size={14} weight="Bold" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Weekly mini-calendar */}
      <div style={{ display: 'flex', gap: '5px' }}>
        {LAST_7.map(dateKey => {
          const done         = !!habit.completions[dateKey];
          const isToday      = dateKey === todayKey;
          const d            = new Date(dateKey + 'T12:00:00');
          const dow          = d.getDay();
          const dayLabel     = DAY_LABELS_SHORT[dow];
          const scheduledDay = habit.frequency === 'daily' || (habit.frequency as number[]).includes(dow);

          return (
            <div key={dateKey}
              onClick={() => { if (isToday && scheduled) onToggle(dateKey); else if (!isToday && scheduledDay) onToggle(dateKey); }}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', cursor: scheduledDay ? 'pointer' : 'default' }}
            >
              <span style={{ fontSize: '0.58rem', color: isToday ? tokens.dot : 'var(--text-muted)', fontFamily: '"DM Sans", sans-serif', fontWeight: isToday ? 700 : 400 }}>
                {isToday ? '·' : dayLabel}
              </span>
              <div style={{ width: '100%', aspectRatio: '1', borderRadius: '9px', background: done ? tokens.dot : scheduledDay ? tokens.bg : 'var(--bg-panel)', border: isToday ? `1.5px solid ${tokens.dot}` : `1.5px solid ${done ? tokens.dot : 'transparent'}`, opacity: scheduledDay ? 1 : 0.3, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.18s' }}>
                {done && <CheckCircle size={10} color="#fff" weight="Bold" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Stats Bar ─────────────────────────────────────────────────────────────────

const StatsBar: React.FC<{ habits: Habit[] }> = ({ habits }) => {
  const todayKey    = getTodayKey();
  const scheduled   = habits.filter(isScheduledToday);
  const done        = scheduled.filter(h => !!h.completions[todayKey]);
  const pct         = scheduled.length > 0 ? Math.round((done.length / scheduled.length) * 100) : 0;
  const maxStreak   = habits.reduce((max, h) => Math.max(max, h.streak), 0);
  const totalStreak = habits.reduce((sum, h) => sum + h.streak, 0);
  const isAllDone   = pct === 100 && scheduled.length > 0;

  if (habits.length === 0) return null;

  return (
    <div style={{ background: 'var(--bg-card)', borderRadius: '22px', border: `1.5px solid ${isAllDone ? 'rgba(94,168,78,0.35)' : 'var(--border)'}`, padding: '18px', marginBottom: '16px', boxShadow: isAllDone ? '0 4px 20px rgba(94,168,78,0.12)' : '0 1px 4px rgba(0,0,0,0.04)', transition: 'border-color 0.3s, box-shadow 0.3s' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Target size={14} color="var(--text-muted)" weight="Bold" />
          <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Today's progress</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {isAllDone && <CheckCircle size={16} color="#5ea84e" weight="Bold" />}
          <span style={{ fontFamily: '"Fraunces", serif', fontSize: '1.15rem', color: isAllDone ? '#5ea84e' : 'var(--text-main)', fontWeight: 500 }}>{done.length}/{scheduled.length}</span>
        </div>
      </div>

      <div style={{ height: '7px', borderRadius: '4px', background: 'var(--bg-panel)', marginBottom: '16px', overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: '4px', background: isAllDone ? 'linear-gradient(90deg, #5ea84e, #7cc96b)' : 'linear-gradient(90deg, var(--accent), #f0b080)', width: `${pct}%`, transition: 'width 0.5s cubic-bezier(0.34,1.2,0.64,1)' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
        {([
          { icon: <Leaf size={13} color="var(--text-muted)" weight="Bold" />,  label: 'Habits',      value: habits.length,   color: 'var(--text-main)' },
          { icon: <Flame size={13} color="#f59e0b" weight="Bold" />,           label: 'Best streak', value: `${maxStreak}d`, color: '#f59e0b'          },
          { icon: <Fire size={13} color="var(--accent)" weight="Bold" />,      label: 'Total days',  value: totalStreak,     color: 'var(--text-main)' },
        ] as { icon: React.ReactNode; label: string; value: string | number; color: string }[]).map((stat, i) => (
          <div key={i} style={{ background: 'var(--bg-panel)', borderRadius: '14px', padding: '10px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '5px' }}>
              {stat.icon}
              <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{stat.label}</p>
            </div>
            <p style={{ fontFamily: '"Fraunces", serif', fontSize: '1.05rem', color: stat.color, fontWeight: 500 }}>{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────

type TabType = 'today' | 'all';

export const HabitsPage: React.FC = () => {
  const { user } = useAuth();
  const { habits, loading, addHabit, updateHabit, deleteHabit, toggleCompletion } = useHabits(user?.uid ?? null);
  const [showModal,     setShowModal]     = useState(false);
  const [editingHabit,  setEditingHabit]  = useState<Habit | null>(null);
  const [tab,           setTab]           = useState<TabType>('today');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const todayKey    = getTodayKey();
  const todayHabits = habits.filter(isScheduledToday);
  const displayed   = tab === 'today' ? todayHabits : habits;
  const doneCount   = todayHabits.filter(h => !!h.completions[todayKey]).length;
  const allDone     = todayHabits.length > 0 && doneCount === todayHabits.length;

  const handleSave = async (input: HabitInput) => {
    if (editingHabit) { await updateHabit(editingHabit.id, input); }
    else              { await addHabit(input); }
    setEditingHabit(null);
  };

  const handleDelete = async (id: string) => { await deleteHabit(id); setConfirmDelete(null); };

  const dateLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', opacity: 0, animation: 'fadeIn 0.22s ease-out forwards' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '6px' }}>
        <div>
          <h1 style={{ fontFamily: '"Fraunces", serif', fontSize: '1.85rem', fontWeight: 500, color: 'var(--text-main)', marginBottom: '4px', lineHeight: 1.1 }}>Habits</h1>
          <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {dateLabel}
            {todayHabits.length > 0 && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: allDone ? '#5ea84e' : 'var(--text-muted)', fontWeight: allDone ? 600 : 400, transition: 'color 0.3s' }}>
                ·&nbsp;{allDone ? <><CheckCircle size={12} color="#5ea84e" weight="Bold" /> All done!</> : `${doneCount}/${todayHabits.length} done`}
              </span>
            )}
          </p>
        </div>

        <button
          onClick={() => { setEditingHabit(null); setShowModal(true); }}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '14px', background: 'var(--accent)', color: '#fff', border: 'none', fontFamily: '"DM Sans", sans-serif', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', transition: 'opacity 0.15s, transform 0.12s', flexShrink: 0, marginTop: '4px', letterSpacing: '0.02em' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.88'; (e.currentTarget as HTMLElement).style.transform = 'scale(0.97)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1';    (e.currentTarget as HTMLElement).style.transform = 'scale(1)';    }}
        >
          <AddCircle size={16} weight="Bold" /> New
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-card)', borderRadius: '16px', padding: '4px', border: '1.5px solid var(--border)', marginTop: '20px', marginBottom: '16px' }}>
        {(['today', 'all'] as TabType[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ flex: 1, padding: '9px 12px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: tab === t ? 'var(--bg-panel)' : 'transparent', color: tab === t ? 'var(--text-main)' : 'var(--text-muted)', fontFamily: '"DM Sans", sans-serif', fontWeight: 700, fontSize: '0.82rem', transition: 'background 0.15s, color 0.15s', letterSpacing: '0.01em' }}
          >
            {t === 'today' ? 'Today' : 'All habits'}
          </button>
        ))}
      </div>

      <StatsBar habits={habits} />

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ height: '124px', borderRadius: '22px', background: 'var(--bg-card)', border: '1.5px solid var(--border)', animation: 'pulse 1.4s ease-in-out infinite', animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '56px 24px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'var(--bg-card)', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Leaf size={28} color="var(--text-muted)" weight="Bold" />
          </div>
          <p style={{ fontFamily: '"Fraunces", serif', fontSize: '1.15rem', color: 'var(--text-main)', fontWeight: 500, marginBottom: '6px' }}>
            {tab === 'today' ? 'No habits today' : 'No habits yet'}
          </p>
          <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {tab === 'today' ? 'Add a habit and start your streak' : 'Create your first habit to get started'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {displayed.map(habit => (
            <HabitCard key={habit.id} habit={habit}
              onToggle={dateKey => toggleCompletion(habit.id, dateKey)}
              onEdit={() => { setEditingHabit(habit); setShowModal(true); }}
              onDelete={() => setConfirmDelete(habit.id)}
            />
          ))}
        </div>
      )}

      {showModal && (
        <HabitModal
          onClose={() => { setShowModal(false); setEditingHabit(null); }}
          onSave={handleSave}
          initial={editingHabit}
        />
      )}

      {confirmDelete && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', animation: 'fadeIn 0.18s ease' }}
          onClick={e => { if (e.target === e.currentTarget) setConfirmDelete(null); }}
        >
          <div style={{ background: 'var(--bg-card)', borderRadius: '24px', padding: '28px 24px 24px', maxWidth: '320px', width: '100%', textAlign: 'center', boxShadow: '0 16px 48px rgba(0,0,0,0.2)' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(224,80,80,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <TrashBinMinimalistic size={24} color="#e05050" weight="Bold" />
            </div>
            <p style={{ fontFamily: '"Fraunces", serif', fontSize: '1.15rem', fontWeight: 500, color: 'var(--text-main)', marginBottom: '8px' }}>Delete habit?</p>
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '22px', lineHeight: 1.5 }}>All completion history and streaks will be permanently lost.</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, padding: '13px', borderRadius: '14px', border: '1.5px solid var(--border)', background: 'var(--bg-panel)', color: 'var(--text-muted)', fontFamily: '"DM Sans", sans-serif', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => handleDelete(confirmDelete!)} style={{ flex: 1, padding: '13px', borderRadius: '14px', border: 'none', background: '#e05050', color: '#fff', fontFamily: '"DM Sans", sans-serif', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.45; } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>
    </div>
  );
};