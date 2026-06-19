import { useNavigate } from 'react-router-dom';
import { Play, Pause } from '@solar-icons/react';
import type { PomoMode } from '../pages/PomodoroPage';
import { MODE_META } from '../pages/PomodoroPage';

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
    <div className="pomo-mini" onClick={() => navigate('/pomodoro')}>
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
          style={{ color: meta.color }}
        >
          {running ? <Pause size={16} strokeWidth={2.2} /> : <Play size={16} strokeWidth={2.2} />}
        </button>
      </div>
    </div>
  );
}
