import { Component, type ReactNode } from 'react';
import i18n from '../i18n';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
          <h2>{i18n.t('notFound.title')}</h2>
          <p style={{ marginTop: '8px', fontSize: '14px' }}>
            {this.state.error?.message || i18n.t('notFound.description')}
          </p>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
            style={{
              marginTop: '16px', padding: '8px 16px', background: '#ed9b6d',
              color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer',
            }}
          >
            {i18n.t('notFound.goBack')}
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
