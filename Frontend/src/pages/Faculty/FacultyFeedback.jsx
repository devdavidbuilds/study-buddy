import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle, ArrowLeft, MessageSquare, MessageSquareReply, RefreshCw, Star, ThumbsUp } from 'lucide-react';
import { getFacultyFeedback, replyToFeedback, deleteFeedbackReply } from '../../api/feedbackApi';
import { generateInitials, getRelativeTime } from '../../utils/helpers';
import './FacultyStudentProgress.css';
import './FacultyStudents.css';
import '../../components/course/CourseExtras.css';

// ==============================
// Faculty → Course Feedback: ratings and comments from students on the
// faculty member's courses. Filter by status, rating or course, and reply
// — replies appear under the student's feedback on the course page.
// ==============================

const Stars = ({ value, size = 13 }) => (
  <span className="cx-stars">
    {[1, 2, 3, 4, 5].map((n) => <Star key={n} size={size} fill={n <= Math.round(value) ? 'currentColor' : 'none'} />)}
  </span>
);

export default function FacultyFeedback({ onBack, onCountsChange }) {
  const [status, setStatus] = useState('all');
  const [rating, setRating] = useState('');
  const [courseId, setCourseId] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [drafts, setDrafts] = useState({});
  const [openReply, setOpenReply] = useState(null);
  const [busyId, setBusyId] = useState('');
  const [actionError, setActionError] = useState('');
  const onCountsChangeRef = useRef(onCountsChange);
  onCountsChangeRef.current = onCountsChange;

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    setError('');
    try {
      const res = await getFacultyFeedback({ status, rating: rating || undefined, courseId: courseId || undefined });
      const next = res?.data?.data || null;
      setData(next);
      onCountsChangeRef.current?.(next?.summary?.unreplied || 0);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load feedback.');
    } finally {
      setLoading(false);
    }
  }, [status, rating, courseId]);

  useEffect(() => {
    load();
    const timer = setInterval(() => load(true), 30000);
    return () => clearInterval(timer);
  }, [load]);

  const sendReply = async (item) => {
    const text = (drafts[item._id] ?? item.reply?.text ?? '').trim();
    if (!text) return;
    setBusyId(item._id);
    setActionError('');
    try {
      await replyToFeedback(item._id, text);
      setOpenReply(null);
      await load(true);
    } catch (err) {
      setActionError(err?.response?.data?.message || 'Could not post the reply.');
    } finally {
      setBusyId('');
    }
  };

  const removeReply = async (item) => {
    setBusyId(item._id);
    try {
      await deleteFeedbackReply(item._id);
      await load(true);
    } finally {
      setBusyId('');
    }
  };

  const summary = data?.summary;

  return (
    <div className="fsp-root">
      {onBack && (
        <button className="fsp-back-btn" onClick={onBack}>
          <ArrowLeft size={14} /> Back to Dashboard
        </button>
      )}
      <div className="fsp-header">
        <h1 className="fsp-page-title"><MessageSquare size={22} /> Course Feedback</h1>
        <p className="fsp-page-subtitle">
          What students say about your courses. Reply to thank them or answer questions — your reply appears under their feedback on the course page.
        </p>
      </div>

      {loading && !data ? (
        <div className="fsp-loading-state"><div className="fsp-loader" /><p>Loading feedback…</p></div>
      ) : error ? (
        <div className="fsp-error-state">
          <AlertCircle size={32} />
          <h3>Something went wrong</h3>
          <p>{error}</p>
          <button className="fsp-retry-btn" onClick={() => load()}><RefreshCw size={14} /> Retry</button>
        </div>
      ) : (
        <>
          <div className="fsp-stats-grid">
            <div className="fsp-stat-card">
              <div className="fsp-stat-icon fsp-icon-amber"><Star size={16} /></div>
              <div><span className="fsp-stat-value">{summary.average ?? '–'}</span><span className="fsp-stat-label">Average rating</span></div>
            </div>
            <div className="fsp-stat-card">
              <div className="fsp-stat-icon fsp-icon-blue"><MessageSquare size={16} /></div>
              <div><span className="fsp-stat-value">{summary.count}</span><span className="fsp-stat-label">Feedback received</span></div>
            </div>
            <div className="fsp-stat-card">
              <div className="fsp-stat-icon fsp-icon-pink"><MessageSquareReply size={16} /></div>
              <div><span className="fsp-stat-value">{summary.unreplied}</span><span className="fsp-stat-label">Awaiting your reply</span></div>
            </div>
            <div className="fsp-stat-card">
              <div className="fsp-stat-icon fsp-icon-green"><ThumbsUp size={16} /></div>
              <div>
                <span className="fsp-stat-value">{summary.count ? Math.round(((summary.distribution[4] + summary.distribution[5]) / summary.count) * 100) : 0}%</span>
                <span className="fsp-stat-label">Rated 4–5 stars</span>
              </div>
            </div>
          </div>

          {data.courses.length > 0 && (
            <div className="fsp-detail-section" style={{ marginBottom: 'var(--space-5)' }}>
              <h3 className="fsp-section-title">By course</h3>
              {data.courses.map((c) => (
                <div key={c.courseId} className="fst-course-row" style={{ cursor: 'pointer' }} onClick={() => setCourseId(String(courseId) === String(c.courseId) ? '' : String(c.courseId))}>
                  <div className="fst-course-name">
                    {c.courseName}
                    <small>{c.count} feedback · {c.unreplied} awaiting reply</small>
                  </div>
                  <Stars value={c.average} /> <strong style={{ fontSize: 'var(--font-size-sm)' }}>{c.average}</strong>
                </div>
              ))}
            </div>
          )}

          <div className="fst-filters">
            {[['all', 'All'], ['unreplied', 'Awaiting reply'], ['replied', 'Replied']].map(([key, label]) => (
              <button key={key} className={`fst-filter ${status === key ? 'active' : ''}`} onClick={() => setStatus(key)}>{label}</button>
            ))}
            {[5, 4, 3, 2, 1].map((n) => (
              <button key={n} className={`fst-filter ${String(rating) === String(n) ? 'active' : ''}`} onClick={() => setRating(String(rating) === String(n) ? '' : String(n))}>{n} ★</button>
            ))}
            {courseId && (
              <button className="fst-filter active" onClick={() => setCourseId('')}>
                {data.courses.find((c) => String(c.courseId) === String(courseId))?.courseName || 'Course'} ✕
              </button>
            )}
          </div>

          {actionError && <p style={{ color: 'var(--color-danger)', fontSize: 'var(--font-size-sm)' }}>{actionError}</p>}

          {data.items.length === 0 ? (
            <div className="fsp-empty-state">
              <MessageSquare size={36} className="fsp-empty-icon" />
              <h3>No feedback here</h3>
              <p>Try another filter, or check back when students rate your courses.</p>
            </div>
          ) : (
            <div className="fsp-detail-section">
              {data.items.map((f) => (
                <div key={f._id} className="cx-item">
                  <div className="cx-item-head">
                    <div className="fsp-avatar">{generateInitials(f.student.fullName)}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
                        {f.student.fullName}
                        <span className="cx-muted"> · {[f.student.rollNumber, f.student.department, f.student.yearOfStudy ? `Year ${f.student.yearOfStudy}` : ''].filter(Boolean).join(' · ')}</span>
                      </div>
                      <div className="cx-muted">
                        <Stars value={f.rating} size={12} /> · {f.course.thumbnail || '📘'} {f.course.courseName} · {getRelativeTime(f.createdAt)}
                        {f.helpfulCount ? ` · ${f.helpfulCount} found helpful` : ''}
                      </div>
                    </div>
                  </div>
                  {f.aspects.length > 0 && (
                    <div className="cx-filters" style={{ marginBottom: 'var(--space-2)' }}>
                      {f.aspects.map((a) => <span key={a} className="cx-tag" style={{ marginLeft: 0 }}>{a}</span>)}
                    </div>
                  )}
                  {f.comment ? <p>{f.comment}</p> : <p className="cx-muted">(rating only, no comment)</p>}

                  {f.reply && openReply !== f._id && (
                    <div className="cx-reply">
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>
                        Your reply <span className="cx-muted">· {getRelativeTime(f.reply.at)}</span>
                      </div>
                      {f.reply.text}
                      <div style={{ marginTop: 'var(--space-2)', display: 'flex', gap: 'var(--space-2)' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => { setOpenReply(f._id); setDrafts((d) => ({ ...d, [f._id]: f.reply.text })); }}>Edit</button>
                        <button className="btn btn-ghost btn-sm" disabled={busyId === f._id} onClick={() => removeReply(f)}>Remove</button>
                      </div>
                    </div>
                  )}

                  {(openReply === f._id || !f.reply) && (
                    openReply === f._id ? (
                      <div style={{ marginTop: 'var(--space-3)' }}>
                        <textarea
                          className="input-field"
                          style={{ width: '100%', minHeight: 70 }}
                          maxLength={1000}
                          placeholder="Write a reply to this student…"
                          value={drafts[f._id] ?? ''}
                          onChange={(e) => setDrafts((d) => ({ ...d, [f._id]: e.target.value }))}
                        />
                        <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                          <button className="btn btn-primary btn-sm" disabled={busyId === f._id || !(drafts[f._id] || '').trim()} onClick={() => sendReply(f)}>
                            {busyId === f._id ? 'Posting…' : 'Post reply'}
                          </button>
                          <button className="btn btn-ghost btn-sm" onClick={() => setOpenReply(null)}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <button className="btn btn-ghost btn-sm" style={{ marginTop: 'var(--space-2)' }} onClick={() => setOpenReply(f._id)}>
                        <MessageSquareReply size={14} /> Reply
                      </button>
                    )
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
