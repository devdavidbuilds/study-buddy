import { NavLink } from 'react-router-dom';
import { Home, BookOpen, Code2, CalendarDays, Sparkles } from 'lucide-react';

const items = [
  { to: '/workspace', icon: Home, label: 'Home' },
  { to: '/courses', icon: BookOpen, label: 'Courses' },
  { to: '/code-lab', icon: Code2, label: 'Code Lab' },
  { to: '/planner', icon: CalendarDays, label: 'Planner' },
  { to: '/ai-tutor', icon: Sparkles, label: 'Buddy' },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
            <Icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
