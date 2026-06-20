import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, Restart, SkipNext } from '@solar-icons/react';
import { LONG_BREAK_INTERVAL, MODE_META } from '../constants/pomo';

export type PomoMode = 'work' | 'short' | 'long';

export interface PomoConfig {
  work: number;
  short: number;
  long: number;
}

const MOTIVATIONAL = [
  'Stay focused, you got this!',
  'Deep work starts now.',
  'One pomodoro at a time.',
  'Your future self will thank you.',
  'Small steps, big results.',
  'Breathe. Focus. Create.',
];

interface PomodoroPageProps {
  mode: PomoMode;
  secondsLeft: number;
  running: boolean;
  completedSessions: number;
  config: PomoConfig;
  celebrate: boolean;
  onToggleRunning: () => void;
  onReset: () => void;
  onSwitchMode: (m: PomoMode) => void;
  onSkipSession: () => void;
}

export default function PomodoroPage({
  mode, secondsLeft, running, completedSessions, config, celebrate,
  onToggleRunning, onReset, onSwitchMode, onSkipSession,
}: PomodoroPageProps) {
  const navigate = useNavigate();
  const [quote] = useState(() => MOTIVATIONAL[Math.floor(Math.random() * MOTIVATIONAL.length)]);

  const totalSeconds = config[mode] * 60;
  const progress = 1 - secondsLeft / totalSeconds;
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const meta = MODE_META[mode];

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
      </div>

      <div className={`pomo-container${celebrate ? ' pomo-celebrate' : ''}`} style={{ background: meta.bgGrad }}>
        <div className="pomo-deco">
          <span className="pomo-deco-circle pomo-deco-1" />
          <span className="pomo-deco-circle pomo-deco-2" />
          <span className="pomo-deco-circle pomo-deco-3" />
          <span className="pomo-deco-circle pomo-deco-4" />
          <span className="pomo-deco-circle pomo-deco-5" />
          <span className="pomo-deco-circle pomo-deco-6" />
          <span className="pomo-deco-circle pomo-deco-7" />
        </div>

        <div className="pomo-mode-tabs">
          {(['work', 'short', 'long'] as PomoMode[]).map((m) => (
            <button
              key={m}
              className={`pomo-tab${mode === m ? ' active' : ''}`}
              onClick={() => onSwitchMode(m)}
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
          <button className="pomo-btn pomo-btn-secondary" onClick={onReset} aria-label="Reset">
            <Restart size={22} strokeWidth={2} />
          </button>
          <button
            className={`pomo-btn pomo-btn-main${running ? ' running' : ''}`}
            onClick={onToggleRunning}
            aria-label={running ? 'Pause' : 'Start'}
            style={{ background: meta.color }}
          >
            {running ? <Pause size={32} strokeWidth={2.2} /> : <Play size={32} strokeWidth={2.2} className="pomo-play-icon" />}
          </button>
          <button className="pomo-btn pomo-btn-secondary" onClick={onSkipSession} aria-label="Skip">
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
    </>
  );
}
