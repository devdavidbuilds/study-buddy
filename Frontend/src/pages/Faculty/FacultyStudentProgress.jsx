import { useState, useEffect, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import {
  ArrowLeft,
  TrendingUp,
  BookOpen,
  Users,
  UserCheck,
  ClipboardList,
  ClipboardCheck,
  Brain,
  Activity,
  Hash,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Clock,
  CheckCircle2,
  Circle,
  MinusCircle,
  BarChart3,
  History,
  FileText,
} from 'lucide-react';
import {
  getCourseProgressOverview,
  getStudentProgressDetail,
  getFacultyOverview,
} from '../../api/facultyProgressApi';
import { generateInitials, getRelativeTime } from '../../utils/helpers';
import './FacultyStudentProgress.css';

const chartTooltipStyle = {
  contentStyle: {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    fontSize: '12px',
    boxShadow: 'var(--shadow-md)',
  },
  itemStyle: { color: 'var(--text-secondary)' },
  labelStyle: { color: 'var(--text-primary)', fontWeight: 600 },
};

const formatDateTime = (value) => {
  if (!value) return '--';
  try {
    return new Date(value).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return '--';
  }
};

const statusColors = {
  'Not Started': 'fsp-status-not-started',
  'In Progress': 'fsp-status-in-progress',
  Completed: 'fsp-status-completed',
};

const ACTIVITY_LABELS = {
  COURSE_OPENED: 'Opened course',
  LESSON_OPENED: 'Opened lesson',
  LESSON_COMPLETED: 'Completed lesson',
  ASSIGNMENT_SUBMITTED: 'Submitted assignment',
  ASSIGNMENT_EVALUATED: 'Assignment graded',
  QUIZ_ATTEMPTED: 'Started quiz',
  QUIZ_COMPLETED: 'Completed quiz',
  QUIZ_SCORE_RECEIVED: 'Received quiz score',
};

export default function FacultyStudentProgress({ onBack }) {
  /* ── View state: 'courses' | 'students' | 'detail' ── */
  const [view, setView] = useState('courses');

  /* ── Courses (Step 1) ── */
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [coursesError, setCoursesError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  /* ── Course overview + student list (Step 2) ── */
  const [overview, setOverview] = useState(null);
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [overviewError, setOverviewError] = useState(null);
  const [studentSearch, setStudentSearch] = useState('');

  /* ── Student detail (Step 3) ── */
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState(null);

  /* ── Fetch faculty's own courses on mount ── */
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoadingCourses(true);
    setCoursesError(null);
    try {
      // Courses this faculty member owns that have students, most students
      // first. (The public catalog is paginated, so filtering its first
      // page missed most courses.)
      const overviewRes = await getFacultyOverview();
      setCourses(overviewRes?.data?.data?.activeCourses || []);
    } catch (err) {
      console.error('FacultyStudentProgress courses fetch error:', err);
      setCoursesError(
        err?.response?.data?.message || err.message || 'Failed to load courses'
      );
    } finally {
      setLoadingCourses(false);
    }
  };

  /* ── Select a course → load course-level analytics + students ── */
  const selectCourse = async (course) => {
    setSelectedCourse(course);
    setView('students');
    fetchOverview(course._id);
  };

  const fetchOverview = async (courseId) => {
    setOverview(null);
    setOverviewError(null);
    setLoadingOverview(true);
    try {
      const res = await getCourseProgressOverview(courseId);
      setOverview(res?.data?.data || null);
    } catch (err) {
      console.error('FacultyStudentProgress overview fetch error:', err);
      setOverviewError(
        err?.response?.data?.message || err.message || 'Failed to load student progress'
      );
    } finally {
      setLoadingOverview(false);
    }
  };

  /* ── Select a student → load their detail view ── */
  const selectStudent = (studentId) => {
    setSelectedStudentId(studentId);
    setView('detail');
    fetchDetail(selectedCourse._id, studentId);
  };

  const fetchDetail = async (courseId, studentId) => {
    setDetail(null);
    setDetailError(null);
    setLoadingDetail(true);
    try {
      const res = await getStudentProgressDetail(courseId, studentId);
      setDetail(res?.data?.data || null);
    } catch (err) {
      console.error('FacultyStudentProgress detail fetch error:', err);
      setDetailError(
        err?.response?.data?.message || err.message || 'Failed to load student details'
      );
    } finally {
      setLoadingDetail(false);
    }
  };

  /* ── Navigation ── */
  const backToCourses = () => {
    setView('courses');
    setSelectedCourse(null);
    setOverview(null);
    setStudentSearch('');
  };

  const backToStudents = () => {
    setView('students');
    setSelectedStudentId(null);
    setDetail(null);
  };

  /* ── Filtered student list ── */
  const filteredStudents = useMemo(() => {
    const students = overview?.students || [];
    const q = studentSearch.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q)
    );
  }, [overview, studentSearch]);

  /* ── Chart data ── */
  const lessonChartData = useMemo(() => {
    return (overview?.lessonCompletionDistribution || []).map((l) => ({
      name:
        l.lessonTitle && l.lessonTitle.length > 14
          ? `${l.lessonTitle.slice(0, 14)}…`
          : l.lessonTitle || l.lessonId,
      fullName: l.lessonTitle || l.lessonId,
      completed: l.completedCount,
    }));
  }, [overview]);

  const activityChartData = useMemo(() => {
    return (overview?.activityOverTime || []).map((d) => ({
      date: d.date.slice(5), // MM-DD
      events: d.count,
    }));
  }, [overview]);

  /* ════════════════════════════════════════════
     RENDER
     ════════════════════════════════════════════ */
  return (
    <div className="fsp-root">
      {/* ── Header ── */}
      <div className="fsp-header">
        <button className="fsp-back-btn" onClick={onBack}>
          <ArrowLeft size={14} /> Back to Dashboard
        </button>
        <h1 className="fsp-page-title">
          <TrendingUp size={20} />
          Student Progress
        </h1>
        <p className="fsp-page-subtitle">
          Monitor how students enrolled in your courses are learning.
        </p>
      </div>

      {/* ── Breadcrumb ── */}
      <div className="fsp-breadcrumb">
        <button
          className={`fsp-crumb ${view === 'courses' ? 'active' : ''}`}
          onClick={backToCourses}
        >
          My Courses
        </button>
        {selectedCourse && (
          <>
            <ChevronRight size={13} className="fsp-crumb-sep" />
            <button
              className={`fsp-crumb ${view === 'students' ? 'active' : ''}`}
              onClick={() => selectCourse(selectedCourse)}
            >
              {selectedCourse.courseName}
            </button>
          </>
        )}
        {view === 'detail' && detail && (
          <>
            <ChevronRight size={13} className="fsp-crumb-sep" />
            <span className="fsp-crumb active">{detail.student?.name}</span>
          </>
        )}
      </div>

      {/* ══════════ STEP 1: My Courses ══════════ */}
      {view === 'courses' && (
        <>
          {loadingCourses ? (
            <div className="fsp-loading-state">
              <div className="fsp-loader" />
              <p>Loading your courses…</p>
            </div>
          ) : coursesError ? (
            <div className="fsp-error-state">
              <AlertCircle size={32} />
              <h3>Something went wrong</h3>
              <p>{coursesError}</p>
              <button className="fsp-retry-btn" onClick={fetchCourses}>
                <RefreshCw size={14} /> Retry
              </button>
            </div>
          ) : courses.length === 0 ? (
            <div className="fsp-empty-state">
              <BookOpen size={36} className="fsp-empty-icon" />
              <h3>No students yet</h3>
              <p>Courses appear here once students start learning in them.</p>
            </div>
          ) : (
            <div className="fsp-course-grid">
              {courses.map((course) => (
                <button
                  key={course._id}
                  className="fsp-course-card"
                  onClick={() => selectCourse(course)}
                >
                  <span className="fsp-course-thumb">{course.thumbnail || '📘'}</span>
                  <div className="fsp-course-info">
                    <h3>{course.courseName}</h3>
                    <span className="fsp-course-code">
                      <Hash size={11} /> {course.courseCode}
                      {course.students ? ` · ${course.students} ${course.students === 1 ? 'student' : 'students'}` : ''}
                    </span>
                  </div>
                  <ChevronRight size={16} className="fsp-course-arrow" />
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* ══════════ STEP 2: Course-level analytics + Student list ══════════ */}
      {view === 'students' && selectedCourse && (
        <>
          {loadingOverview ? (
            <div className="fsp-loading-state">
              <div className="fsp-loader" />
              <p>Loading student progress…</p>
            </div>
          ) : overviewError ? (
            <div className="fsp-error-state">
              <AlertCircle size={32} />
              <h3>Something went wrong</h3>
              <p>{overviewError}</p>
              <button
                className="fsp-retry-btn"
                onClick={() => fetchOverview(selectedCourse._id)}
              >
                <RefreshCw size={14} /> Retry
              </button>
            </div>
          ) : overview ? (
            <>
              {/* ── Course-level stat cards ── */}
              <div className="fsp-stats-grid">
                <div className="fsp-stat-card">
                  <div className="fsp-stat-icon fsp-icon-blue">
                    <Users size={16} />
                  </div>
                  <div>
                    <span className="fsp-stat-value">{overview.courseStats.totalStudents}</span>
                    <span className="fsp-stat-label">Total Students</span>
                  </div>
                </div>
                <div className="fsp-stat-card">
                  <div className="fsp-stat-icon fsp-icon-green">
                    <UserCheck size={16} />
                  </div>
                  <div>
                    <span className="fsp-stat-value">{overview.courseStats.activeStudents}</span>
                    <span className="fsp-stat-label">
                      Active (last {overview.courseStats.activeWindowDays}d)
                    </span>
                  </div>
                </div>
                <div className="fsp-stat-card">
                  <div className="fsp-stat-icon fsp-icon-purple">
                    <BarChart3 size={16} />
                  </div>
                  <div>
                    <span className="fsp-stat-value">
                      {overview.courseStats.overallProgressPercentage}%
                    </span>
                    <span className="fsp-stat-label">Overall Progress</span>
                  </div>
                </div>
                <div className="fsp-stat-card">
                  <div className="fsp-stat-icon fsp-icon-amber">
                    <ClipboardList size={16} />
                  </div>
                  <div>
                    <span className="fsp-stat-value">
                      {overview.courseStats.assignmentSubmissions}
                    </span>
                    <span className="fsp-stat-label">Assignment Submissions</span>
                  </div>
                </div>
                <div className="fsp-stat-card">
                  <div className="fsp-stat-icon fsp-icon-teal">
                    <ClipboardCheck size={16} />
                  </div>
                  <div>
                    <span className="fsp-stat-value">
                      {overview.courseStats.assignmentsEvaluated}
                    </span>
                    <span className="fsp-stat-label">Evaluated</span>
                  </div>
                </div>
                <div className="fsp-stat-card">
                  <div className="fsp-stat-icon fsp-icon-pink">
                    <Brain size={16} />
                  </div>
                  <div>
                    <span className="fsp-stat-value">{overview.courseStats.quizzesCreated}</span>
                    <span className="fsp-stat-label">Quizzes Created</span>
                  </div>
                </div>
              </div>

              {/* ── Analytics charts ── */}
              <div className="fsp-charts-grid">
                <div className="fsp-chart-card">
                  <h3 className="fsp-chart-title">
                    <BookOpen size={15} /> Lesson Completion
                  </h3>
                  {lessonChartData.length === 0 ? (
                    <div className="fsp-chart-empty">
                      <p>This course has no lessons yet.</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={lessonChartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }}
                          interval={0}
                          angle={-25}
                          textAnchor="end"
                          height={50}
                        />
                        <YAxis
                          allowDecimals={false}
                          tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }}
                        />
                        <Tooltip
                          {...chartTooltipStyle}
                          formatter={(value) => [`${value} student${value !== 1 ? 's' : ''}`, 'Completed']}
                          labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName || ''}
                        />
                        <Bar dataKey="completed" fill="#E75480" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div className="fsp-chart-card">
                  <h3 className="fsp-chart-title">
                    <Activity size={15} /> Student Activity Over Time
                  </h3>
                  {activityChartData.every((d) => d.events === 0) ? (
                    <div className="fsp-chart-empty">
                      <p>No recorded activity in the last 14 days.</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={activityChartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} />
                        <YAxis
                          allowDecimals={false}
                          tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }}
                        />
                        <Tooltip {...chartTooltipStyle} formatter={(value) => [`${value} event${value !== 1 ? 's' : ''}`, 'Activity']} />
                        <Line
                          type="monotone"
                          dataKey="events"
                          stroke="#6366f1"
                          strokeWidth={2.5}
                          dot={{ r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* ── Quiz analytics ── */}
              {overview.courseStats.quizzesCreated > 0 && (
                <div className="fsp-notice">
                  <Brain size={14} />
                  <span>
                    {overview.courseStats.quizAttempts > 0
                      ? `${overview.courseStats.quizAttempts} quiz attempt${overview.courseStats.quizAttempts !== 1 ? 's' : ''} recorded${overview.courseStats.avgQuizPercentage !== null ? ` · ${overview.courseStats.avgQuizPercentage}% average` : ''}.`
                      : `${overview.courseStats.quizzesCreated} quiz${overview.courseStats.quizzesCreated !== 1 ? 'zes' : ''} created for this course, but no student attempts are recorded yet.`}
                  </span>
                </div>
              )}

              {/* ── Student list ── */}
              <div className="fsp-students-section">
                <div className="fsp-students-header">
                  <h2>
                    <Users size={16} /> Students
                    <span className="fsp-count-badge">{overview.students.length}</span>
                  </h2>
                  <input
                    type="text"
                    className="fsp-search-input"
                    placeholder="Search by name or email…"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                  />
                </div>

                {overview.students.length === 0 ? (
                  <div className="fsp-empty-state">
                    <Users size={36} className="fsp-empty-icon" />
                    <h3>No students yet</h3>
                    <p>No students have interacted with this course yet.</p>
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="fsp-empty-state">
                    <Users size={36} className="fsp-empty-icon" />
                    <h3>No matching students</h3>
                    <p>Try a different search term.</p>
                  </div>
                ) : (
                  <div className="fsp-student-list">
                    {filteredStudents.map((s) => (
                      <button
                        key={s.studentId}
                        className="fsp-student-row"
                        onClick={() => selectStudent(s.studentId)}
                      >
                        <div className="fsp-student-identity">
                          <div className="fsp-avatar">{generateInitials(s.name || '?')}</div>
                          <div className="fsp-student-text">
                            <span className="fsp-student-name">{s.name}</span>
                            {s.email && <span className="fsp-student-email">{s.email}</span>}
                          </div>
                        </div>

                        <div className="fsp-student-progress">
                          <div className="progress-bar-wrapper sm">
                            <div
                              className="progress-bar-fill"
                              style={{ width: `${Math.min(s.progressPercentage, 100)}%` }}
                            />
                          </div>
                          <span className="fsp-progress-pct">{s.progressPercentage}%</span>
                        </div>

                        <div className="fsp-student-meta">
                          <span title="Completed lessons">
                            <BookOpen size={12} />
                            {s.completedLessonsCount}/{s.totalLessons}
                          </span>
                          <span title="Assignments submitted / evaluated">
                            <ClipboardList size={12} />
                            {s.assignmentsSubmitted} sub · {s.assignmentsEvaluated} eval
                          </span>
                        </div>

                        <div className="fsp-student-activity">
                          <Clock size={12} />
                          {s.lastActivityAt ? getRelativeTime(s.lastActivityAt) : 'No activity'}
                        </div>

                        <span className={`fsp-status-badge ${statusColors[s.status] || ''}`}>
                          {s.status}
                        </span>

                        <ChevronRight size={16} className="fsp-course-arrow" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : null}
        </>
      )}

      {/* ══════════ STEP 3: Student Detail ══════════ */}
      {view === 'detail' && (
        <>
          {loadingDetail ? (
            <div className="fsp-loading-state">
              <div className="fsp-loader" />
              <p>Loading student details…</p>
            </div>
          ) : detailError ? (
            <div className="fsp-error-state">
              <AlertCircle size={32} />
              <h3>Something went wrong</h3>
              <p>{detailError}</p>
              <button
                className="fsp-retry-btn"
                onClick={() => fetchDetail(selectedCourse._id, selectedStudentId)}
              >
                <RefreshCw size={14} /> Retry
              </button>
            </div>
          ) : detail ? (
            <>
              {/* ── Student summary header ── */}
              <div className="fsp-detail-header">
                <div className="fsp-avatar fsp-avatar-lg">
                  {generateInitials(detail.student?.name || '?')}
                </div>
                <div className="fsp-detail-identity">
                  <h2>{detail.student?.name}</h2>
                  <span className="fsp-student-email">{detail.student?.email}</span>
                </div>
                <span className={`fsp-status-badge ${statusColors[detail.status] || ''}`}>
                  {detail.status}
                </span>
              </div>

              {/* ── Progress summary cards ── */}
              <div className="fsp-stats-grid">
                <div className="fsp-stat-card">
                  <div className="fsp-stat-icon fsp-icon-purple">
                    <BarChart3 size={16} />
                  </div>
                  <div>
                    <span className="fsp-stat-value">{detail.progress.percentage}%</span>
                    <span className="fsp-stat-label">Course Progress</span>
                  </div>
                </div>
                <div className="fsp-stat-card">
                  <div className="fsp-stat-icon fsp-icon-blue">
                    <BookOpen size={16} />
                  </div>
                  <div>
                    <span className="fsp-stat-value">
                      {detail.progress.completedLessonsCount}/{detail.progress.totalLessons}
                    </span>
                    <span className="fsp-stat-label">Lessons Completed</span>
                  </div>
                </div>
                <div className="fsp-stat-card">
                  <div className="fsp-stat-icon fsp-icon-amber">
                    <ClipboardList size={16} />
                  </div>
                  <div>
                    <span className="fsp-stat-value">{detail.assignments.submitted}</span>
                    <span className="fsp-stat-label">Assignments Submitted</span>
                  </div>
                </div>
                <div className="fsp-stat-card">
                  <div className="fsp-stat-icon fsp-icon-teal">
                    <ClipboardCheck size={16} />
                  </div>
                  <div>
                    <span className="fsp-stat-value">{detail.assignments.evaluated}</span>
                    <span className="fsp-stat-label">Evaluated</span>
                  </div>
                </div>
                <div className="fsp-stat-card">
                  <div className="fsp-stat-icon fsp-icon-green">
                    <Clock size={16} />
                  </div>
                  <div>
                    <span className="fsp-stat-value fsp-stat-value-sm">
                      {detail.lastActivityAt ? getRelativeTime(detail.lastActivityAt) : '--'}
                    </span>
                    <span className="fsp-stat-label">Last Activity</span>
                  </div>
                </div>
              </div>

              <div className="fsp-detail-grid">
                {/* ── Completed lessons ── */}
                <div className="fsp-detail-section">
                  <h3 className="fsp-section-title">
                    <BookOpen size={15} /> Completed Lessons
                  </h3>
                  {detail.progress.completedLessons.length === 0 ? (
                    <div className="fsp-inline-empty">No lessons completed yet.</div>
                  ) : (
                    <ul className="fsp-lesson-list">
                      {detail.progress.completedLessons
                        .slice()
                        .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
                        .map((l, i) => (
                          <li key={`${l.moduleId}-${l.lessonId}-${i}`} className="fsp-lesson-item">
                            <CheckCircle2 size={14} className="fsp-lesson-check" />
                            <span className="fsp-lesson-title">{l.lessonTitle || l.lessonId}</span>
                            <span className="fsp-lesson-date">{formatDateTime(l.completedAt)}</span>
                          </li>
                        ))}
                    </ul>
                  )}
                </div>

                {/* ── Assignment submissions ── */}
                <div className="fsp-detail-section">
                  <h3 className="fsp-section-title">
                    <ClipboardList size={15} /> Assignment Submissions
                  </h3>
                  {detail.assignments.entries.length === 0 ? (
                    <div className="fsp-inline-empty">No assignments submitted yet.</div>
                  ) : (
                    <ul className="fsp-assignment-detail-list">
                      {detail.assignments.entries.map((a, i) => (
                        <li key={`${a.assignmentId || 'legacy'}-${i}`} className="fsp-assignment-detail-item">
                          <div className="fsp-assignment-detail-top">
                            <span className="fsp-assignment-detail-title">
                              {a.title || 'Untitled assignment'}
                            </span>
                            {a.status === 'Evaluated' ? (
                              <span className="fsp-status-badge fsp-status-completed">
                                <CheckCircle2 size={11} /> {a.marks}/{a.maxMarks}
                              </span>
                            ) : a.status === 'Returned' ? (
                              <span className="fsp-status-badge fsp-status-in-progress">
                                <MinusCircle size={11} /> Returned
                              </span>
                            ) : (
                              <span className="fsp-status-badge fsp-status-in-progress">
                                <MinusCircle size={11} /> Pending
                              </span>
                            )}
                          </div>
                          <div className="fsp-assignment-detail-meta">
                            <span>
                              <Clock size={11} /> Submitted {formatDateTime(a.submittedAt)}
                            </span>
                            {a.evaluatedAt && (
                              <span>
                                <CheckCircle2 size={11} /> Evaluated {formatDateTime(a.evaluatedAt)}
                              </span>
                            )}
                          </div>
                          {a.feedback && (
                            <div className="fsp-assignment-feedback">
                              <FileText size={11} /> {a.feedback}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* ── Quiz activity ── */}
                <div className="fsp-detail-section">
                  <h3 className="fsp-section-title">
                    <Brain size={15} /> Quiz Activity
                  </h3>
                  {detail.quizzes.attempts.length === 0 ? (
                    <div className="fsp-inline-empty">{detail.quizzes.note}</div>
                  ) : (
                    <ul className="fsp-assignment-list">
                      {detail.quizzes.attempts.map((attempt) => (
                        <li key={`${attempt.quizId}-${attempt.submittedAt}`} className="fsp-assignment-item">
                          <div className="fsp-assignment-detail-title">
                            <strong>{attempt.title}</strong>
                            <span className="fsp-status-badge fsp-status-completed">
                              <CheckCircle2 size={11} /> {attempt.percentage}%
                            </span>
                          </div>
                          <div className="fsp-assignment-detail-meta">
                            <span>{attempt.score}/{attempt.totalMarks} marks</span>
                            <span>{attempt.correctAnswers} correct · {attempt.incorrectAnswers} incorrect</span>
                            <span><Clock size={11} /> Submitted {formatDateTime(attempt.submittedAt)}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* ── Recent activity feed ── */}
                <div className="fsp-detail-section">
                  <h3 className="fsp-section-title">
                    <History size={15} /> Recent Activity
                  </h3>
                  {detail.recentActivity.length === 0 ? (
                    <div className="fsp-inline-empty">No recorded activity yet.</div>
                  ) : (
                    <ul className="fsp-activity-feed">
                      {detail.recentActivity.map((a, i) => (
                        <li key={i} className="fsp-activity-item">
                          <Circle size={8} className="fsp-activity-dot" />
                          <div className="fsp-activity-text">
                            <span>
                              {ACTIVITY_LABELS[a.activityType] || a.activityType}
                              {a.assignmentTitle ? ` — ${a.assignmentTitle}` : ''}
                            </span>
                            <span className="fsp-activity-time">{getRelativeTime(a.createdAt)}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </>
          ) : null}
        </>
      )}
    </div>
  );
}
