import { useCallback, useState } from 'react';

const THEME_KEY = 'app_theme';

export function useTheme() {
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem(THEME_KEY) === 'dark'; } catch { return false; }
  });
  const toggle = useCallback(() => setDark(d => {
    try { localStorage.setItem(THEME_KEY, d ? 'light' : 'dark'); } catch { /* storage blocked */ }
    return !d;
  }), []);
  return { dark, toggle };
}
