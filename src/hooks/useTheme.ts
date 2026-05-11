import { useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'slate';

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove('dark', 'slate');
  if (theme === 'dark')  root.classList.add('dark');
  if (theme === 'slate') root.classList.add('slate');
}

/**
 * Lightweight hook: only applies the theme to the DOM.
 * State management is done externally (AppSettings).
 */
export function useThemeApply(theme: Theme) {
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);
}

/** Read initial theme from localStorage (used by AppSettings before sync). */
export function readInitialTheme(): Theme {
  try {
    const stored = localStorage.getItem('cutasks-theme') as Theme | null;
    if (stored === 'light' || stored === 'dark' || stored === 'slate') return stored;
  } catch { /* ignore */ }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}