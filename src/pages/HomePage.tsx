import { HomeSmile } from '@solar-icons/react';

export default function HomePage() {
  return (
    <>
      <div className="page-hero">
        <h1 className="page-hero-title">Home</h1>
      </div>
      <div className="empty">
        <HomeSmile size={56} className="empty-icon" />
        <p className="empty-sub">Coming soon</p>
      </div>
    </>
  );
}
