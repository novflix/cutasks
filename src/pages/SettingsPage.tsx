import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logout, Key, CheckCircle, CloseCircle, TrashBinMinimalistic, Pen, Earth } from '@solar-icons/react';
import { logout, changePassword, deleteAccount, updateDisplayName } from '../services/auth';
import { saveSettings } from '../services/firestore';
import { useAuth } from '../contexts/AuthContext';
import type { PomoConfig } from './PomodoroPage';
import { DEFAULT_POMO_CONFIG } from '../constants/pomo';

type DeleteMode = 'instant' | '3days' | '7days';
type WeekStartDay = 'monday' | 'saturday';

const POMO_STORAGE = 'cutasks_pomodoro';

const DELETE_OPTIONS: { value: DeleteMode; label: string; desc: string }[] = [
  { value: 'instant', label: 'Immediately', desc: 'Delete right after completion' },
  { value: '3days', label: 'After 3 days', desc: 'Keep for 3 days, then remove' },
  { value: '7days', label: 'After 7 days', desc: 'Keep for a week, then remove' },
];

const WEEK_START_OPTIONS: { value: WeekStartDay; label: string; desc: string }[] = [
  { value: 'monday', label: 'Monday', desc: 'Week starts on Monday' },
  { value: 'saturday', label: 'Saturday', desc: 'Week starts on Saturday' },
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
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTheme, setActiveTheme] = useState<string>(() => {
    return localStorage.getItem('cutasks_theme') || 'dark';
  });
  const [deleteMode, setDeleteMode] = useState<DeleteMode>(() => {
    return (localStorage.getItem('cutasks_delete_mode') as DeleteMode) || 'instant';
  });
  const [weekStartDay, setWeekStartDay] = useState<WeekStartDay>(() => {
    return (localStorage.getItem('cutasks_week_start') as WeekStartDay) || 'monday';
  });
  const [pomoConfig, setPomoConfig] = useState<PomoConfig>(() => {
    try { const r = localStorage.getItem(POMO_STORAGE); return r ? { ...DEFAULT_POMO_CONFIG, ...JSON.parse(r) } : DEFAULT_POMO_CONFIG; } catch { return DEFAULT_POMO_CONFIG; }
  });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordModalClosing, setPasswordModalClosing] = useState(false);
  const passwordModalTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteModalClosing, setDeleteModalClosing] = useState(false);
  const deleteModalTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [nameModalClosing, setNameModalClosing] = useState(false);
  const nameModalTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [nameError, setNameError] = useState('');
  const [nameSuccess, setNameSuccess] = useState(false);
  const [nameLoading, setNameLoading] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', activeTheme);
    localStorage.setItem('cutasks_theme', activeTheme);
    if (user) saveSettings(user.uid, { theme: activeTheme, deleteMode, weekStart: weekStartDay }).catch(() => {});
  }, [activeTheme, deleteMode, weekStartDay, user]);

  useEffect(() => {
    localStorage.setItem('cutasks_delete_mode', deleteMode);
    localStorage.setItem('cutasks_week_start', weekStartDay);
    window.dispatchEvent(new CustomEvent('week-start-changed', { detail: weekStartDay }));
    if (user) saveSettings(user.uid, { theme: activeTheme, deleteMode, weekStart: weekStartDay }).catch(() => {});
  }, [deleteMode, weekStartDay, activeTheme, user]);

  useEffect(() => {
    localStorage.setItem(POMO_STORAGE, JSON.stringify(pomoConfig));
    window.dispatchEvent(new CustomEvent('pomo-config-changed', { detail: pomoConfig }));
  }, [pomoConfig]);

  function openPasswordModal() {
    setPasswordModalClosing(false);
    setShowPasswordModal(true);
    setPasswordError('');
    setPasswordSuccess(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  }

  function closePasswordModal() {
    setPasswordModalClosing(true);
    passwordModalTimer.current = setTimeout(() => {
      setShowPasswordModal(false);
      setPasswordModalClosing(false);
      setPasswordError('');
      setPasswordSuccess(false);
    }, 200);
  }

  const initials = user ? getInitials(user.displayName, user.email) : '?';
  const avatarColor = user ? hashColor(user.email || user.displayName || '') : '#ed9b6d';

  async function handleChangePassword() {
    setPasswordError('');
    setPasswordSuccess(false);
    if (!currentPassword || !newPassword) {
      setPasswordError('Fill in all fields');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    setPasswordLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => closePasswordModal(), 1500);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to change password';
      if (msg.includes('wrong-password') || msg.includes('invalid-credential')) {
        setPasswordError('Current password is incorrect');
      } else if (msg.includes('weak-password')) {
        setPasswordError('New password is too weak');
      } else {
        setPasswordError('Failed to change password');
      }
    } finally {
      setPasswordLoading(false);
    }
  }

  function openDeleteModal() {
    setDeleteModalClosing(false);
    setShowDeleteModal(true);
    setDeleteError('');
    setDeletePassword('');
  }

  function closeDeleteModal() {
    setDeleteModalClosing(true);
    deleteModalTimer.current = setTimeout(() => {
      setShowDeleteModal(false);
      setDeleteModalClosing(false);
      setDeleteError('');
      setDeletePassword('');
    }, 200);
  }

  async function handleDeleteAccount() {
    setDeleteError('');
    if (!deletePassword) {
      setDeleteError('Enter your password to confirm');
      return;
    }
    setDeleteLoading(true);
    try {
      await deleteAccount(deletePassword);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to delete account';
      if (msg.includes('wrong-password') || msg.includes('invalid-credential')) {
        setDeleteError('Incorrect password');
      } else {
        setDeleteError('Failed to delete account');
      }
    } finally {
      setDeleteLoading(false);
    }
  }

  function openNameModal() {
    setNameModalClosing(false);
    setShowNameModal(true);
    setNewDisplayName(user?.displayName || '');
    setNameError('');
    setNameSuccess(false);
  }

  function closeNameModal() {
    setNameModalClosing(true);
    nameModalTimer.current = setTimeout(() => {
      setShowNameModal(false);
      setNameModalClosing(false);
      setNameError('');
      setNameSuccess(false);
    }, 200);
  }

  async function handleUpdateName() {
    setNameError('');
    setNameSuccess(false);
    const trimmed = newDisplayName.trim();
    if (!trimmed) {
      setNameError('Name cannot be empty');
      return;
    }
    if (trimmed === (user?.displayName || '')) {
      closeNameModal();
      return;
    }
    setNameLoading(true);
    try {
      await updateDisplayName(trimmed);
      setNameSuccess(true);
      setTimeout(() => closeNameModal(), 1500);
    } catch {
      setNameError('Failed to update name');
    } finally {
      setNameLoading(false);
    }
  }

  return (
    <div className="settings-page">
      <div className="page-hero">
        <h1 className="page-hero-title">Settings</h1>
      </div>

      {user && (
        <div className="settings-section">
          <span className="settings-section-label">Account</span>
          <div className="account-card">
            <div className="account-avatar" style={{ background: `${avatarColor}20`, color: avatarColor }}>
              <span className="account-avatar-text">{initials}</span>
            </div>
            <div className="account-info">
              <div className="account-name-row">
                <span className="account-name">{user.displayName || 'User'}</span>
                <button className="account-name-edit" onClick={openNameModal} title="Change name">
                  <Pen size={14} />
                </button>
              </div>
              <span className="account-email">{user.email}</span>
            </div>
            <button className="account-logout" onClick={logout} title="Sign out">
              <Logout size={18} />
            </button>
          </div>
          <div className="account-actions-row">
            <button className="account-action-btn" onClick={openPasswordModal}>
              <div className="account-action-icon">
                <Key size={18} />
              </div>
              <span className="account-action-text">Change password</span>
            </button>
            <button className="account-action-btn account-action-danger" onClick={openDeleteModal}>
              <div className="account-action-icon account-action-icon-danger">
                <TrashBinMinimalistic size={18} />
              </div>
              <span className="account-action-text">Delete account</span>
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
        <span className="settings-section-label">Week starts on</span>
        <div className="delete-options">
          {WEEK_START_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`delete-option${weekStartDay === opt.value ? ' active' : ''}`}
              onClick={() => setWeekStartDay(opt.value)}
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
        <span className="settings-section-label">Pomodoro timer</span>
        {([
          { key: 'work' as const, label: 'Focus duration', color: '#ed9b6d' },
          { key: 'short' as const, label: 'Short break', color: '#66bb6a' },
          { key: 'long' as const, label: 'Long break', color: '#64b5f6' },
        ]).map((item) => (
          <div key={item.key} className="pomo-setting-row">
            <div className="pomo-setting-info">
              <span className="pomo-setting-label">{item.label}</span>
            </div>
            <div className="pomo-setting-controls">
              <button
                className="pomo-setting-adj"
                onClick={() => setPomoConfig((c) => ({ ...c, [item.key]: Math.max(1, c[item.key] - 1) }))}
              >
                −
              </button>
              <span className="pomo-setting-value" style={{ color: item.color }}>{pomoConfig[item.key]}m</span>
              <button
                className="pomo-setting-adj"
                onClick={() => setPomoConfig((c) => ({ ...c, [item.key]: Math.min(item.key === 'work' ? 120 : 60, c[item.key] + 1) }))}
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="settings-section">
        <span className="settings-section-label">Info</span>
        <div className="settings-footer">
          <span className="settings-footer-label">Version</span>
          <span className="settings-footer-value">0.1.0</span>
        </div>
        <button className="settings-landing-btn" onClick={() => navigate('/?preview=1')}>
          <Earth size={16} />
          <span>View landing page</span>
        </button>
      </div>

      {(showPasswordModal || passwordModalClosing) && (
        <div className={`modal-overlay${passwordModalClosing ? ' closing' : ''}`} onClick={closePasswordModal}>
          <div className={`modal${passwordModalClosing ? ' closing' : ''}`} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Change password</h2>
              <button className="btn-icon" onClick={closePasswordModal}>
                <CloseCircle size={22} />
              </button>
            </div>
            <div className="modal-body">
              <div className="password-field">
                <label className="password-label">Current password</label>
                <input
                  type="password"
                  className="password-input"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                />
              </div>
              <div className="password-field">
                <label className="password-label">New password</label>
                <input
                  type="password"
                  className="password-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>
              <div className="password-field">
                <label className="password-label">Confirm new password</label>
                <input
                  type="password"
                  className="password-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>
              {passwordError && (
                <span className="password-error">{passwordError}</span>
              )}
              {passwordSuccess && (
                <span className="password-success">
                  <CheckCircle size={16} />
                  Password changed successfully
                </span>
              )}
              <button
                className="password-submit"
                onClick={handleChangePassword}
                disabled={passwordLoading}
              >
                {passwordLoading ? (
                  <span className="password-spinner" />
                ) : (
                  <>
                    <Key size={16} />
                    Change password
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {(showDeleteModal || deleteModalClosing) && (
        <div className={`modal-overlay${deleteModalClosing ? ' closing' : ''}`} onClick={closeDeleteModal}>
          <div className={`modal${deleteModalClosing ? ' closing' : ''}`} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete account</h2>
              <button className="btn-icon" onClick={closeDeleteModal}>
                <CloseCircle size={22} />
              </button>
            </div>
            <div className="modal-body">
              <p className="delete-warning-text">
                This action is <strong>irreversible</strong>. All your data including tasks, projects, habits, and settings will be permanently deleted.
              </p>
              <div className="password-field">
                <label className="password-label">Enter your password to confirm</label>
                <input
                  type="password"
                  className="password-input"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Your password"
                />
              </div>
              {deleteError && (
                <span className="password-error">{deleteError}</span>
              )}
              <button
                className="delete-account-submit"
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <span className="password-spinner" />
                ) : (
                  <>
                    <TrashBinMinimalistic size={16} />
                    Delete my account
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {(showNameModal || nameModalClosing) && (
        <div className={`modal-overlay${nameModalClosing ? ' closing' : ''}`} onClick={closeNameModal}>
          <div className={`modal${nameModalClosing ? ' closing' : ''}`} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Change name</h2>
              <button className="btn-icon" onClick={closeNameModal}>
                <CloseCircle size={22} />
              </button>
            </div>
            <div className="modal-body">
              <div className="password-field">
                <label className="password-label">Display name</label>
                <input
                  type="text"
                  className="password-input"
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  placeholder="Enter your name"
                  maxLength={30}
                />
              </div>
              {nameError && (
                <span className="password-error">{nameError}</span>
              )}
              {nameSuccess && (
                <span className="password-success">
                  <CheckCircle size={16} />
                  Name updated successfully
                </span>
              )}
              <button
                className="password-submit"
                onClick={handleUpdateName}
                disabled={nameLoading}
              >
                {nameLoading ? (
                  <span className="password-spinner" />
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Save
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
