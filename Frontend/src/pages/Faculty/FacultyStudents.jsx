import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Award,
  BookOpen,
  CalendarClock,
  ChevronRight,
  Circle,
  LogIn,
  RefreshCw,
  UserCheck,
  Users,
  UserX,
  AlertCircle,
  Wifi,
} from 'lucide-react';
import { getStudents, getStudentDetail } from '../../api/facultyStudentsApi';
import { generateInitials, getRelativeTime } from '../../utils/helpers';
import './FacultyStudentProgress.css';
import './FacultyStudents.css';

// ==============================
// Faculty → Students: every registered student, their registration
// details, when they last logged in / were active, and their learning
// summary. Refreshes every 30 s so "Online now" stays current.
// ==============================

const STATUS = {
  online: { label: 'Online now', badge: 'fsp-status-completed' },
  today: { label: 'Active today', badge: 'fsp-status-in-progress' },
  week: { label: 'Active this week', badge: 'fsp-status-in-progress' },
  inactive: { label: 'Inactive', badge: 'fsp-status-not-started' },
  never: { label: 'Never logged in', badge: 'fsp-status-not-started' },
};

const FILTERS = [
  { key: 'all', label: 'All students' },
  { key: 'online', label: 'Online now' },
  { key: 'today', label: 'Active today' },
  { key: 'week', label: 'Active this week' },
  { key: 'never', label: 'Never logged in' },
];

const ACTIVITY_LABELS = {
  COURSE_OPENED: 'Opened course',
  LESSON_OPENED: 'Opened a lesson',
  LESSON_COMPLETED: 'Completed a lesson',
  QUIZ_COMPLETED: 'Completed a quiz',
  ASSIGNMENT_SUBMITTED: 'Submitted an assignment',
  ASSIGNMENT_EVALUATED: 'Assignment graded',
};

const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—';
const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : '—';

const matchesFilter = (student, filter) => {
  if (filter === 'all') return true;
  if (filter === 'today') return student.status === 'online' || student.status === 'today';
  if (filter === 'week') return ['online', 'today', 'week'].includes(student.status);
  return student.status === filter;
};

