import React from 'react';
import { CalendarMinimalistic } from '@solar-icons/react';

export const CalendarPage: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: '16px',
        opacity: 0,
        animation: 'fadeIn 0.22s ease-out forwards',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '20px',
          background: 'var(--bg-panel)',
          border: '1.5px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
        }}
      >
        <CalendarMinimalistic size={28} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <p
          style={{
            fontFamily: '"Fraunces", serif',
            fontSize: '1.25rem',
            fontWeight: 500,
            color: 'var(--text-main)',
            marginBottom: '6px',
          }}
        >
          Calendar
        </p>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontFamily: '"DM Sans", sans-serif' }}>
          Coming soon — your tasks on a timeline.
        </p>
      </div>
    </div>
  );
};