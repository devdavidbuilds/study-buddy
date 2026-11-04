import { useCallback, useEffect, useRef, useState } from 'react';
import {
  HelpCircle,
  CheckCircle2,
  Clock,
  MessageSquareReply,
  RefreshCw,
  AlertCircle,
  Send,
  Edit3,
  BookOpen,
} from 'lucide-react';
import { getFacultyDoubts, replyToDoubt } from '../../api/doubtApi';
import { generateInitials, getRelativeTime } from '../../utils/helpers';
import './FacultyDoubts.css';

export default function FacultyDoubts({ onCountsChange }) {
  const [status, setStatus] = useState('all');
  const [courseId, setCourseId] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openReplyId, setOpenReplyId] = useState(null);
  const [replyText, setReplyText] = useState({});
  const [submittingId, setSubmittingId] = useState(null);
  const [actionError, setActionError] = useState('');

  const onCountsChangeRef = useRef(onCountsChange);
  onCountsChangeRef.current = onCountsChange;

  const loadDoubts = useCallback(
    async (quiet = false) => {
      if (!quiet) setLoading(true);
      setError('');
      try {
        const res = await getFacultyDoubts({
          status: status !== 'all' ? status : undefined,
          courseId: courseId || undefined,
        });
        const resData = res?.data?.data || null;
        setData(resData);
        onCountsChangeRef.current?.(resData?.summary?.pending || 0);
      } catch (err) {
        setError(err?.response?.data?.message || 'Unable to load student doubts.');
      } finally {
        setLoading(false);
      }
    },
    [status, courseId]
  );

  useEffect(() => {
    loadDoubts();
    const interval = setInterval(() => loadDoubts(true), 30000);
    return () => clearInterval(interval);
  }, [loadDoubts]);

  const handleSendReply = async (doubtId) => {
    const text = (replyText[doubtId] || '').trim();
    if (!text) return;

    setSubmittingId(doubtId);
    setActionError('');
    try {
      await replyToDoubt(doubtId, { text });
      setOpenReplyId(null);
      await loadDoubts(true);
    } catch (err) {
      setActionError(err?.response?.data?.message || 'Could not send reply.');
    } finally {
      setSubmittingId(null);
    }
  };

  const startReplying = (doubt) => {
    setOpenReplyId(doubt._id);
    setReplyText((prev) => ({
      ...prev,
      [doubt._id]: prev[doubt._id] ?? doubt.reply?.text ?? '',
    }));
  };

  const summary = data?.summary || { total: 0, pending: 0, resolved: 0 };
  const items = data?.items || [];
  const courses = data?.courses || [];

  return (
    <div className="fdb-container animate-fade-in">
      {/* ── Summary Stats ── */}
      <div className="fdb-stats-row">
        <div className="fdb-stat-card">
          <div className="fdb-stat-icon pending">
            <Clock size={20} />
          </div>
          <div className="fdb-stat-info">
            <span className="fdb-stat-val">{summary.pending}</span>
            <span className="fdb-stat-lbl">Pending Doubts</span>
          </div>
        </div>

        <div className="fdb-stat-card">
          <div className="fdb-stat-icon resolved">
            <CheckCircle2 size={20} />
          </div>
          <div className="fdb-stat-info">
            <span className="fdb-stat-val">{summary.resolved}</span>
            <span className="fdb-stat-lbl">Answered</span>
          </div>
        </div>

        <div className="fdb-stat-card">
          <div className="fdb-stat-icon total">
            <HelpCircle size={20} />
          </div>
          <div className="fdb-stat-info">
            <span className="fdb-stat-val">{summary.total}</span>
            <span className="fdb-stat-lbl">Total Questions</span>
          </div>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="fdb-filter-bar">
        <div className="fdb-filter-group">
          <button
            type="button"
            className={`fdb-filter-btn${status === 'all' ? ' active' : ''}`}
            onClick={() => setStatus('all')}
          >
            All Questions <span className="fdb-badge-count">{summary.total}</span>
          </button>
          <button
            type="button"
            className={`fdb-filter-btn${status === 'pending' ? ' active' : ''}`}
            onClick={() => setStatus('pending')}
          >
            Pending <span className="fdb-badge-count">{summary.pending}</span>
          </button>
          <button
            type="button"
            className={`fdb-filter-btn${status === 'resolved' ? ' active' : ''}`}
            onClick={() => setStatus('resolved')}
          >
            Answered <span className="fdb-badge-count">{summary.resolved}</span>
          </button>
        </div>

        <div className="fdb-filter-group">
          {courses.length > 0 && (
            <select
              className="fdb-course-select"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
            >
              <option value="">All Courses</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.courseName || c.title}
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => loadDoubts()}
            title="Refresh doubts"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {actionError && (
        <div className="fdb-card" style={{ borderLeft: '4px solid #ef4444', color: '#ef4444' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} />
            <span>{actionError}</span>
          </div>
        </div>
      )}

      {/* ── Doubts List ── */}
      {loading && !data ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-tertiary)' }}>
          Loading student doubts…
        </div>
      ) : error ? (
        <div className="fdb-card" style={{ borderLeft: '4px solid #ef4444' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="fdb-card" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
          <HelpCircle size={36} style={{ color: 'var(--text-tertiary)', margin: '0 auto 8px' }} />
          <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, color: 'var(--text-secondary)' }}>
            No doubts found
          </h3>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
            {status === 'pending'
              ? 'Great job! You have answered all student questions.'
              : 'Students have not asked any doubts yet for this selection.'}
          </p>
        </div>
      ) : (
        <div className="fdb-list">
          {items.map((doubt) => {
            const isReplying = openReplyId === doubt._id;
            const hasReply = Boolean(doubt.reply?.text);
            const courseTitle = doubt.course?.courseName || doubt.course?.title || 'Course';

            return (
              <div key={doubt._id} className={`fdb-card ${doubt.status}`}>
                <div className="fdb-card-header">
                  <div className="fdb-student-meta">
                    <div className="fdb-avatar">
                      {generateInitials(doubt.student?.fullName || 'Student')}
                    </div>
                    <div className="fdb-student-details">
                      <span className="fdb-student-name">
                        {doubt.student?.fullName || 'Student'}
                      </span>
                      <span className="fdb-student-sub">
                        {doubt.student?.department || 'Student'}
                        {doubt.student?.rollNumber ? ` • ${doubt.student.rollNumber}` : ''}
                        {' • '}
                        {getRelativeTime(doubt.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="fdb-badges">
                    <span className="fdb-course-pill">
                      <BookOpen size={12} style={{ marginRight: '4px' }} />
                      {courseTitle}
                    </span>
                    <span className={`fdb-status-pill ${doubt.status}`}>
                      {doubt.status === 'resolved' ? (
                        <>
                          <CheckCircle2 size={12} /> Answered
                        </>
                      ) : (
                        <>
                          <Clock size={12} /> Pending
                        </>
                      )}
                    </span>
                  </div>
                </div>

                <div className="fdb-question-box">
                  <div className="fdb-question-title">{doubt.title}</div>
                  {doubt.lessonTitle && (
                    <span className="fdb-lesson-tag">
                      Lesson: {doubt.lessonTitle}
                    </span>
                  )}
                  <div className="fdb-question-text">{doubt.question}</div>
                </div>

                {/* ── Existing Reply ── */}
                {hasReply && !isReplying && (
                  <div className="fdb-reply-box">
                    <div className="fdb-reply-header">
                      <span className="fdb-reply-author">
                        <CheckCircle2 size={14} /> Answer from Faculty
                        {doubt.reply?.repliedAt && (
                          <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>
                            {' • '}
                            {getRelativeTime(doubt.reply.repliedAt)}
                          </span>
                        )}
                      </span>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '2px 8px', fontSize: '11px' }}
                        onClick={() => startReplying(doubt)}
                      >
                        <Edit3 size={12} /> Edit
                      </button>
                    </div>
                    <div className="fdb-reply-text">{doubt.reply.text}</div>
                  </div>
                )}

                {/* ── Reply Action / Composer ── */}
                {!hasReply && !isReplying && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => startReplying(doubt)}
                    >
                      <MessageSquareReply size={14} />
                      Reply to Student
                    </button>
                  </div>
                )}

                {isReplying && (
                  <div className="fdb-composer animate-fade-in">
                    <textarea
                      placeholder="Write your explanation or answer here..."
                      value={replyText[doubt._id] || ''}
                      onChange={(e) =>
                        setReplyText((prev) => ({
                          ...prev,
                          [doubt._id]: e.target.value,
                        }))
                      }
                      rows={4}
                      autoFocus
                    />
                    <div className="fdb-composer-actions">
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => setOpenReplyId(null)}
                        disabled={submittingId === doubt._id}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => handleSendReply(doubt._id)}
                        disabled={!replyText[doubt._id]?.trim() || submittingId === doubt._id}
                      >
                        <Send size={14} />
                        {submittingId === doubt._id ? 'Posting…' : 'Submit Answer'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
