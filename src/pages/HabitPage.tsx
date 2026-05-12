import React, { useState } from 'react';
import {
  AddSquare,
  TrashBinMinimalistic,
  PenNewSquare,
  CloseCircle,
  Flame,
  Leaf,
  Running,
  Walking,
  Dumbbell,
  Book,
  Water,
  Bed,
  Pill,
  MeditationRound,
  Notebook,
  BellBing,
  MusicNote,
  CupHot,
  Target,
  Repeat,
  HeartShine,
  StarShine,
  CheckCircle,
  ChecklistMinimalistic,
  MedalStarCircle,
} from '@solar-icons/react';
import {
  useHabits,
  todayISO,
  lastNDays,
  calcStreak,
  HABIT_COLOR_MAP,
  HABIT_COLOR_OPTIONS,
  type Habit,
  type HabitColor,
  type CreateHabitInput,
} from '../hooks/useHabits';

// ─── Icon palette for habits ──────────────────────────────────────────────────

type HabitIconKey =
  | 'running' | 'walking' | 'dumbbell' | 'meditation' | 'water'
  | 'book' | 'notebook' | 'sleep' | 'pill' | 'coffee'
  | 'music' | 'leaf' | 'target' | 'repeat' | 'heart'
  | 'star' | 'flame' | 'bell' | 'checklist' | 'medal';

const HABIT_ICONS: Record<HabitIconKey, React.FC<{ size?: number; color?: string }>> = {
  running:    Running,
  walking:    Walking,
  dumbbell:   Dumbbell,
  meditation: MeditationRound,
  water:      Water,
  book:       Book,
  notebook:   Notebook,
  sleep:      Bed,
  pill:       Pill,
  coffee:     CupHot,
  music:      MusicNote,
  leaf:       Leaf,
  target:     Target,
  repeat:     Repeat,
  heart:      HeartShine,
  star:       StarShine,
  flame:      Flame,
  bell:       BellBing,
  checklist:  ChecklistMinimalistic,
  medal:      MedalStarCircle,
};

const HABIT_ICON_KEYS = Object.keys(HABIT_ICONS) as HabitIconKey[];

const ICON_LABELS: Record<HabitIconKey, string> = {
  running: 'Run', walking: 'Walk', dumbbell: 'Gym', meditation: 'Meditate',
  water: 'Hydrate', book: 'Read', notebook: 'Journal', sleep: 'Sleep',
  pill: 'Meds', coffee: 'Coffee', music: 'Music', leaf: 'Nature',
  target: 'Goal', repeat: 'Routine', heart: 'Health', star: 'Focus',
  flame: 'Streak', bell: 'Reminder', checklist: 'Tasks', medal: 'Challenge',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DAYS_SHOWN = 7;

function formatShortDate(iso: string, today: string): { dow: string; date: number } {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  if (iso === today) return { dow: 'Today', date: d };
  return { dow: dt.toLocaleDateString('en', { weekday: 'short' }), date: d };
}

const WEEK_DAYS = [
  { value: 1, label: 'Mo' }, { value: 2, label: 'Tu' }, { value: 3, label: 'We' },
  { value: 4, label: 'Th' }, { value: 5, label: 'Fr' }, { value: 6, label: 'Sa' },
  { value: 0, label: 'Su' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void; color: string }> = ({ checked, onChange, color }) => (
  <button
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    style={{
      width: '44px', height: '24px', borderRadius: '12px', border: 'none',
      background: checked ? color : 'var(--border)',
      position: 'relative', cursor: 'pointer', flexShrink: 0,
      transition: 'background 0.22s ease',
    }}
  >
    <span style={{
      position: 'absolute', top: '3px', left: checked ? '23px' : '3px',
      width: '18px', height: '18px', borderRadius: '50%', background: '#fff',
      transition: 'left 0.22s cubic-bezier(0.34,1.56,0.64,1)',
      boxShadow: '0 1px 4px rgba(0,0,0,0.22)',
    }} />
  </button>
);

// Animated check cell
const CheckCell: React.FC<{
  done: boolean;
  isToday: boolean;
  isTarget: boolean;
  color: string;
  dot: string;
  onClick: () => void;
}> = ({ done, isToday, isTarget, color, dot, onClick }) => {
  const [pop, setPop] = useState(false);

  if (!isTarget) {
    return (
      <div style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--border)' }} />
      </div>
    );
  }

  const handle = () => {
    if (!isToday) return;
    if (!done) { setPop(true); setTimeout(() => setPop(false), 400); }
    onClick();
  };

  return (
    <button onClick={handle} disabled={!isToday} style={{
      width: '32px', height: '32px', borderRadius: '10px',
      background: done ? color : isToday ? 'var(--bg-panel)' : 'transparent',
      border: done ? 'none' : `1.5px solid var(--border)`,
      cursor: isToday ? 'pointer' : 'default',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'background 0.18s, transform 0.15s, border-color 0.18s',
      transform: pop ? 'scale(1.3)' : 'scale(1)',
      opacity: !isToday && !done ? 0.4 : 1,
      outline: isToday && !done ? `2px solid ${dot}30` : 'none',
      outlineOffset: '1px',
      flexShrink: 0,
    } as React.CSSProperties}>
      {done
        ? <CheckCircle size={16} color="rgba(255,255,255,0.95)" />
        : isToday
          ? <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: dot, opacity: 0.5 }} />
          : null
      }
    </button>
  );
};

