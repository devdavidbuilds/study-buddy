import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import GlassCard from '../../components/ui/GlassCard';
import ProgressBar from '../../components/ui/ProgressBar';
import PageState from '../../components/ui/PageState';
import { getCourses } from '../../api/courseApi';
import useProfile from '../../hooks/useProfile';
import { generateInitials } from '../../utils/helpers';

const chartTooltipStyle = {
  contentStyle: { background: '#FFFFFF', border: '1px solid rgba(46,46,46,0.08)', borderRadius: '12px', fontSize: '12px', boxShadow: 'var(--shadow-md)' },
  itemStyle: { color: '#6B6560' },
  labelStyle: { color: '#2E2E2E', fontWeight: 600 },
};

export default function ProgressPage() {
  const { profile } = useProfile();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const res = await getCourses();
        setCourses(Array.isArray(res?.data?.data) ? res.data.data : []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Unable to load progress data.');
      } finally {
        setLoading(false);
      }
    };
    loadProgress();
  }, []);

  const weeklyProgress = [
    { day: 'Mon', hours: 2.5 },
    { day: 'Tue', hours: 3.2 },
    { day: 'Wed', hours: 2.8 },
    { day: 'Thu', hours: 4.1 },
    { day: 'Fri', hours: 3.6 },
    { day: 'Sat', hours: 4.8 },
    { day: 'Sun', hours: 3.7 },
  ];
  const monthlyActivity = [
    { week: 'W1', study: 8, quizzes: 4 },
    { week: 'W2', study: 12, quizzes: 6 },
    { week: 'W3', study: 10, quizzes: 5 },
    { week: 'W4', study: 14, quizzes: 8 },
  ];
  const learningGoals = [
    { id: 1, title: 'Finish 3 lessons', progress: 72 },
    { id: 2, title: 'Solve 10 coding problems', progress: 64 },
  ];
  const leaderboard = [
    { rank: 1, name: 'Mina', problems: 48, xp: 4200 },
    { rank: 2, name: String(profile?.name || 'You'), problems: 36, xp: 3800 },
  ];

  const totalHours = weeklyProgress.reduce((sum, d) => sum + d.hours, 0).toFixed(1);

  if (loading) return <PageState title="Loading progress" message="Preparing your study metrics…" />;
  if (error) return <PageState type="error" title="Unable to load progress" message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Progress</h1>
          <p>Your learning journey at a glance</p>
        </div>
      </div>

      <div className="progress-stats-row">
        <GlassCard className="progress-stat-card">
          <div className="progress-stat-value gradient-text">{profile?.streak || 12}</div>
          <div className="progress-stat-label">Day Streak 🔥</div>
        </GlassCard>
        <GlassCard className="progress-stat-card">
          <div className="progress-stat-value gradient-text">{(profile?.xp || 2400).toLocaleString()}</div>
          <div className="progress-stat-label">Total XP</div>
        </GlassCard>
        <GlassCard className="progress-stat-card">
          <div className="progress-stat-value gradient-text">{profile?.level || 4}</div>
          <div className="progress-stat-label">Level</div>
        </GlassCard>
        <GlassCard className="progress-stat-card">
          <div className="progress-stat-value gradient-text">{totalHours}h</div>
          <div className="progress-stat-label">This Week</div>
        </GlassCard>
      </div>

      <div className="two-col-grid">
        <div>
          <GlassCard style={{ marginBottom: 'var(--space-6)' }}>
            <h3 className="section-title">📊 Weekly Study Hours</h3>
            <div className="chart-wrapper" style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyProgress} barCategoryGap="30%">
                  <XAxis dataKey="day" stroke="#B8B0A8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#B8B0A8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip {...chartTooltipStyle} />
                  <Bar dataKey="hours" fill="url(#barGradientProgress)" radius={[6, 6, 0, 0]} />
                  <defs>
                    <linearGradient id="barGradientProgress" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F8C8DC" />
                      <stop offset="100%" stopColor="#E75480" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="section-title">📈 Monthly Activity</h3>
            <div className="chart-wrapper" style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyActivity}>
                  <CartesianGrid stroke="rgba(46,46,46,0.06)" vertical={false} />
                  <XAxis dataKey="week" stroke="#B8B0A8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#B8B0A8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip {...chartTooltipStyle} />
                  <Line type="monotone" dataKey="study" stroke="#E75480" strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="quizzes" stroke="#C9B6E4" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        <div>
          <GlassCard style={{ marginBottom: 'var(--space-6)' }}>
            <h3 className="section-title">🎯 Learning Goals</h3>
            <div className="goals-list">
              {learningGoals.map(goal => (
                <div key={goal.id} className="goal-item" style={{ marginBottom: 'var(--space-4)' }}>
                  <div className="goal-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
                    <h4 style={{ fontSize: 'var(--font-size-sm)' }}>{goal.title}</h4>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>{goal.progress}%</span>
                  </div>
                  <ProgressBar value={goal.progress} size="sm" />
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="section-title">🏆 Leaderboard</h3>
            {leaderboard.map(l => (
              <div key={l.rank} className={`leaderboard-row ${l.name === currentUser.name ? 'you' : ''}`}>
                <div className="leaderboard-rank">{l.rank}</div>
                <div className="avatar sm">{generateInitials(l.name)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>{l.name}</div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>{l.problems} problems solved</div>
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--color-accent)' }}>{l.xp.toLocaleString()} XP</div>
              </div>
            ))}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
