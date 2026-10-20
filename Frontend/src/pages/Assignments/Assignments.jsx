import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../../components/ui/GlassCard';
import ProgressBar from '../../components/ui/ProgressBar';
import Badge from '../../components/ui/Badge';
import PageState from '../../components/ui/PageState';
import { SubmittedPdf } from '../../components/assignment/PdfUploadField';
import { getMySubmissions } from '../../api/progressApi';
import { getDaysUntil, getStatusColor } from '../../utils/helpers';

const filterOptions = ['All', 'pending', 'submitted', 'returned', 'evaluated'];
const badgeVariant = { pending: 'warning', submitted: 'info', returned: 'danger', evaluated: 'success' };
const stripeColor = { pending: getStatusColor('in-progress'), submitted: getStatusColor('submitted'), returned: 'var(--color-danger)', evaluated: getStatusColor('completed') };

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : '');

export default function Assignments() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAssignments = async () => {
      try {
        const res = await getMySubmissions();
        const list = Array.isArray(res?.data?.data) ? res.data.data : [];
        setAssignments(
          list.map((a, index) => ({
            ...a,
            id: `${a.courseId}-${a.assignmentId || `${a.moduleId}-${a.lessonId}`}-${index}`,
            status: String(a.status || 'pending').toLowerCase(),
          }))
        );
      } catch (err) {
        setError(
          err?.response?.status === 403
            ? 'Assignments are listed for student accounts. Faculty can review work under Submissions.'
            : err?.response?.data?.message || 'Unable to load assignments.'
        );
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
          <p>
            {assignments.filter(a => a.status === 'pending').length} pending across your courses
            {assignments.some(a => a.status === 'returned') &&
              ` · ${assignments.filter(a => a.status === 'returned').length} returned for resubmission`}
          </p>
        </div>
      </div>

      <div className="assignments-filters">
        {filterOptions.map(opt => (
          <span key={opt} className={`chip ${filter === opt ? 'active' : ''}`} onClick={() => setFilter(opt)}>
            {opt === 'All' ? 'All' : opt}
          </span>
        ))}
      </div>

      <GlassCard noPadding>
        {filtered.map(a => (
          <div key={a.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
            <div
              className="assignment-row"
              role="link"
              tabIndex={0}
              style={{ cursor: 'pointer' }}
              title="Open the lesson for this assignment"
              onClick={() => navigate(`/courses/${a.courseId}/learn/${a.moduleId}/${a.lessonId}`)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') navigate(`/courses/${a.courseId}/learn/${a.moduleId}/${a.lessonId}`);
              }}
            >
              <div className="assignment-priority" style={{ background: stripeColor[a.status], width: 4, height: 40, borderRadius: 4 }} />
              <div className="assignment-row-info">
                <h4>{a.title}</h4>
                <p>{a.courseName}</p>
              </div>
              <div className="assignment-row-progress">
                {a.status === 'evaluated' && a.maxMarks > 0 ? (
                  <>
                    <ProgressBar value={(a.marks / a.maxMarks) * 100} size="sm" />
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                      {a.marks} / {a.maxMarks} marks
                    </span>
                  </>
                ) : (
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                    {a.status === 'submitted'
                      ? 'Awaiting marks'
                      : a.status === 'returned'
                      ? 'Resubmission needed'
                      : `${a.maxMarks ?? ''} marks`}
                  </span>
                )}
              </div>
              <Badge variant={badgeVariant[a.status] || 'ghost'}>{a.status}</Badge>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', minWidth: 70, textAlign: 'right' }}>
                {a.status === 'pending'
                  ? a.dueDate ? getDaysUntil(a.dueDate) : 'No due date'
                  : formatDate(a.submittedAt)}
              </span>
            </div>

            {a.status !== 'pending' && (
              <div className="submission-status-details-wrap" style={{ padding: '0 var(--space-4) var(--space-4) calc(var(--space-4) * 2 + 4px)' }}>
                <div className="submission-status-details" style={{ marginTop: 0 }}>
                  <span>Submitted {new Date(a.submittedAt).toLocaleString()}</span>
                  {a.evaluatedAt && a.status !== 'submitted' && (
                    <span>
                      {a.status === 'returned' ? 'Returned' : 'Evaluated'} {new Date(a.evaluatedAt).toLocaleString()}
                      {a.evaluatedByName ? ` by ${a.evaluatedByName}` : ''}
                    </span>
                  )}
                </div>
                {a.status === 'returned' && (
                  <p className="submission-feedback">
                    Your faculty returned this for resubmission. Open the lesson to update your answers or upload a new PDF.
                  </p>
                )}
                {a.file && (
                  <div style={{ marginTop: 'var(--space-2)' }}>
                    <SubmittedPdf file={a.file} compact />
                  </div>
                )}
                {a.feedback && (
                  <p className="submission-feedback">
                    <strong>Faculty feedback:</strong> {a.feedback}
                  </p>
                )}
              </div>
            )}
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
