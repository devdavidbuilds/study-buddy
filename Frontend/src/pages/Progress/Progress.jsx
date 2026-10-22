import { useEffect, useState } from 'react';
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
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  History,
} from 'lucide-react';

import GlassCard from '../../components/ui/GlassCard';
import ProgressBar from '../../components/ui/ProgressBar';
import PageState from '../../components/ui/PageState';
import { getMyActivity } from '../../api/activityApi';
import useLearningSummary from '../../hooks/useLearningSummary';
import { generateInitials, getRelativeTime } from '../../utils/helpers';

// Icon + label for each activity type this feed can display. Only
// meaningful, real events land in this feed — nothing here is mocked.
const ACTIVITY_DISPLAY = {
  COURSE_OPENED: { icon: BookOpen, label: 'Opened course' },
  LESSON_OPENED: { icon: BookOpen, label: 'Opened lesson' },
  LESSON_COMPLETED: { icon: CheckCircle2, label: 'Completed lesson' },
  QUIZ_COMPLETED: { icon: ClipboardCheck, label: 'Completed quiz' },
  ASSIGNMENT_SUBMITTED: { icon: ClipboardList, label: 'Submitted assignment' },
  ASSIGNMENT_EVALUATED: { icon: ClipboardCheck, label: 'Assignment graded' },
};

function describeActivity(activity) {
  const display = ACTIVITY_DISPLAY[activity.activityType] || {
    icon: History,
    label: activity.activityType,
  };

  const courseName = activity.course?.courseName || '';
  const title =
    activity.assignment?.title || activity.metadata?.title || '';

  let detail = courseName;

  if (activity.activityType === 'ASSIGNMENT_SUBMITTED' && title) {
    detail = `${title}${courseName ? ` · ${courseName}` : ''}`;
  }

  if (activity.activityType === 'ASSIGNMENT_EVALUATED') {
    const marks = activity.metadata?.marks;
    const maxMarks = activity.metadata?.maxMarks;
    const scoreText =
      marks !== undefined && maxMarks !== undefined
        ? ` — Scored ${marks}/${maxMarks}`
        : '';
    detail = `${title}${courseName ? ` · ${courseName}` : ''}${scoreText}`;
  }

  if (activity.activityType === 'QUIZ_COMPLETED') {
    const score = activity.metadata?.percentage;
    detail = `${title || 'Quiz'}${score !== undefined ? ` — ${score}%` : ''}${courseName ? ` · ${courseName}` : ''}`;
  }

  if (activity.activityType === 'LESSON_OPENED' || activity.activityType === 'LESSON_COMPLETED') {
    const lessonTitle = activity.metadata?.lessonTitle || '';
    detail = `${lessonTitle || 'Lesson'}${courseName ? ` · ${courseName}` : ''}`;
  }

  return { ...display, detail };
}

const chartTooltipStyle = {
  contentStyle: {
    background: '#FFFFFF',
    border: '1px solid rgba(46,46,46,0.08)',
    borderRadius: '12px',
    fontSize: '12px',
    boxShadow: 'var(--shadow-md)',
  },
  itemStyle: {
    color: '#6B6560',
  },
  labelStyle: {
    color: '#2E2E2E',
    fontWeight: 600,
  },
};

