import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from '@solar-icons/react';

export default function CalendarPage() {
  const navigate = useNavigate();

  return (
    <>
      <div className="page-hero">
        <button className="btn-icon" onClick={() => navigate('/home')}>
          <ArrowLeft size={22} />
        </button>
        <h1 className="page-hero-title">Calendar</h1>
      </div>
      <main className="main">
        <div className="empty">
          <p className="empty-title">Coming soon</p>
          <p className="empty-sub">Calendar view is under development</p>
        </div>
      </main>
    </>
  );
}