// ─── Habit Card ───────────────────────────────────────────────────────────────

const HabitCard: React.FC<{
  habit: Habit;
  days: string[];
  today: string;
  onToggle: (date: string) => void;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ habit, days, today, onToggle, onEdit, onDelete }) => {
  const colors = HABIT_COLOR_MAP[habit.color];
  const streak = calcStreak(habit.completions, habit.targetDays);
  const completionSet = new Set(habit.completions);
  const todayDone = completionSet.has(today);

  const HabitIcon = HABIT_ICONS[habit.icon as HabitIconKey] ?? Target;

  const isTargetDay = (iso: string) => {
    if (habit.targetDays.length === 0) return true;
    const [y, m, d] = iso.split('-').map(Number);
    return habit.targetDays.includes(new Date(y, m - 1, d).getDay());
  };

  // Week completion rate
  const weekTargetDays = days.filter(isTargetDay);
  const weekDone = weekTargetDays.filter(d => completionSet.has(d)).length;

  return (
    <div style={{
      background: 'var(--bg-card)',
      borderRadius: '20px',
      border: `1.5px solid ${todayDone ? colors.border : 'var(--border)'}`,
      padding: '16px',
      transition: 'border-color 0.3s',
      animation: 'hb-fade 0.22s ease-out both',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>

        {/* Icon badge */}
        <div style={{
          width: '42px', height: '42px', borderRadius: '13px', flexShrink: 0,
          background: colors.bg, border: `1.5px solid ${colors.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <HabitIcon size={20} color={colors.text} />
        </div>

        {/* Name + meta */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontFamily: '"DM Sans", sans-serif', fontWeight: 600,
            fontSize: '0.9rem', color: 'var(--text-main)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            lineHeight: 1.25,
          }}>{habit.name}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '3px' }}>
            {streak > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Flame size={11} color={colors.text} />
                <span style={{ fontSize: '0.68rem', fontFamily: '"DM Sans", sans-serif', fontWeight: 700, color: colors.text }}>
                  {streak}d streak
                </span>
              </div>
            )}
            {weekTargetDays.length > 0 && (
              <span style={{ fontSize: '0.68rem', fontFamily: '"DM Sans", sans-serif', color: 'var(--text-muted)', fontWeight: 500 }}>
                {weekDone}/{weekTargetDays.length} this week
              </span>
            )}
          </div>
        </div>

        {/* Mini progress arc */}
        <div style={{ position: 'relative', width: '32px', height: '32px', flexShrink: 0 }}>
          <svg width="32" height="32" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="16" cy="16" r="12" fill="none" stroke="var(--border)" strokeWidth="2.5" />
            <circle
              cx="16" cy="16" r="12" fill="none"
              stroke={colors.dot} strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 12}`}
              strokeDashoffset={`${2 * Math.PI * 12 * (1 - (weekTargetDays.length ? weekDone / weekTargetDays.length : 0))}`}
              style={{ transition: 'stroke-dashoffset 0.5s cubic-bezier(0.34,1.56,0.64,1)' }}
            />
          </svg>
          <span style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.58rem', fontFamily: '"DM Sans", sans-serif', fontWeight: 700, color: colors.text,
          }}>
            {weekTargetDays.length ? Math.round((weekDone / weekTargetDays.length) * 100) : 0}%
          </span>
        </div>

        {/* Actions */}
        <button onClick={onEdit}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '5px', borderRadius: '8px', display: 'flex', opacity: 0.6, transition: 'opacity 0.15s, color 0.15s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; (e.currentTarget as HTMLElement).style.color = 'var(--text-main)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '0.6'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
        ><PenNewSquare size={15} /></button>
        <button onClick={onDelete}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '5px', borderRadius: '8px', display: 'flex', opacity: 0.6, transition: 'opacity 0.15s, color 0.15s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; (e.currentTarget as HTMLElement).style.color = '#e0546a'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '0.6'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
        ><TrashBinMinimalistic size={15} /></button>
      </div>

      {/* Day grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
        {days.map(iso => {
          const { dow, date } = formatShortDate(iso, today);
          const isToday = iso === today;
          const done = completionSet.has(iso);
          const target = isTargetDay(iso);
          return (
            <div key={iso} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <span style={{
                fontSize: '0.58rem', fontFamily: '"DM Sans", sans-serif',
                fontWeight: isToday ? 700 : 500,
                color: isToday ? colors.text : 'var(--text-muted)',
                lineHeight: 1,
              }}>
                {dow === 'Today' ? '●' : dow}
              </span>
              <CheckCell
                done={done} isToday={isToday} isTarget={target}
                color={colors.bg + 'ff'} dot={colors.dot}
                onClick={() => onToggle(iso)}
              />
              <span style={{
                fontSize: '0.58rem', fontFamily: '"DM Sans", sans-serif',
                color: isToday ? colors.text : done ? colors.dot : 'var(--text-muted)',
                fontWeight: (isToday || done) ? 600 : 400,
                lineHeight: 1,
              }}>
                {date}
              </span>
            </div>
          );
        })}
      </div>

      {/* Today action strip */}
      {(
        <div style={{
          marginTop: '14px', paddingTop: '12px',
          borderTop: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: '0.72rem', fontFamily: '"DM Sans", sans-serif', color: 'var(--text-muted)' }}>
            {isTargetDay(today)
              ? todayDone ? 'Completed today 🎉' : 'Mark today as done'
              : 'Not scheduled today'}
          </span>
          {isTargetDay(today) && (
            <Toggle
              checked={todayDone}
              onChange={() => onToggle(today)}
              color={colors.dot}
            />
          )}
        </div>
      )}
    </div>
  );
};

// ─── Create / Edit modal ──────────────────────────────────────────────────────

const HabitModal: React.FC<{
  initial?: Habit;
  onSave: (data: CreateHabitInput) => void;
  onClose: () => void;
}> = ({ initial, onSave, onClose }) => {
  const [name, setName]           = useState(initial?.name ?? '');
  const [icon, setIcon]           = useState<HabitIconKey>((initial?.icon as HabitIconKey) ?? 'target');
  const [color, setColor]         = useState<HabitColor>(initial?.color ?? 'teal');
  const [targetDays, setTargetDays] = useState<number[]>(initial?.targetDays ?? []);

  const toggleDay = (d: number) =>
    setTargetDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);

  const valid = name.trim().length > 0;
  const colors = HABIT_COLOR_MAP[color];
  const SelectedIcon = HABIT_ICONS[icon];

  const handleSave = () => {
    if (!valid) return;
    onSave({ name: name.trim(), icon, color, targetDays });
    onClose();
  };

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px 16px',
        animation: 'hb-fade 0.18s ease-out',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-card)', borderRadius: '24px',
          border: '1.5px solid var(--border)',
          padding: '24px',
          width: '100%', maxWidth: '460px',
          maxHeight: 'calc(100dvh - 48px)',
          overflowY: 'auto',
          boxShadow: '0 16px 48px rgba(0,0,0,0.28)',
          animation: 'hb-slide-up 0.22s cubic-bezier(0.34,1.56,0.64,1)',
        }}
    >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px',
              background: colors.bg, border: `1.5px solid ${colors.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <SelectedIcon size={20} color={colors.text} />
            </div>
            <h2 style={{ fontFamily: '"Fraunces", serif', fontSize: '1.2rem', fontWeight: 500, color: 'var(--text-main)' }}>
              {initial ? 'Edit habit' : 'New habit'}
            </h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
            <CloseCircle size={22} />
          </button>
        </div>

        {/* Name */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '0.7rem', fontFamily: '"DM Sans", sans-serif', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Name</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') onClose(); }}
            placeholder="e.g. Morning run, Read 20 pages…"
            maxLength={60}
            className="input-field"
            style={{ width: '100%', padding: '12px 14px', fontSize: '0.9rem', boxSizing: 'border-box' }}
            autoFocus
          />
        </div>

        {/* Icon picker */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '0.7rem', fontFamily: '"DM Sans", sans-serif', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Icon</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
            {HABIT_ICON_KEYS.map(key => {
              const Icon = HABIT_ICONS[key];
              const active = icon === key;
              return (
                <button key={key} onClick={() => setIcon(key)}
                  title={ICON_LABELS[key]}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                    padding: '10px 6px', borderRadius: '12px', cursor: 'pointer',
                    border: active ? `1.5px solid ${colors.border}` : '1.5px solid var(--border)',
                    background: active ? colors.bg : 'var(--bg-panel)',
                    transition: 'all 0.15s',
                  }}
                >
                  <Icon size={18} color={active ? colors.text : 'var(--text-muted)'} />
                  <span style={{ fontSize: '0.58rem', fontFamily: '"DM Sans", sans-serif', color: active ? colors.text : 'var(--text-muted)', fontWeight: active ? 600 : 400 }}>
                    {ICON_LABELS[key]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Color */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '0.7rem', fontFamily: '"DM Sans", sans-serif', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Color</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {HABIT_COLOR_OPTIONS.map(c => {
              const { dot } = HABIT_COLOR_MAP[c];
              const active = color === c;
              return (
                <button key={c} onClick={() => setColor(c)}
                  style={{
                    width: '30px', height: '30px', borderRadius: '50%', border: 'none',
                    background: dot, cursor: 'pointer',
                    outline: active ? `3px solid ${dot}` : '3px solid transparent',
                    outlineOffset: '2px',
                    transform: active ? 'scale(1.18)' : 'scale(1)',
                    transition: 'outline-color 0.15s, transform 0.15s',
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Days */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
            <label style={{ fontSize: '0.7rem', fontFamily: '"DM Sans", sans-serif', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Schedule</label>
            <span style={{ fontSize: '0.7rem', fontFamily: '"DM Sans", sans-serif', color: 'var(--text-muted)' }}>
              {targetDays.length === 0 ? 'Every day' : `${targetDays.length}×/week`}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {WEEK_DAYS.map(({ value, label }) => {
              const active = targetDays.includes(value);
              return (
                <button key={value} onClick={() => toggleDay(value)}
                  style={{
                    flex: 1, height: '38px', borderRadius: '10px', cursor: 'pointer',
                    border: active ? `1.5px solid ${colors.border}` : '1.5px solid var(--border)',
                    background: active ? colors.bg : 'var(--bg-panel)',
                    color: active ? colors.text : 'var(--text-muted)',
                    fontSize: '0.72rem', fontFamily: '"DM Sans", sans-serif', fontWeight: 600,
                    transition: 'all 0.15s',
                  }}
                >{label}</button>
              );
            })}
          </div>
          <button
            onClick={() => setTargetDays([])}
            style={{
              marginTop: '8px', background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '0.72rem', fontFamily: '"DM Sans", sans-serif',
              color: targetDays.length === 0 ? colors.text : 'var(--text-muted)',
              padding: '4px 0', fontWeight: targetDays.length === 0 ? 600 : 400,
              transition: 'color 0.15s', textDecoration: targetDays.length === 0 ? 'underline' : 'none',
            }}
          >
            Reset to every day
          </button>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={!valid}
          style={{
            width: '100%', padding: '14px', borderRadius: '16px', border: 'none',
            background: valid ? colors.dot : 'var(--border)',
            color: valid ? '#fff' : 'var(--text-muted)',
            fontFamily: '"DM Sans", sans-serif', fontWeight: 700, fontSize: '0.9rem',
            cursor: valid ? 'pointer' : 'not-allowed',
            transition: 'background 0.2s, color 0.2s, transform 0.12s',
            transform: 'scale(1)',
          }}
          onMouseEnter={e => { if (valid) (e.currentTarget as HTMLElement).style.transform = 'scale(1.01)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
        >
          {initial ? 'Save changes' : 'Add habit'}
        </button>
        <style>{`
          @keyframes hb-slide-up {
            from { transform: translateY(20px); opacity: 0; }
            to   { transform: translateY(0);    opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );
};

