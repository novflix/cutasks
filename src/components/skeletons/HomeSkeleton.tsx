import './skeletons.css';

export default function HomeSkeleton() {
  return (
    <div className="sk">
      {/* Dashboard Card */}
      <div className="sk-dash-card">
        <div className="sk-dash-deco">
          <div className="sk-dash-deco-circle" />
          <div className="sk-dash-deco-circle" />
          <div className="sk-dash-deco-circle" />
        </div>

        <div className="sk-dash-header">
          <div className="sk-dash-text">
            <div className="sk-dash-greeting sk-delay-1" />
            <div className="sk-dash-sub sk-delay-2" />
          </div>
          <div className="sk-dash-ring">
            <div className="sk-dash-ring-inner sk-delay-1" />
            <div className="sk-dash-ring-num sk-delay-2" />
          </div>
        </div>

        <div className="sk-dash-stats">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`sk-dash-stat sk-delay-${i}`}>
              <div className="sk-dash-stat-icon" />
              <div className="sk-dash-stat-info">
                <div className="sk-dash-stat-num" />
                <div className="sk-dash-stat-label" />
              </div>
            </div>
          ))}
        </div>

        <div className="sk-dash-bottom">
          <div className="sk-dash-bottom-item sk-delay-5">
            <div className="sk-dash-bottom-icon" />
            <div className="sk-dash-bottom-text" />
          </div>
          <div className="sk-dash-bottom-item sk-delay-6">
            <div className="sk-dash-bottom-icon" />
            <div className="sk-dash-bottom-text" />
          </div>
        </div>
      </div>

      {/* Banner Cards */}
      <div className="sk-banners">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`sk-banner sk-delay-${i + 3}`}>
            <div className="sk-banner-visual">
              <div className="sk-banner-visual-deco">
                <div className="sk-banner-visual-circle" />
                <div className="sk-banner-visual-circle" />
              </div>
            </div>
            <div className="sk-banner-content">
              <div className="sk-banner-title" />
              <div className="sk-banner-desc" />
              <div className="sk-banner-arrow" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
