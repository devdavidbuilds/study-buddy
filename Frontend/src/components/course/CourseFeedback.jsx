import { useCallback, useEffect, useState } from 'react';
import { Star, ThumbsUp, MessageSquareReply } from 'lucide-react';
import PageState from '../ui/PageState';
import {
  getCourseFeedback,
  saveMyFeedback,
  deleteMyFeedback,
  toggleFeedbackHelpful,
} from '../../api/feedbackApi';
import { generateInitials, getRelativeTime } from '../../utils/helpers';
import './CourseExtras.css';

// Course feedback: rating summary, the student's own feedback form
// (enrolled students), and everyone's feedback with "helpful" votes and
// faculty replies.

const Stars = ({ value, size = 14 }) => (
  <span className="cx-stars" aria-label={`${value} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((n) => (
      <Star key={n} size={size} fill={n <= Math.round(value) ? 'currentColor' : 'none'} />
    ))}
  </span>
);

export default function CourseFeedback({ courseId }) {
  const [data, setData] = useState(null);
  const [sort, setSort] = useState('recent');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [aspects, setAspects] = useState([]);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formMessage, setFormMessage] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const res = await getCourseFeedback(courseId, sort);
      const next = res?.data?.data || null;
      setData(next);
      if (next?.mine) {
        setRating(next.mine.rating);
        setComment(next.mine.comment || '');
        setAspects(next.mine.aspects || []);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load feedback.');
    } finally {
      setLoading(false);
    }
  }, [courseId, sort]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async () => {
    if (!rating) {
      setFormMessage('Please choose a star rating.');
      return;
    }
    setSaving(true);
    setFormMessage('');
    try {
      await saveMyFeedback(courseId, { rating, comment, aspects });
      setEditing(false);
      setFormMessage('Thanks for your feedback!');
      await load();
    } catch (err) {
      setFormMessage(err?.response?.data?.message || 'Could not save your feedback.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setSaving(true);
    try {
      await deleteMyFeedback(courseId);
      setRating(0); setComment(''); setAspects([]); setEditing(false);
      setFormMessage('Your feedback was deleted.');
      await load();
    } finally {
      setSaving(false);
    }
  };

  const toggleHelpful = async (item) => {
    try {
      const res = await toggleFeedbackHelpful(item._id);
      const { helpedByMe, helpfulCount } = res?.data?.data || {};
      setData((d) => ({ ...d, items: d.items.map((f) => (f._id === item._id ? { ...f, helpedByMe, helpfulCount } : f)) }));
    } catch {
      // ignore — the button simply stays as it was
    }
  };

  if (loading) return <PageState title="Loading feedback" message="Fetching what learners think…" />;
  if (error) return <PageState type="error" title="Unable to load feedback" message={error} onRetry={load} />;

  const { summary, items, mine, canPost } = data;
  const showForm = canPost && (!mine || editing);

  return (
    <div>
      {/* Summary */}
      <div className="cx-summary">
        <div className="cx-score">
          <strong>{summary.average ?? '–'}</strong>
          <Stars value={summary.average || 0} size={16} />
          <div className="cx-muted">{summary.count} {summary.count === 1 ? 'rating' : 'ratings'}</div>
        </div>
        <div>
          {[5, 4, 3, 2, 1].map((n) => (
            <div key={n} className="cx-bar-row">
              <span>{n} ★</span>
              <div className="cx-bar"><span style={{ width: `${summary.count ? (summary.distribution[n] / summary.count) * 100 : 0}%` }} /></div>
              <span>{summary.distribution[n]}</span>
            </div>
          ))}
          {summary.aspects.length > 0 && (
            <div className="cx-filters" style={{ marginTop: 'var(--space-3)', marginBottom: 0 }}>
              {summary.aspects.slice(0, 5).map((a) => (
                <span key={a.label} className="chip" style={{ cursor: 'default' }}>{a.label} · {a.count}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Own feedback */}
      {showForm ? (
        <div className="cx-form">
          <h4 style={{ margin: 0 }}>{mine ? 'Edit your feedback' : 'Rate this course'}</h4>
          <div className="cx-star-input" onMouseLeave={() => setHover(0)} style={{ marginTop: 'var(--space-2)' }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" aria-label={`${n} stars`} onMouseEnter={() => setHover(n)} onClick={() => setRating(n)}>
                <Star size={26} fill={n <= (hover || rating) ? 'currentColor' : 'none'} />
              </button>
            ))}
          </div>
          <div className="cx-filters" style={{ marginTop: 'var(--space-3)', marginBottom: 0 }}>
            {data.aspects.map((a) => (
              <button
                key={a}
                type="button"
                className={`chip ${aspects.includes(a) ? 'active' : ''}`}
                onClick={() => setAspects((list) => (list.includes(a) ? list.filter((x) => x !== a) : [...list, a]))}
              >
                {a}
              </button>
            ))}
          </div>
          <textarea
            className="input-field"
            maxLength={1000}
            placeholder="What did you like? What could be better? (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-sm" onClick={submit} disabled={saving}>
              {saving ? 'Saving…' : mine ? 'Update feedback' : 'Submit feedback'}
            </button>
            {mine && <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancel</button>}
            {formMessage && <span className="cx-muted">{formMessage}</span>}
          </div>
        </div>
      ) : canPost && mine ? (
        <div className="cx-form" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <span className="cx-muted">
            You rated this course <Stars value={mine.rating} /> {formMessage && `· ${formMessage}`}
          </span>
          <span style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>Edit</button>
            <button className="btn btn-ghost btn-sm" onClick={remove} disabled={saving}>Delete</button>
          </span>
        </div>
      ) : (
        <p className="cx-muted" style={{ marginBottom: 'var(--space-4)' }}>
          {formMessage || 'Students enrolled in this course can rate it and leave feedback for the faculty.'}
        </p>
      )}

      {/* All feedback */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
        <h4 style={{ margin: 0 }}>Learner feedback</h4>
        <select className="input-field" style={{ width: 'auto', padding: '4px 10px' }} value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="recent">Most recent</option>
          <option value="helpful">Most helpful</option>
          <option value="high">Highest rated</option>
          <option value="low">Lowest rated</option>
        </select>
      </div>

      {items.length === 0 ? (
        <p className="cx-muted">No feedback yet — be the first to share your experience.</p>
      ) : items.map((f) => (
        <div key={f._id} className="cx-item">
          <div className="cx-item-head">
            <div className="avatar sm">{generateInitials(f.studentName)}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
                {f.studentName}{f.isMine ? ' (you)' : ''}
              </div>
              <div className="cx-muted"><Stars value={f.rating} size={12} /> · {getRelativeTime(f.createdAt)}{f.edited ? ' · edited' : ''}</div>
            </div>
          </div>
          {f.aspects.length > 0 && (
            <div className="cx-filters" style={{ marginBottom: 'var(--space-2)' }}>
              {f.aspects.map((a) => <span key={a} className="cx-tag" style={{ marginLeft: 0 }}>{a}</span>)}
            </div>
          )}
          {f.comment && <p>{f.comment}</p>}
          <button
            className={`cx-helpful ${f.helpedByMe ? 'on' : ''}`}
            onClick={() => toggleHelpful(f)}
            disabled={f.isMine}
            title={f.isMine ? "You can't vote on your own feedback" : 'Mark as helpful'}
          >
            <ThumbsUp size={12} /> Helpful{f.helpfulCount ? ` · ${f.helpfulCount}` : ''}
          </button>
          {f.reply && (
            <div className="cx-reply">
              <div style={{ fontWeight: 600, marginBottom: 4 }}>
                <MessageSquareReply size={13} style={{ verticalAlign: 'middle' }} /> {f.reply.byName} · faculty reply
                <span className="cx-muted"> · {getRelativeTime(f.reply.at)}</span>
              </div>
              {f.reply.text}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
