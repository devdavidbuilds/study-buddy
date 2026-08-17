import { useState, useEffect, useCallback } from 'react';
import { Search, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const commands = [
  { group: 'Navigation', items: [
    { label: 'Go to Home', action: '/workspace', icon: '🏠' },
    { label: 'Go to My Courses', action: '/courses', icon: '📚' },
    { label: 'Go to Code Lab', action: '/code-lab', icon: '💻' },
    { label: 'Go to Planner', action: '/planner', icon: '📅' },
    { label: 'Go to Assignments', action: '/assignments', icon: '📝' },
    { label: 'Go to AI Tutor', action: '/ai-tutor', icon: '🌸' },
    { label: 'Go to Notes', action: '/notes', icon: '📒' },
    { label: 'Go to Achievements', action: '/achievements', icon: '🏆' },
    { label: 'Go to Progress', action: '/progress', icon: '📈' },
    { label: 'Go to Profile', action: '/profile', icon: '👤' },
    { label: 'Go to Settings', action: '/settings', icon: '⚙️' },
  ]},
  { group: 'Actions', items: [
    { label: 'Create New Note', action: '/notes', icon: '📒' },
    { label: 'Ask AI Tutor', action: '/ai-tutor', icon: '✨' },
  ]},
];

export default function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();

  const filtered = commands.map(group => ({
    ...group,
    items: group.items.filter(item =>
      item.label.toLowerCase().includes(query.toLowerCase())
    ),
  })).filter(g => g.items.length > 0);

  const allItems = filtered.flatMap(g => g.items);

  const handleSelect = useCallback((item) => {
    if (item.action.startsWith('/')) navigate(item.action);
    onClose();
    setQuery('');
  }, [navigate, onClose]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') { onClose(); setQuery(''); }
      if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(i => Math.min(i + 1, allItems.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex(i => Math.max(i - 1, 0)); }
      if (e.key === 'Enter' && allItems[activeIndex]) { handleSelect(allItems[activeIndex]); }
    };
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, activeIndex, allItems, onClose, handleSelect]);

  useEffect(() => { setActiveIndex(0); }, [query]);

  if (!isOpen) return null;

  let itemIdx = 0;
  return (
    <div className="command-overlay" onClick={onClose}>
      <div className="command-palette" onClick={e => e.stopPropagation()}>
        <div className="command-input-wrapper">
          <Search size={20} />
          <input
            type="text"
            placeholder="Type a command or search..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
          />
          <span className="search-shortcut">ESC</span>
        </div>
        <div className="command-results">
          {filtered.map(group => (
            <div key={group.group}>
              <div className="command-group-label">{group.group}</div>
              {group.items.map(item => {
                const idx = itemIdx++;
                return (
                  <div
                    key={item.label}
                    className={`command-item ${idx === activeIndex ? 'active' : ''}`}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setActiveIndex(idx)}
                  >
                    <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                    <span>{item.label}</span>
                    <ArrowRight size={14} style={{ color: 'var(--text-tertiary)' }} />
                  </div>
                );
              })}
            </div>
          ))}
          {allItems.length === 0 && (
            <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)' }}>
              No results found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
