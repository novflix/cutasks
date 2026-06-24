import './Skeleton.css';

interface SkeletonProps {
  lines?: number;
  type?: 'text' | 'card' | 'task' | 'stat';
}

export default function Skeleton({ lines = 3, type = 'text' }: SkeletonProps) {
  if (type === 'task') {
    return (
      <div className="skeleton-list">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="skeleton-task">
            <div className="skeleton-check" />
            <div className="skeleton-task-body">
              <div className="skeleton-line skeleton-line-title" />
              <div className="skeleton-line skeleton-line-short" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className="skeleton-grid">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="skeleton-card">
            <div className="skeleton-card-header">
              <div className="skeleton-icon" />
              <div className="skeleton-line skeleton-line-medium" />
            </div>
            <div className="skeleton-line skeleton-line-short" />
            <div className="skeleton-line skeleton-line-full" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'stat') {
    return (
      <div className="skeleton-stats">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="skeleton-stat">
            <div className="skeleton-line skeleton-line-tiny" />
            <div className="skeleton-line skeleton-line-medium" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="skeleton-text">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`skeleton-line ${i === lines - 1 ? 'skeleton-line-short' : 'skeleton-line-full'}`}
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  );
}
