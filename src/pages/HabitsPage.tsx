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

// ── Icons ────────────────────────────────────────────────────────────────────

const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const FlameIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2c0 0-5 4.5-5 10a5 5 0 0 0 10 0c0-5.5-5-10-5-10zm-1.5 12.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0z" />
  </svg>
);

const CheckIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 13l4 4L19 7" />
  </svg>
);

const EditIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
);

const TrophyIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 22v-4" />
    <path d="M14 22v-4" />
    <path d="M6 2h12v11a6 6 0 0 1-12 0V2z" />
  </svg>
);

const CloseIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

// ── Constants ─────────────────────────────────────────────────────────────────

const COLORS: { value: HabitColor; label: string }[] = [
  { value: 'coral',    label: 'Coral' },
  { value: 'sage',     label: 'Sage' },
  { value: 'sky',      label: 'Sky' },
  { value: 'lavender', label: 'Lavender' },
  { value: 'amber',    label: 'Amber' },
  { value: 'teal',     label: 'Teal' },
  { value: 'blush',    label: 'Blush' },
  { value: 'slate',    label: 'Slate' },
];

const EMOJIS = ['✨', '🏃', '💧', '📚', '🧘', '🎯', '💪', '🥗', '😴', '🎨', '🧹', '💊', '🌿', '🎵', '✍️', '🧠', '🌅', '🚴', '🍎', '🤸'];

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_LABELS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

// ── Habit Modal ───────────────────────────────────────────────────────────────

interface ModalProps {
  onClose: () => void;
  onSave: (input: HabitInput) => void;
  initial?: Habit | null;
}

