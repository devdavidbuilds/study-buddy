import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, BookOpen, Flame, Zap } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import ProgressRing from '../../components/ui/ProgressRing';
import PageState from '../../components/ui/PageState';
import useProfile from '../../hooks/useProfile';
import useLearningSummary from '../../hooks/useLearningSummary';
import { getMyCertificates, downloadCertificate } from '../../api/certificateApi';
import { generateInitials } from '../../utils/helpers';

export default function Profile() {
  const navigate = useNavigate();
  const {
    profile,
    loading: profileLoading,
    error: profileError,
  } = useProfile();
  const { summary, loading, error } = useLearningSummary();

  const [certificates, setCertificates] = useState([]);
  const [downloadingId, setDownloadingId] = useState('');

  useEffect(() => {
    getMyCertificates()
      .then((res) => setCertificates(res?.data?.data || []))
      .catch(() => setCertificates([]));
  }, []);

  const handleDownload = async (certificate) => {
    setDownloadingId(certificate.certificateId);
    try {
      await downloadCertificate(certificate);
    } finally {
      setDownloadingId('');
    }
  };

  // All figures come from the student's real records
  // (GET /api/progress/summary and /api/certificates/mine).
  const earnedBadges = (summary?.badges || []).filter((b) => b.earned);
  const inProgress = (summary?.courses || [])
    .filter((c) => c.percentage > 0 && c.percentage < 100)
    .slice(0, 4);

  const currentUserName = profile?.fullName || 'Study Buddy';

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
            {[profile?.university, profile?.department, profile?.yearOfStudy ? `Year ${profile.yearOfStudy}` : '']
              .filter(Boolean)
              .join(' • ') || 'Study Buddy Community'}
          </p>
        </div>

        <button className="btn btn-secondary" onClick={() => navigate('/settings')}>
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
            {summary.streak}
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
            {summary.xp.toLocaleString()}
          </div>

          <div className="progress-stat-label">
            XP • Level {summary.level}
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
            {summary.stats.coursesEnrolled}
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

            {certificates.length > 0 ? (
              certificates.map((certificate) => (
                <div
                  key={certificate.certificateId}
                  className="certificate-row"
                >
                  <div
                    className="certificate-icon"
                    style={{
                      background: '#E7548022',
                    }}
                  >
                    🎓
                  </div>

                  <div style={{ flex: 1 }}>
                    <h5
                      style={{
                        fontSize:
                          'var(--font-size-sm)',
                        fontWeight: 600,
                      }}
                    >
                      {certificate.courseName}
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
                      {new Date(certificate.issuedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleDownload(certificate)}
                    disabled={downloadingId === certificate.certificateId}
                  >
                    {downloadingId === certificate.certificateId ? 'Preparing…' : 'Download'}
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
              {earnedBadges.length === 0 && (
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-tertiary)' }}>
                  Complete lessons and quizzes to earn badges.
                </p>
              )}
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
                  key={course._id}
                  onClick={() => navigate(`/courses/${course._id}`)}
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                  }}
                >
                  <ProgressRing
                    value={course.percentage}
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
                      {course.courseName}
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