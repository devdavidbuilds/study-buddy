import { Search } from 'lucide-react';

export default function SearchBar({ placeholder = 'Search...', value, onChange, shortcut, className }) {
  return (
    <div className={`search-bar ${className || ''}`}>
      <Search size={18} />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange?.(e.target.value)}
      />
      {shortcut && <span className="search-shortcut">{shortcut}</span>}
    </div>
  );
}
