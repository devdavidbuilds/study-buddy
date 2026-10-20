import { useState, useEffect, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import BottomNav from './BottomNav';
import SakuraPetals from '../ui/SakuraPetals';
import CommandPalette from '../ui/CommandPalette';

const pageTitles = {
  '/workspace': 'Home',
  '/courses': 'My Courses',
  '/planner': 'Planner',
  '/assignments': 'Assignments',
  '/ai-tutor': 'AI Tutor',
  '/notes': 'Notes',
  '/achievements': 'Achievements',
  '/progress': 'Progress',
  '/profile': 'Profile',
  '/notifications': 'Notifications',
  '/settings': 'Settings',
};

export default function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const location = useLocation();

  const pageTitle = pageTitles[location.pathname]
    || (location.pathname.startsWith('/courses/') ? 'Course' : 'Home');

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleMobileClose = useCallback(() => setMobileOpen(false), []);

  return (
    <div className="app-layout">
      <SakuraPetals />
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={handleMobileClose}
      />
      <main className={`app-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <TopBar
          pageTitle={pageTitle}
          onCommandOpen={() => setCommandOpen(true)}
          onMobileMenuToggle={() => setMobileOpen(true)}
        />
        <div className="app-content">
          <Outlet />
        </div>
        <BottomNav />
      </main>
      <CommandPalette isOpen={commandOpen} onClose={() => setCommandOpen(false)} />
    </div>
  );
}
