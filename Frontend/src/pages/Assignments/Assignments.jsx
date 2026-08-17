import { useEffect, useState } from 'react';
import GlassCard from '../../components/ui/GlassCard';
import ProgressBar from '../../components/ui/ProgressBar';
import Badge from '../../components/ui/Badge';
import PageState from '../../components/ui/PageState';
import { getCourses } from '../../api/courseApi';
import { getDaysUntil, getPriorityColor } from '../../utils/helpers';

const filterOptions = ['All', 'pending', 'in-progress', 'submitted'];
const badgeVariant = { pending: 'warning', 'in-progress': 'info', submitted: 'success' };

export default function Assignments() {
  const [filter, setFilter] = useState('All');
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAssignments = async () => {
      try {
        const res = await getCourses();
        const courses = Array.isArray(res?.data?.data) ? res.data.data : [];
        const mapped = courses.map((course, index) => ({
          id: course._id || course.id || index + 1,
          title: `${course.title || 'Course'} Milestone`,
          course: course.category || 'Study Buddy',
          progress: course.progress || 0,
          status: course.progress > 0 ? (course.progress === 100 ? 'submitted' : 'in-progress') : 'pending',
          priority: index % 2 === 0 ? 'high' : 'medium',
          dueDate: new Date(Date.now() + (index + 1) * 86400000).toISOString(),
        }));
        setAssignments(mapped);
      } catch (err) {
        setError(err?.response?.data?.message || 'Unable to load assignments.');
      } finally {
        setLoading(false);
      }
    };
    loadAssignments();
  }, []);

  const filtered = filter === 'All' ? assignments : assignments.filter(a => a.status === filter);

  if (loading) return <PageState title="Loading assignments" message="Pulling in your latest tasks…" />;
  if (error) return <PageState type="error" title="Unable to load assignments" message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Assignments</h1>
          <p>{assignments.filter(a => a.status !== 'submitted').length} pending across your courses</p>
        </div>
      </div>

      <div className="assignments-filters">
        {filterOptions.map(opt => (
          <span key={opt} className={`chip ${filter === opt ? 'active' : ''}`} onClick={() => setFilter(opt)}>
            {opt === 'All' ? 'All' : opt.replace('-', ' ')}
          </span>
        ))}
      </div>

      <GlassCard noPadding>
        {filtered.map(a => (
          <div key={a.id} className="assignment-row" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <div className="assignment-priority" style={{ background: getPriorityColor(a.priority), width: 4, height: 40, borderRadius: 4 }} />
            <div className="assignment-row-info">
              <h4>{a.title}</h4>
              <p>{a.course}</p>
            </div>
            <div className="assignment-row-progress">
              <ProgressBar value={a.progress} size="sm" />
            </div>
            <Badge variant={badgeVariant[a.status] || 'ghost'}>{a.status.replace('-', ' ')}</Badge>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', minWidth: 70, textAlign: 'right' }}>
              {getDaysUntil(a.dueDate)}
            </span>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">🌸</div>
            <h3>All caught up!</h3>
            <p>No assignments here right now.</p>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