// ─── Delete confirm ───────────────────────────────────────────────────────────

const DeleteConfirm: React.FC<{ name: string; onConfirm: () => void; onCancel: () => void }> = ({ name, onConfirm, onCancel }) => (
  <div
    onClick={onCancel}
    style={{
      position: 'fixed', inset: 0, zIndex: 60,
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
      animation: 'hb-fade 0.15s ease-out',
    }}
  >
    <div
      onClick={e => e.stopPropagation()}
      style={{
        background: 'var(--bg-card)', borderRadius: '24px',
        border: '1.5px solid var(--border)', padding: '28px 24px',
        maxWidth: '340px', width: '100%', textAlign: 'center',
        boxShadow: '0 16px 48px rgba(0,0,0,0.24)',
      }}
    >
      <div style={{
        width: '52px', height: '52px', borderRadius: '16px',
        background: 'rgba(224,84,106,0.12)', border: '1.5px solid rgba(224,84,106,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 16px',
      }}>
        <TrashBinMinimalistic size={22} color="#e0546a" />
      </div>
      <h3 style={{ fontFamily: '"Fraunces", serif', fontWeight: 500, fontSize: '1.15rem', color: 'var(--text-main)', marginBottom: '8px' }}>
        Delete habit?
      </h3>
      <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
        <strong style={{ color: 'var(--text-main)' }}>"{name}"</strong> and all its history will be permanently deleted.
      </p>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={onCancel}
          style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1.5px solid var(--border)', background: 'var(--bg-panel)', color: 'var(--text-muted)', fontFamily: '"DM Sans", sans-serif', fontWeight: 500, fontSize: '0.85rem', cursor: 'pointer' }}>
          Cancel
        </button>
        <button onClick={onConfirm}
          style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#e0546a', color: '#fff', fontFamily: '"DM Sans", sans-serif', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
          Delete
        </button>
      </div>
    </div>
  </div>
);

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const SkeletonCard = () => (
  <div style={{ background: 'var(--bg-card)', borderRadius: '20px', border: '1.5px solid var(--border)', padding: '16px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
      <div style={{ width: '42px', height: '42px', borderRadius: '13px', background: 'var(--border)', animation: 'hb-pulse 1.4s ease-in-out infinite' }} />
      <div style={{ flex: 1 }}>
        <div style={{ height: '12px', width: '40%', borderRadius: '6px', background: 'var(--border)', marginBottom: '7px', animation: 'hb-pulse 1.4s ease-in-out infinite' }} />
        <div style={{ height: '9px', width: '25%', borderRadius: '5px', background: 'var(--border)', animation: 'hb-pulse 1.4s ease-in-out infinite' }} />
      </div>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '18px', height: '8px', borderRadius: '4px', background: 'var(--border)', animation: 'hb-pulse 1.4s ease-in-out infinite' }} />
          <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'var(--border)', animation: 'hb-pulse 1.4s ease-in-out infinite' }} />
          <div style={{ width: '12px', height: '8px', borderRadius: '4px', background: 'var(--border)', animation: 'hb-pulse 1.4s ease-in-out infinite' }} />
        </div>
      ))}
    </div>
  </div>
);

