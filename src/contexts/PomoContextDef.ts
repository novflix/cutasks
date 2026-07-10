import { createContext } from 'react';
import type { PomoMode } from '../pages/PomodoroPage';
import type { PomoConfig } from '../pages/PomodoroPage';

export interface PomoContextValue {
  mode: PomoMode;
  secondsLeft: number;
  running: boolean;
  completedSessions: number;
  config: PomoConfig;
  celebrate: boolean;
  miniVisible: boolean;
  miniClosing: boolean;

  toggleRunning: () => void;
  reset: () => void;
  switchMode: (mode: PomoMode) => void;
  skipSession: () => void;
  setConfig: (config: PomoConfig) => void;
}

export const PomoContext = createContext<PomoContextValue | null>(null);
