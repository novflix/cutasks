import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-loading">
            <div className="auth-spinner" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" state={{ from: location.pathname }} replace />;

  return <>{children}</>;
}
