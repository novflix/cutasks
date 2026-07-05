import './skeletons.css';

export default function HabitsSkeleton() {
  return (
    <div className="sk">
      {/* Hero */}
      <div className="sk-hero">
        <div className="sk-hero-back sk-delay-1" />
        <div className="sk-hero-title sk-delay-1" />
      </div>

      {/* Week navigation */}
      <div className="sk-habits-week-nav sk-delay-2">
        <div className="sk-habits-week-center">
          <div className="sk-habits-arrow" />
          <div className="sk-habits-date-range" />
          <div className="sk-habits-arrow" />
        </div>
        <div className="sk-habits-add" />
      </div>

      {/* Calendar day row */}
      <div className="sk-habits-cal">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className={`sk-habits-day sk-delay-${i}`}>
            <div className="sk-habits-day-name" />
            <div className="sk-habits-day-pill" />
          </div>
        ))}
      </div>

      {/* Date label */}
      <div className="sk-habits-date-label sk-delay-3" />

      {/* Habit items */}
      <div className="sk-habits-list">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`sk-habit-row sk-delay-${i + 3}`}>
            <div className="sk-habit-handle">
              {[1, 2, 3].map((j) => (
                <div key={j} className="sk-habit-dot" />
              ))}
            </div>
            <div className="sk-habit-check" />
            <div className="sk-habit-body">
              <div className="sk-habit-icon" />
              <div className="sk-habit-name" />
            </div>
            <div className="sk-habit-streak" />
          </div>
        ))}
      </div>
    </div>
  );
}
