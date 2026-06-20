import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <>
      <div className="page-hero">
        <h1 className="page-hero-title">Home</h1>
      </div>
      <div className="home-banners">
        <button className="banner-card banner-habits" onClick={() => navigate('/habits')}>
          <div className="banner-visual banner-visual-habits">
            <svg className="banner-deco" width="100%" height="100%" viewBox="0 0 200 120" fill="none" preserveAspectRatio="none">
              <circle cx="170" cy="20" r="40" fill="rgba(255,255,255,0.06)" />
              <circle cx="180" cy="90" r="25" fill="rgba(255,255,255,0.04)" />
              <circle cx="30" cy="100" r="35" fill="rgba(255,255,255,0.05)" />
              <rect x="10" y="10" width="6" height="6" rx="1.5" fill="rgba(255,255,255,0.08)" />
              <rect x="160" y="60" width="4" height="4" rx="1" fill="rgba(255,255,255,0.1)" />
              <rect x="90" y="15" width="5" height="5" rx="1" fill="rgba(255,255,255,0.07)" />
            </svg>
            <div className="banner-bubbles">
              <span className="bubble bubble-1" />
              <span className="bubble bubble-2" />
              <span className="bubble bubble-3" />
              <span className="bubble bubble-4" />
              <span className="bubble bubble-5" />
            </div>
            <div className="banner-icon-big">
              <img src="/icons/habits.svg" alt="" width="44" height="44" />
            </div>
          </div>
          <div className="banner-content">
            <h2 className="banner-title">Habits</h2>
            <p className="banner-desc">Build streaks, track daily routines, and become better every day</p>
            <div className="banner-arrow">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10m0 0L9 4m4 4L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </button>

        <button className="banner-card banner-pomodoro" onClick={() => navigate('/pomodoro')}>
          <div className="banner-visual banner-visual-pomodoro">
            <svg className="banner-deco" width="100%" height="100%" viewBox="0 0 200 120" fill="none" preserveAspectRatio="none">
              <circle cx="160" cy="30" r="35" fill="rgba(255,255,255,0.05)" />
              <circle cx="40" cy="90" r="30" fill="rgba(255,255,255,0.04)" />
              <circle cx="120" cy="100" r="20" fill="rgba(255,255,255,0.06)" />
              <rect x="80" y="20" width="5" height="5" rx="1" fill="rgba(255,255,255,0.09)" />
              <rect x="150" y="80" width="4" height="4" rx="1" fill="rgba(255,255,255,0.08)" />
              <rect x="20" y="30" width="3" height="3" rx="0.75" fill="rgba(255,255,255,0.07)" />
            </svg>
            <div className="banner-bubbles">
              <span className="bubble bubble-1" />
              <span className="bubble bubble-2" />
              <span className="bubble bubble-3" />
              <span className="bubble bubble-4" />
              <span className="bubble bubble-5" />
            </div>
            <div className="banner-icon-big">
              <img src="/icons/timer.svg" alt="" width="44" height="44" />
            </div>
          </div>
          <div className="banner-content">
            <h2 className="banner-title">Pomodoro Timer</h2>
            <p className="banner-desc">Stay focused with timed work sessions and short breaks</p>
            <div className="banner-arrow">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10m0 0L9 4m4 4L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </button>

        <button className="banner-card banner-calendar" onClick={() => navigate('/calendar')}>
          <div className="banner-visual banner-visual-calendar">
            <svg className="banner-deco" width="100%" height="100%" viewBox="0 0 200 120" fill="none" preserveAspectRatio="none">
              <circle cx="150" cy="25" r="38" fill="rgba(255,255,255,0.05)" />
              <circle cx="30" cy="80" r="28" fill="rgba(255,255,255,0.04)" />
              <circle cx="100" cy="105" r="22" fill="rgba(255,255,255,0.06)" />
              <rect x="60" y="15" width="5" height="5" rx="1" fill="rgba(255,255,255,0.08)" />
              <rect x="170" y="70" width="4" height="4" rx="1" fill="rgba(255,255,255,0.07)" />
              <rect x="10" y="40" width="3" height="3" rx="0.75" fill="rgba(255,255,255,0.09)" />
            </svg>
            <div className="banner-bubbles banner-bubbles-calendar">
              <span className="cal-dot cal-dot-1" />
              <span className="cal-dot cal-dot-2" />
              <span className="cal-dot cal-dot-3" />
              <span className="cal-dot cal-dot-4" />
              <span className="cal-dot cal-dot-5" />
              <span className="cal-dot cal-dot-6" />
              <span className="cal-dot cal-dot-7" />
            </div>
            <div className="banner-icon-big">
              <img src="/icons/calendar.svg" alt="" width="44" height="44" />
            </div>
          </div>
          <div className="banner-content">
            <h2 className="banner-title">Calendar</h2>
            <p className="banner-desc">View your schedule and plan ahead at a glance</p>
            <div className="banner-arrow">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10m0 0L9 4m4 4L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </button>
      </div>
    </>
  );
}
