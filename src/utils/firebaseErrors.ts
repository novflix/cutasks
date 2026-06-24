import i18n from '../i18n';

const t = (key: string) => i18n.t(key);

export function getFirebaseErrorMessage(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return t('auth.emailInUse');
    case 'auth/invalid-email':
      return t('auth.invalidEmail');
    case 'auth/weak-password':
      return t('auth.weakPassword');
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return t('auth.invalidCredential');
    case 'auth/too-many-requests':
      return t('auth.tooManyRequests');
    case 'auth/network-request-failed':
      return t('auth.networkError');
    case 'auth/popup-closed-by-user':
      return t('auth.popupClosed');
    case 'auth/requires-recent-login':
      return t('auth.recentLoginRequired');
    default:
      return t('auth.genericError');
  }
}
