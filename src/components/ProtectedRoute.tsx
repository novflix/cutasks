import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

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

  if (!user) return <Navigate to="/auth" replace />;

  return <>{children}</>;
}
