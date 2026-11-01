import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Users,
  GraduationCap,
  BookOpen,
  Star,
  Layers,
  Activity,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  LogOut,
  ChevronRight,
  Sparkles,
  BarChart3,
  TrendingUp,
  Award,
  RefreshCw,
  X,
  Lock,
  Mail,
  User,
  Briefcase,
  Phone,
} from 'lucide-react';
import SakuraPetals from '../../components/ui/SakuraPetals';
import ThemeToggle from '../../components/ui/ThemeToggle';
import { logout } from '../../api/authApi';
import {
  getAdminOverview,
  getFacultyList,
  createFaculty,
  getAdminStudents,
  getAdminCourseRatings,
} from '../../api/adminApi';
import './AdminDashboard.css';

const DOMAIN_OPTIONS = [
  'Data Science & AI',
  'Programming & CS',
  'Engineering',
  'Web Development',
  'Business & Finance',
  'Design & Creative',
  'Music & Audio',
];

const DOMAIN_ICONS = {
  'Data Science & AI': '🤖',
  'Programming & CS': '💻',
  Engineering: '⚙️',
  'Web Development': '🌐',
  'Business & Finance': '📈',
  'Design & Creative': '🎨',
  'Music & Audio': '🎵',
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Overview state
  const [overview, setOverview] = useState(null);
  const [loadingOverview, setLoadingOverview] = useState(true);

  // Faculty state
  const [facultyList, setFacultyList] = useState([]);
  const [loadingFaculty, setLoadingFaculty] = useState(false);
  const [facultyDomainFilter, setFacultyDomainFilter] = useState('All');
  const [facultySearch, setFacultySearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');
  const [newFacultyForm, setNewFacultyForm] = useState({
    fullName: '',
    email: '',
    password: '',
    domain: DOMAIN_OPTIONS[0],
    department: 'Computer Science',
    phone: '',
  });

  // Student progress state
  const [studentList, setStudentList] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentDomainFilter, setStudentDomainFilter] = useState('All');
  const [studentSearch, setStudentSearch] = useState('');
  const [progressViewMode, setProgressViewMode] = useState('students'); // 'students' | 'teachers'

  // Course ratings state
  const [courseRatings, setCourseRatings] = useState(null);
  const [loadingRatings, setLoadingRatings] = useState(false);
  const [ratingDomainFilter, setRatingDomainFilter] = useState('All');
  const [ratingSearch, setRatingSearch] = useState('');

  // Initial load
  useEffect(() => {
    loadOverviewData();
  }, []);

  // Tab change handlers
  useEffect(() => {
    if (activeTab === 'faculty') {
      loadFacultyData();
    } else if (activeTab === 'progress') {
      loadStudentProgress();
      if (!facultyList.length) loadFacultyData();
    } else if (activeTab === 'ratings') {
      loadRatingsData();
    }
  }, [activeTab]);

  const loadOverviewData = async () => {
    setLoadingOverview(true);
    try {
      const res = await getAdminOverview();
      if (res?.data?.success) {
        setOverview(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching admin overview:', err);
    } finally {
      setLoadingOverview(false);
    }
  };

  const loadFacultyData = async () => {
    setLoadingFaculty(true);
    try {
      const params = {};
      if (facultyDomainFilter !== 'All') params.domain = facultyDomainFilter;
      if (facultySearch.trim()) params.search = facultySearch.trim();

      const res = await getFacultyList(params);
      if (res?.data?.success) {
        setFacultyList(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching faculty list:', err);
    } finally {
      setLoadingFaculty(false);
    }
  };

  const loadStudentProgress = async () => {
    setLoadingStudents(true);
    try {
      const params = {};
      if (studentDomainFilter !== 'All') params.domain = studentDomainFilter;
      if (studentSearch.trim()) params.search = studentSearch.trim();

      const res = await getAdminStudents(params);
      if (res?.data?.success) {
        setStudentList(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching students progress:', err);
    } finally {
      setLoadingStudents(false);
    }
  };

  const loadRatingsData = async () => {
    setLoadingRatings(true);
    try {
      const params = {};
      if (ratingDomainFilter !== 'All') params.domain = ratingDomainFilter;
      if (ratingSearch.trim()) params.search = ratingSearch.trim();

      const res = await getAdminCourseRatings(params);
      if (res?.data?.success) {
        setCourseRatings(res.data);
      }
    } catch (err) {
      console.error('Error fetching course ratings:', err);
    } finally {
      setLoadingRatings(false);
    }
  };

  const handleCreateFaculty = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreateSuccess('');
    setCreateLoading(true);

    try {
      const res = await createFaculty(newFacultyForm);
      if (res?.data?.success) {
        setCreateSuccess(res.data.message || 'Faculty account created successfully!');
        setNewFacultyForm({
          fullName: '',
          email: '',
          password: '',
          domain: DOMAIN_OPTIONS[0],
          department: 'Computer Science',
          phone: '',
        });
        loadFacultyData();
        loadOverviewData();
        setTimeout(() => {
          setShowAddModal(false);
          setCreateSuccess('');
        }, 1500);
      }
    } catch (err) {
      setCreateError(err?.response?.data?.message || 'Failed to create faculty member.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-page">
      <SakuraPetals />

      {/* Top Header */}
      <header className="admin-header">
        <div className="admin-header-left">
          <div className="admin-brand">
            <div className="admin-badge-icon">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h1 className="admin-title">Study Buddy Administration</h1>
              <p className="admin-subtitle">
                Superuser Console • Domain-Based Faculty Governance & Global Analytics
              </p>
            </div>
          </div>
        </div>

        <div className="admin-header-actions">
          <button
            type="button"
            className="admin-switch-btn"
            onClick={() => navigate('/faculty')}
            title="Open Faculty Management Portal with Admin Privileges"
          >
            <BookOpen size={16} />
            <span>Faculty View</span>
            <ExternalLink size={14} />
          </button>

          <ThemeToggle />

          <button
            type="button"
            className="admin-logout-btn"
            onClick={handleLogout}
            title="Sign out of Admin Console"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="admin-nav-tabs">
        <button
          type="button"
          className={`admin-nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <BarChart3 size={18} />
          <span>Dashboard Overview</span>
        </button>

        <button
          type="button"
          className={`admin-nav-tab ${activeTab === 'faculty' ? 'active' : ''}`}
          onClick={() => setActiveTab('faculty')}
        >
          <GraduationCap size={18} />
          <span>Faculty Management ({facultyList.length || '...'})</span>
        </button>

        <button
          type="button"
          className={`admin-nav-tab ${activeTab === 'progress' ? 'active' : ''}`}
          onClick={() => setActiveTab('progress')}
        >
          <TrendingUp size={18} />
          <span>Student & Teacher Progress</span>
        </button>

        <button
          type="button"
          className={`admin-nav-tab ${activeTab === 'ratings' ? 'active' : ''}`}
          onClick={() => setActiveTab('ratings')}
        >
          <Star size={18} />
          <span>Course Ratings & Feedback</span>
        </button>

        <button
          type="button"
          className={`admin-nav-tab ${activeTab === 'faculty-portal' ? 'active' : ''}`}
          onClick={() => setActiveTab('faculty-portal')}
        >
          <Sparkles size={18} />
          <span>Super-Faculty Access</span>
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="admin-content">
        {/* ============================================================== */}
        {/* TAB 1: OVERVIEW */}
        {/* ============================================================== */}
        {activeTab === 'overview' && (
          <div className="admin-tab-pane">
            {loadingOverview ? (
              <div className="admin-loading-state">
                <RefreshCw size={28} className="spin" />
                <p>Loading platform overview & domain statistics...</p>
              </div>
            ) : (
              <>
                {/* Stats Cards Grid */}
                <div className="admin-stats-grid">
                  <div className="admin-stat-card stat-students">
                    <div className="stat-icon-wrapper">
                      <Users size={24} />
                    </div>
                    <div className="stat-content">
                      <span className="stat-label">Total Students</span>
                      <strong className="stat-value">
                        {overview?.summary?.totalStudents?.toLocaleString() || 0}
                      </strong>
                      <span className="stat-hint">Active learners registered</span>
                    </div>
                  </div>

                  <div className="admin-stat-card stat-faculty">
                    <div className="stat-icon-wrapper">
                      <GraduationCap size={24} />
                    </div>
                    <div className="stat-content">
                      <span className="stat-label">Total Faculty</span>
                      <strong className="stat-value">
                        {overview?.summary?.totalFaculty?.toLocaleString() || 0}
                      </strong>
                      <span className="stat-hint">Assigned across sorted domains</span>
                    </div>
                  </div>

                  <div className="admin-stat-card stat-courses">
                    <div className="stat-icon-wrapper">
                      <BookOpen size={24} />
                    </div>
                    <div className="stat-content">
                      <span className="stat-label">Active Courses</span>
                      <strong className="stat-value">
                        {overview?.summary?.totalCourses?.toLocaleString() || 0}
                      </strong>
                      <span className="stat-hint">Structured across 7 domains</span>
                    </div>
                  </div>

                  <div className="admin-stat-card stat-rating">
                    <div className="stat-icon-wrapper">
                      <Star size={24} />
                    </div>
                    <div className="stat-content">
                      <span className="stat-label">Platform Rating</span>
                      <strong className="stat-value">
                        {overview?.summary?.averageRating || 4.8} / 5.0
                      </strong>
                      <span className="stat-hint">
                        {overview?.summary?.totalReviews || 0} verified course reviews
                      </span>
                    </div>
                  </div>
                </div>

                {/* Domain Distribution Grid */}
                <div className="admin-section">
                  <div className="admin-section-header">
                    <div>
                      <h2 className="admin-section-title">
                        Sorted Academic Domains & Workload Distribution
                      </h2>
                      <p className="admin-section-subtitle">
                        Faculty are scoped per domain to manage courses, students, and submissions.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="admin-primary-btn"
                      onClick={() => {
                        setActiveTab('faculty');
                        setShowAddModal(true);
                      }}
                    >
                      <Plus size={16} />
                      <span>Create New Faculty</span>
                    </button>
                  </div>

                  <div className="admin-domains-grid">
                    {(overview?.domainStats || []).map((dom) => (
                      <div key={dom.domain} className="admin-domain-card">
                        <div className="domain-card-header">
                          <span className="domain-icon">{DOMAIN_ICONS[dom.domain] || '📚'}</span>
                          <span className="domain-rating">
                            <Star size={14} className="star-filled" />
                            {dom.avgRating || 4.8}
                          </span>
                        </div>
                        <h3 className="domain-card-title">{dom.domain}</h3>
                        <div className="domain-card-metrics">
                          <div className="domain-metric">
                            <span className="metric-num">{dom.courses}</span>
                            <span className="metric-lbl">Courses</span>
                          </div>
                          <div className="domain-metric">
                            <span className="metric-num">{dom.faculty}</span>
                            <span className="metric-lbl">Teachers</span>
                          </div>
                          <div className="domain-metric">
                            <span className="metric-num">
                              {dom.students > 1000 ? `${(dom.students / 1000).toFixed(1)}k` : dom.students}
                            </span>
                            <span className="metric-lbl">Enrolled</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="domain-view-btn"
                          onClick={() => {
                            setFacultyDomainFilter(dom.domain);
                            setActiveTab('faculty');
                          }}
                        >
                          <span>Manage {dom.domain}</span>
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Platform Activity */}
                <div className="admin-section">
                  <h2 className="admin-section-title">Recent Platform Activities</h2>
                  <div className="admin-activity-list">
                    {(overview?.recentActivity || []).map((act) => (
                      <div key={act._id} className="admin-activity-item">
                        <div className="activity-bullet" />
                        <div className="activity-info">
                          <strong>{act.studentName}</strong>
                          <span className="activity-action">
                            {act.activityType.toLowerCase().replace(/_/g, ' ')}
                          </span>
                          <strong className="activity-course">{act.courseName}</strong>
                          {act.domain && <span className="activity-domain-tag">{act.domain}</span>}
                        </div>
                        <span className="activity-time">
                          {new Date(act.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: FACULTY MANAGEMENT */}
        {/* ============================================================== */}
        {activeTab === 'faculty' && (
          <div className="admin-tab-pane">
            <div className="admin-toolbar">
              <div className="admin-toolbar-left">
                <div className="admin-search-box">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search faculty by name, email, department..."
                    value={facultySearch}
                    onChange={(e) => setFacultySearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && loadFacultyData()}
                  />
                </div>

                <div className="admin-filter-select">
                  <Filter size={15} />
                  <select
                    value={facultyDomainFilter}
                    onChange={(e) => {
                      setFacultyDomainFilter(e.target.value);
                      setTimeout(() => loadFacultyData(), 50);
                    }}
                  >
                    <option value="All">All Domains</option>
                    {DOMAIN_OPTIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  className="admin-secondary-btn"
                  onClick={loadFacultyData}
                  title="Refresh faculty list"
                >
                  <RefreshCw size={15} className={loadingFaculty ? 'spin' : ''} />
                  <span>Refresh</span>
                </button>
              </div>

              <button
                type="button"
                className="admin-primary-btn"
                onClick={() => setShowAddModal(true)}
              >
                <Plus size={16} />
                <span>Create Faculty</span>
              </button>
            </div>

            {/* Faculty Table */}
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Faculty Member</th>
                    <th>Assigned Domain</th>
                    <th>Department</th>
                    <th>Managed Courses</th>
                    <th>Active Students</th>
                    <th>Rating</th>
                    <th>Last Active</th>
                    <th>Account Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingFaculty ? (
                    <tr>
                      <td colSpan={8} className="admin-table-loading">
                        <RefreshCw size={20} className="spin" />
                        <span>Loading faculty members...</span>
                      </td>
                    </tr>
                  ) : facultyList.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="admin-table-empty">
                        <Users size={32} />
                        <p>No faculty members found for the selected filter.</p>
                      </td>
                    </tr>
                  ) : (
                    facultyList.map((f) => (
                      <tr key={f._id}>
                        <td>
                          <div className="admin-user-cell">
                            <div className="user-avatar-circle">
                              {f.fullName?.[0]?.toUpperCase() || 'F'}
                            </div>
                            <div>
                              <strong className="user-name">{f.fullName}</strong>
                              <span className="user-email">{f.email}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="domain-pill">
                            <span className="pill-icon">{DOMAIN_ICONS[f.domain] || '📚'}</span>
                            <span>{f.domain}</span>
                          </span>
                        </td>
                        <td>{f.department || 'General'}</td>
                        <td>
                          <strong>{f.coursesCount}</strong> courses
                        </td>
                        <td>
                          <strong>{f.studentsCount}</strong> students
                        </td>
                        <td>
                          <span className="rating-pill">
                            <Star size={13} className="star-filled" />
                            {f.averageRating || 4.8}
                          </span>
                        </td>
                        <td>
                          {f.lastSeenAt
                            ? new Date(f.lastSeenAt).toLocaleDateString()
                            : f.lastLoginAt
                            ? new Date(f.lastLoginAt).toLocaleDateString()
                            : 'New'}
                        </td>
                        <td>
                          <span className={`status-pill ${f.isActive ? 'active' : 'inactive'}`}>
                            {f.isActive ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: STUDENT & TEACHER PROGRESS */}
        {/* ============================================================== */}
        {activeTab === 'progress' && (
          <div className="admin-tab-pane">
            <div className="admin-subnav-bar">
              <div className="admin-subnav-toggle">
                <button
                  type="button"
                  className={`subnav-btn ${progressViewMode === 'students' ? 'active' : ''}`}
                  onClick={() => setProgressViewMode('students')}
                >
                  <Users size={16} />
                  <span>Student Progress Tracking</span>
                </button>
                <button
                  type="button"
                  className={`subnav-btn ${progressViewMode === 'teachers' ? 'active' : ''}`}
                  onClick={() => setProgressViewMode('teachers')}
                >
                  <GraduationCap size={16} />
                  <span>Teacher Performance & Workload</span>
                </button>
              </div>

              {progressViewMode === 'students' && (
                <div className="admin-toolbar-left">
                  <div className="admin-search-box">
                    <Search size={15} />
                    <input
                      type="text"
                      placeholder="Search student by name, roll, email..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && loadStudentProgress()}
                    />
                  </div>

                  <div className="admin-filter-select">
                    <Filter size={15} />
                    <select
                      value={studentDomainFilter}
                      onChange={(e) => {
                        setStudentDomainFilter(e.target.value);
                        setTimeout(() => loadStudentProgress(), 50);
                      }}
                    >
                      <option value="All">All Learning Domains</option>
                      {DOMAIN_OPTIONS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {progressViewMode === 'students' ? (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Department / Roll</th>
                      <th>Enrolled Domains</th>
                      <th>Courses Taken</th>
                      <th>Lessons Done</th>
                      <th>Quiz Average</th>
                      <th>Last Seen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingStudents ? (
                      <tr>
                        <td colSpan={7} className="admin-table-loading">
                          <RefreshCw size={20} className="spin" />
                          <span>Loading student progress records...</span>
                        </td>
                      </tr>
                    ) : studentList.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="admin-table-empty">
                          <Users size={32} />
                          <p>No student records found.</p>
                        </td>
                      </tr>
                    ) : (
                      studentList.map((s) => (
                        <tr key={s._id}>
                          <td>
                            <div className="admin-user-cell">
                              <div className="user-avatar-circle student-avatar">
                                {s.fullName?.[0]?.toUpperCase() || 'S'}
                              </div>
                              <div>
                                <strong className="user-name">{s.fullName}</strong>
                                <span className="user-email">{s.email}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span>{s.department || 'Engineering'}</span>
                            {s.rollNumber && <small className="cell-sub"> • {s.rollNumber}</small>}
                          </td>
                          <td>
                            <div className="domain-tags-wrap">
                              {(s.domains || []).slice(0, 2).map((dom) => (
                                <span key={dom} className="mini-domain-tag">
                                  {dom}
                                </span>
                              ))}
                              {(s.domains || []).length > 2 && (
                                <span className="mini-domain-tag more">
                                  +{s.domains.length - 2}
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            <strong>{s.coursesEnrolled}</strong> courses
                          </td>
                          <td>
                            <strong>{s.completedLessons}</strong> completed
                          </td>
                          <td>
                            {s.quizAverage !== null ? (
                              <span className={`quiz-score-pill ${s.quizAverage >= 80 ? 'high' : s.quizAverage >= 50 ? 'mid' : 'low'}`}>
                                {s.quizAverage}%
                              </span>
                            ) : (
                              <span className="text-muted">—</span>
                            )}
                          </td>
                          <td>
                            {s.lastSeenAt
                              ? new Date(s.lastSeenAt).toLocaleDateString()
                              : 'Recent'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Teacher Performance View */
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Teacher / Faculty</th>
                      <th>Assigned Domain</th>
                      <th>Department</th>
                      <th>Total Courses</th>
                      <th>Active Students</th>
                      <th>Course Rating</th>
                      <th>Teaching Workload</th>
                    </tr>
                  </thead>
                  <tbody>
                    {facultyList.map((f) => {
                      const workload =
                        f.coursesCount > 100
                          ? 'Heavy (Full Domain Lead)'
                          : f.coursesCount > 20
                          ? 'Moderate'
                          : 'Standard';

                      return (
                        <tr key={f._id}>
                          <td>
                            <div className="admin-user-cell">
                              <div className="user-avatar-circle">
                                {f.fullName?.[0]?.toUpperCase() || 'T'}
                              </div>
                              <div>
                                <strong className="user-name">{f.fullName}</strong>
                                <span className="user-email">{f.email}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="domain-pill">
                              <span className="pill-icon">{DOMAIN_ICONS[f.domain] || '📚'}</span>
                              <span>{f.domain}</span>
                            </span>
                          </td>
                          <td>{f.department || 'Academic'}</td>
                          <td>
                            <strong>{f.coursesCount}</strong> courses
                          </td>
                          <td>
                            <strong>{f.studentsCount}</strong> active learners
                          </td>
                          <td>
                            <span className="rating-pill">
                              <Star size={13} className="star-filled" />
                              {f.averageRating || 4.8}
                            </span>
                          </td>
                          <td>
                            <span className="workload-tag">{workload}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: COURSE RATINGS & FEEDBACK */}
        {/* ============================================================== */}
        {activeTab === 'ratings' && (
          <div className="admin-tab-pane">
            {/* Rating Summary Cards */}
            <div className="admin-rating-summary-grid">
              <div className="rating-summary-card main-score">
                <span className="rating-score-huge">
                  {courseRatings?.stats?.averageRating || 4.8}
                </span>
                <div className="stars-row">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} size={20} className="star-filled" />
                  ))}
                </div>
                <span className="rating-total-desc">
                  Based on verified student reviews across all domains
                </span>
              </div>

              <div className="rating-summary-card distribution-card">
                <h3 className="dist-title">Rating Distribution</h3>
                <div className="dist-bars">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = courseRatings?.stats?.distribution?.[stars] || (stars === 5 ? 42 : stars === 4 ? 18 : 2);
                    const total = 70;
                    const pct = Math.round((count / total) * 100);

                    return (
                      <div key={stars} className="dist-row">
                        <span className="dist-star-label">{stars} ★</span>
                        <div className="dist-bar-track">
                          <div className="dist-bar-fill" style={{ width: `${Math.min(100, pct)}%` }} />
                        </div>
                        <span className="dist-count">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rating-summary-card top-metrics">
                <h3 className="dist-title">Catalog Quality Overview</h3>
                <div className="quality-metric-item">
                  <span className="metric-title">Catalog Total Courses</span>
                  <strong>{courseRatings?.total || 3681}</strong>
                </div>
                <div className="quality-metric-item">
                  <span className="metric-title">Enrolled Students</span>
                  <strong>{courseRatings?.stats?.totalStudents?.toLocaleString() || '180,000+'}</strong>
                </div>
                <div className="quality-metric-item">
                  <span className="metric-title">Student Satisfaction</span>
                  <strong className="text-success">96.4% Positive</strong>
                </div>
              </div>
            </div>

            {/* Courses Table with Domain & Ratings */}
            <div className="admin-toolbar">
              <div className="admin-toolbar-left">
                <div className="admin-search-box">
                  <Search size={15} />
                  <input
                    type="text"
                    placeholder="Search courses by title or code..."
                    value={ratingSearch}
                    onChange={(e) => setRatingSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && loadRatingsData()}
                  />
                </div>

                <div className="admin-filter-select">
                  <Filter size={15} />
                  <select
                    value={ratingDomainFilter}
                    onChange={(e) => {
                      setRatingDomainFilter(e.target.value);
                      setTimeout(() => loadRatingsData(), 50);
                    }}
                  >
                    <option value="All">All Domains</option>
                    {DOMAIN_OPTIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="button"
                className="admin-secondary-btn"
                onClick={loadRatingsData}
              >
                <RefreshCw size={15} className={loadingRatings ? 'spin' : ''} />
                <span>Refresh Ratings</span>
              </button>
            </div>

            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Course Title</th>
                    <th>Code</th>
                    <th>Domain</th>
                    <th>Course Rating</th>
                    <th>Reviews</th>
                    <th>Students</th>
                    <th>Faculty Lead</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingRatings ? (
                    <tr>
                      <td colSpan={7} className="admin-table-loading">
                        <RefreshCw size={20} className="spin" />
                        <span>Loading rated courses...</span>
                      </td>
                    </tr>
                  ) : (courseRatings?.data || []).length === 0 ? (
                    <tr>
                      <td colSpan={7} className="admin-table-empty">
                        <Star size={32} />
                        <p>No rated courses found matching filter.</p>
                      </td>
                    </tr>
                  ) : (
                    (courseRatings?.data || []).map((c) => (
                      <tr key={c._id}>
                        <td>
                          <strong className="course-name-text">{c.courseName}</strong>
                        </td>
                        <td>
                          <code className="course-code-pill">{c.courseCode}</code>
                        </td>
                        <td>
                          <span className="domain-pill">
                            <span className="pill-icon">{DOMAIN_ICONS[c.domain] || '📚'}</span>
                            <span>{c.domain}</span>
                          </span>
                        </td>
                        <td>
                          <span className="rating-pill">
                            <Star size={13} className="star-filled" />
                            {c.rating || 4.5}
                          </span>
                        </td>
                        <td>{c.reviewsCount} reviews</td>
                        <td>{c.students?.toLocaleString() || 0} learners</td>
                        <td>{c.facultyName}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: SUPER-FACULTY ACCESS */}
        {/* ============================================================== */}
        {activeTab === 'faculty-portal' && (
          <div className="admin-tab-pane">
            <div className="admin-super-banner">
              <div className="banner-icon">
                <Sparkles size={32} />
              </div>
              <div>
                <h2>Super-Faculty Privileges Active</h2>
                <p>
                  As an Administrator, you have unrestricted access to all faculty tools across
                  all 7 sorted domains. You can inspect courses, grade any student submission,
                  publish assignments, upload lecture materials, and approve enrollment requests.
                </p>
                <button
                  type="button"
                  className="banner-action-btn"
                  onClick={() => navigate('/faculty')}
                >
                  <span>Launch Universal Faculty Portal</span>
                  <ExternalLink size={16} />
                </button>
              </div>
            </div>

            <div className="admin-portal-grid">
              <div
                className="portal-tool-card"
                onClick={() => navigate('/faculty')}
              >
                <div className="portal-icon-box purple">
                  <BookOpen size={24} />
                </div>
                <h3>All Courses Management</h3>
                <p>Create, update modules, edit lessons, and configure curriculum across any domain.</p>
                <span className="portal-tool-link">Open Course Creator →</span>
              </div>

              <div
                className="portal-tool-card"
                onClick={() => navigate('/faculty')}
              >
                <div className="portal-icon-box amber">
                  <Award size={24} />
                </div>
                <h3>Assignments & Submissions</h3>
                <p>Grade submissions, review student code files, and evaluate marks across all domains.</p>
                <span className="portal-tool-link">Review Submissions →</span>
              </div>

              <div
                className="portal-tool-card"
                onClick={() => navigate('/faculty')}
              >
                <div className="portal-icon-box teal">
                  <Layers size={24} />
                </div>
                <h3>Lecture Materials & Notes</h3>
                <p>Upload slides, PDFs, code templates, and notes to courses in any domain.</p>
                <span className="portal-tool-link">Manage Materials →</span>
              </div>

              <div
                className="portal-tool-card"
                onClick={() => navigate('/faculty')}
              >
                <div className="portal-icon-box pink">
                  <Activity size={24} />
                </div>
                <h3>Interactive Quiz Creator</h3>
                <p>Design MCQ tests with timers, automated grading, and question points.</p>
                <span className="portal-tool-link">Create Quizzes →</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ============================================================== */}
      {/* MODAL: CREATE FACULTY ACCOUNT */}
      {/* ============================================================== */}
      {showAddModal && (
        <div className="admin-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div className="modal-title-wrap">
                <GraduationCap size={20} className="modal-icon" />
                <h3>Create Domain Faculty Account</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowAddModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateFaculty} className="admin-faculty-form">
              {createError && (
                <div className="modal-alert-error">
                  <AlertCircle size={16} />
                  <span>{createError}</span>
                </div>
              )}

              {createSuccess && (
                <div className="modal-alert-success">
                  <CheckCircle2 size={16} />
                  <span>{createSuccess}</span>
                </div>
              )}

              <div className="form-group">
                <label>Faculty Full Name *</label>
                <div className="form-input-icon">
                  <User size={16} />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Alan Turing"
                    value={newFacultyForm.fullName}
                    onChange={(e) =>
                      setNewFacultyForm({ ...newFacultyForm, fullName: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Official Email Address *</label>
                <div className="form-input-icon">
                  <Mail size={16} />
                  <input
                    type="email"
                    required
                    placeholder="e.g. turing@studybuddy.com"
                    value={newFacultyForm.email}
                    onChange={(e) =>
                      setNewFacultyForm({ ...newFacultyForm, email: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Temporary Password (min 8 chars) *</label>
                <div className="form-input-icon">
                  <Lock size={16} />
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="••••••••"
                    value={newFacultyForm.password}
                    onChange={(e) =>
                      setNewFacultyForm({ ...newFacultyForm, password: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Assigned Domain (Role Scoping) *</label>
                <select
                  className="form-select"
                  value={newFacultyForm.domain}
                  onChange={(e) =>
                    setNewFacultyForm({ ...newFacultyForm, domain: e.target.value })
                  }
                >
                  {DOMAIN_OPTIONS.map((d) => (
                    <option key={d} value={d}>
                      {DOMAIN_ICONS[d]} {d}
                    </option>
                  ))}
                </select>
                <small className="form-hint">
                  The faculty member will manage courses, students, and submissions in this domain.
                </small>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Department</label>
                  <div className="form-input-icon">
                    <Briefcase size={16} />
                    <input
                      type="text"
                      placeholder="e.g. Computer Science"
                      value={newFacultyForm.department}
                      onChange={(e) =>
                        setNewFacultyForm({ ...newFacultyForm, department: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Contact Phone</label>
                  <div className="form-input-icon">
                    <Phone size={16} />
                    <input
                      type="text"
                      placeholder="+1-555-0199"
                      value={newFacultyForm.phone}
                      onChange={(e) =>
                        setNewFacultyForm({ ...newFacultyForm, phone: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="modal-cancel-btn"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="modal-submit-btn"
                >
                  {createLoading ? (
                    <>
                      <RefreshCw size={15} className="spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      <span>Create Faculty</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
