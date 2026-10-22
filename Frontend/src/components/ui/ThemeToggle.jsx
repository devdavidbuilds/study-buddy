import { useTheme } from '../../context/ThemeContext';

// Day/night switch: a little sky in a pill. The sun slides across and
// becomes a crescent moon, and stars come out. The new theme spreads out
// from the switch (see ThemeContext.setMode).
export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme();
  const dark = theme === 'dark';

  const onClick = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    toggleTheme({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
  };

  return (
    <button
      type="button"
      className={`theme-toggle ${dark ? 'is-dark' : ''} ${className}`}
      onClick={onClick}
      role="switch"
      aria-checked={dark}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Light mode' : 'Dark mode'}
    >
      <span className="theme-toggle-sky" aria-hidden="true">
        <i className="tt-star s1" /><i className="tt-star s2" /><i className="tt-star s3" />
        <i className="tt-cloud" />
      </span>
      <span className="theme-toggle-orb" aria-hidden="true">
        <i className="tt-crater c1" /><i className="tt-crater c2" />
      </span>
    </button>
  );
}
