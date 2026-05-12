/**
 * useSettingsSync – cross-device settings synchronisation via Firestore.
 *
 * Storage layout (users/{uid}/settings/prefs):
 *   th  – theme:         'l' | 'd' | 's'  (light / dark / slate)
 *   sf  – sort field:    'c' | 'p' | 'dl' (createdAt / priority / deadline)
 *   dd  – deletion delay:'i' | '1' | '3'  (immediate / 24h / 3d)
 *   pm  – pomodoro:      compact object
 *   hb  – habits:        compact object
 *   _ts – last updated:  server timestamp
 *
 * Pomodoro packed (pm):
 *   w   – workDuration       (number)
 *   s   – shortBreak         (number)
 *   l   – longBreak          (number)
 *   li  – longBreakInterval  (number)
 *   sn  – showInNav          (0 | 1)
 *   ab  – autoStartBreaks    (0 | 1)
 *   ap  – autoStartPomodoros (0 | 1)
 *
 * Habits packed (hb):
 *   sn  – showInNav (0 | 1)
 */

import { useEffect, useRef, useCallback } from 'react';
import {
  doc,
  setDoc,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Theme } from './useTheme';
import type { SortField } from './useTaskSort';
import type { DeletionDelay } from './useTaskDeletion';
import type { PomodoroSettings, HabitSettings } from '../context/pomodoroContextValue';

const LS_THEME   = 'cutasks-theme';
const LS_SORT    = 'cutasks_sort';
const LS_DEL     = 'cutasks-deletion-delay';
const LS_POMO    = 'cutasks-pomodoro-settings';
const LS_HABIT   = 'cutasks-habit-settings';
const LS_SYNC_TS = 'cutasks-settings-ts';

type CompactDoc = {
  th?: string;
  sf?: string;
  dd?: string;
  pm?: {
    w?: number; s?: number; l?: number; li?: number;
    sn?: 0 | 1; ab?: 0 | 1; ap?: 0 | 1;
  };
  hb?: { sn?: 0 | 1 };
  _ts?: unknown;
};

const THEME_ENC: Record<Theme, string>         = { light: 'l', dark: 'd', slate: 's' };
const THEME_DEC: Record<string, Theme>         = { l: 'light', d: 'dark', s: 'slate' };
const SORT_ENC:  Record<SortField, string>     = { createdAt: 'c', priority: 'p', deadline: 'dl' };
const SORT_DEC:  Record<string, SortField>     = { c: 'createdAt', p: 'priority', dl: 'deadline' };
const DEL_ENC:   Record<DeletionDelay, string> = { immediate: 'i', '24h': '1', '3d': '3' };
const DEL_DEC:   Record<string, DeletionDelay> = { i: 'immediate', '1': '24h', '3': '3d' };

export interface AllSettings {
  theme: Theme;
  sortField: SortField;
  deletionDelay: DeletionDelay;
  pomodoro: PomodoroSettings;
  habit: HabitSettings;
}

const POMO_DEFAULTS: PomodoroSettings = {
  workDuration: 25, shortBreak: 5, longBreak: 15,
  longBreakInterval: 4, showInNav: true,
  autoStartBreaks: false, autoStartPomodoros: false,
};

const HABIT_DEFAULTS: HabitSettings = { showInNav: true };

