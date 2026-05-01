import React from 'react';
import { Sun, Moon } from '@solar-icons/react';

interface Props {
  dark: boolean;
  onToggle: () => void;
}

export const SettingsPage: React.FC<Props> = ({ dark, onToggle }) => {
  return (
    <div
      style={{
        maxWidth: '480px',
        margin: '0 auto',
        opacity: 0,
        animation: 'fadeIn 0.22s ease-out forwards',
      }}
    >
      <h1
        style={{
          fontFamily: '"Fraunces", serif',
          fontSize: '1.75rem',
          fontWeight: 500,
          color: 'var(--text-main)',
          marginBottom: '24px',
        }}
      >
        Settings
      </h1>

      {/* Section: Appearance */}
      <section>
        <p
          style={{
            fontSize: '0.7rem',
            fontFamily: '"DM Sans", sans-serif',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--text-muted)',
            marginBottom: '8px',
          }}
        >
          Appearance
        </p>

        <div
          style={{
            background: 'var(--bg-card)',
            border: '1.5px solid var(--border)',
            borderRadius: '18px',
            overflow: 'hidden',
          }}
        >
          {/* Theme row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '11px',
                  background: 'var(--bg-panel)',
                  border: '1.5px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                }}
              >
                {dark ? <Moon size={17} /> : <Sun size={17} />}
              </div>
              <div>
                <p
                  style={{
                    fontFamily: '"DM Sans", sans-serif',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    color: 'var(--text-main)',
                    lineHeight: 1.2,
                  }}
                >
                  Dark mode
                </p>
                <p
                  style={{
                    fontFamily: '"DM Sans", sans-serif',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    marginTop: '2px',
                  }}
                >
                  {dark ? 'Currently dark' : 'Currently light'}
                </p>
              </div>
            </div>

            {/* Toggle switch */}
            <button
              onClick={onToggle}
              aria-label="Toggle dark mode"
              style={{
                width: '44px',
                height: '26px',
                borderRadius: '13px',
                border: 'none',
                background: dark ? 'var(--accent)' : 'var(--border)',
                cursor: 'pointer',
                position: 'relative',
                transition: 'background 0.22s cubic-bezier(0.23,1,0.32,1)',
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: '3px',
                  left: dark ? '21px' : '3px',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: 'white',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                  transition: 'left 0.22s cubic-bezier(0.23,1,0.32,1)',
                }}
              />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};