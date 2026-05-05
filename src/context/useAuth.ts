import { useContext } from 'react';
import { AuthContext } from './authContextInstance';
import type { AuthContextValue } from './authContextValue';

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}