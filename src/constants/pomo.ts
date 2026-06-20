import type { PomoConfig } from '../pages/PomodoroPage';

export const LONG_BREAK_INTERVAL = 4;

export const DEFAULT_POMO_CONFIG: PomoConfig = { work: 25, short: 5, long: 15 };

export const MODE_META: Record<'work' | 'short' | 'long', { label: string; color: string; bgGrad: string }> = {
  work:  { label: 'Focus',      color: '#ed9b6d', bgGrad: 'linear-gradient(135deg, #2a1a0e, #4a2a12, #5c3518)' },
  short: { label: 'Short Break', color: '#66bb6a', bgGrad: 'linear-gradient(135deg, #0f2a1a, #1a4028, #245030)' },
  long:  { label: 'Long Break',  color: '#64b5f6', bgGrad: 'linear-gradient(135deg, #0f2a3d, #163a52, #1c4a64)' },
};
