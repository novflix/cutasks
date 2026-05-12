import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/useAuth';

export type HabitColor =
  | 'terracotta' | 'sage' | 'sky' | 'lavender'
  | 'blush' | 'amber' | 'teal' | 'slate';

export const HABIT_COLOR_MAP: Record<HabitColor, { dot: string; bg: string; border: string; text: string }> = {
  terracotta: { dot: '#e07850', bg: 'rgba(224,120,80,0.12)',  border: 'rgba(224,120,80,0.35)', text: '#e07850' },
  sage:       { dot: '#5ea84e', bg: 'rgba(94,168,78,0.12)',   border: 'rgba(94,168,78,0.35)',  text: '#5ea84e' },
  sky:        { dot: '#3d96e0', bg: 'rgba(61,150,224,0.12)',  border: 'rgba(61,150,224,0.35)', text: '#3d96e0' },
  lavender:   { dot: '#9370e0', bg: 'rgba(147,112,224,0.12)', border: 'rgba(147,112,224,0.35)',text: '#9370e0' },
  blush:      { dot: '#e0546a', bg: 'rgba(224,84,106,0.12)',  border: 'rgba(224,84,106,0.35)', text: '#e0546a' },
  amber:      { dot: '#d4a030', bg: 'rgba(212,160,48,0.12)',  border: 'rgba(212,160,48,0.35)', text: '#d4a030' },
  teal:       { dot: '#28b8aa', bg: 'rgba(40,184,170,0.12)',  border: 'rgba(40,184,170,0.35)', text: '#28b8aa' },
  slate:      { dot: '#6488c0', bg: 'rgba(100,136,192,0.12)', border: 'rgba(100,136,192,0.35)',text: '#6488c0' },
};

export const HABIT_COLOR_OPTIONS = Object.keys(HABIT_COLOR_MAP) as HabitColor[];

export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: HabitColor;
  /** days of week to track: 0=Sun … 6=Sat. Empty = every day */
  targetDays: number[];
  /** ISO date strings YYYY-MM-DD that were completed */
  completions: string[];
  order: number;
  createdAt: string;
}

export type CreateHabitInput = Omit<Habit, 'id' | 'completions' | 'order' | 'createdAt'>;

/** Today as YYYY-MM-DD in local time */
export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Returns the last N days as YYYY-MM-DD strings, oldest first */
export function lastNDays(n: number): string[] {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  }
  return days;
}

/** Current streak: consecutive completed days ending today (or yesterday) */
export function calcStreak(completions: string[], targetDays: number[]): number {
  const set = new Set(completions);
  let streak = 0;
  let i = 0;
  while (true) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dayOfWeek = d.getDay();
    const isTarget = targetDays.length === 0 || targetDays.includes(dayOfWeek);
    if (isTarget) {
      if (set.has(iso)) {
        streak++;
      } else if (i === 0) {
        // today not yet done — don't break streak if yesterday was done
        i++;
        continue;
      } else {
        break;
      }
    }
    i++;
    if (i > 365) break;
  }
  return streak;
}

export function useHabits() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      // Schedule state updates as callbacks, not synchronously in the effect body
      Promise.resolve().then(() => {
        setHabits([]);
        setLoading(false);
      });
      return;
    }
    const ref = collection(db, 'users', user.uid, 'habits');
    const q = query(ref, orderBy('order', 'asc'));
    const unsub = onSnapshot(q, snap => {
      setHabits(snap.docs.map(d => ({ id: d.id, ...d.data() } as Habit)));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, [user]);

  const addHabit = useCallback(async (input: CreateHabitInput) => {
    if (!user) return;
    const order = habits.length;
    await addDoc(collection(db, 'users', user.uid, 'habits'), {
      ...input,
      completions: [],
      order,
      createdAt: new Date().toISOString(),
      _ts: serverTimestamp(),
    });
  }, [user, habits.length]);

  const updateHabit = useCallback(async (id: string, patch: Partial<Omit<Habit, 'id'>>) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid, 'habits', id), { ...patch, _ts: serverTimestamp() });
  }, [user]);

  const deleteHabit = useCallback(async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'habits', id));
  }, [user]);

  const toggleCompletion = useCallback(async (id: string, date: string) => {
    if (!user) return;
    const habit = habits.find(h => h.id === id);
    if (!habit) return;
    const completions = habit.completions.includes(date)
      ? habit.completions.filter(d => d !== date)
      : [...habit.completions, date];
    await updateDoc(doc(db, 'users', user.uid, 'habits', id), { completions, _ts: serverTimestamp() });
  }, [user, habits]);

  return { habits, loading, addHabit, updateHabit, deleteHabit, toggleCompletion };
}