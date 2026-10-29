import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { LogOut } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import ProgressBar from '../../components/ui/ProgressBar';
import ProgressRing from '../../components/ui/ProgressRing';
import PageState from '../../components/ui/PageState';
import useProfile from '../../hooks/useProfile';
import useLearningSummary from '../../hooks/useLearningSummary';
import { getStudySessions } from '../../api/plannerApi';
import { getNotes } from '../../api/notesApi';
import { getMyActivity } from '../../api/activityApi';
import { logout } from '../../api/authApi';
import { getGreeting, formatDate, getDaysUntil, getPriorityColor, getRelativeTime } from '../../utils/helpers';
import './Workspace.css';

const quickActions = [
  { icon: '📝', label: 'New Note', to: '/notes' },
  { icon: '🌸', label: 'AI Tutor', to: '/ai-tutor' },
  { icon: '📋', label: 'Start Quiz', to: '/courses' },
  { icon: '📅', label: 'Planner', to: '/planner' },
];

const chartTooltipStyle = {
  contentStyle: { background: '#FFFFFF', border: '1px solid rgba(46,46,46,0.08)', borderRadius: '12px', fontSize: '12px', boxShadow: 'var(--shadow-md)' },
  itemStyle: { color: '#6B6560' },
  labelStyle: { color: '#2E2E2E', fontWeight: 600 },
};

const ACTIVITY_ICONS = {
  COURSE_OPENED: ['📘', 'Opened a course'],
  LESSON_OPENED: ['📖', 'Opened a lesson'],
  LESSON_COMPLETED: ['✅', 'Completed a lesson'],
  QUIZ_COMPLETED: ['📝', 'Completed a quiz'],
  ASSIGNMENT_SUBMITTED: ['📤', 'Submitted an assignment'],
  ASSIGNMENT_EVALUATED: ['🏷️', 'Assignment graded'],
};

const SESSION_COLORS = ['#E75480', '#6FA8DC', '#C9B6E4', '#5BB974', '#F0A94E'];

// Local calendar date as YYYY-MM-DD.
const todayKey = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

const priorityFor = (dueDate) => {
  if (!dueDate) return 'normal';
  const days = (new Date(dueDate) - new Date()) / 86400000;
  if (days <= 2) return 'high';
  if (days <= 7) return 'medium';
  return 'low';
};

const emptyText = { fontSize: 'var(--font-size-sm)', color: 'var(--text-tertiary)' };

