import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from '@solar-icons/react';

export default function HabitsPage() {
  const navigate = useNavigate();

  return (
    <>
      <div className="page-hero">
        <button className="btn-icon" onClick={() => navigate('/home')}>
          <ArrowLeft size={22} />
        </button>
        <h1 className="page-hero-title">Habits</h1>
      </div>
      <div className="empty">
        <div className="coming-soon-icon coming-soon-habits">
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
            <circle cx="28" cy="28" r="24" stroke="var(--primary)" strokeWidth="2" strokeDasharray="6 4" />
            <path d="M28 16v12l8 4" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="28" cy="28" r="4" fill="var(--primary)" opacity="0.2" />
            <circle cx="28" cy="28" r="4" stroke="var(--primary)" strokeWidth="2" fill="none" />
          </svg>
        </div>
        <p className="empty-title">Coming soon</p>
        <p className="empty-sub">Track daily habits and build streaks</p>
      </div>
    </>
  );
}