export default function ProgressPage() {
  const { summary, loading, error, refresh } = useLearningSummary();

  const [activity, setActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);

  useEffect(() => {
    const loadActivity = async () => {
      try {
        const res = await getMyActivity({ limit: 10 });

        setActivity(
          Array.isArray(res?.data?.data) ? res.data.data : []
        );
      } catch (err) {
        // Non-fatal: the rest of the Progress page still renders.
        setActivity([]);
      } finally {
        setActivityLoading(false);
      }
    };

    loadActivity();
  }, []);

  // All figures below come from GET /api/progress/summary (real records).
  const weeklyProgress = summary?.weekly || [];
  const monthlyActivity = summary?.monthly || [];
  const learningGoals = summary?.goals || [];
  const leaderboard = summary?.leaderboard || [];
  const totalHours = summary?.stats?.hoursThisWeek ?? 0;

  if (loading) {
    return (
      <PageState
        title="Loading progress"
        message="Preparing your study metrics…"
      />
    );
  }

  if (error) {
    return (
      <PageState
        type="error"
        title="Unable to load progress"
        message={error}
        onRetry={refresh}
      />
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Progress</h1>
          <p>Your learning journey at a glance</p>
        </div>
      </div>

      {/* Progress Statistics */}
      <div className="progress-stats-row">
        <GlassCard className="progress-stat-card">
          <div className="progress-stat-value gradient-text">
            {summary.streak}
          </div>

          <div className="progress-stat-label">
            Day Streak 🔥
          </div>
        </GlassCard>

        <GlassCard className="progress-stat-card">
          <div className="progress-stat-value gradient-text">
            {summary.xp.toLocaleString()}
          </div>

          <div className="progress-stat-label">
            Total XP
          </div>
        </GlassCard>

        <GlassCard className="progress-stat-card">
          <div className="progress-stat-value gradient-text">
            {summary.level}
          </div>

          <div className="progress-stat-label">
            Level
          </div>
        </GlassCard>

        <GlassCard className="progress-stat-card">
          <div className="progress-stat-value gradient-text">
            {totalHours}h
          </div>

          <div className="progress-stat-label">
            This Week
          </div>
        </GlassCard>
      </div>

      {/* Main Content */}
      <div className="two-col-grid">
        {/* LEFT COLUMN */}
        <div>
          {/* Weekly Study Hours */}
          <GlassCard
            style={{
              marginBottom: 'var(--space-6)',
            }}
          >
            <h3 className="section-title">
              📊 Weekly Study Hours
            </h3>

            <div
              className="chart-wrapper"
              style={{ height: 220 }}
            >
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={weeklyProgress}
                  barCategoryGap="30%"
                >
                  <XAxis
                    dataKey="day"
                    stroke="#B8B0A8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />

                  <YAxis
                    stroke="#B8B0A8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />

                  <Tooltip
                    {...chartTooltipStyle}
                  />

                  <Bar
                    dataKey="hours"
                    fill="url(#barGradientProgress)"
                    radius={[6, 6, 0, 0]}
                  />

                  <defs>
                    <linearGradient
                      id="barGradientProgress"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#F8C8DC"
                      />

                      <stop
                        offset="100%"
                        stopColor="#E75480"
                      />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Monthly Activity */}
          <GlassCard>
            <h3 className="section-title">
              📈 Monthly Activity
            </h3>

            <div
              className="chart-wrapper"
              style={{ height: 220 }}
            >
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <LineChart
                  data={monthlyActivity}
                >
                  <CartesianGrid
                    stroke="rgba(46,46,46,0.06)"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="week"
                    stroke="#B8B0A8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />

                  <YAxis
                    stroke="#B8B0A8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />

                  <Tooltip
                    {...chartTooltipStyle}
                  />

                  <Line
                    type="monotone"
                    dataKey="study"
                    stroke="#E75480"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                  />

                  <Line
                    type="monotone"
                    dataKey="quizzes"
                    stroke="#C9B6E4"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        {/* RIGHT COLUMN */}
        <div>
          {/* Learning Goals */}
          <GlassCard
            style={{
              marginBottom: 'var(--space-6)',
            }}
          >
            <h3 className="section-title">
              🎯 Learning Goals
            </h3>

            <div className="goals-list">
              {learningGoals.length === 0 && (
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-tertiary)' }}>
                  No weekly goals yet — set one in the Planner to track it here.
                </p>
              )}
              {learningGoals.map((goal) => (
                <div
                  key={goal._id}
                  className="goal-item"
                  style={{
                    marginBottom: 'var(--space-4)',
                  }}
                >
                  <div
                    className="goal-header"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: 'var(--space-1)',
                    }}
                  >
                    <h4
                      style={{
                        fontSize:
                          'var(--font-size-sm)',
                      }}
                    >
                      {goal.title}
                    </h4>

                    <span
                      style={{
                        fontSize:
                          'var(--font-size-xs)',
                        color:
                          'var(--text-tertiary)',
                      }}
                    >
                      {goal.progress}%
                    </span>
                  </div>

                  <ProgressBar
                    value={goal.progress}
                    size="sm"
                  />
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Leaderboard */}
          <GlassCard>
            <h3 className="section-title">
              🏆 Leaderboard
            </h3>

            {leaderboard.map((leader) => (
              <div
                key={leader.rank}
                className={`leaderboard-row ${
                  leader.isYou ? 'you' : ''
                }`}
              >
                <div className="leaderboard-rank">
                  {leader.rank}
                </div>

                <div className="avatar sm">
                  {generateInitials(
                    leader.name
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize:
                        'var(--font-size-sm)',
                      fontWeight: 600,
                    }}
                  >
                    {leader.name}
                  </div>

                  <div
                    style={{
                      fontSize:
                        'var(--font-size-xs)',
                      color:
                        'var(--text-tertiary)',
                    }}
                  >
                    {leader.lessons} lessons
                    completed
                  </div>
                </div>

                <div
                  style={{
                    fontSize:
                      'var(--font-size-sm)',
                    fontWeight: 700,
                    color:
                      'var(--color-accent)',
                  }}
                >
                  {leader.xp.toLocaleString()} XP
                </div>
              </div>
            ))}
          </GlassCard>
        </div>
      </div>

      {/* Recent Activity — real, tracked learning events */}
      <GlassCard style={{ marginTop: 'var(--space-6)' }}>
        <h3 className="section-title">
          <History size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
          Recent Activity
        </h3>

        {activityLoading ? (
          <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)' }}>
            Loading your recent activity…
          </p>
        ) : activity.length === 0 ? (
          <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)' }}>
            No activity yet. Open a course or complete a lesson to see it show up here.
          </p>
        ) : (
          <div className="activity-feed">
            {activity.map((item) => {
              const { icon: Icon, label, detail } = describeActivity(item);

              return (
                <div
                  key={item._id}
                  className="activity-feed-row"
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 'var(--space-3)',
                    padding: 'var(--space-3) 0',
                    borderBottom: '1px solid var(--border-color)',
                  }}
                >
                  <div
                    className="avatar sm"
                    style={{ background: 'var(--color-accent-soft, rgba(231,84,128,0.12))', color: 'var(--color-accent)' }}
                  >
                    <Icon size={14} />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
                      {label}
                    </div>
                    {detail && (
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                        {detail}
                      </div>
                    )}
                  </div>

                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
                    {getRelativeTime(item.createdAt)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>
    </div>
  );
}