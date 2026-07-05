import './skeletons.css';

export default function ProjectsSkeleton() {
  return (
    <div className="sk">
      {/* Hero title */}
      <div className="sk-hero">
        <div className="sk-hero-title sk-delay-1" />
      </div>

      {/* Stats row */}
      <div className="sk-stats">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`sk-stat-pill sk-delay-${i}`}>
            <div className="sk-stat-dot" />
            <div className="sk-stat-text" />
          </div>
        ))}
        <div className="sk-add-btn sk-delay-5">
          <div className="sk-add-btn-icon" />
          <div className="sk-add-btn-text" />
        </div>
      </div>

      {/* Search bar */}
      <div className="sk-search sk-delay-5">
        <div className="sk-search-icon" />
        <div className="sk-search-input" />
      </div>

      {/* Project card grid */}
      <div className="sk-projects-grid">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`sk-project-card sk-delay-${i}`}>
            <div className="sk-project-top">
              <div className="sk-project-icon" />
              <div className="sk-project-name" />
            </div>
            <div className="sk-project-desc-lines">
              <div className="sk-bar sk-bar--lg sk-delay-5" />
              <div className="sk-bar sk-bar--md sk-delay-6" />
            </div>
            <div className="sk-project-footer">
              <div className="sk-project-badge" />
              <div className="sk-project-date" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
