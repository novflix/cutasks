import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'slate';

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove('dark', 'slate');
  if (theme === 'dark')  root.classList.add('dark');
  if (theme === 'slate') root.classList.add('slate');
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('cutasks-theme') as Theme | null;
    if (stored === 'light' || stored === 'dark' || stored === 'slate') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem('cutasks-theme', theme);
  }, [theme]);

  // Legacy compat: dark = true when not light
  const dark = theme !== 'light';

  return { theme, setTheme, dark, toggle: () => setTheme(t => t === 'light' ? 'dark' : 'light') };
}