const HabitModal: React.FC<ModalProps> = ({ onClose, onSave, initial }) => {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [emoji, setEmoji] = useState(initial?.emoji ?? '✨');
  const [color, setColor] = useState<HabitColor>(initial?.color ?? 'coral');
  const [freq, setFreq] = useState<'daily' | 'weekly'>(
    initial ? (initial.frequency === 'daily' ? 'daily' : 'weekly') : 'daily'
  );
  const [days, setDays] = useState<number[]>(
    initial && Array.isArray(initial.frequency) ? initial.frequency : [1, 2, 3, 4, 5]
  );
  const [showEmojis, setShowEmojis] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => { titleRef.current?.focus(); }, []);

  const toggleDay = (d: number) => {
    setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d].sort());
  };

  const handleSave = () => {
    if (!title.trim()) return;
    const frequency: HabitFrequency = freq === 'daily' ? 'daily' : days;
    onSave({ title: title.trim(), emoji, color, frequency });
    onClose();
  };

  const tokens = habitColorTokens(color);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        padding: '0',
        animation: 'fadeIn 0.18s ease',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        width: '100%', maxWidth: '480px',
        background: 'var(--bg-card)', borderRadius: '24px 24px 0 0',
        padding: '20px 20px 32px',
        animation: 'slideUp 0.25s cubic-bezier(0.34,1.2,0.64,1)',
        maxHeight: '90dvh', overflowY: 'auto',
      }}>
        {/* Handle */}
        <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: 'var(--border)', margin: '0 auto 20px' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ fontFamily: '"Fraunces", serif', fontSize: '1.3rem', fontWeight: 500, color: 'var(--text-main)' }}>
            {initial ? 'Edit habit' : 'New habit'}
          </h2>
          <button onClick={onClose} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--bg-panel)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <CloseIcon size={14} />
          </button>
        </div>

        {/* Emoji + Title */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', alignItems: 'flex-start' }}>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowEmojis(v => !v)}
              style={{
                width: '48px', height: '48px', borderRadius: '14px',
                border: `2px solid ${tokens.border}`,
                background: tokens.bg,
                fontSize: '1.4rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'transform 0.15s',
              }}
            >{emoji}</button>
            {showEmojis && (
              <div style={{
                position: 'absolute', top: '54px', left: 0, zIndex: 10,
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: '16px', padding: '10px',
                display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                width: '200px',
              }}>
                {EMOJIS.map(e => (
                  <button key={e} onClick={() => { setEmoji(e); setShowEmojis(false); }}
                    style={{ width: '34px', height: '34px', borderRadius: '10px', border: 'none', background: emoji === e ? 'var(--bg-panel)' : 'transparent', fontSize: '1.2rem', cursor: 'pointer' }}
                  >{e}</button>
                ))}
              </div>
            )}
          </div>
          <input
            ref={titleRef}
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Habit name..."
            style={{
              flex: 1, padding: '12px 14px', borderRadius: '14px',
              border: '1.5px solid var(--border)', outline: 'none',
              background: 'var(--bg-panel)', color: 'var(--text-main)',
              fontFamily: '"DM Sans", sans-serif', fontSize: '0.9rem',
              transition: 'border-color 0.15s',
              WebkitUserSelect: 'text', userSelect: 'text',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = tokens.dot; }}
            onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
          />
        </div>

        {/* Color */}
        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '8px' }}>Color</label>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', flexWrap: 'wrap' }}>
          {COLORS.map(c => {
            const t = habitColorTokens(c.value);
            return (
              <button
                key={c.value}
                onClick={() => setColor(c.value)}
                style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: t.dot,
                  border: color === c.value ? `3px solid var(--text-main)` : '3px solid transparent',
                  cursor: 'pointer', outline: 'none',
                  boxShadow: color === c.value ? `0 0 0 2px ${t.dot}55` : 'none',
                  transition: 'transform 0.15s, border-color 0.15s',
                  transform: color === c.value ? 'scale(1.15)' : 'scale(1)',
                }}
              />
            );
          })}
        </div>

        {/* Frequency */}
        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '8px' }}>Frequency</label>
        <div style={{ display: 'flex', gap: '8px', marginBottom: freq === 'weekly' ? '12px' : '24px' }}>
          {(['daily', 'weekly'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFreq(f)}
              style={{
                flex: 1, padding: '10px', borderRadius: '12px', cursor: 'pointer',
                border: freq === f ? `1.5px solid ${tokens.dot}` : '1.5px solid var(--border)',
                background: freq === f ? tokens.bg : 'var(--bg-panel)',
                color: freq === f ? tokens.dot : 'var(--text-muted)',
                fontFamily: '"DM Sans", sans-serif', fontWeight: 600, fontSize: '0.82rem',
                transition: 'all 0.15s',
                textTransform: 'capitalize',
              }}
            >{f}</button>
          ))}
        </div>

        {freq === 'weekly' && (
          <div style={{ display: 'flex', gap: '6px', marginBottom: '24px' }}>
            {DAY_LABELS_SHORT.map((d, i) => {
              const on = days.includes(i);
              return (
                <button
                  key={i}
                  onClick={() => toggleDay(i)}
                  style={{
                    flex: 1, height: '36px', borderRadius: '10px', cursor: 'pointer',
                    border: on ? `1.5px solid ${tokens.dot}` : '1.5px solid var(--border)',
                    background: on ? tokens.dot : 'var(--bg-panel)',
                    color: on ? '#fff' : 'var(--text-muted)',
                    fontFamily: '"DM Sans", sans-serif', fontWeight: 600, fontSize: '0.75rem',
                    transition: 'all 0.15s',
                  }}
                >{d}</button>
              );
            })}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={!title.trim()}
          style={{
            width: '100%', padding: '14px', borderRadius: '16px', border: 'none',
            background: title.trim() ? tokens.dot : 'var(--border)',
            color: '#fff',
            fontFamily: '"DM Sans", sans-serif', fontWeight: 600, fontSize: '0.9rem',
            cursor: title.trim() ? 'pointer' : 'not-allowed',
            transition: 'background 0.15s, transform 0.1s',
          }}
          onMouseEnter={e => { if (title.trim()) (e.currentTarget as HTMLButtonElement).style.opacity = '0.9'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
        >
          {initial ? 'Save changes' : 'Add habit'}
        </button>
      </div>
    </div>
  );
};

// ── Habit Card ─────────────────────────────────────────────────────────────────

interface CardProps {
  habit: Habit;
  onToggle: (dateKey: string) => void;
  onEdit: () => void;
  onDelete: () => void;
}

const LAST_7 = getLastNDays(7).reverse(); // oldest → newest

const HabitCard: React.FC<CardProps> = ({ habit, onToggle, onEdit, onDelete }) => {
  const tokens = habitColorTokens(habit.color);
  const todayKey = getTodayKey();
  const completedToday = !!habit.completions[todayKey];
  const scheduled = isScheduledToday(habit);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showMenu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showMenu]);

  const handleToggle = () => {
    if (scheduled) onToggle(todayKey);
  };

  return (
    <div style={{
      background: 'var(--bg-card)', borderRadius: '20px',
      border: `1px solid ${completedToday && scheduled ? tokens.border : 'var(--border)'}`,
      padding: '16px',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      boxShadow: completedToday && scheduled ? `0 0 0 1px ${tokens.border}` : 'none',
      position: 'relative',
    }}>
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
        {/* Check button */}
        <button
          onClick={handleToggle}
          style={{
            width: '40px', height: '40px', borderRadius: '14px', flexShrink: 0,
            border: completedToday ? 'none' : `2px solid ${tokens.border}`,
            background: completedToday ? tokens.dot : tokens.bg,
            color: completedToday ? '#fff' : tokens.dot,
            cursor: scheduled ? 'pointer' : 'default',
            opacity: !scheduled ? 0.4 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s cubic-bezier(0.34,1.4,0.64,1)',
            transform: completedToday ? 'scale(1.05)' : 'scale(1)',
          }}
        >
          {completedToday ? <CheckIcon size={18} /> : <span style={{ fontSize: '1.15rem' }}>{habit.emoji}</span>}
        </button>

        {/* Title + meta */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontFamily: '"DM Sans", sans-serif', fontWeight: 600, fontSize: '0.9rem',
            color: 'var(--text-main)',
            textDecoration: completedToday ? 'none' : 'none',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {habit.emoji} {habit.title}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '3px' }}>
            {habit.streak > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#f59e0b', fontSize: '0.72rem', fontWeight: 600, fontFamily: '"DM Sans", sans-serif' }}>
                <FlameIcon size={12} /> {habit.streak}d
              </span>
            )}
            {habit.bestStreak > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--text-muted)', fontSize: '0.72rem', fontFamily: '"DM Sans", sans-serif' }}>
                <TrophyIcon size={11} /> {habit.bestStreak}
              </span>
            )}
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: '"DM Sans", sans-serif' }}>
              {habit.frequency === 'daily' ? 'Daily' : `${(habit.frequency as number[]).map(d => DAY_LABELS[d].slice(0,2)).join(', ')}`}
            </span>
          </div>
        </div>

        {/* Menu */}
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setShowMenu(v => !v)}
            style={{ width: '28px', height: '28px', borderRadius: '8px', border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', lineHeight: 1 }}
          >⋯</button>
          {showMenu && (
            <div style={{ position: 'absolute', right: 0, top: '32px', zIndex: 50, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '6px', minWidth: '130px', boxShadow: '0 8px 24px rgba(0,0,0,0.18)' }}>
              <button onClick={() => { onEdit(); setShowMenu(false); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '10px', border: 'none', background: 'none', color: 'var(--text-main)', fontFamily: '"DM Sans", sans-serif', fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer', textAlign: 'left' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-panel)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}
              >
                <EditIcon size={13} /> Edit
              </button>
              <button onClick={() => { onDelete(); setShowMenu(false); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '10px', border: 'none', background: 'none', color: '#e05050', fontFamily: '"DM Sans", sans-serif', fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer', textAlign: 'left' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(224,80,80,0.08)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}
              >
                <TrashIcon size={13} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Weekly mini-calendar (last 7 days) */}
      <div style={{ display: 'flex', gap: '4px' }}>
        {LAST_7.map(dateKey => {
          const done = !!habit.completions[dateKey];
          const isToday = dateKey === todayKey;
          const d = new Date(dateKey + 'T12:00:00');
          const dow = d.getDay();
          const dayLabel = DAY_LABELS_SHORT[dow];

          // is this day scheduled?
          const scheduledDay = habit.frequency === 'daily' || (habit.frequency as number[]).includes(dow);

          return (
            <div
              key={dateKey}
              onClick={() => { if (isToday && scheduled) onToggle(dateKey); else if (!isToday && scheduledDay) onToggle(dateKey); }}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                cursor: scheduledDay ? 'pointer' : 'default',
              }}
            >
              <span style={{ fontSize: '0.6rem', color: isToday ? tokens.dot : 'var(--text-muted)', fontFamily: '"DM Sans", sans-serif', fontWeight: isToday ? 700 : 400 }}>
                {isToday ? 'Now' : dayLabel}
              </span>
              <div style={{
                width: '100%', aspectRatio: '1', borderRadius: '8px',
                background: done ? tokens.dot : scheduledDay ? tokens.bg : 'var(--bg-panel)',
                border: isToday ? `1.5px solid ${tokens.dot}` : '1.5px solid transparent',
                opacity: scheduledDay ? 1 : 0.35,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.18s',
              }}>
                {done && <CheckIcon size={10} />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Stats Bar ─────────────────────────────────────────────────────────────────

interface StatsBarProps {
  habits: Habit[];
}

const StatsBar: React.FC<StatsBarProps> = ({ habits }) => {
  const todayKey = getTodayKey();
  const scheduled = habits.filter(isScheduledToday);
  const done = scheduled.filter(h => !!h.completions[todayKey]);
  const pct = scheduled.length > 0 ? Math.round((done.length / scheduled.length) * 100) : 0;
  const totalStreak = habits.reduce((sum, h) => sum + h.streak, 0);
  const maxStreak = habits.reduce((max, h) => Math.max(max, h.streak), 0);

  if (habits.length === 0) return null;

  return (
    <div style={{
      background: 'var(--bg-card)', borderRadius: '20px', border: '1px solid var(--border)',
      padding: '16px', marginBottom: '20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Today's progress
        </span>
        <span style={{ fontFamily: '"Fraunces", serif', fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 500 }}>
          {done.length}/{scheduled.length}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ height: '6px', borderRadius: '3px', background: 'var(--bg-panel)', marginBottom: '14px', overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: '3px',
          background: pct === 100 ? '#5ea84e' : 'var(--accent)',
          width: `${pct}%`,
          transition: 'width 0.4s cubic-bezier(0.34,1.2,0.64,1)',
        }} />
      </div>

      {/* Micro stats */}
      <div style={{ display: 'flex', gap: '16px' }}>
        <div>
          <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Habits</p>
          <p style={{ fontFamily: '"Fraunces", serif', fontSize: '1rem', color: 'var(--text-main)', fontWeight: 500 }}>{habits.length}</p>
        </div>
        <div>
          <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '2px' }}>🔥 Best streak</p>
          <p style={{ fontFamily: '"Fraunces", serif', fontSize: '1rem', color: '#f59e0b', fontWeight: 500 }}>{maxStreak}d</p>
        </div>
        <div>
          <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Total streak days</p>
          <p style={{ fontFamily: '"Fraunces", serif', fontSize: '1rem', color: 'var(--text-main)', fontWeight: 500 }}>{totalStreak}</p>
        </div>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────

type TabType = 'today' | 'all';

export const HabitsPage: React.FC = () => {
  const { user } = useAuth();
  const { habits, loading, addHabit, updateHabit, deleteHabit, toggleCompletion } = useHabits(user?.uid ?? null);
  const [showModal, setShowModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [tab, setTab] = useState<TabType>('today');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const todayKey = getTodayKey();
  const todayHabits = habits.filter(isScheduledToday);
  const allHabits = habits;

  const displayed = tab === 'today' ? todayHabits : allHabits;
  const doneCount = todayHabits.filter(h => !!h.completions[todayKey]).length;

  const handleSave = async (input: HabitInput) => {
    if (editingHabit) {
      await updateHabit(editingHabit.id, input);
    } else {
      await addHabit(input);
    }
    setEditingHabit(null);
  };

  const handleDelete = async (id: string) => {
    await deleteHabit(id);
    setConfirmDelete(null);
  };

  const today = new Date();
  const dateLabel = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', opacity: 0, animation: 'fadeIn 0.22s ease-out forwards' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '4px' }}>
        <div>
          <h1 style={{ fontFamily: '"Fraunces", serif', fontSize: '1.75rem', fontWeight: 500, color: 'var(--text-main)', marginBottom: '2px' }}>
            Habits
          </h1>
          <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {dateLabel}
            {todayHabits.length > 0 && (
              <span style={{ marginLeft: '6px', color: doneCount === todayHabits.length && todayHabits.length > 0 ? '#5ea84e' : 'var(--text-muted)' }}>
                · {doneCount}/{todayHabits.length} done
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => { setEditingHabit(null); setShowModal(true); }}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '10px 14px', borderRadius: '14px',
            background: 'var(--accent)', color: '#fff', border: 'none',
            fontFamily: '"DM Sans", sans-serif', fontWeight: 600, fontSize: '0.82rem',
            cursor: 'pointer', transition: 'opacity 0.15s',
            flexShrink: 0, marginTop: '4px',
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.88'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
        >
          <PlusIcon /> New
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-card)', borderRadius: '14px', padding: '4px', border: '1px solid var(--border)', marginTop: '18px', marginBottom: '18px' }}>
        {(['today', 'all'] as TabType[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1, padding: '8px 12px', borderRadius: '10px', border: 'none', cursor: 'pointer',
              background: tab === t ? 'var(--bg-panel)' : 'transparent',
              color: tab === t ? 'var(--text-main)' : 'var(--text-muted)',
              fontFamily: '"DM Sans", sans-serif', fontWeight: 600, fontSize: '0.82rem',
              transition: 'background 0.15s, color 0.15s',
              textTransform: 'capitalize',
            }}
          >{t === 'today' ? 'Today' : 'All habits'}</button>
        ))}
      </div>

      {/* Stats */}
      <StatsBar habits={habits} />

      {/* Habit list */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ height: '120px', borderRadius: '20px', background: 'var(--bg-card)', border: '1px solid var(--border)', animation: 'pulse 1.4s ease-in-out infinite', animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 24px' }}>
          <p style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🌱</p>
          <p style={{ fontFamily: '"Fraunces", serif', fontSize: '1.15rem', color: 'var(--text-main)', fontWeight: 500, marginBottom: '6px' }}>
            {tab === 'today' ? 'No habits today' : 'No habits yet'}
          </p>
          <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {tab === 'today' ? 'Add a habit and start your streak' : 'Create your first habit to get started'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {displayed.map(habit => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onToggle={dateKey => toggleCompletion(habit.id, dateKey)}
              onEdit={() => { setEditingHabit(habit); setShowModal(true); }}
              onDelete={() => setConfirmDelete(habit.id)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <HabitModal
          onClose={() => { setShowModal(false); setEditingHabit(null); }}
          onSave={handleSave}
          initial={editingHabit}
        />
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', animation: 'fadeIn 0.18s ease' }}
          onClick={e => { if (e.target === e.currentTarget) setConfirmDelete(null); }}
        >
          <div style={{ background: 'var(--bg-card)', borderRadius: '20px', padding: '24px', maxWidth: '320px', width: '100%', textAlign: 'center' }}>
            <p style={{ fontSize: '2rem', marginBottom: '10px' }}>🗑️</p>
            <p style={{ fontFamily: '"Fraunces", serif', fontSize: '1.1rem', fontWeight: 500, color: 'var(--text-main)', marginBottom: '6px' }}>Delete habit?</p>
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              All completion history and streaks will be lost.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-panel)', color: 'var(--text-muted)', fontFamily: '"DM Sans", sans-serif', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => handleDelete(confirmDelete!)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#e05050', color: '#fff', fontFamily: '"DM Sans", sans-serif', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};