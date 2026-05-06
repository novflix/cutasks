import { createContext } from 'react';
import type { PomodoroContextValue } from './pomodoroContextValue';

export const PomodoroContext = createContext<PomodoroContextValue | null>(null);