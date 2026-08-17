import { useEffect, useState } from 'react';
import { Award, BookOpen, Flame, Zap } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import ProgressRing from '../../components/ui/ProgressRing';
import PageState from '../../components/ui/PageState';
import { getCourses } from '../../api/courseApi';
import useProfile from '../../hooks/useProfile';
import { generateInitials } from '../../utils/helpers';

export default function Profile() {
  const { profile, loading: profileLoading, error: profileError } = useProfile();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const res = await getCourses();
        setCourses(Array.isArray(res?.data?.data) ? res.data.data : []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Unable to load profile courses.');
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, []);

  const completedCourses = courses.filter(c => c.progress === 100);
  const earnedBadges = [
    { id: 1, title: 'First Steps', icon: '🌱' },
    { id: 2, title: 'Consistent Learner', icon: '🔥' },
  ];
  const inProgress = courses.filter(c => c.progress > 0 && c.progress < 100).slice(0, 4);

  if (profileLoading || loading) return <PageState title="Loading profile" message="Fetching your latest profile and course progress…" />;
  if (profileError || error) return <PageState type="error" title="Unable to load profile" message={profileError || error} />;

  return (
    <div className="animate-fade-in">
      <div className="profile-header">
        <div className="avatar xxl">{generateInitials(profile?.name || 'Study Buddy')}</div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--space-1)' }}>{profile?.name || 'Study Buddy'}</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>{profile?.bio || 'Learning with intention and calm focus.'}</p>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-tertiary)' }}>{profile?.university || 'Study Buddy Community'}</p>
        </div>
        <button className="btn btn-secondary">Edit Profile</button>
      </div>

      <div className="profile-stats-row">
        <GlassCard className="progress-stat-card">
          <Flame size={20} style={{ color: 'var(--color-warning)', marginBottom: 'var(--space-2)' }} />
          <div className="progress-stat-value gradient-text">{profile?.streak || 12}</div>
          <div className="progress-stat-label">Day Streak</div>
        </GlassCard>
        <GlassCard className="progress-stat-card">
          <Zap size={20} style={{ color: 'var(--color-accent)', marginBottom: 'var(--space-2)' }} />
          <div className="progress-stat-value gradient-text">{(profile?.xp || 2400).toLocaleString()}</div>
          <div className="progress-stat-label">XP • Level {currentUser.level}</div>
        </GlassCard>
        <GlassCard className="progress-stat-card">
          <BookOpen size={20} style={{ color: 'var(--color-info)', marginBottom: 'var(--space-2)' }} />
          <div className="progress-stat-value gradient-text">{courses.length}</div>
          <div className="progress-stat-label">Courses Enrolled</div>
        </GlassCard>
        <GlassCard className="progress-stat-card">
          <Award size={20} style={{ color: 'var(--color-success)', marginBottom: 'var(--space-2)' }} />
          <div className="progress-stat-value gradient-text">{earnedBadges.length}</div>
          <div className="progress-stat-label">Badges Earned</div>
        </GlassCard>
      </div>

      <div className="two-col-grid">
        <div>
          <GlassCard style={{ marginBottom: 'var(--space-6)' }}>
            <h3 className="section-title">📜 Certificates</h3>
            {completedCourses.length > 0 ? completedCourses.map(c => (
              <div key={c._id || c.id} className="certificate-row">
                <div className="certificate-icon" style={{ background: `${c.color}22` }}>{c.thumbnail}</div>
                <div style={{ flex: 1 }}>
                  <h5 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>{c.title}</h5>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>Completed • {c.instructor}</span>
                </div>
                <button className="btn btn-ghost btn-sm">Download</button>
              </div>
            )) : (
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-tertiary)' }}>Complete a course to earn your first certificate 🌸</p>
            )}
          </GlassCard>

          <GlassCard>
            <h3 className="section-title">🏅 Badges</h3>
            <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
              {earnedBadges.map(b => (
                <div key={b.id} style={{ textAlign: 'center', width: 90 }}>
                  <div className="achievement-icon" style={{ margin: '0 auto var(--space-2)' }}>{b.icon}</div>
                  <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>{b.title}</div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        <GlassCard>
          <h3 className="section-title">📚 Continuing</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            {inProgress.map(c => (
              <div key={c._id || c.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <ProgressRing value={c.progress} size={54} strokeWidth={5} color={c.color} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="truncate" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>{c.title}</div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>{c.completedLessons}/{c.totalLessons} lessons</div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
