import './skeletons.css';

export default function ProjectDetailSkeleton() {
  return (
    <div className="sk">
      {/* Project header */}
      <div className="sk-project-detail-header">
        <div className="sk-hero-back sk-delay-1" />
        <div className="sk-pd-icon sk-delay-1" />
        <div className="sk-pd-info">
          <div className="sk-pd-name sk-delay-2" />
          <div className="sk-pd-desc sk-delay-3" />
        </div>
      </div>

      {/* Stats row */}
      <div className="sk-stats">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`sk-stat-pill sk-delay-${i + 2}`}>
            <div className="sk-stat-dot" />
            <div className="sk-stat-text" />
          </div>
        ))}
        <div className="sk-add-btn sk-delay-6">
          <div className="sk-add-btn-icon" />
          <div className="sk-add-btn-text" />
        </div>
      </div>

      {/* Search bar */}
      <div className="sk-search sk-delay-6">
        <div className="sk-search-icon" />
        <div className="sk-search-input" />
      </div>

      {/* Task list */}
      <div className="sk-task-list">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={`sk-task-row sk-delay-${i + 3}`}>
            <div className="sk-task-check" />
            <div className="sk-task-body">
              <div className="sk-task-title" />
              <div className="sk-task-desc" />
              <div className="sk-task-tags">
                <div className="sk-tag sk-delay-7" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
