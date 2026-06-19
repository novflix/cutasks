import type { PomoMode, PomoConfig } from '../pages/PomodoroPage';

const POMO_STORAGE = 'cutasks_pomodoro';
const POMO_STATE = 'cutasks_pomodoro_state';
const defaultPomoConfig: PomoConfig = { work: 25, short: 5, long: 15 };

export function loadPomoConfig(): PomoConfig {
  try {
    const r = localStorage.getItem(POMO_STORAGE);
    return r ? { ...defaultPomoConfig, ...JSON.parse(r) } : defaultPomoConfig;
  } catch {
    return defaultPomoConfig;
  }
}

export function loadPomoSavedState(): { mode: PomoMode; secondsLeft: number; completedSessions: number } | null {
  try {
    const raw = localStorage.getItem(POMO_STATE);
    if (!raw) return null;
    const s: { running?: boolean; savedAt?: number; mode?: string; secondsLeft?: number; completedSessions?: number } = JSON.parse(raw);
    if (s.running && s.savedAt) {
      const elapsed = Math.floor((Date.now() - s.savedAt) / 1000);
      const remaining = Math.max(0, (s.secondsLeft ?? 0) - elapsed);
      if (remaining <= 0) return null;
      return { mode: (s.mode ?? 'work') as PomoMode, secondsLeft: remaining, completedSessions: s.completedSessions ?? 0 };
    }
    return { mode: (s.mode ?? 'work') as PomoMode, secondsLeft: s.secondsLeft ?? 0, completedSessions: s.completedSessions ?? 0 };
  } catch {
    return null;
  }
}

export function savePomoState(mode: PomoMode, secondsLeft: number, completedSessions: number, running: boolean) {
  const state = { mode, secondsLeft, completedSessions, running, savedAt: Date.now() };
  localStorage.setItem(POMO_STATE, JSON.stringify(state));
}

export function loadPomoRunning(): boolean {
  try {
    const raw = localStorage.getItem(POMO_STATE);
    if (raw) {
      const s = JSON.parse(raw);
      if (s.running && s.secondsLeft > 0) return true;
    }
  } catch { /* ignore */ }
  return false;
}

export { POMO_STORAGE, POMO_STATE };
