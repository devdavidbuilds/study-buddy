import { useEffect, useState } from 'react';
import GlassCard from '../../components/ui/GlassCard';
import ProgressBar from '../../components/ui/ProgressBar';
import Badge from '../../components/ui/Badge';
import PageState from '../../components/ui/PageState';
import useProfile from '../../hooks/useProfile';

export default function Achievements() {
  const { profile } = useProfile();
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        setAchievements([
          { id: 1, title: 'First Steps', description: 'Started your first course', earned: true, date: '2 days ago', progress: 100, icon: '🌱' },
          { id: 2, title: 'Consistent Learner', description: 'Maintained a 7-day streak', earned: true, date: '1 day ago', progress: 100, icon: '🔥' },
          { id: 3, title: 'Problem Solver', description: 'Completed 10 coding challenges', earned: false, progress: 70, icon: '💡' },
        ]);
      } catch (err) {
        setError('Unable to load achievements.');
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const earnedCount = achievements.filter(a => a.earned).length;

  if (loading) return <PageState title="Loading achievements" message="Gathering your badges…" />;
  if (error) return <PageState type="error" title="Unable to load achievements" message={error} />;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Achievements</h1>
            <p>{earnedCount} of {achievements.length} badges earned • {profile?.streak || 12} day streak 🔥</p>
        </div>
      </div>

      <div className="achievements-grid">
        {achievements.map((a, i) => (
          <GlassCard key={a.id} hoverable className={`achievement-card ${a.earned ? '' : 'locked'} animate-fade-in-up stagger-${(i % 8) + 1}`}>
            <div className="achievement-icon">{a.icon}</div>
            <h4>{a.title}</h4>
            <p>{a.description}</p>
            {a.earned ? (
              <Badge variant="success">Earned {a.date}</Badge>
            ) : (
              <>
                <ProgressBar value={a.progress} size="sm" />
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginTop: 'var(--space-2)' }}>{a.progress}% to unlock</div>
              </>
            )}
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
