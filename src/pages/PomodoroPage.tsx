import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from '@solar-icons/react';

export default function PomodoroPage() {
  const navigate = useNavigate();

  return (
    <>
      <div className="page-hero">
        <button className="btn-icon" onClick={() => navigate('/home')}>
          <ArrowLeft size={22} />
        </button>
        <h1 className="page-hero-title">Pomodoro Timer</h1>
      </div>
      <div className="empty">
        <div className="coming-soon-icon coming-soon-pomodoro">
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
            <circle cx="28" cy="30" r="18" stroke="var(--primary)" strokeWidth="2" />
            <line x1="28" y1="30" x2="28" y2="18" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="28" y1="30" x2="36" y2="30" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" />
            <line x1="28" y1="8" x2="28" y2="12" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" />
            <line x1="18" y1="9" x2="19.5" y2="12.5" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" />
            <line x1="38" y1="9" x2="36.5" y2="12.5" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" />
            <circle cx="28" cy="30" r="2" fill="var(--primary)" />
          </svg>
        </div>
        <p className="empty-title">Coming soon</p>
        <p className="empty-sub">Focus with timed work sessions</p>
      </div>
    </>
  );
}
