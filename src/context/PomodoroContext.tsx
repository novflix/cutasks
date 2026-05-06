import React, { useState, useEffect } from 'react';
import { PomodoroContext } from './pomodoroContextInstance';
import type { PomodoroSettings } from './pomodoroContextValue';

const DEFAULTS: PomodoroSettings = {
  workDuration: 25,
  shortBreak: 5,
  longBreak: 15,
  longBreakInterval: 4,
  showInNav: true,
  autoStartBreaks: false,
  autoStartPomodoros: false,
};

const KEY = 'cutasks-pomodoro-settings';

export function PomodoroProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<PomodoroSettings>(() => {
    try {
      const stored = localStorage.getItem(KEY);
      if (stored) return { ...DEFAULTS, ...JSON.parse(stored) };
    } catch { /* ignore */ }
    return DEFAULTS;
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(settings));
  }, [settings]);

  const update = (patch: Partial<PomodoroSettings>) =>
    setSettings(prev => ({ ...prev, ...patch }));

  return (
    <PomodoroContext.Provider value={{ settings, update }}>
      {children}
    </PomodoroContext.Provider>
  );
}