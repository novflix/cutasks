import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePomodoroSettings } from '../hooks/usePomodoroSettings';

type Mode = 'work' | 'short' | 'long';

const MODE_LABELS: Record<Mode, string> = {
  work: 'Focus',
  short: 'Short Break',
  long: 'Long Break',
};

const MODE_COLORS: Record<Mode, string> = {
  work: 'var(--accent)',
  short: '#5ea84e',
  long: '#3d96e0',
};

function formatTime(s: number) {
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  const sec = (s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

function playBell() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.8);
    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1.2);
  } catch { /* Web Audio not available */ }
}

export const PomodoroPage: React.FC = () => {
  const { settings } = usePomodoroSettings();

  const getDuration = useCallback((mode: Mode) => {
    if (mode === 'work') return settings.workDuration * 60;
    if (mode === 'short') return settings.shortBreak * 60;
    return settings.longBreak * 60;
  }, [settings]);

  const [mode, setMode] = useState<Mode>('work');
  // total is regular state so it can be read during render without ref issues
  const [total, setTotal] = useState(() => settings.workDuration * 60);
  const [timeLeft, setTimeLeft] = useState(() => settings.workDuration * 60);
  const [running, setRunning] = useState(false);
  const [pomodorosCompleted, setPomodorosCompleted] = useState(0);
  const [sessions, setSessions] = useState<{ mode: Mode; completedAt: number }[]>([]);
  const [ripple, setRipple] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Helper: switch to a new mode without triggering the effect below
  const applyMode = useCallback((m: Mode) => {
    const d = getDuration(m);
    setMode(m);
    setTotal(d);
    setTimeLeft(d);
  }, [getDuration]);

  // When settings change while not running, re-sync duration for current mode
  // We intentionally do NOT call setState here synchronously — use a flag pattern
  const prevSettingsRef = useRef(settings);
  useEffect(() => {
    if (prevSettingsRef.current !== settings && !running) {
      prevSettingsRef.current = settings;
      const d = getDuration(mode);
      // Schedule state update outside the effect body via a microtask
      Promise.resolve().then(() => {
        setTotal(d);
        setTimeLeft(d);
      });
    } else {
      prevSettingsRef.current = settings;
    }
  }, [settings, mode, getDuration, running]);

  const handleComplete = useCallback((currentMode: Mode, currentPomodoros: number) => {
    playBell();
    setRunning(false);
    setSessions(prev => [...prev, { mode: currentMode, completedAt: Date.now() }]);

    let newPomodoros = currentPomodoros;
    if (currentMode === 'work') {
      newPomodoros = currentPomodoros + 1;
      setPomodorosCompleted(newPomodoros);
    }

    if (currentMode === 'work') {
      const nextMode = newPomodoros % settings.longBreakInterval === 0 ? 'long' : 'short';
      const d = getDuration(nextMode);
      setMode(nextMode);
      setTotal(d);
      setTimeLeft(d);
      if (settings.autoStartBreaks) setTimeout(() => setRunning(true), 500);
    } else {
      const d = getDuration('work');
      setMode('work');
      setTotal(d);
      setTimeLeft(d);
      if (settings.autoStartPomodoros) setTimeout(() => setRunning(true), 500);
    }
  }, [settings, getDuration]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            handleComplete(mode, pomodorosCompleted);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, mode, pomodorosCompleted, handleComplete]);

  const toggleRunning = () => {
    setRipple(true);
    setTimeout(() => setRipple(false), 600);
    setRunning(r => !r);
  };

  const handleReset = () => {
    setRunning(false);
    const d = getDuration(mode);
    setTotal(d);
    setTimeLeft(d);
  };

  const handleSkip = () => {
    setRunning(false);
    handleComplete(mode, pomodorosCompleted);
  };

  const switchMode = (m: Mode) => {
    if (running) return;
    applyMode(m);
  };

  const progress = total > 0 ? (total - timeLeft) / total : 0;

  // SVG ring
  const R = 88;
  const CIRC = 2 * Math.PI * R;
  const dash = CIRC * progress;
  const color = MODE_COLORS[mode];

  const todayPomodoros = sessions.filter(
    s => s.mode === 'work' && new Date(s.completedAt).toDateString() === new Date().toDateString()
  ).length;

  return (
    <div
      style={{
        maxWidth: '420px',
        margin: '0 auto',
        opacity: 0,
        animation: 'fadeIn 0.22s ease-out forwards',
      }}
    >
      <h1
        style={{
          fontFamily: '"Fraunces", serif',
          fontSize: '1.75rem',
          fontWeight: 500,
          color: 'var(--text-main)',
          marginBottom: '28px',
        }}
      >
        Pomodoro
      </h1>

      {/* Mode selector */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '5px',
          marginBottom: '36px',
        }}
      >
        {(['work', 'short', 'long'] as Mode[]).map(m => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            style={{
              flex: 1,
              padding: '8px 4px',
              borderRadius: '11px',
              border: 'none',
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: running ? 'not-allowed' : 'pointer',
              transition: 'all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
              background: mode === m ? color : 'transparent',
              color: mode === m ? (m === 'work' ? 'var(--bg-main)' : '#fff') : 'var(--text-muted)',
              opacity: running && mode !== m ? 0.4 : 1,
              transform: mode === m ? 'scale(1.03)' : 'scale(1)',
              boxShadow: mode === m ? `0 2px 12px ${color}44` : 'none',
            }}
          >
            {MODE_LABELS[m]}
          </button>
        ))}
      </div>

      {/* Timer ring */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '36px',
          position: 'relative',
        }}
      >
        {/* Glow */}
        <div
          style={{
            position: 'absolute',
            inset: '10px',
            borderRadius: '50%',
            background: `radial-gradient(circle at center, ${color}18 0%, transparent 70%)`,
            transition: 'background 0.6s ease',
            animation: running ? 'pomoPulse 2.4s ease-in-out infinite' : 'none',
          }}
        />

        <svg width="220" height="220" viewBox="0 0 220 220">
          <style>{`
            @keyframes pomoPulse {
              0%, 100% { opacity: 0.6; transform: scale(1); }
              50% { opacity: 1; transform: scale(1.04); }
            }
            @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes pomoRipple { from { transform: scale(0); opacity: 1; } to { transform: scale(2.5); opacity: 0; } }
          `}</style>

          {/* Track */}
          <circle cx="110" cy="110" r={R} fill="none" stroke="var(--border)" strokeWidth="8" />

          {/* Progress arc */}
          <circle
            cx="110" cy="110" r={R}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={CIRC - dash}
            transform="rotate(-90 110 110)"
            style={{
              transition: running
                ? 'stroke-dashoffset 1s linear, stroke 0.6s ease'
                : 'stroke-dashoffset 0.4s ease, stroke 0.6s ease',
            }}
          />

          {/* Dot on arc end */}
          {progress > 0.01 && progress < 0.99 && (() => {
            const angle = -Math.PI / 2 + 2 * Math.PI * progress;
            const x = 110 + R * Math.cos(angle);
            const y = 110 + R * Math.sin(angle);
            return (
              <circle
                cx={x} cy={y} r="5"
                fill={color}
                style={{ transition: 'all 1s linear, fill 0.6s ease' }}
              />
            );
          })()}
        </svg>

        {/* Center time display */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontFamily: '"Fraunces", serif',
              fontSize: '3.4rem',
              fontWeight: 400,
              color: 'var(--text-main)',
              letterSpacing: '-2px',
              lineHeight: 1,
              transition: 'color 0.3s ease',
            }}
          >
            {formatTime(timeLeft)}
          </div>
          <div
            style={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '0.72rem',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: color,
              marginTop: '6px',
              transition: 'color 0.6s ease',
            }}
          >
            {MODE_LABELS[mode]}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '14px',
          marginBottom: '36px',
        }}
      >
        {/* Reset */}
        <button
          onClick={handleReset}
          title="Reset"
          style={{ width: '44px', height: '44px', borderRadius: '50%', border: '1.5px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.18s ease', flexShrink: 0 }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-main)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--text-muted)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
        </button>

        {/* Play/Pause */}
        <button
          onClick={toggleRunning}
          style={{ width: '72px', height: '72px', borderRadius: '50%', border: 'none', background: color, color: mode === 'work' ? 'var(--bg-main)' : '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)', boxShadow: `0 4px 24px ${color}55`, flexShrink: 0, position: 'relative', overflow: 'hidden' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.08)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
        >
          {ripple && (
            <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(255,255,255,0.3)', animation: 'pomoRipple 0.6s ease-out forwards' }} />
          )}
          {running ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5.14v14l11-7-11-7z" />
            </svg>
          )}
        </button>

        {/* Skip */}
        <button
          onClick={handleSkip}
          title="Skip"
          style={{ width: '44px', height: '44px', borderRadius: '50%', border: '1.5px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.18s ease', flexShrink: 0 }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-main)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--text-muted)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M5.5 5l11 7-11 7V5z" />
            <rect x="18" y="5" width="2.5" height="14" rx="1" />
          </svg>
        </button>
      </div>

      {/* Pomodoro dots */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '36px' }}>
        {Array.from({ length: settings.longBreakInterval }).map((_, i) => {
          const filled = i < (pomodorosCompleted % settings.longBreakInterval);
          return (
            <div
              key={i}
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: filled ? MODE_COLORS.work : 'var(--border)',
                transition: 'background 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                transform: filled ? 'scale(1.2)' : 'scale(1)',
                boxShadow: filled ? `0 0 6px ${MODE_COLORS.work}88` : 'none',
              }}
            />
          );
        })}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {[
          { label: 'Today', value: todayPomodoros, unit: 'sessions' },
          { label: 'Total', value: pomodorosCompleted, unit: 'sessions' },
        ].map(({ label, value, unit }) => (
          <div key={label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '16px', textAlign: 'center' }}>
            <p style={{ fontFamily: '"Fraunces", serif', fontSize: '2rem', fontWeight: 400, color: 'var(--text-main)', lineHeight: 1, marginBottom: '4px' }}>
              {value}
            </p>
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
              {label} {unit}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};