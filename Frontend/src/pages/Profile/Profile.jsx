import { useEffect, useState } from 'react';
import { Award, BookOpen, Flame, Zap } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import ProgressRing from '../../components/ui/ProgressRing';
import PageState from '../../components/ui/PageState';
import { getCourses } from '../../api/courseApi';
import useProfile from '../../hooks/useProfile';
import { generateInitials } from '../../utils/helpers';

export default function Profile() {
  const {
    profile,
    loading: profileLoading,
    error: profileError,
  } = useProfile();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const res = await getCourses();

        setCourses(
          Array.isArray(res?.data?.data)
            ? res.data.data
            : []
        );
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            'Unable to load profile courses.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  const completedCourses = courses.filter(
    (c) => c.progress === 100
  );

  const earnedBadges = [
    {
      id: 1,
      title: 'First Steps',
      icon: '🌱',
    },
    {
      id: 2,
      title: 'Consistent Learner',
      icon: '🔥',
    },
  ];

  const inProgress = courses
    .filter(
      (c) =>
        c.progress > 0 &&
        c.progress < 100
    )
    .slice(0, 4);

  /*
   * Backend uses "fullName".
   * Some older frontend code may use "name".
   * Support both so the existing UI continues working.
   */
  const currentUserName =
    profile?.fullName ||
    profile?.name ||
    'Study Buddy';

  const currentUserLevel =
    profile?.level || 4;

  const currentUserXP =
    profile?.xp || 2400;

  const currentUserStreak =
    profile?.streak || 12;

  if (profileLoading || loading) {
    return (
      <PageState
        title="Loading profile"
        message="Fetching your latest profile and course progress…"
      />
    );
  }

  if (profileError || error) {
    return (
      <PageState
        type="error"
        title="Unable to load profile"
        message={profileError || error}
      />
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="avatar xxl">
          {generateInitials(currentUserName)}
        </div>

        <div style={{ flex: 1 }}>
          <h1
            style={{
              fontSize: 'var(--font-size-2xl)',
              marginBottom: 'var(--space-1)',
            }}
          >
            {currentUserName}
          </h1>

          <p
            style={{
              color: 'var(--text-secondary)',
              marginBottom: 'var(--space-2)',
            }}
          >
            {profile?.bio ||
              'Learning with intention and calm focus.'}
          </p>

          <p
            style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--text-tertiary)',
            }}
          >
            {profile?.university ||
              'Study Buddy Community'}
          </p>
        </div>

        <button className="btn btn-secondary">
          Edit Profile
        </button>
      </div>

      {/* Profile Statistics */}
      <div className="profile-stats-row">
        {/* Streak */}
        <GlassCard className="progress-stat-card">
          <Flame
            size={20}
            style={{
              color: 'var(--color-warning)',
              marginBottom: 'var(--space-2)',
            }}
          />

          <div className="progress-stat-value gradient-text">
            {currentUserStreak}
          </div>

          <div className="progress-stat-label">
            Day Streak
          </div>
        </GlassCard>

        {/* XP / Level */}
        <GlassCard className="progress-stat-card">
          <Zap
            size={20}
            style={{
              color: 'var(--color-accent)',
              marginBottom: 'var(--space-2)',
            }}
          />

          <div className="progress-stat-value gradient-text">
            {currentUserXP.toLocaleString()}
          </div>

          <div className="progress-stat-label">
            XP • Level {currentUserLevel}
          </div>
        </GlassCard>

        {/* Courses */}
        <GlassCard className="progress-stat-card">
          <BookOpen
            size={20}
            style={{
              color: 'var(--color-info)',
              marginBottom: 'var(--space-2)',
            }}
          />

          <div className="progress-stat-value gradient-text">
            {courses.length}
          </div>

          <div className="progress-stat-label">
            Courses Enrolled
          </div>
        </GlassCard>

        {/* Badges */}
        <GlassCard className="progress-stat-card">
          <Award
            size={20}
            style={{
              color: 'var(--color-success)',
              marginBottom: 'var(--space-2)',
            }}
          />

          <div className="progress-stat-value gradient-text">
            {earnedBadges.length}
          </div>

          <div className="progress-stat-label">
            Badges Earned
          </div>
        </GlassCard>
      </div>

      {/* Main Content */}
      <div className="two-col-grid">
        {/* LEFT COLUMN */}
        <div>
          {/* Certificates */}
          <GlassCard
            style={{
              marginBottom: 'var(--space-6)',
            }}
          >
            <h3 className="section-title">
              📜 Certificates
            </h3>

            {completedCourses.length > 0 ? (
              completedCourses.map((course) => (
                <div
                  key={course._id || course.id}
                  className="certificate-row"
                >
                  <div
                    className="certificate-icon"
                    style={{
                      background: `${course.color || '#E75480'}22`,
                    }}
                  >
                    {course.thumbnail}
                  </div>

                  <div style={{ flex: 1 }}>
                    <h5
                      style={{
                        fontSize:
                          'var(--font-size-sm)',
                        fontWeight: 600,
                      }}
                    >
                      {course.title}
                    </h5>

                    <span
                      style={{
                        fontSize:
                          'var(--font-size-xs)',
                        color:
                          'var(--text-tertiary)',
                      }}
                    >
                      Completed •{' '}
                      {course.instructor}
                    </span>
                  </div>

                  <button className="btn btn-ghost btn-sm">
                    Download
                  </button>
                </div>
              ))
            ) : (
              <p
                style={{
                  fontSize:
                    'var(--font-size-sm)',
                  color:
                    'var(--text-tertiary)',
                }}
              >
                Complete a course to earn your
                first certificate 🌸
              </p>
            )}
          </GlassCard>

          {/* Badges */}
          <GlassCard>
            <h3 className="section-title">
              🏅 Badges
            </h3>

            <div
              style={{
                display: 'flex',
                gap: 'var(--space-4)',
                flexWrap: 'wrap',
              }}
            >
              {earnedBadges.map((badge) => (
                <div
                  key={badge.id}
                  style={{
                    textAlign: 'center',
                    width: 90,
                  }}
                >
                  <div
                    className="achievement-icon"
                    style={{
                      margin:
                        '0 auto var(--space-2)',
                    }}
                  >
                    {badge.icon}
                  </div>

                  <div
                    style={{
                      fontSize:
                        'var(--font-size-xs)',
                      fontWeight: 600,
                    }}
                  >
                    {badge.title}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* RIGHT COLUMN */}
        <GlassCard>
          <h3 className="section-title">
            📚 Continuing
          </h3>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-5)',
            }}
          >
            {inProgress.length > 0 ? (
              inProgress.map((course) => (
                <div
                  key={course._id || course.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                  }}
                >
                  <ProgressRing
                    value={course.progress}
                    size={54}
                    strokeWidth={5}
                    color={course.color}
                  />

                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <div
                      className="truncate"
                      style={{
                        fontSize:
                          'var(--font-size-sm)',
                        fontWeight: 600,
                      }}
                    >
                      {course.title}
                    </div>

                    <div
                      style={{
                        fontSize:
                          'var(--font-size-xs)',
                        color:
                          'var(--text-tertiary)',
                      }}
                    >
                      {course.completedLessons || 0}
                      /
                      {course.totalLessons || 0}
                      {' '}lessons
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p
                style={{
                  fontSize:
                    'var(--font-size-sm)',
                  color:
                    'var(--text-tertiary)',
                }}
              >
                Start a course to see your
                learning progress here 🌸
              </p>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}