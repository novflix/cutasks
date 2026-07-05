import './skeletons.css';

export default function PomodoroSkeleton() {
  return (
    <div className="sk">
      {/* Hero */}
      <div className="sk-hero">
        <div className="sk-hero-back sk-delay-1" />
        <div className="sk-hero-title sk-delay-1" />
      </div>

      {/* Pomodoro container */}
      <div className="sk-pomo-container sk-delay-2">
        {/* Mode tabs */}
        <div className="sk-pomo-tabs">
          <div className="sk-pomo-tab sk-delay-3" />
          <div className="sk-pomo-tab sk-delay-4" />
          <div className="sk-pomo-tab sk-delay-5" />
        </div>

        {/* Timer ring */}
        <div className="sk-pomo-ring-wrap">
          <div className="sk-pomo-ring-bg" />
          <div className="sk-pomo-ring-progress sk-delay-3" />
          <div className="sk-pomo-time">
            <div className="sk-pomo-time-text sk-delay-4" />
            <div className="sk-pomo-time-label sk-delay-5" />
          </div>
        </div>

        {/* Controls */}
        <div className="sk-pomo-controls">
          <div className="sk-pomo-btn-secondary sk-delay-6" />
          <div className="sk-pomo-btn-main sk-delay-7" />
          <div className="sk-pomo-btn-secondary sk-delay-6" />
        </div>

        {/* Quote */}
        <div className="sk-pomo-quote sk-delay-8" />

        {/* Session dots */}
        <div className="sk-pomo-sessions">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`sk-pomo-dot sk-delay-${i + 7}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
