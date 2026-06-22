import { useState, useRef, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../services/auth';
import { saveAllData } from '../services/firestore';
import { loadTasks, loadProjects, loadSections, loadProjectTasks } from '../storage';
import { useAuth } from '../contexts/AuthContext';
import '../styles/auth.css';

type Mode = 'login' | 'register';

export default function AuthPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
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
  const [migrating, setMigrating] = useState(false);
  const [migrated, setMigrated] = useState(false);

  useEffect(() => {
    setTimeout(() => emailRef.current?.focus(), 150);
  }, [mode]);

  useEffect(() => {
    if (user && migrated) navigate('/home', { replace: true });
  }, [user, migrated, navigate]);

  useEffect(() => {
    if (!user || migrated) return;
    async function migrate() {
      const localTasks = loadTasks();
      const localProjects = loadProjects();
      const localSections = loadSections();
      const localProjectTasks = loadProjectTasks();
      const hasLocal = localTasks.length + localProjects.length + localSections.length + localProjectTasks.length > 0;
      if (!hasLocal) {
        setMigrated(true);
        return;
      }
      setMigrating(true);
      try {
        await saveAllData(user!.uid, {
          tasks: localTasks,
          projects: localProjects,
          sections: localSections,
          projectTasks: localProjectTasks,
        });
        setMigrated(true);
      } catch {
        setMigrated(true);
      } finally {
        setMigrating(false);
      }
    }
    migrate();
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
      const code = (err as { code?: string }).code;
      if (code === 'auth/email-already-in-use') setError('An account with this email already exists');
      else if (code === 'auth/invalid-email') setError('Invalid email address');
      else if (code === 'auth/weak-password') setError('Password must be at least 6 characters');
      else if (code === 'auth/invalid-credential') setError('Invalid email or password');
      else if (code === 'auth/user-not-found') setError('No account found with this email');
      else if (code === 'auth/wrong-password') setError('Incorrect password');
      else if (code === 'auth/too-many-requests') setError('Too many attempts. Try again later');
      else setError('Something went wrong. Please try again');
    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setClosing(true);
    setTimeout(() => {
      setMode(mode === 'login' ? 'register' : 'login');
      setError('');
      setClosing(false);
    }, 180);
  }

  if (user && migrating) {
    return (
      <div className="auth-page">
        <div className={`auth-card${closing ? ' closing' : ''}`}>
          <div className="auth-loading">
            <div className="auth-spinner" />
            <p className="auth-loading-text">Syncing your data...</p>
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

        <h1 className="auth-title">{mode === 'login' ? 'Welcome back' : 'Create account'}</h1>
        <p className="auth-subtitle">{mode === 'login' ? 'Sign in to continue to Cutasks' : 'Start organizing your tasks'}</p>

        <form ref={formRef} onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' && (
            <div className="auth-field">
              <label className="auth-label" htmlFor="auth-name">Name</label>
              <input
                id="auth-name"
                type="text"
                className="auth-input"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
          )}

          <div className="auth-field">
            <label className="auth-label" htmlFor="auth-email">Email</label>
            <input
              ref={emailRef}
              id="auth-email"
              type="email"
              className="auth-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="auth-password">Password</label>
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
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? <div className="auth-btn-spinner" /> : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button type="button" className="auth-switch-btn" onClick={switchMode}>
            {mode === 'login' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
}