export default function FacultyStudents({ onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    setError('');
    try {
      const res = await getStudents();
      setData(res?.data?.data || null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load students.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(() => load(true), 30000);
    return () => clearInterval(timer);
  }, [load]);

  const openStudent = async (id) => {
    setSelectedId(id);
    setDetail(null);
    setDetailError('');
    setDetailLoading(true);
    try {
      const res = await getStudentDetail(id);
      setDetail(res?.data?.data || null);
    } catch (err) {
      setDetailError(err?.response?.data?.message || 'Unable to load this student.');
    } finally {
      setDetailLoading(false);
    }
  };

  const students = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data?.students || []).filter((s) =>
      matchesFilter(s, filter) &&
      (!q || [s.fullName, s.email, s.rollNumber, s.department, s.university, s.phone]
        .some((v) => String(v || '').toLowerCase().includes(q)))
    );
  }, [data, filter, search]);

  // ── Student detail ──────────────────────────
  if (selectedId) {
    const s = detail?.student;
    const status = STATUS[s?.status] || STATUS.inactive;
    return (
      <div className="fsp-root">
        <button className="fsp-back-btn" onClick={() => setSelectedId(null)}>
          <ArrowLeft size={14} /> All students
        </button>

        {detailLoading ? (
          <div className="fsp-loading-state"><div className="fsp-loader" /><p>Loading student…</p></div>
        ) : detailError ? (
          <div className="fsp-error-state">
            <AlertCircle size={32} />
            <h3>Something went wrong</h3>
            <p>{detailError}</p>
            <button className="fsp-retry-btn" onClick={() => openStudent(selectedId)}><RefreshCw size={14} /> Retry</button>
          </div>
        ) : s ? (
          <>
            <div className="fsp-detail-header">
              <div className="fsp-avatar fsp-avatar-lg">{generateInitials(s.fullName || '?')}</div>
              <div className="fsp-detail-identity">
                <h2>{s.fullName}</h2>
                <span className="fsp-student-email">{s.email}</span>
              </div>
              <span className={`fsp-status-badge ${status.badge}`}>
                <span className={`fst-dot ${s.status}`} />{status.label}
              </span>
            </div>

            <div className="fsp-stats-grid">
              <div className="fsp-stat-card">
                <div className="fsp-stat-icon fsp-icon-green"><LogIn size={16} /></div>
                <div>
                  <span className="fsp-stat-value fsp-stat-value-sm">{s.lastLoginAt ? getRelativeTime(s.lastLoginAt) : '—'}</span>
                  <span className="fsp-stat-label">Last login</span>
                </div>
              </div>
              <div className="fsp-stat-card">
                <div className="fsp-stat-icon fsp-icon-blue"><CalendarClock size={16} /></div>
                <div>
                  <span className="fsp-stat-value fsp-stat-value-sm">{s.lastActiveAt ? getRelativeTime(s.lastActiveAt) : '—'}</span>
                  <span className="fsp-stat-label">Last active</span>
                </div>
              </div>
              <div className="fsp-stat-card">
                <div className="fsp-stat-icon fsp-icon-purple"><BookOpen size={16} /></div>
                <div>
                  <span className="fsp-stat-value">{detail.courses.length}</span>
                  <span className="fsp-stat-label">Courses</span>
                </div>
              </div>
              <div className="fsp-stat-card">
                <div className="fsp-stat-icon fsp-icon-amber"><Award size={16} /></div>
                <div>
                  <span className="fsp-stat-value">{detail.certificates.length}</span>
                  <span className="fsp-stat-label">Certificates</span>
                </div>
              </div>
            </div>

            <div className="fsp-detail-section" style={{ marginBottom: 'var(--space-5)' }}>
              <h3 className="fsp-section-title"><Users size={15} /> Student details</h3>
              <div className="fst-info-grid">
                {[
                  ['Full name', s.fullName],
                  ['Email', s.email],
                  ['Phone', s.phone],
                  ['Roll number', s.rollNumber],
                  ['Department', s.department],
                  ['Year of study', s.yearOfStudy ? `Year ${s.yearOfStudy}` : ''],
                  ['College / university', s.university],
                  ['Date of birth', s.dateOfBirth ? formatDate(s.dateOfBirth) : ''],
                  ['Registered on', formatDate(s.createdAt)],
                  ['Last login', formatDateTime(s.lastLoginAt)],
                  ['Last active', formatDateTime(s.lastActiveAt)],
                  ['Total logins', String(s.loginCount || 0)],
                ].map(([label, value]) => (
                  <div key={label} className="fst-info-item">
                    <label>{label}</label>
                    <span>{value || '—'}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="fsp-detail-grid">
              <div className="fsp-detail-section">
                <h3 className="fsp-section-title"><BookOpen size={15} /> Courses</h3>
                {detail.courses.length === 0 ? (
                  <div className="fsp-inline-empty">Not started any course yet.</div>
                ) : detail.courses.map((c) => (
                  <div key={c.courseId} className="fst-course-row">
                    <span className="fsp-course-thumb">{c.thumbnail || '📘'}</span>
                    <div className="fst-course-name">
                      {c.courseName}
                      <small>
                        {c.completedLessons}/{c.totalLessons} lessons
                        {c.averageScore !== null ? ` · avg score ${c.averageScore}%` : ''}
                        {' · '}{getRelativeTime(c.lastActivityAt)}
                      </small>
                    </div>
                    <div className="fst-course-bar">
                      <div className="progress-bar-wrapper sm" style={{ flex: 1 }}>
                        <div className="progress-bar-fill" style={{ width: `${c.percentage}%` }} />
                      </div>
                      <span className="fsp-progress-pct">{c.percentage}%</span>
                    </div>
                  </div>
                ))}

                {detail.certificates.length > 0 && (
                  <>
                    <h3 className="fsp-section-title" style={{ marginTop: 'var(--space-5)' }}><Award size={15} /> Certificates</h3>
                    <ul className="fsp-lesson-list">
                      {detail.certificates.map((c) => (
                        <li key={c.certificateId} className="fsp-lesson-item">
                          <Award size={14} className="fsp-lesson-check" />
                          <span className="fsp-lesson-title">{c.courseName}</span>
                          <span className="fsp-lesson-date">{formatDate(c.issuedAt)} · {c.certificateId}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>

              <div className="fsp-detail-section">
                <h3 className="fsp-section-title"><CalendarClock size={15} /> Recent activity</h3>
                {detail.activity.length === 0 ? (
                  <div className="fsp-inline-empty">No activity yet.</div>
                ) : (
                  <ul className="fsp-activity-feed">
                    {detail.activity.map((a) => (
                      <li key={a._id} className="fsp-activity-item">
                        <Circle size={8} className="fsp-activity-dot" />
                        <div className="fsp-activity-text">
                          <span>
                            {ACTIVITY_LABELS[a.type] || a.type}
                            {a.title ? ` — ${a.title}` : ''}
                            {a.score !== undefined ? ` (${a.score}%)` : ''}
                          </span>
                          <span className="fsp-activity-time">{a.courseName} · {getRelativeTime(a.createdAt)}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </>
        ) : null}
      </div>
    );
  }

  // ── Student list ────────────────────────────
  const summary = data?.summary;
  return (
    <div className="fsp-root">
      {onBack && (
        <button className="fsp-back-btn" onClick={onBack}>
          <ArrowLeft size={14} /> Back to Dashboard
        </button>
      )}
      <div className="fsp-header">
        <h1 className="fsp-page-title"><Users size={22} /> Students</h1>
        <p className="fsp-page-subtitle">
          Everyone registered on Study Buddy — their details, when they last logged in and how they are learning.
        </p>
      </div>

      {loading ? (
        <div className="fsp-loading-state"><div className="fsp-loader" /><p>Loading students…</p></div>
      ) : error ? (
        <div className="fsp-error-state">
          <AlertCircle size={32} />
          <h3>Something went wrong</h3>
          <p>{error}</p>
          <button className="fsp-retry-btn" onClick={() => load()}><RefreshCw size={14} /> Retry</button>
        </div>
      ) : (
        <>
          <div className="fsp-stats-grid">
            <div className="fsp-stat-card">
              <div className="fsp-stat-icon fsp-icon-blue"><Users size={16} /></div>
              <div><span className="fsp-stat-value">{summary.total}</span><span className="fsp-stat-label">Registered students</span></div>
            </div>
            <div className="fsp-stat-card">
              <div className="fsp-stat-icon fsp-icon-green"><Wifi size={16} /></div>
              <div><span className="fsp-stat-value">{summary.online}</span><span className="fsp-stat-label">Online now</span></div>
            </div>
            <div className="fsp-stat-card">
              <div className="fsp-stat-icon fsp-icon-purple"><UserCheck size={16} /></div>
              <div><span className="fsp-stat-value">{summary.activeToday}</span><span className="fsp-stat-label">Active today</span></div>
            </div>
            <div className="fsp-stat-card">
              <div className="fsp-stat-icon fsp-icon-amber"><CalendarClock size={16} /></div>
              <div><span className="fsp-stat-value">{summary.activeThisWeek}</span><span className="fsp-stat-label">Active this week</span></div>
            </div>
            <div className="fsp-stat-card">
              <div className="fsp-stat-icon fsp-icon-pink"><UserX size={16} /></div>
              <div><span className="fsp-stat-value">{summary.neverLoggedIn}</span><span className="fsp-stat-label">Never logged in</span></div>
            </div>
          </div>

          <div className="fsp-students-section">
            <div className="fsp-students-header">
              <h2>
                <Users size={16} /> Students
                <span className="fsp-count-badge">{students.length}</span>
              </h2>
              <input
                type="text"
                className="fsp-search-input"
                placeholder="Search name, email, roll no, department…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="fst-filters">
              {FILTERS.map((f) => (
                <button key={f.key} className={`fst-filter ${filter === f.key ? 'active' : ''}`} onClick={() => setFilter(f.key)}>
                  {f.label}
                </button>
              ))}
            </div>

            {students.length === 0 ? (
              <div className="fsp-empty-state">
                <Users size={36} className="fsp-empty-icon" />
                <h3>No matching students</h3>
                <p>Try a different filter or search term.</p>
              </div>
            ) : (
              <div className="fsp-student-list">
                {students.map((s) => {
                  const status = STATUS[s.status] || STATUS.inactive;
                  return (
                    <button key={s._id} className="fsp-student-row" onClick={() => openStudent(s._id)}>
                      <div className="fsp-student-identity">
                        <div className="fsp-avatar">{generateInitials(s.fullName || '?')}</div>
                        <div className="fsp-student-text">
                          <span className="fsp-student-name">{s.fullName}</span>
                          <span className="fsp-student-email">{s.email}</span>
                        </div>
                      </div>

                      <div className="fst-academic">
                        <span>{[s.rollNumber, s.department, s.yearOfStudy ? `Year ${s.yearOfStudy}` : ''].filter(Boolean).join(' · ') || '—'}</span>
                        <span>{s.university || 'College not given'}</span>
                      </div>

                      <div className="fsp-student-meta">
                        <span title="Courses started"><BookOpen size={12} /> {s.courses} courses</span>
                        <span title="Lessons completed · certificates">{s.lessonsCompleted} lessons · {s.certificates} cert.</span>
                      </div>

                      <div className="fsp-student-activity" title={s.lastLoginAt ? `Last login ${formatDateTime(s.lastLoginAt)}` : 'No login recorded'}>
                        <LogIn size={12} />
                        {s.lastActiveAt ? getRelativeTime(s.lastActiveAt) : 'never'}
                      </div>

                      <span className={`fsp-status-badge ${status.badge}`}>
                        <span className={`fst-dot ${s.status}`} />{status.label}
                      </span>

                      <ChevronRight size={16} className="fsp-course-arrow" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
