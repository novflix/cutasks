import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Play, Pause, Restart, SkipNext,
  SettingsMinimalistic, CloseCircle,
} from '@solar-icons/react';

type Mode = 'work' | 'short' | 'long';

interface TimerConfig {
  work: number;
  short: number;
  long: number;
}

const DEFAULT_CONFIG: TimerConfig = { work: 25, short: 5, long: 15 };
const LONG_BREAK_INTERVAL = 4;
const STORAGE_KEY = 'cutasks_pomodoro';

const MODE_META: Record<Mode, { label: string; color: string; bgGrad: string }> = {
  work:  { label: 'Focus',      color: '#ed9b6d', bgGrad: 'linear-gradient(135deg, #2a1a0e, #4a2a12, #5c3518)' },
  short: { label: 'Short Break', color: '#66bb6a', bgGrad: 'linear-gradient(135deg, #0f2a1a, #1a4028, #245030)' },
  long:  { label: 'Long Break',  color: '#64b5f6', bgGrad: 'linear-gradient(135deg, #0f2a3d, #163a52, #1c4a64)' },
};

const MOTIVATIONAL = [
  'Stay focused, you got this!',
  'Deep work starts now.',
  'One pomodoro at a time.',
  'Your future self will thank you.',
  'Small steps, big results.',
  'Breathe. Focus. Create.',
];

function loadConfig(): TimerConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return DEFAULT_CONFIG;
}

function saveConfig(c: TimerConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
}