// ─── Empty state ──────────────────────────────────────────────────────────────

const EmptyState: React.FC<{ onAdd: () => void }> = ({ onAdd }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', padding: '64px 24px', textAlign: 'center',
  }}>
    <div style={{
      width: '72px', height: '72px', borderRadius: '22px',
      background: 'var(--bg-panel)', border: '1.5px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      marginBottom: '20px',
    }}>
      <Repeat size={32} color="var(--text-muted)" />
    </div>
    <h2 style={{ fontFamily: '"Fraunces", serif', fontWeight: 500, fontSize: '1.35rem', color: 'var(--text-main)', marginBottom: '8px' }}>
      No habits yet
    </h2>
    <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.65, maxWidth: '260px', marginBottom: '28px' }}>
      Build consistency one day at a time. Add your first habit below.
    </p>
    <button onClick={onAdd}
      style={{
        display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 22px',
        borderRadius: '14px', border: 'none', background: 'var(--accent)', color: '#fff',
        fontFamily: '"DM Sans", sans-serif', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer',
        transition: 'opacity 0.15s, transform 0.12s',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.88'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
    >
      <AddSquare size={16} /> Add your first habit
    </button>
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

export const HabitPage: React.FC = () => {
  const { habits, loading, addHabit, updateHabit, deleteHabit, toggleCompletion } = useHabits();
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget]   = useState<Habit | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Habit | null>(null);

  const today = todayISO();
  const days  = lastNDays(DAYS_SHOWN);

  const todayDow = new Date().getDay();
  const totalToday = habits.filter(h => h.targetDays.length === 0 || h.targetDays.includes(todayDow)).length;
  const doneToday  = habits.filter(h => {
    const isTarget = h.targetDays.length === 0 || h.targetDays.includes(todayDow);
    return isTarget && h.completions.includes(today);
  }).length;
  const allDone = totalToday > 0 && doneToday === totalToday;

  return (
    <div style={{ maxWidth: '520px', margin: '0 auto', opacity: 0, animation: 'hb-fade 0.22s ease-out forwards' }}>
      <style>{`
        @keyframes hb-fade  { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes hb-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: '"Fraunces", serif', fontSize: '1.75rem', fontWeight: 500, color: 'var(--text-main)', marginBottom: '4px' }}>
            Habits
          </h1>
          {!loading && habits.length > 0 && totalToday > 0 && (
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {allDone
                ? 'All done for today 🎉'
                : doneToday === 0
                  ? 'Start your streak for today'
                  : `${doneToday} of ${totalToday} done today`}
            </p>
          )}
        </div>
        <button
          onClick={() => setShowCreate(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '9px 16px', borderRadius: '14px', border: 'none',
            background: 'var(--accent)', color: '#fff',
            fontFamily: '"DM Sans", sans-serif', fontWeight: 600, fontSize: '0.82rem',
            cursor: 'pointer', flexShrink: 0,
            transition: 'opacity 0.15s, transform 0.12s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.88'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
        >
          <AddSquare size={15} /> New habit
        </button>
      </div>

      {/* Today progress bar */}
      {!loading && habits.length > 0 && totalToday > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.7rem', fontFamily: '"DM Sans", sans-serif', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
              Today
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              {allDone && <MedalStarCircle size={13} color="var(--accent)" />}
              <span style={{ fontSize: '0.72rem', fontFamily: '"DM Sans", sans-serif', fontWeight: 600, color: allDone ? 'var(--accent)' : 'var(--text-muted)' }}>
                {doneToday}/{totalToday}
              </span>
            </div>
          </div>
          <div style={{ height: '5px', borderRadius: '3px', background: 'var(--border)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: '3px',
              background: allDone ? 'var(--accent)' : 'var(--accent)',
              width: `${Math.round((doneToday / totalToday) * 100)}%`,
              transition: 'width 0.5s cubic-bezier(0.34,1.56,0.64,1)',
              opacity: allDone ? 1 : 0.7,
            }} />
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[0, 1, 2].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : habits.length === 0 ? (
        <EmptyState onAdd={() => setShowCreate(true)} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {habits.map((habit, i) => (
            <div key={habit.id} style={{ animationDelay: `${i * 40}ms`, animation: 'hb-fade 0.22s ease-out both' }}>
              <HabitCard
                habit={habit}
                days={days}
                today={today}
                onToggle={date => toggleCompletion(habit.id, date)}
                onEdit={() => setEditTarget(habit)}
                onDelete={() => setDeleteTarget(habit)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showCreate && (
        <HabitModal
          onSave={data => addHabit(data)}
          onClose={() => setShowCreate(false)}
        />
      )}
      {editTarget && (
        <HabitModal
          initial={editTarget}
          onSave={data => updateHabit(editTarget.id, data)}
          onClose={() => setEditTarget(null)}
        />
      )}
      {deleteTarget && (
        <DeleteConfirm
          name={deleteTarget.name}
          onConfirm={() => { deleteHabit(deleteTarget.id); setDeleteTarget(null); }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};