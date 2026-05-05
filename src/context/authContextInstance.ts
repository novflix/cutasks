import { createContext } from 'react';
import type { AuthContextValue } from './authContextValue';

export const AuthContext = createContext<AuthContextValue | null>(null);