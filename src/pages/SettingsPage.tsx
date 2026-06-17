import { useState, useEffect } from 'react';
import { Logout } from '@solar-icons/react';
import { logout } from '../services/auth';
import { saveSettings } from '../services/firestore';
import { useAuth } from '../contexts/AuthContext';

type DeleteMode = 'instant' | '3days' | '7days';

const DELETE_OPTIONS: { value: DeleteMode; label: string; desc: string }[] = [
  { value: 'instant', label: 'Immediately', desc: 'Delete right after completion' },
  { value: '3days', label: 'After 3 days', desc: 'Keep for 3 days, then remove' },
  { value: '7days', label: 'After 7 days', desc: 'Keep for a week, then remove' },
];

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

function getInitials(name: string | null | undefined, email: string | null | undefined): string {
  const source = name || email || '?';
  const parts = source.split(/[@\s]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

function hashColor(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  const colors = ['#ed9b6d', '#66bb6a', '#64b5f6', '#ba68c8', '#ffb74d', '#4db6ac', '#e57373', '#9575cd'];
  return colors[Math.abs(h) % colors.length];
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTheme, setActiveTheme] = useState<string>(() => {
    return localStorage.getItem('cutasks_theme') || 'dark';
  });
  const [deleteMode, setDeleteMode] = useState<DeleteMode>(() => {
    return (localStorage.getItem('cutasks_delete_mode') as DeleteMode) || 'instant';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', activeTheme);
    localStorage.setItem('cutasks_theme', activeTheme);
    if (user) saveSettings(user.uid, { theme: activeTheme, deleteMode }).catch(() => {});
  }, [activeTheme, deleteMode, user]);

  useEffect(() => {
    localStorage.setItem('cutasks_delete_mode', deleteMode);
    if (user) saveSettings(user.uid, { theme: activeTheme, deleteMode }).catch(() => {});
  }, [deleteMode, activeTheme, user]);

  const initials = user ? getInitials(user.displayName, user.email) : '?';
  const avatarColor = user ? hashColor(user.email || user.displayName || '') : '#ed9b6d';

  return (
    <div className="settings-page">
      <div className="page-hero">
        <h1 className="page-hero-title">Settings</h1>
      </div>

      {user && (
        <div className="settings-section">
          <div className="account-card">
            <div className="account-avatar" style={{ background: `${avatarColor}20`, color: avatarColor }}>
              <span className="account-avatar-text">{initials}</span>
            </div>
            <div className="account-info">
              <span className="account-name">{user.displayName || 'User'}</span>
              <span className="account-email">{user.email}</span>
            </div>
            <button className="account-logout" onClick={logout} title="Sign out">
              <Logout size={18} />
            </button>
          </div>
        </div>
      )}

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
        <span className="settings-section-label">Completed tasks</span>
        <div className="delete-options">
          {DELETE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`delete-option${deleteMode === opt.value ? ' active' : ''}`}
              onClick={() => setDeleteMode(opt.value)}
            >
              <div className="delete-option-radio">
                <div className="delete-option-dot" />
              </div>
              <div className="delete-option-info">
                <span className="delete-option-label">{opt.label}</span>
                <span className="delete-option-desc">{opt.desc}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="settings-section">
        <span className="settings-section-label">Info</span>
        <div className="settings-footer">
          <span className="settings-footer-label">Version</span>
          <span className="settings-footer-value">0.1.0</span>
        </div>
      </div>
    </div>
  );
}
