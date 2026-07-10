import { useContext } from 'react';
import { PomoContext } from '../contexts/PomoContextDef';

export function usePomoContext() {
  const ctx = useContext(PomoContext);
  if (!ctx) throw new Error('usePomoContext must be used within PomoProvider');
  return ctx;
}
