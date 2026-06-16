import { useState, useEffect } from 'react';
import { Logout } from '@solar-icons/react';
import { logout } from '../services/auth';
import { useAuth } from '../contexts/AuthContext';

interface ThemeOption {
  id: string;
  name: string;
  bg: string;
  card: string;
  elevated: string;
  text: string;
  textMuted: string;
  accent: string;
}

const themes: ThemeOption[] = [
  { id: 'dark', name: 'Dark', bg: '#121212', card: '#1e1e1e', elevated: '#252525', text: '#f0f0f0', textMuted: '#555555', accent: '#ed9b6d' },
  { id: 'light', name: 'Light', bg: '#f5f5f5', card: '#ffffff', elevated: '#fafafa', text: '#1a1a1a', textMuted: '#aaaaaa', accent: '#ed9b6d' },
  { id: 'midnight', name: 'Midnight', bg: '#0d1117', card: '#161b22', elevated: '#1c2128', text: '#e6edf3', textMuted: '#484f58', accent: '#ed9b6d' },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTheme, setActiveTheme] = useState<string>(() => {
    return localStorage.getItem('cutasks_theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', activeTheme);
    localStorage.setItem('cutasks_theme', activeTheme);
  }, [activeTheme]);

  return (
    <div className="settings-page">
      <div className="page-hero">
        <h1 className="page-hero-title">Settings</h1>
      </div>

      <div className="settings-section">
        <span className="settings-section-label">Theme</span>

        <div className="theme-cards">
          {themes.map((theme) => (
            <button
              key={theme.id}
              className={`theme-card${activeTheme === theme.id ? ' active' : ''}`}
              onClick={() => setActiveTheme(theme.id)}
            >
              <div className="theme-card-preview">
                <div className="theme-card-sidebar-col" style={{ background: theme.card }}>
                  <div className="theme-card-sidebar-icon" style={{ background: theme.accent }} />
                  <div className="theme-card-sidebar-pill" style={{ background: theme.text, opacity: 0.3 }} />
                  <div className="theme-card-sidebar-pill" style={{ background: theme.text, opacity: 0.15 }} />
                  <div className="theme-card-sidebar-pill" style={{ background: theme.text, opacity: 0.15 }} />
                </div>
                <div className="theme-card-content-col" style={{ background: theme.bg }}>
                  <div className="theme-card-content-bar w80" style={{ background: theme.text, opacity: 0.7 }} />
                  <div className="theme-card-content-bar w60" style={{ background: theme.textMuted }} />
                  <div className="theme-card-content-bar w40" style={{ background: theme.textMuted, opacity: 0.5 }} />
                  <div className="theme-card-content-accent" style={{ background: theme.accent }} />
                </div>
              </div>
              <div className="theme-card-body">
                <span className="theme-card-label">{theme.name}</span>
                <div className="theme-card-dot" />
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="settings-section">
        <span className="settings-section-label">Info</span>
        <div className="settings-footer">
          <span className="settings-footer-label">Version</span>
          <span className="settings-footer-value">1.0.0</span>
        </div>
      </div>

      {user && (
        <div className="settings-section">
          <span className="settings-section-label">Account</span>
          <div className="settings-footer">
            <span className="settings-footer-label">{user.displayName || user.email}</span>
            <button className="btn btn-secondary settings-logout-btn" onClick={logout}>
              <Logout size={16} />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
