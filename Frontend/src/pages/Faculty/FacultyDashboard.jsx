import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Settings,
  ClipboardList,
  ArrowRight,
  LogOut,
  LayoutDashboard,
  Users,
  Brain,
  TrendingUp,
  Activity,
  ChevronRight,
  Bell,
  Menu,
  X,
  GraduationCap,
  BarChart3,
  FileText,
  Zap,
  ClipboardCheck,
  FolderOpen,
  UserPlus,
} from 'lucide-react';
import SakuraPetals from '../../components/ui/SakuraPetals';
import { profile } from '../../api/authApi';
import { getCourses, getMyFacultyCourses } from '../../api/courseApi';
import { getFacultyOverview } from '../../api/facultyProgressApi';
import { getRelativeTime } from '../../utils/helpers';
import { setAuthToken } from '../../api/api';
import FacultyMyCourses from './FacultyMyCourses';
import FacultyCourseContent from './FacultyCourseContent';
import FacultyCreateAssignment from './FacultyCreateAssignment';
import FacultySubmissions from './FacultySubmissions';
import FacultyQuizGenerator from './FacultyQuizGenerator';
import FacultyStudentProgress from './FacultyStudentProgress';
import FacultyStudents from './FacultyStudents';
import FacultyEnrollments from './FacultyEnrollments';
import { getEnrollmentRequests } from '../../api/enrollmentApi';
import FacultyLectureMaterials from './FacultyLectureMaterials';
import './FacultyDashboard.css';

