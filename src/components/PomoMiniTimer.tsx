import { useNavigate } from 'react-router-dom';
import type { PomoMode } from '../pages/PomodoroPage';
import { MODE_META } from '../constants/pomo';

interface PomoMiniTimerProps {
  mode: PomoMode;
  secondsLeft: number;
  running: boolean;
  onToggleRunning: () => void;
}

export default function PomoMiniTimer({ mode, secondsLeft, running, onToggleRunning }: PomoMiniTimerProps) {
  const navigate = useNavigate();
  const meta = MODE_META[mode];
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const time = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div
      className="pomo-mini"
      onClick={() => navigate('/pomodoro')}
      style={{ borderColor: meta.color }}
    >
      <div className="pomo-mini-left">
        <span className="pomo-mini-dot" style={{ background: meta.color }} />
        <span className="pomo-mini-mode">{meta.label}</span>
      </div>
      <div className="pomo-mini-right">
        <span className="pomo-mini-time" style={{ color: meta.color }}>{time}</span>
        <button
          className="pomo-mini-btn"
          onClick={(e) => { e.stopPropagation(); onToggleRunning(); }}
          aria-label={running ? 'Pause' : 'Start'}
          style={{ background: meta.color }}
        >
          {running ? (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <rect x="2" y="1" width="3.5" height="12" rx="1" />
              <rect x="8.5" y="1" width="3.5" height="12" rx="1" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <path d="M3 1.5v11l9-5.5z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
