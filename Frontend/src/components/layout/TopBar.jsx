import { useNavigate } from 'react-router-dom';
import { Command, Menu, LogOut } from 'lucide-react';
import SearchBar from '../ui/SearchBar';
import ThemeToggle from '../ui/ThemeToggle';
import NotificationDropdown from '../ui/NotificationDropdown';
import { logout } from '../../api/authApi';

export default function TopBar({ onCommandOpen, onMobileMenuToggle, pageTitle }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="topbar-icon-btn mobile-menu-btn"
          onClick={onMobileMenuToggle}
          aria-label="Toggle navigation menu"
        >
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
        <ThemeToggle />
        <button
          type="button"
          className="topbar-icon-btn"
          onClick={onCommandOpen}
          title="Command Palette (⌘K)"
          aria-label="Command Palette"
        >
          <Command size={18} />
        </button>
        <NotificationDropdown />
        <button
          type="button"
          className="topbar-icon-btn"
          onClick={handleLogout}
          title="Sign Out"
          aria-label="Sign Out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
