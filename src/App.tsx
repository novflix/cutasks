import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import './App.css';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const DownloadPage = lazy(() => import('./pages/DownloadPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const AppInner = lazy(() => import('./AppInner'));

function PageLoader() {
  return <div className="page-loader"><div className="auth-spinner" /></div>;
}

export default function App() {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) return <PageLoader />;

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/app/home" replace /> : <LandingPage />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/download" element={<DownloadPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/app/*" element={<AppInner />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
