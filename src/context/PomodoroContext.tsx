import React, { createContext, useContext } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PomodoroSettings {
  workDuration: number;
  shortBreak: number;
  longBreak: number;
  longBreakInterval: number;
  showInNav: boolean;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
}

interface PomodoroContextValue {
  settings: PomodoroSettings;
  update: (patch: Partial<PomodoroSettings>) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const PomodoroContext = createContext<PomodoroContextValue | null>(null);

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function usePomodoroSettings(): PomodoroContextValue {
  const ctx = useContext(PomodoroContext);
  if (!ctx) throw new Error('usePomodoroSettings must be used within PomodoroProvider');
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

/**
 * PomodoroProvider receives settings and update from AppSettingsContext,
 * which owns the single source of truth and handles Firestore sync.
 */
export function PomodoroProvider({
  children,
  settings,
  update,
}: {
  children: React.ReactNode;
  settings: PomodoroSettings;
  update: (patch: Partial<PomodoroSettings>) => void;
}) {
  return (
    <PomodoroContext.Provider value={{ settings, update }}>
      {children}
    </PomodoroContext.Provider>
  );
}
