import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import GlassCard from '../../components/ui/GlassCard';
import ProgressBar from '../../components/ui/ProgressBar';
import ProgressRing from '../../components/ui/ProgressRing';
import PageState from '../../components/ui/PageState';
import { getCourses } from '../../api/courseApi';
import useProfile from '../../hooks/useProfile';
import { getGreeting, formatDate, getDaysUntil, getPriorityColor } from '../../utils/helpers';
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

export default function Workspace() {
  const { profile } = useProfile();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const res = await getCourses();
        setCourses(Array.isArray(res?.data?.data) ? res.data.data : []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Unable to load your workspace data.');
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, []);

  const topCourses = courses.slice(0, 4);
  const weeklyProgress = [
    { day: 'Mon', hours: 2.5, problems: 4 },
    { day: 'Tue', hours: 3.2, problems: 5 },
    { day: 'Wed', hours: 2.8, problems: 3 },
    { day: 'Thu', hours: 4.1, problems: 7 },
    { day: 'Fri', hours: 3.6, problems: 6 },
    { day: 'Sat', hours: 4.8, problems: 8 },
    { day: 'Sun', hours: 3.7, problems: 5 },
  ];
  const recentNotes = [
    { id: 1, title: 'Binary Search', course: 'DSA', updatedAt: '2h ago', color: '#F8C8DC', preview: 'Remember the midpoint invariant when searching sorted arrays.' },
    { id: 2, title: 'React Hooks', course: 'Frontend', updatedAt: 'Yesterday', color: '#C9B6E4', preview: 'Use effect dependencies carefully to avoid loop issues.' },
  ];
  const assignments = [
    { id: 1, title: 'Dynamic Programming Quiz', course: 'Algorithms', priority: 'high', dueDate: new Date(Date.now() + 86400000).toISOString() },
    { id: 2, title: 'API Integration Review', course: 'Backend', priority: 'medium', dueDate: new Date(Date.now() + 259200000).toISOString() },
  ];
  const recentActivity = [
    { id: 1, icon: '💻', action: 'Compiled a Python solution', detail: 'Found the correct traversal approach', time: '12 min ago' },
    { id: 2, icon: '📘', action: 'Completed a lesson', detail: 'Frontend Patterns', time: '1h ago' },
  ];
  const learningGoals = [
    { id: 1, title: 'Finish 3 lessons', progress: 72 },
    { id: 2, title: 'Practice 10 problems', progress: 64 },
  ];
  const schedule = [
    { id: 1, time: '09:00', title: 'Algorithms Review', course: 'DSA', duration: '45m', color: '#E75480' },
    { id: 2, time: '14:00', title: 'Code Lab Session', course: 'Frontend', duration: '60m', color: '#6FA8DC' },
  ];

  if (loading) return <PageState title="Loading workspace" message="Preparing your latest study overview…" />;
  if (error) return <PageState type="error" title="Unable to load workspace" message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="workspace">
      <div className="workspace-greeting animate-fade-in">
        <div>
          <h1>{getGreeting()}, {String(profile?.name || 'Student').split(' ')[0]} 👋</h1>
          <p>{formatDate(new Date())} • Level 4 • 2400 XP</p>
        </div>
        <div className="streak-badge">🔥 12 Day Streak</div>
      </div>

      {/* Continue Learning */}
      <div className="animate-fade-in-up stagger-1">
        <h3 className="section-title">Continue Learning <span className="section-count">{topCourses.length}</span></h3>
        <div className="continue-scroll">
          {topCourses.map(course => (
            <GlassCard key={course.id} hoverable compact className="continue-card">
              <div className="course-emoji">{course.thumbnail}</div>
              <div className="course-title">{course.title}</div>
              <div className="course-meta">{course.instructor || 'Study Buddy'} • {course.completedLessons ?? 0}/{course.totalLessons ?? 0} lessons</div>
                <ProgressBar value={course.progress || 0} size="sm" />
              <div className="course-next">Next: {course.nextLesson || 'Continue the next lesson'}</div>
            </GlassCard>
          ))}
        </div>
      </div>

      <div className="workspace-grid">
        {/* Today's Schedule */}
        <GlassCard className="animate-fade-in-up stagger-2">
          <h3 className="section-title">📅 Today's Schedule</h3>
          <div className="schedule-list">
            {schedule.map(item => (
              <div key={item.id} className="schedule-item">
                <span className="schedule-time">{item.time}</span>
                <span className="schedule-dot" style={{ background: item.color }} />
                <div className="schedule-info">
                  <h4>{item.title}</h4>
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
            {recentNotes.map(note => (
              <GlassCard key={note.id} compact hoverable className="note-card">
                <div className="note-color" style={{ background: note.color }} />
                <h4>{note.title}</h4>
                <p className="note-preview line-clamp-2">{note.preview}</p>
                <div className="note-meta">
                  <span>{note.course}</span>
                  <span>{note.updatedAt}</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </GlassCard>

        {/* Upcoming Assignments */}
        <GlassCard className="animate-fade-in-up stagger-4">
          <h3 className="section-title">📌 Upcoming Assignments</h3>
          <div className="assignment-list">
            {assignments.filter(a => a.status !== 'submitted').slice(0, 4).map(a => (
              <div key={a.id} className="assignment-item">
                <div className="assignment-priority" style={{ background: getPriorityColor(a.priority) }} />
                <div className="assignment-info">
                  <h4>{a.title}</h4>
                  <p>{a.course}</p>
                </div>
                <span className="assignment-due">{getDaysUntil(a.dueDate)}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Weekly Progress Chart */}
        <GlassCard className="span-2 animate-fade-in-up stagger-5">
          <h3 className="section-title">📊 Weekly Study Hours</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyProgress} barCategoryGap="30%">
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
            {topCourses.slice(0, 4).map(c => (
              <div key={c._id || c.id} className="ring-item">
                <ProgressRing value={c.progress || 0} size={70} color={c.color} />
                <span className="truncate" style={{ maxWidth: 80 }}>{String(c.title).split(' ')[0]}</span>
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

        {/* Practice Streak Chart */}
        <GlassCard className="animate-fade-in-up stagger-6">
          <h3 className="section-title">✨ Quiz Questions Practiced</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyProgress}>
                <XAxis dataKey="day" stroke="#B8B0A8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#B8B0A8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip {...chartTooltipStyle} />
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E75480" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#E75480" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="problems" stroke="#E75480" fill="url(#areaGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Learning Goals */}
        <GlassCard className="animate-fade-in-up stagger-7">
          <h3 className="section-title">🎯 Learning Goals</h3>
          <div className="goals-list">
            {learningGoals.map(goal => (
              <div key={goal.id} className="goal-item">
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
            {recentActivity.map(item => (
              <div key={item.id} className="activity-item">
                <span className="activity-icon">{item.icon}</span>
                <div className="activity-info">
                  <h4>{item.action}</h4>
                  <p>{item.detail}{item.course && ` • ${item.course}`}</p>
                </div>
                <span className="activity-time">{item.time}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
