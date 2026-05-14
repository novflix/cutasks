import React, { useState, useCallback, useContext, createContext } from 'react';
import { useAuth } from './AuthContext';
import { useSettingsSync, type AllSettings } from '../hooks/useSettingsSync';
import { useThemeApply, readInitialTheme } from '../hooks/useTheme';
import { PomodoroProvider } from './PomodoroContext';
import type { Theme } from '../hooks/useTheme';
import type { SortField } from '../hooks/useTaskSort';
import type { DeletionDelay } from '../hooks/useTaskDeletion';
import type { PomodoroSettings } from './PomodoroContext';

interface AppSettingsValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  dark: boolean;

  sortField: SortField;
  setSortField: (f: SortField) => void;

  deletionDelay: DeletionDelay;
  setDeletionDelay: (d: DeletionDelay) => void;

  pomodoro: PomodoroSettings;
  updatePomodoro: (patch: Partial<PomodoroSettings>) => void;
}

const AppSettingsContext = createContext<AppSettingsValue | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useAppSettings(): AppSettingsValue {
  const ctx = useContext(AppSettingsContext);
  if (!ctx) throw new Error('useAppSettings must be used within AppSettingsProvider');
  return ctx;
}


export function AppSettingsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const [theme,         setThemeState]   = useState<Theme>(readInitialTheme);
  const [sortField,     setSortState]    = useState<SortField>(() => {
    try {
      const s = localStorage.getItem('cutasks_sort');
      if (s) { const p = JSON.parse(s); if (p?.field) return p.field as SortField; }
    } catch { /* ignore */ }
    return 'createdAt';
  });
  const [deletionDelay, setDelState]     = useState<DeletionDelay>(() => {
    try {
      const d = localStorage.getItem('cutasks-deletion-delay');
      if (d === 'immediate' || d === '24h' || d === '3d') return d;
    } catch { /* ignore */ }
    return '24h';
  });
  const [pomodoro, setPomoState] = useState<PomodoroSettings>(() => {
    const DEFAULTS: PomodoroSettings = {
      workDuration: 25, shortBreak: 5, longBreak: 15,
      longBreakInterval: 4, showInNav: true,
      autoStartBreaks: false, autoStartPomodoros: false,
    };
    try {
      const pm = localStorage.getItem('cutasks-pomodoro-settings');
      if (pm) return { ...DEFAULTS, ...JSON.parse(pm) };
    } catch { /* ignore */ }
    return DEFAULTS;
  });

  // Apply theme to DOM whenever it changes
  useThemeApply(theme);

  // Collect current settings for the sync hook
  const current = (): AllSettings => ({
    theme, sortField, deletionDelay, pomodoro,
  });

  // Called by useSettingsSync when a newer remote snapshot arrives
  const onRemoteUpdate = useCallback((s: AllSettings) => {
    setThemeState(s.theme);
    setSortState(s.sortField);
    setDelState(s.deletionDelay);
    setPomoState(s.pomodoro);
  }, []);

  const { push } = useSettingsSync(user?.uid ?? null, onRemoteUpdate);

  // ── Setters that also push to Firestore ───────────────────────────────

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    push({ ...current(), theme: t });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [push, sortField, deletionDelay, pomodoro]);

  const setSortField = useCallback((f: SortField) => {
    setSortState(f);
    push({ ...current(), sortField: f });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [push, theme, deletionDelay, pomodoro]);

  const setDeletionDelay = useCallback((d: DeletionDelay) => {
    setDelState(d);
    push({ ...current(), deletionDelay: d });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [push, theme, sortField, pomodoro]);

  const updatePomodoro = useCallback((patch: Partial<PomodoroSettings>) => {
    setPomoState(prev => {
      const next = { ...prev, ...patch };
      push({ ...current(), pomodoro: next });
      return next;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [push, theme, sortField, deletionDelay]);

  const dark = theme !== 'light';

  return (
    <AppSettingsContext.Provider value={{
      theme, setTheme, dark,
      sortField, setSortField,
      deletionDelay, setDeletionDelay,
      pomodoro, updatePomodoro,
    }}>
      <PomodoroProvider settings={pomodoro} update={updatePomodoro}>
        {children}
      </PomodoroProvider>
    </AppSettingsContext.Provider>
  );
}