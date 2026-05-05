import React, { useState } from 'react';
import { useAuth } from '../context/useAuth';
import { LogoSVG } from '../components/LogoSVG';

type Mode = 'login' | 'register' | 'reset';

interface Props {
  dark: boolean;
}

export const AuthPage: React.FC<Props> = ({ dark }) => {
  const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const clearMessages = () => { setError(''); setSuccess(''); };

  const getErrorMessage = (code: string): string => {
    switch (code) {
      case 'auth/invalid-email':          return 'Invalid email address.';
      case 'auth/user-not-found':         return 'No account found with this email.';
      case 'auth/wrong-password':         return 'Incorrect password.';
      case 'auth/invalid-credential':     return 'Invalid email or password.';
      case 'auth/email-already-in-use':   return 'This email is already registered.';
      case 'auth/weak-password':          return 'Password must be at least 6 characters.';
      case 'auth/too-many-requests':      return 'Too many attempts. Please try again later.';
      case 'auth/popup-closed-by-user':   return 'Sign-in window was closed.';
      case 'auth/network-request-failed': return 'Network error. Check your connection.';
      default:                            return 'Something went wrong. Please try again.';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      if (mode === 'login') {
        await signIn(email, password);
      } else if (mode === 'register') {
        await signUp(email, password);
      } else {
        await resetPassword(email);
        setSuccess('Password reset email sent. Check your inbox.');
      }
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? '';
      setError(getErrorMessage(code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    clearMessages();
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? '';
      setError(getErrorMessage(code));
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '11px 16px',
    borderRadius: '14px',
    border: '1.5px solid var(--border)',
    background: 'var(--bg-card)',
    color: 'var(--text-main)',
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '0.9rem',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  };

  const btnPrimaryStyle: React.CSSProperties = {
    width: '100%',
    padding: '11px',
    borderRadius: '14px',
    border: 'none',
    background: 'var(--text-main)',
    color: 'var(--bg-main)',
    fontFamily: '"DM Sans", sans-serif',
    fontWeight: 600,
    fontSize: '0.9rem',
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.6 : 1,
    transition: 'opacity 0.15s, transform 0.12s',
  };

  const btnSecondaryStyle: React.CSSProperties = {
    width: '100%',
    padding: '11px',
    borderRadius: '14px',
    border: '1.5px solid var(--border)',
    background: 'var(--bg-card)',
    color: 'var(--text-main)',
    fontFamily: '"DM Sans", sans-serif',
    fontWeight: 500,
    fontSize: '0.9rem',
    cursor: loading ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'border-color 0.15s',
  };

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        background: 'var(--bg-main)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '380px',
          background: 'var(--bg-card)',
          borderRadius: '24px',
          border: '1px solid var(--border)',
          padding: '32px 28px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
          animation: 'fadeIn 0.22s ease-out forwards',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}>
          <LogoSVG dark={dark} style={{ height: '32px', width: 'auto' }} />
        </div>

        {/* Title */}
        <h1
          style={{
            fontFamily: '"Fraunces", serif',
            fontSize: '1.5rem',
            fontWeight: 500,
            color: 'var(--text-main)',
            marginBottom: '6px',
            textAlign: 'center',
          }}
        >
          {mode === 'login'    && 'Welcome back'}
          {mode === 'register' && 'Create account'}
          {mode === 'reset'    && 'Reset password'}
        </h1>
        <p
          style={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            textAlign: 'center',
            marginBottom: '24px',
          }}
        >
          {mode === 'login'    && 'Sign in to continue'}
          {mode === 'register' && 'Sign up for free'}
          {mode === 'reset'    && 'Enter your email to recover your account'}
        </p>

        {/* Error / Success */}
        {error && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '12px',
              background: 'rgba(224,84,106,0.10)',
              border: '1px solid rgba(224,84,106,0.30)',
              color: '#c0303a',
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '0.82rem',
              marginBottom: '16px',
            }}
          >
            {error}
          </div>
        )}
        {success && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '12px',
              background: 'rgba(94,168,78,0.10)',
              border: '1px solid rgba(94,168,78,0.30)',
              color: '#2e7022',
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '0.82rem',
              marginBottom: '16px',
            }}
          >
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={inputStyle}
            onFocus={e => { (e.target as HTMLInputElement).style.borderColor = 'var(--accent)'; }}
            onBlur={e => { (e.target as HTMLInputElement).style.borderColor = 'var(--border)'; }}
          />

          {mode !== 'reset' && (
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              style={inputStyle}
              onFocus={e => { (e.target as HTMLInputElement).style.borderColor = 'var(--accent)'; }}
              onBlur={e => { (e.target as HTMLInputElement).style.borderColor = 'var(--border)'; }}
            />
          )}

          <button type="submit" style={btnPrimaryStyle} disabled={loading}>
            {loading ? 'Loading...' : (
              mode === 'login'    ? 'Sign in' :
              mode === 'register' ? 'Create account' :
              'Send reset email'
            )}
          </button>
        </form>

        {/* Divider */}
        {mode !== 'reset' && (
          <>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                margin: '18px 0',
              }}
            >
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: '"DM Sans", sans-serif' }}>
                or
              </span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            </div>

            {/* Google button */}
            <button onClick={handleGoogle} disabled={loading} style={btnSecondaryStyle}>
              <GoogleIcon />
              Continue with Google
            </button>
          </>
        )}

        {/* Mode switchers */}
        <div
          style={{
            marginTop: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {mode === 'login' && (
            <>
              <button
                onClick={() => { clearMessages(); setMode('register'); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent)',
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                Don't have an account? Sign up
              </button>
              <button
                onClick={() => { clearMessages(); setMode('reset'); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                Forgot your password?
              </button>
            </>
          )}
          {(mode === 'register' || mode === 'reset') && (
            <button
              onClick={() => { clearMessages(); setMode('login'); }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent)',
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '0.85rem',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              Already have an account? Sign in
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Google SVG icon
const GoogleIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);