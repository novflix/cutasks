/**
 * useHabits – Firebase-backed habit tracker hook.
 *
 * Firestore layout: users/{uid}/habits/{habitId}
 * Each document:
 *   id, title, emoji, color, frequency ('daily'|'weekly'|number[]),
 *   targetDays (days of week for weekly, or array index for custom),
 *   streak, bestStreak, completions: Record<string, true> (keys = 'YYYY-MM-DD'),
 *   archivedAt, createdAt, order
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  collection, doc, onSnapshot, setDoc, updateDoc,
  deleteDoc, serverTimestamp, query, orderBy,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase/config';

export type HabitColor =
  | 'coral' | 'sage' | 'sky' | 'lavender'
  | 'amber' | 'teal' | 'blush' | 'slate';

export type HabitFrequency = 'daily' | number[]; // number[] = days of week (0=Sun)

export interface Habit {
  id: string;
  title: string;
  emoji: string;
  color: HabitColor;
  frequency: HabitFrequency;
  /** running streak in days */
  streak: number;
  bestStreak: number;
  /** Record of completed dates 'YYYY-MM-DD' -> true */
  completions: Record<string, true>;
  createdAt: string;
  order: number;
  archivedAt?: string | null;
}

export type HabitInput = Omit<Habit, 'id' | 'streak' | 'bestStreak' | 'completions' | 'createdAt' | 'order' | 'archivedAt'>;

const COLORS: Record<HabitColor, { dot: string; bg: string; border: string; text: string }> = {
  coral:    { dot: '#e07850', bg: 'rgba(224,120,80,0.14)',  border: 'rgba(224,120,80,0.35)',  text: '#e07850' },
  sage:     { dot: '#5ea84e', bg: 'rgba(94,168,78,0.14)',   border: 'rgba(94,168,78,0.35)',   text: '#5ea84e' },
  sky:      { dot: '#3d96e0', bg: 'rgba(61,150,224,0.14)',  border: 'rgba(61,150,224,0.35)',  text: '#3d96e0' },
  lavender: { dot: '#9370e0', bg: 'rgba(147,112,224,0.14)', border: 'rgba(147,112,224,0.35)', text: '#9370e0' },
  amber:    { dot: '#d4a030', bg: 'rgba(212,160,48,0.14)',  border: 'rgba(212,160,48,0.35)',  text: '#d4a030' },
  teal:     { dot: '#28b8aa', bg: 'rgba(40,184,170,0.14)',  border: 'rgba(40,184,170,0.35)',  text: '#28b8aa' },
  blush:    { dot: '#e0546a', bg: 'rgba(224,84,106,0.14)',  border: 'rgba(224,84,106,0.35)',  text: '#e0546a' },
  slate:    { dot: '#6488c0', bg: 'rgba(100,136,192,0.14)', border: 'rgba(100,136,192,0.35)', text: '#6488c0' },
};

export function habitColorTokens(color: HabitColor) {
  return COLORS[color] ?? COLORS.coral;
}

// ── Date utils ─────────────────────────────────────────────────────────────────

export function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function getTodayKey(): string {
  return toDateKey(new Date());
}

/** Returns last N days as 'YYYY-MM-DD' keys, most recent first */
export function getLastNDays(n: number): string[] {
  const days: string[] = [];
  const now = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    days.push(toDateKey(d));
  }
  return days;
}

/** Compute current streak from completions */
function computeStreak(completions: Record<string, true>, frequency: HabitFrequency): number {
  if (frequency === 'daily') {
    let streak = 0;
    const today = new Date();
    // allow today or yesterday to count as "current"
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = toDateKey(d);
      if (completions[key]) {
        streak++;
      } else {
        // allow one gap (today not yet completed)
        if (i === 0) continue;
        break;
      }
    }
    return streak;
  }
  // For weekly frequency – count consecutive weeks
  const days = frequency as number[];
  let streak = 0;
  const today = new Date();
  // go back week by week
  for (let w = 0; w < 52; w++) {
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() - w * 7);
    let weekDone = false;
    for (const day of days) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + day);
      if (d <= today && completions[toDateKey(d)]) {
        weekDone = true;
        break;
      }
    }
    if (weekDone) streak++;
    else if (w > 0) break; // current week can still be done
  }
  return streak;
}

