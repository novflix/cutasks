import React from 'react';
import { PomodoroContext } from './pomodoroContextInstance';
import type { PomodoroSettings } from './pomodoroContextValue';

interface Props {
  children: React.ReactNode;
  settings: PomodoroSettings;
  update: (patch: Partial<PomodoroSettings>) => void;
}

/**
 * PomodoroProvider now receives settings and update from the parent
 * (AppSettings), which owns the single source of truth for all settings
 * and handles Firestore sync via useSettingsSync.
 */
export function PomodoroProvider({ children, settings, update }: Props) {
  return (
    <PomodoroContext.Provider value={{ settings, update }}>
      {children}
    </PomodoroContext.Provider>
  );
}