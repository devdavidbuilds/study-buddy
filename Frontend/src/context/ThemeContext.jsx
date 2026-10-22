import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { flushSync } from 'react-dom';

const ThemeContext = createContext();

const STORAGE_KEY = 'studyBuddyTheme';
const MODES = ['light', 'dark', 'system'];

const systemTheme = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

const readMode = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (MODES.includes(stored)) return stored;
  } catch {
    // storage unavailable
  }
  return 'light';
};

const applyTheme = (theme) => {
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  root.style.colorScheme = theme;
};

/**
 * Global theme provider.
 * mode is what the student picked (light, dark or system); theme is what
 * is shown. Sets `data-theme` on <html> so the CSS overrides kick in
 * (index.html sets it before React loads, so there is no light flash).
 */
export function ThemeProvider({ children }) {
  const [mode, setModeState] = useState(readMode);
  const [osTheme, setOsTheme] = useState(systemTheme);
  const theme = mode === 'system' ? osTheme : mode;

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!media) return undefined;
    const onChange = () => setOsTheme(media.matches ? 'dark' : 'light');
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // storage unavailable
    }
  }, [mode]);

  /**
   * Changes the mode. When `origin` ({ x, y } in viewport pixels) is given
   * and the browser supports view transitions, the new theme spreads out
   * from that point as a circle.
   */
  const setMode = useCallback((next, origin) => {
    if (!MODES.includes(next)) return;
    const nextTheme = next === 'system' ? systemTheme() : next;
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const current = document.documentElement.getAttribute('data-theme');

    if (!origin || reduceMotion || !document.startViewTransition || nextTheme === current) {
      setModeState(next);
      return;
    }

    const { x, y } = origin;
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    const transition = document.startViewTransition(() => {
      flushSync(() => setModeState(next));
      applyTheme(nextTheme);
    });
    transition.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 650, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', pseudoElement: '::view-transition-new(root)' },
      );
    }).catch(() => {});
  }, []);

  const setTheme = useCallback((t, origin) => setMode(t, origin), [setMode]);
  const toggleTheme = useCallback((origin) => setMode(theme === 'dark' ? 'light' : 'dark', origin), [setMode, theme]);

  return (
    <ThemeContext.Provider value={{ theme, mode, setMode, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to consume the global theme state.
 * Returns { theme, mode, setMode, setTheme, toggleTheme }.
 */
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}

export default ThemeContext;
