/**
 * useSettingsSync – cross-device settings synchronisation via Firestore.
 *
 * Storage layout (users/{uid}/settings/prefs):
 *   th  – theme:         'l' | 'd' | 's'  (light / dark / slate)
 *   sf  – sort field:    'c' | 'p' | 'dl' (createdAt / priority / deadline)
 *   dd  – deletion delay:'i' | '1' | '3'  (immediate / 24h / 3d)
 *   pm  – pomodoro:      compact number-encoded object (see below)
 *   _ts – last updated:  server timestamp (conflict resolution)
 *
 * Pomodoro packed as a single object with short keys:
 *   w   – workDuration       (number)
 *   s   – shortBreak         (number)
 *   l   – longBreak          (number)
 *   li  – longBreakInterval  (number)
 *   sn  – showInNav          (0 | 1)
 *   ab  – autoStartBreaks    (0 | 1)
 *   ap  – autoStartPomodoros (0 | 1)
 *
 * Strategy:
 *   1. On mount: read localStorage for instant UI.
 *   2. Subscribe to Firestore (onSnapshot) – remote wins when _ts > local _ts.
 *   3. On change: write localStorage immediately + debounce Firestore write.
 *   4. On logout: unsubscribe.
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
import type { PomodoroSettings } from '../context/PomodoroContext';

// ─── Local-storage keys (unchanged to preserve existing local data) ───────────
const LS_THEME   = 'cutasks-theme';
const LS_SORT    = 'cutasks_sort';
const LS_DEL     = 'cutasks-deletion-delay';
const LS_POMO    = 'cutasks-pomodoro-settings';
const LS_SYNC_TS = 'cutasks-settings-ts'; // last synced remote timestamp (ms)

// ─── Compact encode / decode ──────────────────────────────────────────────────

type CompactDoc = {
  th?: string;
  sf?: string;
  dd?: string;
  pm?: {
    w?: number; s?: number; l?: number; li?: number;
    sn?: 0 | 1; ab?: 0 | 1; ap?: 0 | 1;
  };
  _ts?: unknown; // serverTimestamp
};

const THEME_ENC: Record<Theme, string>          = { light: 'l', dark: 'd', slate: 's' };
const THEME_DEC: Record<string, Theme>          = { l: 'light', d: 'dark', s: 'slate' };
const SORT_ENC:  Record<SortField, string>      = { createdAt: 'c', priority: 'p', deadline: 'dl' };
const SORT_DEC:  Record<string, SortField>      = { c: 'createdAt', p: 'priority', dl: 'deadline' };
const DEL_ENC:   Record<DeletionDelay, string>  = { immediate: 'i', '24h': '1', '3d': '3' };
const DEL_DEC:   Record<string, DeletionDelay>  = { i: 'immediate', '1': '24h', '3': '3d' };

export interface AllSettings {
  theme: Theme;
  sortField: SortField;
  deletionDelay: DeletionDelay;
  pomodoro: PomodoroSettings;
}

const POMO_DEFAULTS: PomodoroSettings = {
  workDuration: 25, shortBreak: 5, longBreak: 15,
  longBreakInterval: 4, showInNav: true,
  autoStartBreaks: false, autoStartPomodoros: false,
};

function readLocal(): AllSettings {
  let theme: Theme = 'dark';
  let sortField: SortField = 'createdAt';
  let deletionDelay: DeletionDelay = '24h';
  let pomodoro: PomodoroSettings = { ...POMO_DEFAULTS };

  try {
    const t = localStorage.getItem(LS_THEME);
    if (t === 'light' || t === 'dark' || t === 'slate') theme = t;
    else if (window.matchMedia('(prefers-color-scheme: dark)').matches) theme = 'dark';
    else theme = 'light';
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

  return { theme, sortField, deletionDelay, pomodoro };
}

function writeLocal(s: AllSettings) {
  try {
    localStorage.setItem(LS_THEME, s.theme);
    localStorage.setItem(LS_SORT, JSON.stringify({ field: s.sortField }));
    localStorage.setItem(LS_DEL, s.deletionDelay);
    localStorage.setItem(LS_POMO, JSON.stringify(s.pomodoro));
  } catch { /* ignore */ }
}

function encode(s: AllSettings): CompactDoc {
  const pm = s.pomodoro;
  return {
    th: THEME_ENC[s.theme]        ?? 'd',
    sf: SORT_ENC[s.sortField]     ?? 'c',
    dd: DEL_ENC[s.deletionDelay]  ?? '1',
    pm: {
      w:  pm.workDuration,
      s:  pm.shortBreak,
      l:  pm.longBreak,
      li: pm.longBreakInterval,
      sn: pm.showInNav        ? 1 : 0,
      ab: pm.autoStartBreaks  ? 1 : 0,
      ap: pm.autoStartPomodoros ? 1 : 0,
    },
    _ts: serverTimestamp(),
  };
}

function decode(data: CompactDoc): AllSettings {
  const pm = data.pm ?? {};
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
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

type OnRemoteUpdate = (settings: AllSettings) => void;

/**
 * Call once per authenticated session.
 * Returns a `push` function to call whenever any setting changes.
 */
export function useSettingsSync(uid: string | null, onRemoteUpdate: OnRemoteUpdate) {
  const unsubRef   = useRef<Unsubscribe | null>(null);
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestRef  = useRef<AllSettings>(readLocal());

  // Debounced Firestore write (300 ms)
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

  // Subscribe to remote changes
  useEffect(() => {
    if (!uid) return;

    const ref = doc(db, 'users', uid, 'settings', 'prefs');

    unsubRef.current = onSnapshot(ref, (snap) => {
      if (!snap.exists()) {
        // First login on this account – push local settings to cloud
        push(latestRef.current);
        return;
      }

      const data = snap.data() as CompactDoc;

      // Compare remote timestamp vs last known local sync timestamp
      const remoteMs: number =
        (data._ts as { toMillis?: () => number } | null)?.toMillis?.() ?? 0;
      const localMs  = parseInt(localStorage.getItem(LS_SYNC_TS) ?? '0', 10);

      // Only apply remote if it is newer than our last write
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