function readLocal(): AllSettings {
  let theme: Theme = 'dark';
  let sortField: SortField = 'createdAt';
  let deletionDelay: DeletionDelay = '24h';
  let pomodoro: PomodoroSettings = { ...POMO_DEFAULTS };
  let habit: HabitSettings = { ...HABIT_DEFAULTS };

  try {
    const t = localStorage.getItem(LS_THEME);
    if (t === 'light' || t === 'dark' || t === 'slate') theme = t;
    else theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch { /* ignore */ }

  try {
    const s = localStorage.getItem(LS_SORT);
    if (s) { const p = JSON.parse(s); if (p?.field) sortField = p.field; }
  } catch { /* ignore */ }

  try {
    const d = localStorage.getItem(LS_DEL);
    if (d === 'immediate' || d === '24h' || d === '3d') deletionDelay = d;
  } catch { /* ignore */ }

  try {
    const pm = localStorage.getItem(LS_POMO);
    if (pm) pomodoro = { ...POMO_DEFAULTS, ...JSON.parse(pm) };
  } catch { /* ignore */ }

  try {
    const hb = localStorage.getItem(LS_HABIT);
    if (hb) habit = { ...HABIT_DEFAULTS, ...JSON.parse(hb) };
  } catch { /* ignore */ }

  return { theme, sortField, deletionDelay, pomodoro, habit };
}

function writeLocal(s: AllSettings) {
  try {
    localStorage.setItem(LS_THEME, s.theme);
    localStorage.setItem(LS_SORT, JSON.stringify({ field: s.sortField }));
    localStorage.setItem(LS_DEL, s.deletionDelay);
    localStorage.setItem(LS_POMO, JSON.stringify(s.pomodoro));
    localStorage.setItem(LS_HABIT, JSON.stringify(s.habit));
  } catch { /* ignore */ }
}

function encode(s: AllSettings): CompactDoc {
  const pm = s.pomodoro;
  return {
    th: THEME_ENC[s.theme]       ?? 'd',
    sf: SORT_ENC[s.sortField]    ?? 'c',
    dd: DEL_ENC[s.deletionDelay] ?? '1',
    pm: {
      w:  pm.workDuration,
      s:  pm.shortBreak,
      l:  pm.longBreak,
      li: pm.longBreakInterval,
      sn: pm.showInNav          ? 1 : 0,
      ab: pm.autoStartBreaks    ? 1 : 0,
      ap: pm.autoStartPomodoros ? 1 : 0,
    },
    hb: { sn: s.habit.showInNav ? 1 : 0 },
    _ts: serverTimestamp(),
  };
}

function decode(data: CompactDoc): AllSettings {
  const pm = data.pm ?? {};
  const hb = data.hb ?? {};
  return {
    theme:         THEME_DEC[data.th ?? ''] ?? 'dark',
    sortField:     SORT_DEC[data.sf ?? '']  ?? 'createdAt',
    deletionDelay: DEL_DEC[data.dd ?? '']   ?? '24h',
    pomodoro: {
      workDuration:        pm.w  ?? POMO_DEFAULTS.workDuration,
      shortBreak:          pm.s  ?? POMO_DEFAULTS.shortBreak,
      longBreak:           pm.l  ?? POMO_DEFAULTS.longBreak,
      longBreakInterval:   pm.li ?? POMO_DEFAULTS.longBreakInterval,
      showInNav:           pm.sn === 1,
      autoStartBreaks:     pm.ab === 1,
      autoStartPomodoros:  pm.ap === 1,
    },
    habit: {
      showInNav: hb.sn !== 0, // default true
    },
  };
}

type OnRemoteUpdate = (settings: AllSettings) => void;

export function useSettingsSync(uid: string | null, onRemoteUpdate: OnRemoteUpdate) {
  const unsubRef  = useRef<Unsubscribe | null>(null);
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestRef = useRef<AllSettings>(readLocal());

  const push = useCallback((settings: AllSettings) => {
    latestRef.current = settings;
    writeLocal(settings);

    if (!uid) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        const ref = doc(db, 'users', uid, 'settings', 'prefs');
        await setDoc(ref, encode(settings));
        localStorage.setItem(LS_SYNC_TS, String(Date.now()));
      } catch (e) {
        console.warn('[settingsSync] write failed:', e);
      }
    }, 300);
  }, [uid]);

  useEffect(() => {
    if (!uid) return;
    const ref = doc(db, 'users', uid, 'settings', 'prefs');

    unsubRef.current = onSnapshot(ref, (snap) => {
      if (!snap.exists()) {
        push(latestRef.current);
        return;
      }
      const data = snap.data() as CompactDoc;
      const remoteMs: number =
        (data._ts as { toMillis?: () => number } | null)?.toMillis?.() ?? 0;
      const localMs = parseInt(localStorage.getItem(LS_SYNC_TS) ?? '0', 10);

      if (remoteMs > localMs) {
        const decoded = decode(data);
        writeLocal(decoded);
        localStorage.setItem(LS_SYNC_TS, String(remoteMs));
        latestRef.current = decoded;
        onRemoteUpdate(decoded);
      }
    }, (err) => {
      console.warn('[settingsSync] subscription error:', err);
    });

    return () => {
      unsubRef.current?.();
      unsubRef.current = null;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [uid, push, onRemoteUpdate]);

  return { push };
}