/* ── Sidebar nav items ──────────────────────── */
const sidebarItems = [
  { key: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { key: 'my-courses', icon: BookOpen, label: 'My Courses' },
  { key: 'materials', icon: FolderOpen, label: 'Lecture Materials' },
  { key: 'assignments', icon: ClipboardList, label: 'Assignments' },
  { key: 'submissions', icon: ClipboardCheck, label: 'Submissions & Evaluation' },
  { key: 'quiz-generator', icon: Brain, label: 'Quiz Creator' },
  { key: 'enrollments', icon: UserPlus, label: 'Enrollment Requests' },
  { key: 'students', icon: Users, label: 'Students' },
  { key: 'student-progress', icon: TrendingUp, label: 'Student Progress' },
  { key: 'activity', icon: Activity, label: 'Activity' },
  { key: 'settings', icon: Settings, label: 'Settings' },
];

/* ── Quick action items ─────────────────────── */
const quickActions = [
  {
    key: 'create-course',
    icon: BookOpen,
    iconClass: 'qa-purple',
    title: 'Create Course',
    description: 'Design and publish a new course for your students.',
    cta: 'Create now',
    nav: 'my-courses',
  },
  {
    key: 'create-assignment',
    icon: ClipboardList,
    iconClass: 'qa-amber',
    title: 'Create Assignment',
    description: 'Create assignments with deadlines for your students.',
    cta: 'Create now',
    nav: 'assignments',
  },
  {
    key: 'grade-submissions',
    icon: ClipboardCheck,
    iconClass: 'qa-teal',
    title: 'Grade Submissions',
    description: 'Review student submissions and give marks & feedback.',
    cta: 'Review now',
    nav: 'submissions',
  },
  {
    key: 'generate-quiz',
    icon: Brain,
    iconClass: 'qa-pink',
    title: 'Create Quiz',
    description: 'Build multiple-choice quizzes with questions, options & marks for a lesson.',
    cta: 'Create now',
    nav: 'quiz-generator',
  },
  {
    key: 'view-students',
    icon: Users,
    iconClass: 'qa-teal',
    title: 'View Students',
    description: 'Browse enrolled students and track their progress.',
    cta: 'View all',
    nav: 'students',
  },
];

/* ── Placeholder recent activity ────────────── */
const placeholderActivity = [
  { id: 1, icon: FileText, text: 'No recent activity to display', time: '--', color: 'act-muted' },
];

export default function FacultyDashboard() {
  const [facultyName, setFacultyName] = useState('');
  const [activeNav, setActiveNav] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [courseCount, setCourseCount] = useState('--');
  const [overview, setOverview] = useState(null);
  const [pendingEnrollments, setPendingEnrollments] = useState(0);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await profile();
        const user = res?.data?.user;
        if (user) {
          setFacultyName(user.fullName || 'Faculty');

          getEnrollmentRequests('pending')
            .then((enrollRes) => setPendingEnrollments(enrollRes?.data?.counts?.pending || 0))
            .catch(() => setPendingEnrollments(0));

          // Students, assignments, average progress and recent activity.
          getFacultyOverview()
            .then((overviewRes) => setOverview(overviewRes?.data?.data || null))
            .catch(() => setOverview(null));

          // Fetch courses to populate stat card
          try {
            const myCoursesRes = await getMyFacultyCourses();
            setCourseCount(myCoursesRes?.data?.data?.length || 0);
          } catch {
            const coursesRes = await getCourses({ faculty: user._id, limit: 100 });
            const allCourses = coursesRes?.data?.data || [];
            const myCourses = allCourses.filter((c) => {
              const fid = c.faculty?._id || c.faculty;
              return String(fid) === String(user._id);
            });
            setCourseCount(myCourses.length);
          }
        }
      } catch {
        setFacultyName('Faculty');
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    setAuthToken(null);
    localStorage.removeItem('studyBuddyProfile');
    navigate('/login');
  };

  /* Handle navigation from child components (e.g. FacultyMyCourses) */
  const handleChildNavigate = (target, id) => {
    if (target === 'create-course') {
      setActiveNav('my-courses');
    } else if (target === 'manage-content' && id) {
      setSelectedCourseId(id);
      setActiveNav('manage-content');
    } else if (target === 'edit-course' && id) {
      setSelectedCourseId(id);
      setActiveNav('manage-content');
    }
  };

  /* Derive initials for avatar */
  const initials = facultyName
    ? facultyName
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'F';

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  /* ── Build stat cards with live data ── */
  const statCards = [
    {
      key: 'courses',
      label: 'Total Courses',
      value: courseCount,
      icon: BookOpen,
      gradient: 'stat-purple',
    },
    {
      key: 'students',
      label: 'Total Students',
      value: overview ? overview.students : '--',
      icon: Users,
      gradient: 'stat-blue',
    },
    {
      key: 'assignments',
      label: 'Active Assignments',
      value: overview ? overview.activeAssignments : '--',
      icon: ClipboardList,
      gradient: 'stat-amber',
    },
    {
      key: 'progress',
      label: 'Average Progress',
      value: overview?.averageProgress != null ? `${overview.averageProgress}%` : '--',
      icon: BarChart3,
      gradient: 'stat-green',
    },
  ];

  /* ── Render content based on active nav ── */
  const renderContent = () => {
    if (activeNav === 'my-courses') {
      return <FacultyMyCourses onNavigate={handleChildNavigate} />;
    }

    if (activeNav === 'manage-content' && selectedCourseId) {
      return (
        <FacultyCourseContent
          courseId={selectedCourseId}
          onBack={() => setActiveNav('my-courses')}
        />
      );
    }

    if (activeNav === 'materials') {
      return (
        <FacultyLectureMaterials
          onBack={() => setActiveNav('dashboard')}
        />
      );
    }

    if (activeNav === 'assignments') {
      return (
        <FacultyCreateAssignment
          onBack={() => setActiveNav('dashboard')}
        />
      );
    }

    if (activeNav === 'submissions') {
      return (
        <FacultySubmissions
          onBack={() => setActiveNav('dashboard')}
        />
      );
    }

    if (activeNav === 'quiz-generator') {
      return (
        <FacultyQuizGenerator
          onBack={() => setActiveNav('dashboard')}
        />
      );
    }

    if (activeNav === 'enrollments') {
      return (
        <FacultyEnrollments
          onBack={() => setActiveNav('dashboard')}
          onCountsChange={(counts) => setPendingEnrollments(counts.pending || 0)}
        />
      );
    }

    if (activeNav === 'students') {
      return <FacultyStudents onBack={() => setActiveNav('dashboard')} />;
    }

    if (activeNav === 'student-progress') {
      return (
        <FacultyStudentProgress
          onBack={() => setActiveNav('dashboard')}
        />
      );
    }

    // Default: Dashboard overview
    return (
      <>
        {/* ── Stat Cards ──────────────── */}
        <section className="fd-stats">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.key} className={`fd-stat-card ${stat.gradient}`}>
                <div className="fd-stat-icon">
                  <Icon size={20} />
                </div>
                <div className="fd-stat-info">
                  <span className="fd-stat-label">{stat.label}</span>
                  <span className="fd-stat-value">{stat.value}</span>
                </div>
              </div>
            );
          })}
        </section>

        {/* ── Two-column layout ──────── */}
        <div className="fd-grid-2col">
          {/* My Courses */}
          <section className="fd-section fd-courses-section">
            <div className="fd-section-header">
              <h2>
                <GraduationCap size={18} />
                My Courses
              </h2>
              <button
                className="fd-link-btn"
                onClick={() => setActiveNav('my-courses')}
              >
                View all <ChevronRight size={14} />
              </button>
            </div>
            <div className="fd-courses-list">
              {courseCount === '--' || courseCount === 0 ? (
                <div className="fd-empty-state">
                  <BookOpen size={28} className="fd-empty-icon" />
                  <p>Your courses will appear here</p>
                  <span>Create your first course to get started</span>
                </div>
              ) : (
                <div className="fd-empty-state">
                  <BookOpen size={28} className="fd-empty-icon" />
                  <p>You have {courseCount} course{courseCount !== 1 ? 's' : ''}</p>
                  <button
                    className="fd-link-btn"
                    onClick={() => setActiveNav('my-courses')}
                    style={{ marginTop: '8px' }}
                  >
                    View & manage <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Recent Student Activity */}
          <section className="fd-section fd-activity-section">
            <div className="fd-section-header">
              <h2>
                <Activity size={18} />
                Recent Student Activity
              </h2>
              <button className="fd-link-btn" onClick={() => setActiveNav('student-progress')}>
                View all <ChevronRight size={14} />
              </button>
            </div>
            <div className="fd-activity-list">
              {(overview?.recentActivity?.length
                ? overview.recentActivity.map((a) => ({
                    id: a._id,
                    icon: a.type === 'QUIZ_COMPLETED' ? ClipboardCheck : a.type === 'LESSON_COMPLETED' ? GraduationCap : FileText,
                    text: a.score !== undefined ? `${a.text} — ${a.score}%` : a.text,
                    time: getRelativeTime(a.createdAt),
                    color: '',
                  }))
                : placeholderActivity
              ).map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.id} className={`fd-activity-item ${item.color}`}>
                    <div className="fd-activity-icon">
                      <Icon size={16} />
                    </div>
                    <div className="fd-activity-text">
                      <p>{item.text}</p>
                      <span>{item.time}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* ── Quick Actions ──────────── */}
        <section className="fd-section fd-quick-section">
          <div className="fd-section-header">
            <h2>
              <Zap size={18} />
              Quick Actions
            </h2>
          </div>
          <div className="fd-quick-grid">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.key}
                  className="fd-quick-card"
                  onClick={() => {
                    if (action.nav) setActiveNav(action.nav);
                  }}
                >
                  <div className={`fd-quick-icon ${action.iconClass}`}>
                    <Icon size={20} />
                  </div>
                  <div className="fd-quick-text">
                    <h3>{action.title}</h3>
                    <p>{action.description}</p>
                  </div>
                  <span className="fd-quick-cta">
                    {action.cta} <ArrowRight size={13} />
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </>
    );
  };

  return (
    <div className="fd-root">
      <SakuraPetals count={8} />

      {/* ── Mobile overlay ────────────────── */}
      {sidebarOpen && (
        <div
          className="fd-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Left Sidebar ─────────────────── */}
      <aside className={`fd-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="fd-sidebar-header">
          <div className="fd-logo">
            <span className="fd-logo-icon">🌸</span>
            <span className="fd-logo-text">Study Buddy</span>
          </div>
          <button
            className="fd-sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="fd-sidebar-nav">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                className={`fd-nav-item ${activeNav === item.key ? 'active' : ''}`}
                onClick={() => {
                  setActiveNav(item.key);
                  setSidebarOpen(false);
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.key === 'enrollments' && pendingEnrollments > 0 && (
                  <span className="fd-nav-badge" style={{ marginLeft: 'auto', background: 'var(--color-accent)', color: '#fff', borderRadius: 999, fontSize: 11, fontWeight: 700, padding: '1px 7px' }}>
                    {pendingEnrollments}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="fd-sidebar-footer">
          <button className="fd-nav-item fd-logout" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content ─────────────────── */}
      <main className="fd-main">
        {/* Top header */}
        <header className="fd-topbar">
          <div className="fd-topbar-left">
            <button
              className="fd-hamburger"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </button>
            <div className="fd-welcome">
              <h1 className="fd-welcome-title">
                Welcome back, <span className="fd-accent">{facultyName || 'Faculty'}</span>
              </h1>
              <p className="fd-welcome-date">{currentDate}</p>
            </div>
          </div>

          <div className="fd-topbar-right">
            <button className="fd-icon-btn" aria-label="Notifications">
              <Bell size={18} />
            </button>
            <div className="fd-avatar" title={facultyName || 'Faculty'}>
              {initials}
            </div>
          </div>
        </header>

        {/* Scrollable content */}
        <div className="fd-content">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
