import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Settings,
  ClipboardList,
  FolderOpen,
  ArrowRight,
  LogOut,
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import SakuraPetals from '../../components/ui/SakuraPetals';
import { profile } from '../../api/authApi';
import { setAuthToken } from '../../api/api';
import './FacultyDashboard.css';

const actions = [
  {
    key: 'create-course',
    icon: <BookOpen size={24} />,
    iconClass: 'courses',
    title: 'Create Course',
    description: 'Design and publish a new course for your students.',
    cta: 'Create now',
  },
  {
    key: 'manage-courses',
    icon: <FolderOpen size={24} />,
    iconClass: 'manage-courses',
    title: 'Manage Courses',
    description: 'Edit, update, or archive your existing courses.',
    cta: 'View courses',
  },
  {
    key: 'create-assignment',
    icon: <ClipboardList size={24} />,
    iconClass: 'assignments',
    title: 'Create Assignment',
    description: 'Create assignments with deadlines for your students.',
    cta: 'Create now',
  },
  {
    key: 'manage-assignments',
    icon: <Settings size={24} />,
    iconClass: 'manage-assignments',
    title: 'Manage Assignments',
    description: 'Review submissions and manage existing assignments.',
    cta: 'View assignments',
  },
];

export default function FacultyDashboard() {
  const [facultyName, setFacultyName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await profile();
        const user = res?.data?.user;
        if (user) {
          setFacultyName(user.fullName || 'Faculty');
        }
      } catch {
        // If profile fetch fails, use a default
        setFacultyName('Faculty');
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    setAuthToken(null);
    localStorage.removeItem('studyBuddyProfile');
    navigate('/login');
  };

  return (
    <div className="faculty-dashboard">
      <SakuraPetals />

      <div className="faculty-dashboard-header">
        <div className="faculty-header-left">
          <h1>
            📚 Faculty Dashboard
          </h1>
          <p>
            Welcome back,{' '}
            <span className="faculty-name">
              {facultyName || 'Faculty'}
            </span>
            ! Ready to inspire your students today?
          </p>
        </div>

        <button
          className="faculty-logout-btn"
          onClick={handleLogout}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>

      <div className="faculty-grid">
        {actions.map((action) => (
          <GlassCard
            key={action.key}
            className="faculty-action-card"
            hoverable
          >
            <div className="faculty-card-content">
              <div
                className={`faculty-card-icon ${action.iconClass}`}
              >
                {action.icon}
              </div>

              <div className="faculty-card-text">
                <h3>{action.title}</h3>
                <p>{action.description}</p>
              </div>

              <div className="faculty-card-arrow">
                {action.cta} <ArrowRight size={14} />
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
