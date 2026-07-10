import { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import type { PomoMode, PomoConfig } from '../pages/PomodoroPage';
import { LONG_BREAK_INTERVAL } from '../constants/pomo';
import { loadPomoConfig, loadPomoSavedState, savePomoState, loadPomoRunning } from '../utils/pomo';

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

export function PomoProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<PomoConfig>(loadPomoConfig);
  const [savedPomo] = useState(() => loadPomoSavedState());
  const [mode, setMode] = useState<PomoMode>(savedPomo?.mode ?? 'work');
  const [secondsLeft, setSecondsLeft] = useState(savedPomo?.secondsLeft ?? loadPomoConfig().work * 60);
  const [running, setRunning] = useState(loadPomoRunning);
  const [completedSessions, setCompletedSessions] = useState(savedPomo?.completedSessions ?? 0);
  const [celebrate, setCelebrate] = useState(false);
  const [miniVisible, setMiniVisible] = useState(false);
  const [miniClosing, setMiniClosing] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const miniTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionsRef = useRef(completedSessions);
  const modeRef = useRef(mode);

  useEffect(() => { sessionsRef.current = completedSessions; }, [completedSessions]);
  useEffect(() => { modeRef.current = mode; }, [mode]);

  // Save state
  useEffect(() => {
    savePomoState(mode, secondsLeft, completedSessions, running);
  }, [mode, secondsLeft, completedSessions, running]);

  // Mini timer visibility
  useEffect(() => {
    if (running) {
      if (miniTimerRef.current) clearTimeout(miniTimerRef.current);
      setMiniVisible(true);
      setMiniClosing(false);
    } else if (miniVisible) {
      setMiniClosing(true);
      miniTimerRef.current = setTimeout(() => {
        setMiniVisible(false);
        setMiniClosing(false);
      }, 300);
    }
    return () => { if (miniTimerRef.current) clearTimeout(miniTimerRef.current); };
  }, [running]);

  // Config change listener
  useEffect(() => {
    function onPomoConfigChange(e: Event) {
      setConfig((e as CustomEvent).detail);
    }
    window.addEventListener('pomo-config-changed', onPomoConfigChange);
    return () => window.removeEventListener('pomo-config-changed', onPomoConfigChange);
  }, []);

  const switchMode = useCallback((newMode: PomoMode) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    setMode(newMode);
    setSecondsLeft(config[newMode] * 60);
  }, [config]);

  const toggleRunning = useCallback(() => { setRunning((r) => !r); }, []);

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    setSecondsLeft(config[mode] * 60);
  }, [config, mode]);

  const skipSession = useCallback(() => {
    if (mode === 'work') {
      const next = (sessionsRef.current + 1) % LONG_BREAK_INTERVAL === 0 ? 'long' : 'short';
      setCompletedSessions((s) => s + 1);
      switchMode(next);
    } else {
      switchMode('work');
    }
  }, [mode, switchMode]);

  // Timer interval
  useEffect(() => {
    if (!running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          setRunning(false);
          setCelebrate(true);
          setTimeout(() => setCelebrate(false), 2000);

          if (modeRef.current === 'work') {
            const newSessions = sessionsRef.current + 1;
            setCompletedSessions(newSessions);
            const next = newSessions % LONG_BREAK_INTERVAL === 0 ? 'long' : 'short';
            setTimeout(() => switchMode(next), 600);
          } else {
            setTimeout(() => switchMode('work'), 600);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, switchMode]);

  const value: PomoContextValue = {
    mode, secondsLeft, running, completedSessions, config, celebrate,
    miniVisible, miniClosing,
    toggleRunning, reset, switchMode, skipSession, setConfig,
  };

  return <PomoContext.Provider value={value}>{children}</PomoContext.Provider>;
}