export default function PomodoroPage() {
  const navigate = useNavigate();
  const [config, setConfig] = useState<TimerConfig>(loadConfig);
  const [mode, setMode] = useState<Mode>('work');
  const [secondsLeft, setSecondsLeft] = useState(config.work * 60);
  const [running, setRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsClosing, setSettingsClosing] = useState(false);
  const [tempConfig, setTempConfig] = useState<TimerConfig>(config);
  const [celebrate, setCelebrate] = useState(false);
  const [quote] = useState(() => MOTIVATIONAL[Math.floor(Math.random() * MOTIVATIONAL.length)]);

  const totalSeconds = config[mode] * 60;
  const progress = 1 - secondsLeft / totalSeconds;
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const meta = MODE_META[mode];

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const settingsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);
  useEffect(() => () => { if (settingsTimer.current) clearTimeout(settingsTimer.current); }, []);

  const switchMode = useCallback((newMode: Mode) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    setMode(newMode);
    setSecondsLeft(config[newMode] * 60);
  }, [config]);

  const skipSession = useCallback(() => {
    if (mode === 'work') {
      const next = (completedSessions + 1) % LONG_BREAK_INTERVAL === 0 ? 'long' : 'short';
      setCompletedSessions((s) => s + 1);
      switchMode(next);
    } else {
      switchMode('work');
    }
  }, [mode, completedSessions, switchMode]);

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

          if (mode === 'work') {
            setCompletedSessions((s) => s + 1);
            const next = (completedSessions + 1) % LONG_BREAK_INTERVAL === 0 ? 'long' : 'short';
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
  }, [running, mode, completedSessions, switchMode]);

  useEffect(() => {
    if (running) {
      document.title = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} — ${meta.label} | CuTasks`;
    } else {
      document.title = 'CuTasks';
    }
  }, [running, minutes, seconds, meta.label]);

  function toggleRunning() {
    setRunning((r) => !r);
  }

  function reset() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    setSecondsLeft(config[mode] * 60);
  }

  function openSettings() {
    setTempConfig(config);
    setSettingsClosing(false);
    setShowSettings(true);
  }

  function closeSettings() {
    setSettingsClosing(true);
    settingsTimer.current = setTimeout(() => {
      setShowSettings(false);
      setSettingsClosing(false);
    }, 200);
  }

  function saveSettings() {
    const c = {
      work: Math.max(1, Math.min(120, tempConfig.work)),
      short: Math.max(1, Math.min(60, tempConfig.short)),
      long: Math.max(1, Math.min(60, tempConfig.long)),
    };
    setConfig(c);
    saveConfig(c);
    if (!running) setSecondsLeft(c[mode] * 60);
    closeSettings();
  }

  const r = 100;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * (1 - progress);

  return (
    <>
      <div className="pomo-hero">
        <button className="btn-icon" onClick={() => navigate('/home')}>
          <ArrowLeft size={22} />
        </button>
        <h1 className="page-hero-title">Pomodoro</h1>
        <button className="btn-icon pomo-settings-btn" onClick={openSettings} aria-label="Settings">
          <SettingsMinimalistic size={20} />
        </button>
      </div>

      <div className={`pomo-container${celebrate ? ' pomo-celebrate' : ''}`} style={{ background: meta.bgGrad }}>
        <div className="pomo-deco">
          <span className="pomo-deco-circle pomo-deco-1" />
          <span className="pomo-deco-circle pomo-deco-2" />
          <span className="pomo-deco-circle pomo-deco-3" />
        </div>

        <div className="pomo-mode-tabs">
          {(['work', 'short', 'long'] as Mode[]).map((m) => (
            <button
              key={m}
              className={`pomo-tab${mode === m ? ' active' : ''}`}
              onClick={() => switchMode(m)}
              style={mode === m ? { color: MODE_META[m].color } : undefined}
            >
              {MODE_META[m].label}
            </button>
          ))}
        </div>

        <div className="pomo-ring-wrap">
          <svg className="pomo-ring" viewBox="0 0 220 220">
            <circle
              className="pomo-ring-bg"
              cx="110" cy="110" r={r}
              fill="none" strokeWidth="8"
            />
            <circle
              className="pomo-ring-progress"
              cx="110" cy="110" r={r}
              fill="none" strokeWidth="8"
              strokeLinecap="round"
              stroke={meta.color}
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{ filter: `drop-shadow(0 0 8px ${meta.color}60)` }}
            />
          </svg>

          <div className="pomo-time-display">
            <span className="pomo-time" style={{ color: meta.color }}>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            <span className="pomo-label">{meta.label}</span>
          </div>

          {celebrate && (
            <div className="pomo-confetti">
              {Array.from({ length: 12 }).map((_, i) => (
                <span
                  key={i}
                  className="pomo-confetti-piece"
                  style={{
                    '--angle': `${i * 30}deg`,
                    '--delay': `${i * 0.04}s`,
                    '--color': ['#ed9b6d', '#66bb6a', '#64b5f6', '#ba68c8', '#ffb74d'][i % 5],
                  } as React.CSSProperties}
                />
              ))}
            </div>
          )}
        </div>

        <div className="pomo-controls">
          <button className="pomo-btn pomo-btn-secondary" onClick={reset} aria-label="Reset">
            <Restart size={22} strokeWidth={2} />
          </button>
          <button
            className={`pomo-btn pomo-btn-main${running ? ' running' : ''}`}
            onClick={toggleRunning}
            aria-label={running ? 'Pause' : 'Start'}
            style={{ background: meta.color }}
          >
            {running ? <Pause size={32} strokeWidth={2.2} /> : <Play size={32} strokeWidth={2.2} className="pomo-play-icon" />}
          </button>
          <button className="pomo-btn pomo-btn-secondary" onClick={skipSession} aria-label="Skip">
            <SkipNext size={22} strokeWidth={2} />
          </button>
        </div>

        <p className="pomo-quote">{quote}</p>

        <div className="pomo-sessions">
          {Array.from({ length: LONG_BREAK_INTERVAL }).map((_, i) => (
            <span
              key={i}
              className={`pomo-dot${i < completedSessions % LONG_BREAK_INTERVAL ? ' filled' : ''}`}
              style={i < completedSessions % LONG_BREAK_INTERVAL ? { background: meta.color } : undefined}
            />
          ))}
          <span className="pomo-sessions-label">
            {completedSessions} session{completedSessions !== 1 ? 's' : ''} today
          </span>
        </div>
      </div>

      {(showSettings || settingsClosing) && (
        <div className={`modal-overlay${settingsClosing ? ' closing' : ''}`} onClick={closeSettings}>
          <div className={`modal pomo-settings-modal${settingsClosing ? ' closing' : ''}`} onClick={(e) => e.stopPropagation()}>
            <div className="fm-header">
              <h2 className="fm-title">Timer Settings</h2>
              <button className="btn-icon fm-close" onClick={closeSettings}>
                <CloseCircle size={20} />
              </button>
            </div>
            <div className="fm-body">
              {([
                { key: 'work' as const, label: 'Focus duration', color: '#ed9b6d' },
                { key: 'short' as const, label: 'Short break', color: '#66bb6a' },
                { key: 'long' as const, label: 'Long break', color: '#64b5f6' },
              ]).map((item) => (
                <div key={item.key} className="pomo-setting-row">
                  <div className="pomo-setting-info">
                    <span className="pomo-setting-dot" style={{ background: item.color }} />
                    <span className="pomo-setting-label">{item.label}</span>
                  </div>
                  <div className="pomo-setting-controls">
                    <button
                      className="pomo-setting-adj"
                      onClick={() => setTempConfig((c) => ({ ...c, [item.key]: Math.max(1, c[item.key] - 1) }))}
                    >
                      −
                    </button>
                    <span className="pomo-setting-value" style={{ color: item.color }}>{tempConfig[item.key]}m</span>
                    <button
                      className="pomo-setting-adj"
                      onClick={() => setTempConfig((c) => ({ ...c, [item.key]: Math.min(item.key === 'work' ? 120 : 60, c[item.key] + 1) }))}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="fm-footer">
              <button className="btn btn-secondary" onClick={closeSettings}>Cancel</button>
              <button className="btn btn-primary" onClick={saveSettings}>Save</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