export default function Workspace() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { summary, loading, error, refresh } = useLearningSummary();
  const [sessions, setSessions] = useState([]);
  const [notes, setNotes] = useState([]);
  const [activity, setActivity] = useState([]);

  // Secondary panels load independently; a failure only empties that panel.
  useEffect(() => {
    const today = todayKey();
    getStudySessions(today, today)
      .then((res) => setSessions(Array.isArray(res?.data?.data) ? res.data.data : []))
      .catch(() => setSessions([]));
    getNotes()
      .then((res) => setNotes(Array.isArray(res?.data?.data) ? res.data.data : []))
      .catch(() => setNotes([]));
    getMyActivity({ limit: 4 })
      .then((res) => setActivity(Array.isArray(res?.data?.data) ? res.data.data : []))
      .catch(() => setActivity([]));
  }, []);

  const courses = summary?.courses || [];
  // Unfinished courses first (most recently active), then finished ones.
  const topCourses = [...courses.filter((c) => c.percentage < 100), ...courses.filter((c) => c.percentage === 100)].slice(0, 4);
  const schedule = [...sessions]
    .sort((a, b) => String(a.startTime).localeCompare(String(b.startTime)))
    .map((s, i) => ({
      id: s._id,
      time: s.startTime,
      title: s.title || s.courseName,
      course: s.courseName,
      duration: `${s.durationMinutes}m`,
      color: SESSION_COLORS[i % SESSION_COLORS.length],
      completed: s.completed,
    }));
  const firstName = String(profile?.fullName || 'Student').split(' ')[0];

  const openCourse = (course) => {
    const next = course.nextLesson;
    navigate(next ? `/courses/${course._id}/learn/${next.moduleId}/${next.lessonId}` : `/courses/${course._id}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) return <PageState title="Loading workspace" message="Preparing your latest study overview…" />;
  if (error) return <PageState type="error" title="Unable to load workspace" message={error} onRetry={refresh} />;

  return (
    <div className="workspace">
      <div className="workspace-greeting animate-fade-in">
        <div>
          <h1>{getGreeting()}, {firstName} 👋</h1>
          <p>{formatDate(new Date())} • Level {summary.level} • {summary.xp.toLocaleString()} XP</p>
        </div>
        <div className="workspace-greeting-actions">
          <div className="streak-badge">🔥 {summary.streak} Day Streak</div>
          <button
            type="button"
            className="workspace-signout-btn"
            onClick={handleLogout}
            title="Sign Out of Study Buddy"
            aria-label="Sign Out"
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Continue Learning */}
      <div className="animate-fade-in-up stagger-1">
        <h3 className="section-title">Continue Learning <span className="section-count">{topCourses.length}</span></h3>
        <div className="continue-scroll">
          {topCourses.length === 0 ? (
            <GlassCard compact className="continue-card">
              <div className="course-emoji">📘</div>
              <div className="course-title">No courses started yet</div>
              <div className="course-meta">Pick a course and complete your first lesson.</div>
              <Link to="/courses" className="course-next">Browse courses →</Link>
            </GlassCard>
          ) : topCourses.map(course => (
            <GlassCard key={course._id} hoverable compact className="continue-card" onClick={() => openCourse(course)}>
              <div className="course-emoji">{course.thumbnail || '📘'}</div>
              <div className="course-title">{course.courseName}</div>
              <div className="course-meta">{course.instructor} • {course.completedLessons}/{course.totalLessons} lessons</div>
              <ProgressBar value={course.percentage} size="sm" />
              <div className="course-next">{course.nextLesson ? `Next: ${course.nextLesson.title}` : 'Completed 🎉'}</div>
            </GlassCard>
          ))}
        </div>
      </div>

      <div className="workspace-grid">
        {/* Today's Schedule (Planner) */}
        <GlassCard className="animate-fade-in-up stagger-2">
          <h3 className="section-title">📅 Today's Schedule</h3>
          <div className="schedule-list">
            {schedule.length === 0 ? (
              <p style={emptyText}>No study sessions planned for today. <Link to="/planner">Plan one in the Planner →</Link></p>
            ) : schedule.map(item => (
              <div key={item.id} className="schedule-item">
                <span className="schedule-time">{item.time}</span>
                <span className="schedule-dot" style={{ background: item.color }} />
                <div className="schedule-info">
                  <h4>{item.title}{item.completed ? ' ✓' : ''}</h4>
                  <p>{item.course}</p>
                </div>
                <span className="schedule-duration">{item.duration}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Recent Notes */}
        <GlassCard className="animate-fade-in-up stagger-3">
          <h3 className="section-title">📒 Recent Notes</h3>
          <div className="notes-grid">
            {notes.length === 0 ? (
              <p style={emptyText}>No notes yet. <Link to="/notes">Write your first note →</Link></p>
            ) : notes.slice(0, 2).map(note => (
              <GlassCard key={note._id} compact hoverable className="note-card" onClick={() => navigate('/notes')}>
                <div className="note-color" style={{ background: note.color }} />
                <h4>{note.title}</h4>
                <p className="note-preview line-clamp-2">{note.content || 'No content yet.'}</p>
                <div className="note-meta">
                  <span>{note.course}</span>
                  <span>{getRelativeTime(note.updatedAt)}</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </GlassCard>

        {/* Upcoming Assignments */}
        <GlassCard className="animate-fade-in-up stagger-4">
          <h3 className="section-title">📌 Upcoming Assignments</h3>
          <div className="assignment-list">
            {summary.assignments.length === 0 ? (
              <p style={emptyText}>No pending assignments in your courses. 🎉</p>
            ) : summary.assignments.slice(0, 4).map(a => (
              <div key={a._id} className="assignment-item" style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/courses/${a.courseId}/learn/${a.moduleId}/${a.lessonId}`)}>
                <div className="assignment-priority" style={{ background: getPriorityColor(priorityFor(a.dueDate)) }} />
                <div className="assignment-info">
                  <h4>{a.title}</h4>
                  <p>{a.courseName}{a.status === 'Returned' ? ' • Returned for changes' : ''}</p>
                </div>
                <span className="assignment-due">{a.dueDate ? getDaysUntil(a.dueDate) : 'No due date'}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Weekly Progress Chart — study time estimated from lessons completed */}
        <GlassCard className="span-2 animate-fade-in-up stagger-5">
          <h3 className="section-title">📊 Weekly Study Hours</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.weekly} barCategoryGap="30%">
                <XAxis dataKey="day" stroke="#B8B0A8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#B8B0A8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip {...chartTooltipStyle} />
                <Bar dataKey="hours" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F8C8DC" />
                    <stop offset="100%" stopColor="#E75480" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Course Progress Rings */}
        <GlassCard className="animate-fade-in-up stagger-6">
          <h3 className="section-title">🎯 Course Progress</h3>
          <div className="progress-rings-row">
            {topCourses.length === 0 ? (
              <p style={emptyText}>Your course progress will appear here.</p>
            ) : topCourses.map(c => (
              <div key={c._id} className="ring-item" title={c.courseName}>
                <ProgressRing value={c.percentage} size={70} color={c.color} />
                <span className="truncate" style={{ maxWidth: 80 }}>{String(c.courseName).split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Quick Actions */}
        <GlassCard className="animate-fade-in-up stagger-5">
          <h3 className="section-title">⚡ Quick Actions</h3>
          <div className="quick-actions-grid">
            {quickActions.map(action => (
              <Link key={action.label} to={action.to} className="quick-action">
                <span className="action-icon">{action.icon}</span>
                {action.label}
              </Link>
            ))}
          </div>
        </GlassCard>

        {/* Quiz questions answered per day */}
        <GlassCard className="animate-fade-in-up stagger-6">
          <h3 className="section-title">✨ Quiz Questions Practiced</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={summary.weekly}>
                <XAxis dataKey="day" stroke="#B8B0A8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#B8B0A8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip {...chartTooltipStyle} />
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E75480" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#E75480" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="problems" name="questions" stroke="#E75480" fill="url(#areaGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Learning Goals (weekly study goals from the Planner) */}
        <GlassCard className="animate-fade-in-up stagger-7">
          <h3 className="section-title">🎯 Learning Goals</h3>
          <div className="goals-list">
            {summary.goals.length === 0 ? (
              <p style={emptyText}>No weekly goals yet. <Link to="/planner">Set a goal in the Planner →</Link></p>
            ) : summary.goals.map(goal => (
              <div key={goal._id} className="goal-item">
                <div className="goal-header">
                  <h4>{goal.title}</h4>
                  <span>{goal.progress}%</span>
                </div>
                <ProgressBar value={goal.progress} size="sm" />
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Recent Activity */}
        <GlassCard className="span-2 animate-fade-in-up stagger-8">
          <h3 className="section-title">🕐 Recent Activity</h3>
          <div className="activity-list">
            {activity.length === 0 ? (
              <p style={emptyText}>No activity yet. Open a course to get started.</p>
            ) : activity.map(item => {
              const [icon, action] = ACTIVITY_ICONS[item.activityType] || ['•', item.activityType];
              const title = item.metadata?.title;
              const score = item.metadata?.percentage;
              return (
                <div key={item._id} className="activity-item">
                  <span className="activity-icon">{icon}</span>
                  <div className="activity-info">
                    <h4>{action}{score !== undefined ? ` — ${score}%` : ''}</h4>
                    <p>{[title, item.course?.courseName].filter(Boolean).join(' • ')}</p>
                  </div>
                  <span className="activity-time">{getRelativeTime(item.createdAt)}</span>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
