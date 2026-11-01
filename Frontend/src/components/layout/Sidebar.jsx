import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  Home, BookOpen, CalendarDays, ClipboardList, Sparkles, NotebookPen,
  Trophy, TrendingUp, Settings, ChevronLeft, ChevronRight, Code2, LogOut,
} from 'lucide-react';
import useProfile from '../../hooks/useProfile';
import { generateInitials } from '../../utils/helpers';
import { logout } from '../../api/authApi';

const mainNav = [
  { to: '/workspace', icon: Home, label: 'Home' },
  { to: '/courses', icon: BookOpen, label: 'My Courses' },
  { to: '/code-lab', icon: Code2, label: 'Code Lab' },
  { to: '/planner', icon: CalendarDays, label: 'Planner' },
  { to: '/assignments', icon: ClipboardList, label: 'Assignments' },
  { to: '/ai-tutor', icon: Sparkles, label: 'Buddy' },
  { to: '/notes', icon: NotebookPen, label: 'Notes' },
];

const otherNav = [
  { to: '/achievements', icon: Trophy, label: 'Achievements' },
  { to: '/progress', icon: TrendingUp, label: 'Progress' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const userName = profile?.name || profile?.fullName || 'Study Buddy';
  const userSchool = profile?.university || profile?.school || 'Learning Community';

  const handleLogout = () => {
    logout();
    onMobileClose?.();
    navigate('/login');
  };

  return (
    <>
      <div className={`sidebar-overlay ${mobileOpen ? 'visible' : ''}`} onClick={onMobileClose} />
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/" className="sidebar-logo">
            <div className="sidebar-logo-icon">🌸</div>
            <div className="sidebar-logo-text">
              <h2>Study Buddy</h2>
              <span>Learning Space</span>
            </div>
          </Link>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Learn</div>
          {mainNav.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={onMobileClose}
            >
              <item.icon />
              <span>{item.label}</span>
            </NavLink>
          ))}

          <div className="sidebar-section-label">You</div>
          {otherNav.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={onMobileClose}
            >
              <item.icon />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <Link to="/profile" className="sidebar-user" onClick={onMobileClose}>
            <div className="avatar sm">{generateInitials(userName)}</div>
            <div className="sidebar-user-info">
              <h4>{userName}</h4>
              <p>{userSchool}</p>
            </div>
          </Link>

          <button
            type="button"
            className="nav-item sidebar-logout-btn"
            onClick={handleLogout}
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>

        <button className="sidebar-toggle" onClick={onToggle}>
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>
    </>
  );
}
