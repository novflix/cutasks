import React from 'react';
import { Sun, Moon, CloudStorm } from '@solar-icons/react';
import type { Theme } from '../hooks/useTheme';

interface Props {
  theme: Theme;
  onThemeChange: (t: Theme) => void;
}

const THEMES: {
  value: Theme;
  label: string;
  description: string;
  Icon: React.FC<{ size?: number }>;
  preview: { bg: string; card: string; text: string; accent: string };
}[] = [
  {
    value: 'light',
    label: 'Light',
    description: 'Warm cream tones',
    Icon: Sun,
    preview: { bg: '#fdfaf5', card: '#ffffff', text: '#2d2824', accent: '#ed9b6d' },
  },
  {
    value: 'slate',
    label: 'Slate',
    description: 'Cool dark greys',
    Icon: CloudStorm,
    preview: { bg: '#0f1117', card: '#1a1d27', text: '#e2e8f0', accent: '#ed9b6d' },
  },
  {
    value: 'dark',
    label: 'Mocha',
    description: 'Warm dark browns',
    Icon: Moon,
    preview: { bg: '#1a1614', card: '#2d2824', text: '#f4e8d0', accent: '#ed9b6d' },
  },
];

const ThemePreview: React.FC<{ colors: typeof THEMES[0]['preview']; active: boolean }> = ({ colors, active }) => (
  <div style={{
    width: '100%',
    height: '54px',
    borderRadius: '10px',
    background: colors.bg,
    border: active ? `2px solid ${colors.accent}` : '2px solid transparent',
    padding: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    transition: 'border-color 0.15s',
    boxSizing: 'border-box',
  }}>
    {/* Fake header bar */}
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
      <div style={{ width: '14px', height: '6px', borderRadius: '3px', background: colors.accent, opacity: 0.9 }} />
      <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: colors.card, opacity: 0.6 }} />
    </div>
    {/* Fake card */}
    <div style={{
      flex: 1,
      borderRadius: '5px',
      background: colors.card,
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      padding: '0 5px',
    }}>
      <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: colors.accent }} />
      <div style={{ flex: 1, height: '3px', borderRadius: '2px', background: colors.text, opacity: 0.3 }} />
    </div>
  </div>
);

export const SettingsPage: React.FC<Props> = ({ theme, onThemeChange }) => {
  return (
    <div style={{
      maxWidth: '480px',
      margin: '0 auto',
      opacity: 0,
      animation: 'fadeIn 0.22s ease-out forwards',
    }}>
      <h1 style={{
        fontFamily: '"Fraunces", serif',
        fontSize: '1.75rem',
        fontWeight: 500,
        color: 'var(--text-main)',
        marginBottom: '24px',
      }}>
        Settings
      </h1>

      {/* Section: Appearance */}
      <section>
        <p style={{
          fontSize: '0.7rem',
          fontFamily: '"DM Sans", sans-serif',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--text-muted)',
          marginBottom: '10px',
        }}>
          Appearance
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          {THEMES.map(({ value, label, description, Icon, preview }) => {
            const active = theme === value;
            return (
              <button
                key={value}
                onClick={() => onThemeChange(value)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  padding: '12px',
                  borderRadius: '16px',
                  border: active
                    ? '2px solid var(--accent)'
                    : '2px solid var(--border)',
                  background: active ? 'var(--bg-panel)' : 'var(--bg-card)',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s, background 0.15s, transform 0.12s',
                  transform: active ? 'scale(1.02)' : 'scale(1)',
                  textAlign: 'left',
                }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.transform = 'scale(1.02)'; }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
              >
                <ThemePreview colors={preview} active={active} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{
                    color: active ? 'var(--accent)' : 'var(--text-muted)',
                    transition: 'color 0.15s',
                    display: 'flex',
                  }}>
                    <Icon size={14} />
                  </span>
                  <div>
                    <p style={{
                      fontFamily: '"DM Sans", sans-serif',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      color: active ? 'var(--text-main)' : 'var(--text-muted)',
                      lineHeight: 1.2,
                      transition: 'color 0.15s',
                    }}>
                      {label}
                    </p>
                    <p style={{
                      fontFamily: '"DM Sans", sans-serif',
                      fontSize: '0.65rem',
                      color: 'var(--text-muted)',
                      marginTop: '1px',
                      lineHeight: 1.2,
                    }}>
                      {description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};