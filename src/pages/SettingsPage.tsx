import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logout, Key, CheckCircle, CloseCircle, TrashBinMinimalistic, Pen, AltArrowRight, Heart, Copy, DownloadMinimalistic, UploadMinimalistic } from '@solar-icons/react';
import { loadAllData, saveAllData } from '../services/firestore';
import { SiTon, SiTether, SiSolana, SiLitecoin, SiCircle } from 'react-icons/si';
import {
  isNotificationsSupported, getNotificationPermission,
  requestPermission, isNotificationsEnabled, setNotificationsEnabled,
  subscribeToPush, unsubscribeFromPush,
} from '../services/notifications';
import { logout, changePassword, deleteAccount, updateDisplayName } from '../services/auth';
import { saveSettings } from '../services/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { LANGUAGES, setLanguage, type LanguageCode } from '../i18n';
import { getFirebaseErrorMessage } from '../utils/firebaseErrors';
import type { PomoConfig } from './PomodoroPage';
import { DEFAULT_POMO_CONFIG } from '../constants/pomo';

type DeleteMode = 'instant' | '3days' | '7days';
type WeekStartDay = 'monday' | 'saturday';

const POMO_STORAGE = 'cutasks_pomodoro';

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

const THEME_DATA: { id: string; bg: string; card: string; elevated: string; text: string; textMuted: string; accent: string }[] = [
  { id: 'dark', bg: '#121212', card: '#1e1e1e', elevated: '#252525', text: '#f0f0f0', textMuted: '#555555', accent: '#ed9b6d' },
  { id: 'light', bg: '#f5f5f5', card: '#ffffff', elevated: '#fafafa', text: '#1a1a1a', textMuted: '#aaaaaa', accent: '#ed9b6d' },
  { id: 'midnight', bg: '#0d1117', card: '#161b22', elevated: '#1c2128', text: '#e6edf3', textMuted: '#484f58', accent: '#ed9b6d' },
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
  const { t, i18n } = useTranslation();
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
  const [langOpen, setLangOpen] = useState(false);
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
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [donateModalClosing, setDonateModalClosing] = useState(false);
  const donateModalTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [notifSupported] = useState(() => isNotificationsSupported());
  const [notifPermission, setNotifPermission] = useState(() => getNotificationPermission());
  const [notifEnabled, setNotifEnabled] = useState(() => isNotificationsEnabled());

  const DELETE_OPTIONS: { value: DeleteMode; label: string; desc: string }[] = [
    { value: 'instant', label: t('settings.instant'), desc: t('settings.instantDesc') },
    { value: '3days', label: t('settings.after3days'), desc: t('settings.after3daysDesc') },
    { value: '7days', label: t('settings.after7days'), desc: t('settings.after7daysDesc') },
  ];

  const WEEK_START_OPTIONS: { value: WeekStartDay; label: string; desc: string }[] = [
    { value: 'monday', label: t('settings.monday'), desc: t('settings.mondayDesc') },
    { value: 'saturday', label: t('settings.saturday'), desc: t('settings.saturdayDesc') },
  ];

  const themes: ThemeOption[] = useMemo(() => [
    { id: 'dark', name: t('settings.dark'), bg: THEME_DATA[0].bg, card: THEME_DATA[0].card, elevated: THEME_DATA[0].elevated, text: THEME_DATA[0].text, textMuted: THEME_DATA[0].textMuted, accent: THEME_DATA[0].accent },
    { id: 'light', name: t('settings.light'), bg: THEME_DATA[1].bg, card: THEME_DATA[1].card, elevated: THEME_DATA[1].elevated, text: THEME_DATA[1].text, textMuted: THEME_DATA[1].textMuted, accent: THEME_DATA[1].accent },
    { id: 'midnight', name: t('settings.midnight'), bg: THEME_DATA[2].bg, card: THEME_DATA[2].card, elevated: THEME_DATA[2].elevated, text: THEME_DATA[2].text, textMuted: THEME_DATA[2].textMuted, accent: THEME_DATA[2].accent },
  ], [t]);

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
      setPasswordError(t('settings.fillAllFields'));
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError(t('settings.passwordMin6'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(t('settings.passwordMismatch'));
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
      const code = (e as { code?: string }).code || '';
      const msg = getFirebaseErrorMessage(code);
      setPasswordError(msg);
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
      setDeleteError(t('settings.deleteAccountConfirm'));
      return;
    }
    setDeleteLoading(true);
    try {
      await deleteAccount(deletePassword);
    } catch (e: unknown) {
      const code = (e as { code?: string }).code || '';
      setDeleteError(getFirebaseErrorMessage(code));
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

  const WALLETS = [
    { network: 'USDC (Polygon)', address: '0x9e9C10d3A526cb39B62b88DecC55f04F8f63fdE3' },
    { network: 'USDT (TRC-20)', address: 'TVMMVRhbTJutmjkwFC6x5g4cm2S4P5nbqy' },
    { network: 'TON (The Open Network)', address: 'UQAdiUvmlLJ088bQkbv6AGs_sp7rO0jHcmdzR6oWglq5Isk2' },
    { network: 'SOL (Solana)', address: 'Wv29H2iUF4vQLfqgGjvbSiobThxJAfSpeFNBanoWvKw' },
    { network: 'LTC (Litecoin)', address: 'ltc1qff5xug04kp4tm03zrx9n9tah6zhtf3kzk5cp30' },
  ];

  function openDonateModal() {
    setDonateModalClosing(false);
    setShowDonateModal(true);
    setCopiedAddress(null);
  }

  function closeDonateModal() {
    setDonateModalClosing(true);
    donateModalTimer.current = setTimeout(() => {
      setShowDonateModal(false);
      setDonateModalClosing(false);
      setCopiedAddress(null);
    }, 200);
  }

  async function copyAddress(address: string) {
    await navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 1500);
  }

  async function handleExportData() {
    if (!user) return;
    try {
      const data = await loadAllData(user.uid);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cutasks-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { /* ignore export errors */ }
  }

  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  async function handleImportData(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (data.tasks || data.projects || data.sections || data.projectTasks || data.habits) {
        await saveAllData(user.uid, {
          tasks: data.tasks || [],
          projects: data.projects || [],
          sections: data.sections || [],
          projectTasks: data.projectTasks || [],
        });
        window.location.reload();
      }
    } catch { /* ignore import errors */ }
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleToggleNotifications() {
    if (notifPermission !== 'granted') {
      const result = await requestPermission();
      setNotifPermission(result);
      if (result === 'granted') {
        setNotificationsEnabled(true);
        setNotifEnabled(true);
        subscribeToPush();
      }
    } else {
      const next = !notifEnabled;
      setNotificationsEnabled(next);
      setNotifEnabled(next);
      if (next) {
        subscribeToPush();
      } else {
        unsubscribeFromPush();
      }
    }
  }

  async function handleUpdateName() {
    setNameError('');
    setNameSuccess(false);
    const trimmed = newDisplayName.trim();
    if (!trimmed) {
      setNameError(t('settings.nameEmpty'));
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
      setNameError(t('settings.nameFailed'));
    } finally {
      setNameLoading(false);
    }
  }

  return (
    <div className="settings-page">
      <div className="page-hero">
        <h1 className="page-hero-title">{t('settings.title')}</h1>
      </div>

      {user && (
        <div className="settings-section">
          <span className="settings-section-label">{t('settings.account')}</span>
          <div className="account-card">
            <div className="account-avatar" style={{ background: `${avatarColor}20`, color: avatarColor }}>
              <span className="account-avatar-text">{initials}</span>
            </div>
            <div className="account-info">
              <div className="account-name-row">
                <span className="account-name">{user.displayName || t('settings.displayName')}</span>
                <button className="account-name-edit" onClick={openNameModal} title={t('settings.changeName')}>
                  <Pen size={14} />
                </button>
              </div>
              <span className="account-email">{user.email}</span>
            </div>
            <button className="account-logout" onClick={logout} title={t('settings.signOut')}>
              <Logout size={18} />
            </button>
          </div>
          <div className="account-actions-row">
            <button className="account-action-btn" onClick={openPasswordModal}>
              <div className="account-action-icon">
                <Key size={18} />
              </div>
              <span className="account-action-text">{t('settings.changePassword')}</span>
            </button>
            <button className="account-action-btn account-action-danger" onClick={openDeleteModal}>
              <div className="account-action-icon account-action-icon-danger">
                <TrashBinMinimalistic size={18} />
              </div>
              <span className="account-action-text">{t('settings.deleteAccount')}</span>
            </button>
          </div>
        </div>
      )}

      <div className="settings-section">
          <span className="settings-section-label">{t('settings.theme')}</span>

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
          <span className="settings-section-label">{t('settings.language')}</span>
        <div className={`lang-picker${langOpen ? ' lang-picker--open' : ''}`}>
          {(() => {
            const current = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];
            return (
              <button className="lang-picker__current" onClick={() => setLangOpen(v => !v)}>
                <span className={`fi fi-${current.countryCode} lang-picker__flag`} />
                <span className="lang-picker__label">{current.label}</span>
                <svg className={`lang-picker__chevron${langOpen ? ' open' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            );
          })()}
          <div
            className="lang-picker__list"
            style={{ maxHeight: langOpen ? `${LANGUAGES.length * 48}px` : '0px' }}
          >
            {LANGUAGES.map((lang) => {
              const active = i18n.language === lang.code;
              return (
                <button
                  key={lang.code}
                  className={`lang-picker__item${active ? ' active' : ''}`}
                  onClick={() => { setLanguage(lang.code as LanguageCode); setLangOpen(false); }}
                >
                  <span className={`fi fi-${lang.countryCode} lang-picker__flag`} />
                  <span className="lang-picker__label">{lang.label}</span>
                  <div className={`lang-picker__radio${active ? ' active' : ''}`}>
                    <div className="lang-picker__dot" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="settings-section">
          <span className="settings-section-label">{t('settings.deleteMode')}</span>
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
          <span className="settings-section-label">{t('settings.weekStart')}</span>
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

      {notifSupported && (
        <div className="settings-section">
            <span className="settings-section-label">{t('settings.notifications')}</span>
          <div className="delete-options">
            <button
              className={`delete-option${notifEnabled ? ' active' : ''}`}
              onClick={handleToggleNotifications}
            >
              <div className="delete-option-radio">
                <div className="delete-option-dot" />
              </div>
              <div className="delete-option-info">
                <span className="delete-option-label">
                  {notifPermission === 'granted'
                    ? (notifEnabled ? t('settings.notificationsOn') : t('settings.notificationsOff'))
                    : t('settings.notificationsAllow')}
                </span>
                <span className="delete-option-desc">{t('settings.notificationsDesc')}</span>
              </div>
            </button>
          </div>
        </div>
      )}

      <div className="settings-section">
          <span className="settings-section-label">{t('pomodoro.title')}</span>
        <div className="delete-options">
        {([
            { key: 'work' as const, label: t('pomodoro.focus'), desc: t('pomodoro.focusDesc') },
            { key: 'short' as const, label: t('pomodoro.shortBreak'), desc: t('pomodoro.shortBreakDesc') },
            { key: 'long' as const, label: t('pomodoro.longBreak'), desc: t('pomodoro.longBreakDesc') },
        ]).map((item) => (
          <div key={item.key} className="delete-option">
            <div className="delete-option-info">
              <span className="delete-option-label">{item.label}</span>
              <span className="delete-option-desc">{item.desc}</span>
            </div>
            <div className="pomo-setting-controls">
              <button
                className="pomo-setting-adj"
                onClick={() => setPomoConfig((c) => ({ ...c, [item.key]: Math.max(1, c[item.key] - 1) }))}
              >
                −
              </button>
              <span className="pomo-setting-value">{pomoConfig[item.key]}m</span>
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
      </div>

      <div className="settings-section">
          <span className="settings-section-label">{t('settings.data')}</span>
        <div className="delete-options">
          <button className="delete-option" onClick={handleExportData}>
            <DownloadMinimalistic size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <div className="delete-option-info">
              <span className="delete-option-label">{t('settings.exportData')}</span>
              <span className="delete-option-desc">{t('settings.exportDataDesc')}</span>
            </div>
          </button>
          <button className="delete-option" onClick={handleImportClick}>
            <UploadMinimalistic size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <div className="delete-option-info">
              <span className="delete-option-label">{t('settings.importData')}</span>
              <span className="delete-option-desc">{t('settings.importDataDesc')}</span>
            </div>
          </button>
          <input ref={fileInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImportData} />
        </div>
      </div>

      <div className="settings-section">
          <span className="settings-section-label">{t('settings.info')}</span>
        <div className="delete-options">
          <div className="delete-option">
            <div className="delete-option-info">
              <span className="delete-option-label">{t('settings.version')}</span>
            </div>
            <span className="settings-info-value">1.0.2</span>
          </div>
          <button className="delete-option" onClick={() => navigate('/?preview=1')}>
            <div className="delete-option-info">
              <span className="delete-option-label">{t('settings.landingPage')}</span>
            </div>
            <AltArrowRight size={16} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
          </button>
          <button className="delete-option" onClick={openDonateModal}>
            <div className="delete-option-info">
              <span className="delete-option-label">{t('settings.support')}</span>
            </div>
            <Heart size={16} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
          </button>
        </div>
      </div>

      {(showPasswordModal || passwordModalClosing) && (
        <div className={`modal-overlay${passwordModalClosing ? ' closing' : ''}`} onClick={closePasswordModal}>
          <div className={`modal${passwordModalClosing ? ' closing' : ''}`} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('settings.changePassword')}</h2>
              <button className="btn-icon" onClick={closePasswordModal}>
                <CloseCircle size={22} />
              </button>
            </div>
            <div className="modal-body">
              <div className="password-field">
                <label className="password-label">{t('settings.currentPassword')}</label>
                <input
                  type="password"
                  className="password-input"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder={t('settings.enterCurrentPassword')}
                />
              </div>
              <div className="password-field">
                <label className="password-label">{t('settings.newPassword')}</label>
                <input
                  type="password"
                  className="password-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t('settings.enterNewPassword')}
                />
              </div>
              <div className="password-field">
                <label className="password-label">{t('settings.confirmNewPassword')}</label>
                <input
                  type="password"
                  className="password-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('settings.confirmPasswordPlaceholder')}
                />
              </div>
              {passwordError && (
                <span className="password-error">{passwordError}</span>
              )}
              {passwordSuccess && (
                <span className="password-success">
                  <CheckCircle size={16} />
                  {t('settings.passwordChanged')}
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
                    {t('settings.changePassword')}
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
              <h2>{t('settings.deleteAccountTitle')}</h2>
              <button className="btn-icon" onClick={closeDeleteModal}>
                <CloseCircle size={22} />
              </button>
            </div>
            <div className="modal-body">
              <p className="delete-warning-text">
                {t('settings.deleteAccountDesc')}
              </p>
              <div className="password-field">
                <label className="password-label">{t('settings.deleteAccountConfirm')}</label>
                <input
                  type="password"
                  className="password-input"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder={t('settings.deleteAccountPlaceholder')}
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
                    {t('settings.deleteAccountBtn')}
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
              <h2>{t('settings.changeName')}</h2>
              <button className="btn-icon" onClick={closeNameModal}>
                <CloseCircle size={22} />
              </button>
            </div>
            <div className="modal-body">
              <div className="password-field">
                <label className="password-label">{t('settings.displayName')}</label>
                <input
                  type="text"
                  className="password-input"
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  placeholder={t('settings.enterName')}
                  maxLength={30}
                />
              </div>
              {nameError && (
                <span className="password-error">{nameError}</span>
              )}
              {nameSuccess && (
                <span className="password-success">
                  <CheckCircle size={16} />
                  {t('settings.nameUpdated')}
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
                    {t('common.save')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {(showDonateModal || donateModalClosing) && (
        <div className={`modal-overlay${donateModalClosing ? ' closing' : ''}`} onClick={closeDonateModal}>
          <div className={`modal donate-modal${donateModalClosing ? ' closing' : ''}`} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('settings.supportTitle')}</h2>
              <button className="btn-icon" onClick={closeDonateModal}>
                <CloseCircle size={22} />
              </button>
            </div>
            <div className="modal-body">
              <div className="donate-hero">
                <div className="donate-hero-icon">
                  <Heart size={28} />
                </div>
                <p>{t('settings.supportDesc')}</p>
              </div>
              <div className="donate-list">
                {WALLETS.map((w) => {
                  const cls = w.network.toLowerCase().includes('usdc') ? 'usdc'
                    : w.network.toLowerCase().includes('usdt') ? 'usdt'
                    : w.network.toLowerCase().includes('ton') ? 'ton'
                    : w.network.toLowerCase().includes('solana') ? 'sol'
                    : 'ltc';
                  const CryptoIcon = cls === 'usdc' ? SiCircle
                    : cls === 'usdt' ? SiTether
                    : cls === 'ton' ? SiTon
                    : cls === 'sol' ? SiSolana
                    : SiLitecoin;
                  return (
                    <div key={w.network} className="donate-item">
                      <div className={`donate-item-icon ${cls}`}>
                        <CryptoIcon size={20} />
                      </div>
                      <div className="donate-item-info">
                        <span className="donate-item-name">{w.network}</span>
                        <span className="donate-item-addr" title={w.address}>{w.address}</span>
                      </div>
                      <button className={`donate-item-copy${copiedAddress === w.address ? ' copied' : ''}`} onClick={() => copyAddress(w.address)} title={t('settings.copyAddress')}>
                        {copiedAddress === w.address ? <CheckCircle size={15} /> : <Copy size={15} />}
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="donate-note">
                <p>{t('settings.supportThankYou')}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="settings-legal">
        <a href="/terms" target="_blank" rel="noopener noreferrer">{t('legal.termsShort')}</a>
        <span className="settings-legal-dot">·</span>
        <a href="/privacy" target="_blank" rel="noopener noreferrer">{t('legal.privacyShort')}</a>
      </div>
    </div>
  );
}
