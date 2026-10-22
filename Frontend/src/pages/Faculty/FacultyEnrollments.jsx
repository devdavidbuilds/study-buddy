import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle, ArrowLeft, Check, Clock, RefreshCw, UserPlus, X } from 'lucide-react';
import { getEnrollmentRequests, decideEnrollment } from '../../api/enrollmentApi';
import { generateInitials, getRelativeTime } from '../../utils/helpers';
import './FacultyStudentProgress.css';
import './FacultyStudents.css';

// ==============================
// Faculty → Enrollment Requests: students ask to join a course from its
// preview page; the course's faculty approves or rejects here. Approved
// students can then open the lessons, quizzes and lecture materials.
// ==============================

const TABS = [
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'all', label: 'All' },
];

const BADGE = {
  pending: 'fsp-status-in-progress',
  approved: 'fsp-status-completed',
  rejected: 'fsp-status-not-started',
};

export default function FacultyEnrollments({ onBack, onCountsChange }) {
  const [status, setStatus] = useState('pending');
  const [requests, setRequests] = useState([]);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');
  const [rejecting, setRejecting] = useState(null); // request id awaiting a reason
  const [note, setNote] = useState('');
  const [actionError, setActionError] = useState('');
  // Kept in a ref so a new callback from the parent doesn't trigger reloads.
  const onCountsChangeRef = useRef(onCountsChange);
  onCountsChangeRef.current = onCountsChange;

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    setError('');
    try {
      const res = await getEnrollmentRequests(status);
      setRequests(res?.data?.data || []);
      const nextCounts = res?.data?.counts || { pending: 0, approved: 0, rejected: 0 };
      setCounts(nextCounts);
      onCountsChangeRef.current?.(nextCounts);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load enrollment requests.');
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    load();
    const timer = setInterval(() => load(true), 30000);
    return () => clearInterval(timer);
  }, [load]);

  const decide = async (request, decision, reason = '') => {
    setBusyId(request._id);
    setActionError('');
    try {
      await decideEnrollment(request._id, decision, reason);
      setRejecting(null);
      setNote('');
      await load(true);
    } catch (err) {
      setActionError(err?.response?.data?.message || 'Could not update the request. Please try again.');
    } finally {
      setBusyId('');
    }
  };

  return (
    <div className="fsp-root">
      {onBack && (
        <button className="fsp-back-btn" onClick={onBack}>
          <ArrowLeft size={14} /> Back to Dashboard
        </button>
      )}
      <div className="fsp-header">
        <h1 className="fsp-page-title"><UserPlus size={22} /> Enrollment Requests</h1>
        <p className="fsp-page-subtitle">
          Students request to join a course from its preview page. Approve them to unlock the lessons, quizzes and lecture materials.
        </p>
      </div>

      <div className="fst-filters">
        {TABS.map((t) => (
          <button key={t.key} className={`fst-filter ${status === t.key ? 'active' : ''}`} onClick={() => setStatus(t.key)}>
            {t.label}
            {t.key !== 'all' ? ` (${counts[t.key] || 0})` : ''}
          </button>
        ))}
      </div>

      {actionError && <p style={{ color: 'var(--color-danger)', fontSize: 'var(--font-size-sm)' }}>{actionError}</p>}

      {loading ? (
        <div className="fsp-loading-state"><div className="fsp-loader" /><p>Loading requests…</p></div>
      ) : error ? (
        <div className="fsp-error-state">
          <AlertCircle size={32} />
          <h3>Something went wrong</h3>
          <p>{error}</p>
          <button className="fsp-retry-btn" onClick={() => load()}><RefreshCw size={14} /> Retry</button>
        </div>
      ) : requests.length === 0 ? (
        <div className="fsp-empty-state">
          <UserPlus size={36} className="fsp-empty-icon" />
          <h3>{status === 'pending' ? 'No pending requests' : 'Nothing here yet'}</h3>
          <p>{status === 'pending' ? 'New enrollment requests from students will appear here.' : 'Requests you decide on will be listed here.'}</p>
        </div>
      ) : (
        <div className="fsp-student-list">
          {requests.map((r) => (
            <div key={r._id} className="fsp-student-row" style={{ cursor: 'default', flexWrap: 'wrap' }}>
              <div className="fsp-student-identity">
                <div className="fsp-avatar">{generateInitials(r.student.fullName || '?')}</div>
                <div className="fsp-student-text">
                  <span className="fsp-student-name">{r.student.fullName}</span>
                  <span className="fsp-student-email">{r.student.email}</span>
                </div>
              </div>

              <div className="fst-academic">
                <span>{[r.student.rollNumber, r.student.department, r.student.yearOfStudy ? `Year ${r.student.yearOfStudy}` : ''].filter(Boolean).join(' · ') || '—'}</span>
                <span>{r.student.university || ''}</span>
              </div>

              <div className="fst-academic" style={{ flex: 1.4 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.course.thumbnail || '📘'} {r.course.courseName}</span>
                <span>{r.message ? `“${r.message}”` : r.course.courseCode}</span>
              </div>

              <div className="fsp-student-activity" title={new Date(r.requestedAt).toLocaleString()}>
                <Clock size={12} /> {getRelativeTime(r.requestedAt)}
              </div>

              {r.status === 'pending' ? (
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <button className="btn btn-primary btn-sm" disabled={busyId === r._id} onClick={() => decide(r, 'approve')}>
                    <Check size={14} /> Approve
                  </button>
                  <button className="btn btn-ghost btn-sm" disabled={busyId === r._id} onClick={() => { setRejecting(r._id); setNote(''); }}>
                    <X size={14} /> Reject
                  </button>
                </div>
              ) : (
                <span className={`fsp-status-badge ${BADGE[r.status]}`} title={r.decidedAt ? `${r.status} ${new Date(r.decidedAt).toLocaleString()}${r.decidedBy?.fullName ? ` by ${r.decidedBy.fullName}` : ''}` : ''}>
                  {r.status === 'approved' ? 'Approved' : 'Rejected'}
                  {r.source === 'existing' ? ' (existing learner)' : ''}
                </span>
              )}

              {rejecting === r._id && (
                <div style={{ flexBasis: '100%', display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
                  <input
                    className="fsp-search-input"
                    style={{ flex: 1 }}
                    placeholder="Reason shown to the student (optional)"
                    maxLength={300}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                  <button className="btn btn-primary btn-sm" disabled={busyId === r._id} onClick={() => decide(r, 'reject', note)}>
                    Confirm reject
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setRejecting(null)}>Cancel</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