/** Is this habit scheduled for today? */
export function isScheduledToday(habit: Habit): boolean {
  if (habit.frequency === 'daily') return true;
  const dow = new Date().getDay();
  return (habit.frequency as number[]).includes(dow);
}

// ── Hook ───────────────────────────────────────────────────────────────────────

export function useHabits(uid: string | null) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(() => !!uid);
  const unsubRef = useRef<Unsubscribe | null>(null);
  const prevUidRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    // When uid disappears (logout), reset state.
    // Wrap in setTimeout to avoid synchronous setState inside effect body.
    if (!uid) {
      if (prevUidRef.current !== uid) {
        prevUidRef.current = uid;
        const t = setTimeout(() => { setHabits([]); setLoading(false); }, 0);
        return () => clearTimeout(t);
      }
      return;
    }
    prevUidRef.current = uid;

    const ref = collection(db, 'users', uid, 'habits');
    const q = query(ref, orderBy('order', 'asc'));

    unsubRef.current = onSnapshot(q, (snap) => {
      const list: Habit[] = snap.docs.map(d => {
        const data = d.data();
        const completions = (data.completions ?? {}) as Record<string, true>;
        const freq: HabitFrequency = data.frequency === 'daily' ? 'daily' : (data.frequency ?? 'daily');
        const streak = computeStreak(completions, freq);
        return {
          id: d.id,
          title: data.title ?? '',
          emoji: data.emoji ?? '✨',
          color: (data.color ?? 'coral') as HabitColor,
          frequency: freq,
          streak,
          bestStreak: Math.max(data.bestStreak ?? 0, streak),
          completions,
          createdAt: data.createdAt ?? new Date().toISOString(),
          order: data.order ?? 0,
          archivedAt: data.archivedAt ?? null,
        };
      });
      setHabits(list);
      setLoading(false);
    }, () => setLoading(false));

    return () => { unsubRef.current?.(); };
  }, [uid]);

  // ── CRUD ──────────────────────────────────────────────────────────────────

  const addHabit = useCallback(async (input: HabitInput) => {
    if (!uid) return;
    const id = crypto.randomUUID();
    const order = habits.length;
    await setDoc(doc(db, 'users', uid, 'habits', id), {
      ...input,
      frequency: input.frequency,
      streak: 0,
      bestStreak: 0,
      completions: {},
      createdAt: new Date().toISOString(),
      order,
      archivedAt: null,
      _ts: serverTimestamp(),
    });
  }, [uid, habits.length]);

  const updateHabit = useCallback(async (id: string, patch: Partial<Omit<Habit, 'id'>>) => {
    if (!uid) return;
    await updateDoc(doc(db, 'users', uid, 'habits', id), {
      ...patch,
      _ts: serverTimestamp(),
    });
  }, [uid]);

  const deleteHabit = useCallback(async (id: string) => {
    if (!uid) return;
    await deleteDoc(doc(db, 'users', uid, 'habits', id));
  }, [uid]);

  const toggleCompletion = useCallback(async (id: string, dateKey: string) => {
    if (!uid) return;
    const habit = habits.find(h => h.id === id);
    if (!habit) return;

    const newCompletions = { ...habit.completions };
    if (newCompletions[dateKey]) {
      delete newCompletions[dateKey];
    } else {
      newCompletions[dateKey] = true;
    }

    const newStreak = computeStreak(newCompletions, habit.frequency);
    const newBest = Math.max(habit.bestStreak, newStreak);

    await updateDoc(doc(db, 'users', uid, 'habits', id), {
      completions: newCompletions,
      streak: newStreak,
      bestStreak: newBest,
      _ts: serverTimestamp(),
    });
  }, [uid, habits]);

  return { habits, loading, addHabit, updateHabit, deleteHabit, toggleCompletion };
}