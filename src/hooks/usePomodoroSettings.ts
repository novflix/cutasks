import { useContext } from 'react';
import { PomodoroContext } from '../context/pomodoroContextInstance';

export type { PomodoroSettings } from '../context/pomodoroContextValue';

export function usePomodoroSettings() {
  const ctx = useContext(PomodoroContext);
  if (!ctx) throw new Error('usePomodoroSettings must be used within PomodoroProvider');
  return ctx;
}