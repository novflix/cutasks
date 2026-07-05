import './skeletons.css';

export default function CalendarSkeleton() {
  return (
    <div className="sk">
      {/* Hero */}
      <div className="sk-hero">
        <div className="sk-hero-back sk-delay-1" />
        <div className="sk-hero-title sk-delay-1" />
      </div>

      {/* Controls */}
      <div className="sk-cal-controls sk-delay-2">
        <div className="sk-cal-mode-toggle">
          <div className="sk-cal-mode-btn sk-delay-3" />
          <div className="sk-cal-mode-btn sk-delay-4" />
        </div>
        <div className="sk-cal-nav">
          <div className="sk-cal-nav-arrow sk-delay-3" />
          <div className="sk-cal-nav-label sk-delay-4" />
          <div className="sk-cal-nav-arrow sk-delay-3" />
        </div>
      </div>

      {/* Week row */}
      <div className="sk-cal-week">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className={`sk-cal-day sk-delay-${i}`}>
            <div className="sk-cal-day-name" />
            <div className={`sk-cal-day-pill${i === 3 ? ' sk-cal-day-pill--today' : ''}`} />
          </div>
        ))}
      </div>

      {/* Date label */}
      <div className="sk-cal-date-label sk-delay-4">
        <div className="sk-cal-date-text" />
        <div className="sk-cal-date-count" />
      </div>

      {/* Task list */}
      <div className="sk-task-list">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`sk-task-row sk-delay-${i + 4}`}>
            <div className="sk-task-check" />
            <div className="sk-task-body">
              <div className="sk-task-title" />
              <div className="sk-task-desc" />
              <div className="sk-task-tags">
                <div className="sk-tag sk-delay-7" />
                <div className="sk-tag sk-delay-8" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
