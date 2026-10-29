import { useRef } from 'react';
import { Search } from 'lucide-react';

export default function SearchBar({
  placeholder = 'Search...',
  value,
  onChange,
  shortcut,
  className,
  onClick,
  readOnly,
  style,
  ...rest
}) {
  const inputRef = useRef(null);
  const isClickable = Boolean(onClick);

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    } else {
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick?.(e);
    }
  };

  return (
    <div
      className={`search-bar ${className || ''}`}
      onClick={handleClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={handleKeyDown}
      style={isClickable ? { cursor: 'pointer', ...style } : style}
      aria-label={isClickable ? (placeholder || 'Search') : undefined}
      {...rest}
    >
      <Search size={18} style={isClickable ? { pointerEvents: 'none' } : undefined} />
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange?.(e.target.value)}
        onClick={isClickable ? handleClick : undefined}
        onFocus={isClickable ? (e) => {
          e.target.blur();
          handleClick(e);
        } : undefined}
        readOnly={readOnly ?? isClickable}
        style={isClickable ? { cursor: 'pointer' } : undefined}
        tabIndex={isClickable ? -1 : undefined}
      />
      {shortcut && (
        <span
          className="search-shortcut"
          style={isClickable ? { pointerEvents: 'none' } : undefined}
        >
          {shortcut}
        </span>
      )}
    </div>
  );
}

