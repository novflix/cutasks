import { useState, useRef, useEffect, useMemo, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { login, register } from '../services/auth';
import { useAuth } from '../contexts/AuthContext';
import { getFirebaseErrorMessage } from '../utils/firebaseErrors';
import '../styles/auth.css';

type Mode = 'login' | 'register';

export default function AuthPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const from = (location.state as { from?: string })?.from || '/app/home';
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [closing, setClosing] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const [migrated, setMigrated] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);

  const passwordChecks = useMemo(() => ({
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  }), [password]);

  const passwordValid = mode === 'login' || Object.values(passwordChecks).every(Boolean);

  const emailValid = mode === 'login' || (email.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));

  useEffect(() => {
    setTimeout(() => emailRef.current?.focus(), 150);
  }, [mode]);

  useEffect(() => {
    if (user && migrated) navigate(from, { replace: true });
  }, [user, migrated, navigate, from]);

  useEffect(() => {
    if (!user || migrated) return;
    setMigrated(true);
  }, [user, migrated]);

  if (user && migrated) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'register') {
        await register(email, password, name);
      } else {
        await login(email, password);
      }
    } catch (err: unknown) {
      const code = (err as { code?: string }).code || '';
      setError(getFirebaseErrorMessage(code));
    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setClosing(true);
    setTimeout(() => {
      setMode(mode === 'login' ? 'register' : 'login');
      setError('');
      setEmail('');
      setPassword('');
      setName('');
      setClosing(false);
      setAgreedToTerms(false);
      setAgreedToPrivacy(false);
    }, 180);
  }

  if (user && !migrated) {
    return (
      <div className="auth-page">
        <div className={`auth-card${closing ? ' closing' : ''}`}>
          <div className="auth-loading">
            <div className="auth-spinner" />
            <p className="auth-loading-text">{t('auth.syncing')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className={`auth-card${closing ? ' closing' : ''}`}>
        <div className="auth-logo">
          <svg width="48" height="48" viewBox="0 0 150 150" fill="none">
            <path d="M125 75V95C125 111.569 111.569 125 95 125H55C38.4315 125 25 111.569 25 95V55C25 38.4315 38.4315 25 55 25H75" stroke="#ED9B6D" strokeWidth="15" strokeLinecap="round" fill="none" />
            <path d="M50 62.4208L73.8187 89.6808C75.8761 92.0354 79.5693 91.9405 81.5091 89.4881C97.5694 69.1838 107.644 56.4469 124.679 34.9106" stroke="currentColor" strokeWidth="12" strokeLinecap="round" fill="none" />
          </svg>
        </div>

        <h1 className="auth-title">{mode === 'login' ? t('auth.welcomeBack') : t('auth.createAccount')}</h1>
        <p className="auth-subtitle">{mode === 'login' ? t('auth.signInSubtitle') : t('auth.signUpSubtitle')}</p>

        <form ref={formRef} onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' && (
            <div className="auth-field">
              <label className="auth-label" htmlFor="auth-name">{t('auth.name')}</label>
              <input
                id="auth-name"
                type="text"
                className="auth-input"
                placeholder={t('auth.yourName')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
          )}

          <div className="auth-field">
            <label className="auth-label" htmlFor="auth-email">{t('auth.email')}</label>
            <input
              ref={emailRef}
              id="auth-email"
              type="email"
              className="auth-input"
              placeholder={t('auth.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="auth-password">{t('auth.password')}</label>
            <div className="auth-password-wrap">
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                className="auth-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {mode === 'register' && password.length > 0 && (
              <div className="auth-password-checks">
                {([
                  { key: 'length', label: t('auth.pwdCheckLength') },
                  { key: 'uppercase', label: t('auth.pwdCheckUpper') },
                  { key: 'lowercase', label: t('auth.pwdCheckLower') },
                  { key: 'number', label: t('auth.pwdCheckNumber') },
                ] as const).map(({ key, label }) => (
                  <div key={key} className={`auth-pwd-check ${passwordChecks[key] ? 'valid' : ''}`}>
                    <span className="auth-pwd-check-icon">
                      {passwordChecks[key] ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="5 12 10 17 19 7" />
                        </svg>
                      ) : (
                        <span className="auth-pwd-check-dot" />
                      )}
                    </span>
                    <span className="auth-pwd-check-text">{label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {mode === 'register' && (
            <div className="auth-checkboxes">
              <label className="auth-checkbox">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                />
                <span className="auth-checkbox-custom">
                  <span className="auth-checkbox-ripple" />
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="5 12 10 17 19 7" />
                  </svg>
                </span>
                <span className="auth-checkbox-text">
                  {t('auth.agreeTo')} <a href="/terms">{t('legal.termsShort')}</a>
                </span>
              </label>
              <label className="auth-checkbox">
                <input
                  type="checkbox"
                  checked={agreedToPrivacy}
                  onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                />
                <span className="auth-checkbox-custom">
                  <span className="auth-checkbox-ripple" />
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="5 12 10 17 19 7" />
                  </svg>
                </span>
                <span className="auth-checkbox-text">
                  {t('auth.agreeTo')} <a href="/privacy">{t('legal.privacyShort')}</a>
                </span>
              </label>
            </div>
          )}

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="auth-submit" disabled={loading || (mode === 'register' && (!agreedToTerms || !agreedToPrivacy || !passwordValid || !emailValid))}>
            {loading ? <div className="auth-btn-spinner" /> : mode === 'login' ? t('auth.signIn') : t('auth.signUp')}
          </button>
        </form>

        <p className="auth-switch">
          {mode === 'login' ? t('auth.noAccount') : t('auth.hasAccount')}{' '}
          <button type="button" className="auth-switch-btn" onClick={switchMode}>
            {mode === 'login' ? t('auth.signUp') : t('auth.signIn')}
          </button>
        </p>
      </div>
    </div>
  );
}
