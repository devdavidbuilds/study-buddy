import { Link } from 'react-router-dom';
import { Bell, Command, Menu } from 'lucide-react';
import SearchBar from '../ui/SearchBar';

export default function TopBar({ onCommandOpen, onMobileMenuToggle, pageTitle }) {
  const unread = 0;

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="topbar-icon-btn mobile-menu-btn" onClick={onMobileMenuToggle}>
          <Menu size={20} />
        </button>
        <div className="topbar-breadcrumb">
          <span>Study Buddy</span>
          <span>/</span>
          <strong>{pageTitle || 'Workspace'}</strong>
        </div>
      </div>

      <div className="topbar-center">
        <SearchBar
          placeholder="Search courses, notes, or ask AI..."
          shortcut="⌘K"
          onChange={() => {}}
          onClick={onCommandOpen}
        />
      </div>

      <div className="topbar-right">
        <button className="topbar-icon-btn" onClick={onCommandOpen} title="Command Palette">
          <Command size={18} />
        </button>
        <Link to="/notifications" className="topbar-icon-btn">
          <Bell size={18} />
          {unread > 0 && <span className="notification-dot" />}
        </Link>
      </div>
    </header>
  );
}
