import { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  ClipboardCheck,
  BookOpen,
  FileText,
  Clock,
  User,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Circle,
  X,
  Save,
  Eye,
  Calendar,
  Search,
  AlertTriangle,
  ExternalLink,
  Download,
  Hash,
  RotateCcw,
} from 'lucide-react';
import { profile } from '../../api/authApi';
import { getMyFacultyCourses, getCourses } from '../../api/courseApi';
import {
  getFacultySubmissions,
  evaluateSubmission,
  fetchSubmissionPdf,
  openSubmissionPdf,
  downloadSubmissionPdf,
} from '../../api/assignmentApi';
import { SubmittedPdf } from '../../components/assignment/PdfUploadField';
import './FacultySubmissions.css';

const formatDateTime = (value) => {
  if (!value) return '--';
  try {
    return new Date(value).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return '--';
  }
};

const formatFileSize = (bytes) => {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Same limits as the backend (assignmentController#evaluateSubmission).
const MAX_ALLOWED_MAX_MARKS = 1000;
const MAX_FEEDBACK_LENGTH = 5000;

function StatusBadge({ submission, pendingLabel = 'Pending' }) {
  if (submission.status === 'Evaluated') {
    return (
      <span className="fsub-status-badge fsub-status-evaluated">
        <CheckCircle2 size={12} /> Evaluated ({submission.marks}/{submission.maxMarks})
      </span>
    );
  }
  if (submission.status === 'Returned') {
    return (
      <span className="fsub-status-badge fsub-status-returned">
        <RotateCcw size={12} /> Returned for resubmission
      </span>
    );
  }
  return (
    <span className="fsub-status-badge fsub-status-pending">
      <Circle size={12} /> {pendingLabel}
    </span>
  );
}

export default function FacultySubmissions({ onBack }) {
  /* ── Faculty identity ── */
  const [facultyId, setFacultyId] = useState(null);

  /* ── Courses for filter dropdown ── */
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('all');

  /* ── Filter & Search states ── */
  const [selectedFilter, setSelectedFilter] = useState('All'); // 'All' | 'Pending Evaluation' | 'Evaluated' | 'Returned' | 'Late'
  const [searchQuery, setSearchQuery] = useState('');

  /* ── Submissions state ── */
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);
  const [submissionsError, setSubmissionsError] = useState(null);

  /* ── Modal & Evaluation state ── */
  const [openSubmission, setOpenSubmission] = useState(null);
  const [marksInput, setMarksInput] = useState('');
  const [maxMarksInput, setMaxMarksInput] = useState('');
  const [feedbackInput, setFeedbackInput] = useState('');
  const [evaluationStatus, setEvaluationStatus] = useState('Evaluated'); // 'Evaluated' | 'Returned'
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [marksFieldError, setMarksFieldError] = useState(null);

  /* ── Inline PDF preview in modal ── */
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [pdfPreviewState, setPdfPreviewState] = useState('idle'); // idle | loading | error
  const openFileId = openSubmission?.file?.fileId || null;

  useEffect(() => {
    if (!openFileId || !openSubmission?.file) {
      setPdfPreviewUrl(null);
      setPdfPreviewState('idle');
      return undefined;
    }
    let cancelled = false;
    let objectUrl = null;
    setPdfPreviewUrl(null);
    setPdfPreviewState('loading');
    fetchSubmissionPdf(openSubmission.file)
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setPdfPreviewUrl(objectUrl);
        setPdfPreviewState('idle');
      })
      .catch(() => {
        if (!cancelled) setPdfPreviewState('error');
      });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openFileId]);

  /* ── Load initial data on mount ── */
  useEffect(() => {
    initializePage();
  }, []);

  const initializePage = async () => {
    setLoadingSubmissions(true);
    setSubmissionsError(null);
    try {
      // 1. Authenticate faculty identity
      const profileRes = await profile();
      const user = profileRes?.data?.user;
      if (!user?._id) throw new Error('Unable to verify faculty identity');
      setFacultyId(user._id);

      // 2. Load courses for the course filter dropdown
      try {
        const myCoursesRes = await getMyFacultyCourses();
        const myCourses = myCoursesRes?.data?.data || [];
        setCourses(myCourses);
      } catch {
        // Fallback to getCourses with faculty filter
        const fallbackRes = await getCourses({ faculty: user._id, limit: 100 });
        const all = fallbackRes?.data?.data || [];
        setCourses(
          all.filter((c) => {
            const fid = c.faculty?._id || c.faculty;
            return String(fid) === String(user._id);
          })
        );
      }

      // 3. Load all submissions for this faculty's courses
      await fetchSubmissionsData();
    } catch (err) {
      console.error('FacultySubmissions init error:', err);
      setSubmissionsError(
        err?.response?.data?.message || err.message || 'Failed to load submissions'
      );
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const fetchSubmissionsData = async (courseIdFilter = selectedCourseId) => {
    try {
      const params = {};
      if (courseIdFilter && courseIdFilter !== 'all') {
        params.courseId = courseIdFilter;
      }
      const res = await getFacultySubmissions(params);
      const list = Array.isArray(res?.data?.data) ? res.data.data : [];
      setSubmissions(list);
    } catch (err) {
      console.error('Fetch submissions error:', err);
      throw err;
    }
  };

  const handleRefresh = async () => {
    setLoadingSubmissions(true);
    setSubmissionsError(null);
    try {
      await fetchSubmissionsData(selectedCourseId);
    } catch (err) {
      setSubmissionsError(
        err?.response?.data?.message || err.message || 'Failed to load submissions'
      );
    } finally {
      setLoadingSubmissions(false);
    }
  };

  /* ── Course selector change ── */
  const handleCourseChange = async (e) => {
    const newCourseId = e.target.value;
    setSelectedCourseId(newCourseId);
    setLoadingSubmissions(true);
    setSubmissionsError(null);
    try {
      await fetchSubmissionsData(newCourseId);
    } catch (err) {
      setSubmissionsError(
        err?.response?.data?.message || err.message || 'Failed to load submissions'
      );
    } finally {
      setLoadingSubmissions(false);
    }
  };

  /* ── Derived counts for summary stats ── */
  const stats = useMemo(() => {
    const total = submissions.length;
    const pending = submissions.filter((s) => s.status === 'Submitted').length;
    const evaluated = submissions.filter((s) => s.status === 'Evaluated').length;
    const returned = submissions.filter((s) => s.status === 'Returned').length;
    const late = submissions.filter((s) => Boolean(s.isLate)).length;
    return { total, pending, evaluated, returned, late };
  }, [submissions]);

  /* ── Filtered submissions ── */
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((s) => {
      // Course filter
      if (selectedCourseId !== 'all' && String(s.courseId) !== String(selectedCourseId)) {
        return false;
      }

      // Status filter
      if (selectedFilter === 'Pending Evaluation' && s.status !== 'Submitted') {
        return false;
      }
      if (selectedFilter === 'Evaluated' && s.status !== 'Evaluated') {
        return false;
      }
      if (selectedFilter === 'Returned' && s.status !== 'Returned') {
        return false;
      }
      if (selectedFilter === 'Late' && !s.isLate) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          (s.studentName || '').toLowerCase().includes(q) ||
          (s.studentEmail || '').toLowerCase().includes(q) ||
          (s.assignmentTitle || '').toLowerCase().includes(q) ||
          (s.courseName || '').toLowerCase().includes(q) ||
          (s.courseCode || '').toLowerCase().includes(q) ||
          (s.file?.originalName || '').toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [submissions, selectedCourseId, selectedFilter, searchQuery]);

  /* ── Open submission for evaluation ─── */
  const handleOpenSubmission = (submission) => {
    setOpenSubmission(submission);
    setMarksInput(
      submission.status === 'Evaluated' && submission.marks !== undefined
        ? String(submission.marks)
        : ''
    );
    setMaxMarksInput(String(submission.maxMarks ?? 10));
    setFeedbackInput(submission.feedback || '');
    setEvaluationStatus(submission.status === 'Returned' ? 'Returned' : 'Evaluated');
    setSaveError(null);
    setSaveSuccess(false);
    setMarksFieldError(null);
  };

  const closeSubmissionModal = () => {
    setOpenSubmission(null);
    setSaveError(null);
    setSaveSuccess(false);
    setMarksFieldError(null);
  };

  const parsedMaxMarks = Number(maxMarksInput);
  const maxMarksValid =
    maxMarksInput !== '' && Number.isFinite(parsedMaxMarks) && parsedMaxMarks > 0 && parsedMaxMarks <= MAX_ALLOWED_MAX_MARKS;
  const maxMarks = maxMarksValid ? parsedMaxMarks : openSubmission?.maxMarks ?? 10;
  const returning = evaluationStatus === 'Returned';

  const validateEvaluation = () => {
    if (!maxMarksValid) return `Maximum marks must be greater than 0 and at most ${MAX_ALLOWED_MAX_MARKS}.`;
    if (returning) {
      if (!feedbackInput.trim()) return 'Add feedback explaining what the student should change.';
      if (marksInput === '') return null; // marks are optional when returning
    } else if (marksInput === '' || marksInput === null || marksInput === undefined) {
      return 'Marks are required.';
    }
    const n = Number(marksInput);
    if (Number.isNaN(n)) return 'Marks must be a number.';
    if (n < 0) return 'Marks cannot be negative.';
    if (n > maxMarks) return `Marks cannot exceed ${maxMarks}.`;
    if (Math.round(n * 100) !== n * 100) return 'Marks can have at most 2 decimal places.';
    if (feedbackInput.trim().length > MAX_FEEDBACK_LENGTH) return `Feedback cannot exceed ${MAX_FEEDBACK_LENGTH} characters.`;
    return null;
  };

  /* ── Save evaluation ──────────────── */
  const handleSaveEvaluation = async () => {
    const err = validateEvaluation();
    if (err) {
      setMarksFieldError(err);
      return;
    }
    setMarksFieldError(null);
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const payload = {
        status: evaluationStatus,
        ...(marksInput !== '' ? { marks: Number(marksInput) } : {}),
        feedback: feedbackInput.trim(),
        courseId: openSubmission.courseId,
        moduleId: openSubmission.moduleId,
        lessonId: openSubmission.lessonId,
        assignmentId: openSubmission.assignmentId,
        maxMarks,
      };

      const res = await evaluateSubmission(
        openSubmission.assignmentId,
        openSubmission.studentId,
        payload
      );

      const updated = res?.data?.data;

      // Update in submissions list immediately
      setSubmissions((prev) =>
        prev.map((s) => {
          const match =
            (s.submissionId && openSubmission.submissionId && s.submissionId === openSubmission.submissionId) ||
            (s.studentId === openSubmission.studentId &&
              s.courseId === openSubmission.courseId &&
              s.moduleId === openSubmission.moduleId &&
              s.lessonId === openSubmission.lessonId);
          if (!match) return s;

          return {
            ...s,
            status: updated?.status || evaluationStatus,
            marks: updated?.marks ?? Number(marksInput),
            maxMarks: updated?.maxMarks ?? s.maxMarks,
            feedback: updated?.feedback ?? feedbackInput.trim(),
            evaluatedAt: updated?.evaluatedAt || new Date().toISOString(),
            evaluatedByName: updated?.evaluatedByName || s.evaluatedByName,
          };
        })
      );

      // Update openSubmission in modal
      setOpenSubmission((prev) =>
        prev
          ? {
              ...prev,
              status: updated?.status || evaluationStatus,
              marks: updated?.marks ?? Number(marksInput),
              maxMarks: updated?.maxMarks ?? prev.maxMarks,
              feedback: updated?.feedback ?? feedbackInput.trim(),
              evaluatedAt: updated?.evaluatedAt || new Date().toISOString(),
              evaluatedByName: updated?.evaluatedByName || prev.evaluatedByName,
            }
          : prev
      );

      setSaveSuccess(true);
    } catch (err2) {
      console.error('Save evaluation error:', err2);
      setSaveError(
        err2?.response?.data?.message || err2.message || 'Failed to save evaluation'
      );
    } finally {
      setSaving(false);
    }
  };

  /* ── PDF Quick Actions from list ── */
  const handleQuickOpenPdf = async (e, file) => {
    e.stopPropagation();
    try {
      await openSubmissionPdf(file);
    } catch (err) {
      alert(err?.response?.data?.message || 'Could not open the PDF.');
    }
  };

  const handleQuickDownloadPdf = async (e, file) => {
    e.stopPropagation();
    try {
      await downloadSubmissionPdf(file);
    } catch (err) {
      alert(err?.response?.data?.message || 'Could not download the PDF.');
    }
  };

  return (
    <div className="fsub-root">
      {/* ── Page Header ── */}
      <div className="fsub-header">
        <button className="fsub-back-btn" onClick={onBack}>
          <ArrowLeft size={14} /> Back to Dashboard
        </button>
        <h1 className="fsub-page-title">
          <ClipboardCheck size={22} />
          Submissions &amp; Evaluation
        </h1>
        <p className="fsub-page-subtitle">
          Review student submissions, preview submitted PDFs, and assign marks &amp; feedback.
        </p>
      </div>

      {/* ── Summary Stats Row ── */}
      <div className="fsub-summary-row">
        <div className="fsub-summary-stat">
          <span className="fsub-summary-value">{stats.total}</span>
          <span className="fsub-summary-label">Total Submissions</span>
        </div>
        <div className="fsub-summary-stat fsub-summary-pending">
          <span className="fsub-summary-value">{stats.pending}</span>
          <span className="fsub-summary-label">Pending Evaluation</span>
        </div>
        <div className="fsub-summary-stat fsub-summary-evaluated">
          <span className="fsub-summary-value">{stats.evaluated}</span>
          <span className="fsub-summary-label">Evaluated</span>
        </div>
        <div className="fsub-summary-stat fsub-summary-late">
          <span className="fsub-summary-value">{stats.late}</span>
          <span className="fsub-summary-label">Late Submissions</span>
        </div>
      </div>

      {/* ── Filter & Search Controls Bar ── */}
      <div className="fsub-filter-row">
        <div className="fsub-chips">
          {['All', 'Pending Evaluation', 'Evaluated', 'Returned', 'Late'].map((filterName) => {
            const count =
              filterName === 'All'
                ? stats.total
                : filterName === 'Pending Evaluation'
                ? stats.pending
                : filterName === 'Evaluated'
                ? stats.evaluated
                : filterName === 'Returned'
                ? stats.returned
                : stats.late;

            return (
              <button
                key={filterName}
                type="button"
                className={`fsub-chip ${selectedFilter === filterName ? 'active' : ''}`}
                onClick={() => setSelectedFilter(filterName)}
              >
                <span>{filterName}</span>
                <span className="fsub-chip-count">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="fsub-controls">
          {/* Course filter dropdown */}
          <select
            className="fsub-select"
            value={selectedCourseId}
            onChange={handleCourseChange}
            aria-label="Filter by course"
          >
            <option value="all">All Courses ({courses.length})</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.courseCode ? `${c.courseCode} - ` : ''}{c.courseName}
              </option>
            ))}
          </select>

          {/* Search bar */}
          <div className="fsub-search-wrap">
            <Search size={14} className="fsub-search-icon" />
            <input
              type="text"
              className="fsub-search-input"
              placeholder="Search submissions…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Refresh button */}
          <button
            type="button"
            className="fsub-chip"
            onClick={handleRefresh}
            title="Refresh submissions"
          >
            <RefreshCw size={13} className={loadingSubmissions ? 'fsub-spin' : ''} />
          </button>
        </div>
      </div>

      {/* ── Submissions Content ── */}
      {loadingSubmissions ? (
        <div className="fsub-loading-state">
          <div className="fsub-loader" />
          <p>Loading student submissions…</p>
        </div>
      ) : submissionsError ? (
        <div className="fsub-error-state">
          <AlertCircle size={32} />
          <h3>Something went wrong</h3>
          <p>{submissionsError}</p>
          <button className="fsub-retry-btn" onClick={handleRefresh}>
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <div className="fsub-empty-state">
          <BookOpen size={36} className="fsub-empty-icon" />
          <h3>No submissions found</h3>
          <p>
            {submissions.length === 0
              ? 'No student submissions have been recorded for your courses yet.'
              : 'No submissions match your selected filter or search query.'}
          </p>
        </div>
      ) : (
        <div className="fsub-submission-list">
          {filteredSubmissions.map((s) => (
            <div key={s.submissionId || `${s.studentId}-${s.courseId}-${s.moduleId}-${s.lessonId}`} className="fsub-submission-row">
              {/* Student info */}
              <div className="fsub-submission-student">
                <div className="fsub-avatar">
                  {(s.studentName || '?').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="fsub-student-name">{s.studentName}</div>
                  <div className="fsub-student-email">{s.studentEmail}</div>
                </div>
              </div>

              {/* Course & Assignment */}
              <div className="fsub-col-assign">
                <div className="fsub-assign-title" title={s.assignmentTitle}>
                  {s.assignmentTitle}
                </div>
                <div className="fsub-assign-course" title={`${s.courseName} (${s.courseCode})`}>
                  <span>{s.courseName}</span>
                  {s.courseCode && (
                    <span className="fsub-course-code">
                      <Hash size={10} /> {s.courseCode}
                    </span>
                  )}
                </div>
              </div>

              {/* Submitted PDF file */}
              <div className="fsub-col-file">
                {s.file ? (
                  <>
                    <div
                      className="fsub-file-chip"
                      title={`${s.file.originalName} (${formatFileSize(s.file.size)}) - Click to open`}
                      onClick={(e) => handleQuickOpenPdf(e, s.file)}
                    >
                      <FileText size={12} />
                      <span>{s.file.originalName || 'submission.pdf'}</span>
                    </div>
                    <div className="fsub-file-size">
                      {formatFileSize(s.file.size)}
                      <button
                        type="button"
                        className="btn btn-ghost"
                        style={{ padding: '0 4px', fontSize: '10px', height: 'auto', marginLeft: '6px' }}
                        title="Download PDF"
                        onClick={(e) => handleQuickDownloadPdf(e, s.file)}
                      >
                        <Download size={10} />
                      </button>
                    </div>
                  </>
                ) : (
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                    Text response
                  </span>
                )}
              </div>

              {/* Dates & Deadline */}
              <div className="fsub-col-dates">
                <div className="fsub-date-item" title={`Submitted: ${formatDateTime(s.submittedAt)}`}>
                  <Clock size={11} />
                  <span>Sub: {formatDateTime(s.submittedAt)}</span>
                </div>
                <div className="fsub-date-item" title={`Deadline: ${s.dueDate ? formatDateTime(s.dueDate) : 'No due date'}`}>
                  <Calendar size={11} />
                  <span>Due: {s.dueDate ? formatDateTime(s.dueDate) : 'None'}</span>
                </div>
                {s.isLate && (
                  <span className="fsub-late-tag" title="Submitted after deadline">
                    <AlertTriangle size={10} /> Late
                  </span>
                )}
              </div>

              {/* Status Badge */}
              <div className="fsub-submission-status">
                <StatusBadge submission={s} />
              </div>

              {/* Open Evaluation Button */}
              <button
                type="button"
                className="fsub-open-btn"
                onClick={() => handleOpenSubmission(s)}
              >
                <Eye size={13} />
                {s.status === 'Submitted' ? 'Evaluate' : 'Review / Edit'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ══════════ Open Submission / Evaluation Modal ══════════ */}
      {openSubmission && (
        <div className="modal-overlay" onClick={closeSubmissionModal}>
          <div
            className="modal-content fsub-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>{openSubmission.studentName}&apos;s Submission</h3>
              <button
                type="button"
                className="fsub-modal-close"
                onClick={closeSubmissionModal}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {/* Submission context metadata */}
              <div className="fsub-modal-meta">
                <div className="fsub-modal-meta-item">
                  <span className="fsub-modal-meta-label">Assignment</span>
                  <span>{openSubmission.assignmentTitle}</span>
                </div>
                <div className="fsub-modal-meta-item">
                  <span className="fsub-modal-meta-label">Course</span>
                  <span>{openSubmission.courseName} {openSubmission.courseCode ? `(${openSubmission.courseCode})` : ''}</span>
                </div>
                <div className="fsub-modal-meta-item">
                  <span className="fsub-modal-meta-label">Submitted</span>
                  <span>{formatDateTime(openSubmission.submittedAt)}</span>
                </div>
                <div className="fsub-modal-meta-item">
                  <span className="fsub-modal-meta-label">Deadline / Due Date</span>
                  <span>
                    {openSubmission.dueDate ? formatDateTime(openSubmission.dueDate) : 'No deadline'}
                    {openSubmission.isLate && (
                      <span className="fsub-late-tag" style={{ marginLeft: 6 }}>
                        <AlertTriangle size={10} /> Late
                      </span>
                    )}
                  </span>
                </div>
                <div className="fsub-modal-meta-item">
                  <span className="fsub-modal-meta-label">Status</span>
                  <span>
                    <StatusBadge submission={openSubmission} pendingLabel="Pending Evaluation" />
                  </span>
                </div>
                <div className="fsub-modal-meta-item">
                  <span className="fsub-modal-meta-label">Student Email</span>
                  <span>{openSubmission.studentEmail || '--'}</span>
                </div>
                {openSubmission.status !== 'Submitted' && openSubmission.evaluatedAt && (
                  <div className="fsub-modal-meta-item">
                    <span className="fsub-modal-meta-label">
                      {openSubmission.status === 'Returned' ? 'Returned by' : 'Evaluated by'}
                    </span>
                    <span>
                      {openSubmission.evaluatedByName || 'Faculty'} · {formatDateTime(openSubmission.evaluatedAt)}
                    </span>
                  </div>
                )}
              </div>

              {/* Submitted PDF section */}
              {openSubmission.file && (
                <div className="fsub-modal-section">
                  <label className="fsub-modal-section-label">Submitted PDF Document</label>
                  <SubmittedPdf file={openSubmission.file} />

                  {pdfPreviewState === 'loading' && (
                    <div className="fsub-pdf-preview fsub-pdf-preview-state">
                      <RefreshCw size={14} className="fsub-spin" style={{ marginRight: 6 }} />
                      Loading PDF preview…
                    </div>
                  )}
                  {pdfPreviewState === 'error' && (
                    <div className="fsub-pdf-preview fsub-pdf-preview-state">
                      The preview could not be embedded. Use Open or Download to view the document.
                    </div>
                  )}
                  {pdfPreviewUrl && (
                    <iframe
                      className="fsub-pdf-preview"
                      src={pdfPreviewUrl}
                      title={`PDF submitted by ${openSubmission.studentName}`}
                    />
                  )}
                </div>
              )}

              {/* Answers list or text */}
              <div className="fsub-modal-section">
                <label className="fsub-modal-section-label">Student Answers &amp; Responses</label>
                {openSubmission.questions && openSubmission.questions.length > 0 ? (
                  <div className="fsub-answers-list">
                    {openSubmission.questions.map((q, i) => (
                      <div key={i} className="fsub-answer-block">
                        <div className="fsub-answer-question">
                          Q{i + 1}. {q.questionText}
                          {q.marks ? ` (${q.marks} marks)` : ''}
                        </div>
                        <div className="fsub-answer-text">
                          {openSubmission.answers?.[i] || (
                            <span className="fsub-muted">
                              {openSubmission.file ? 'Attached in PDF' : 'No answer provided'}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="fsub-answer-text fsub-answer-freeform">
                    {openSubmission.answer || (
                      <span className="fsub-muted">
                        {openSubmission.file
                          ? 'Work submitted via attached PDF file.'
                          : 'No text response provided.'}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Evaluation outcome */}
              <div className="fsub-modal-section">
                <label className="fsub-modal-section-label">Evaluation Status</label>
                <div className="fsub-chips" role="radiogroup" aria-label="Evaluation status">
                  {[
                    { value: 'Evaluated', label: 'Evaluated', Icon: CheckCircle2 },
                    { value: 'Returned', label: 'Return for resubmission', Icon: RotateCcw },
                  ].map(({ value, label, Icon }) => (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={evaluationStatus === value}
                      className={`fsub-chip ${evaluationStatus === value ? 'active' : ''}`}
                      onClick={() => {
                        setEvaluationStatus(value);
                        setMarksFieldError(null);
                      }}
                    >
                      <Icon size={12} /> <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Evaluation scoring form */}
              <div className="fsub-modal-section">
                <div className="fsub-marks-row">
                  <div className="fsub-marks-field">
                    <label className="fsub-modal-section-label" htmlFor="fsub-marks">
                      Marks{returning ? ' (optional)' : ''}
                    </label>
                    <input
                      id="fsub-marks"
                      type="number"
                      min="0"
                      max={maxMarks}
                      step="0.5"
                      className="fsub-marks-input"
                      value={marksInput}
                      onChange={(e) => {
                        setMarksInput(e.target.value);
                        setMarksFieldError(null);
                      }}
                      placeholder={`0 - ${maxMarks}`}
                    />
                  </div>
                  <div className="fsub-marks-field">
                    <label className="fsub-modal-section-label" htmlFor="fsub-max-marks">
                      Maximum Marks
                    </label>
                    <input
                      id="fsub-max-marks"
                      type="number"
                      min="1"
                      max={MAX_ALLOWED_MAX_MARKS}
                      className="fsub-marks-input"
                      value={maxMarksInput}
                      onChange={(e) => {
                        setMaxMarksInput(e.target.value);
                        setMarksFieldError(null);
                      }}
                    />
                  </div>
                </div>
                {marksFieldError && (
                  <span className="fsub-field-error">{marksFieldError}</span>
                )}
              </div>

              {/* Feedback form */}
              <div className="fsub-modal-section">
                <label className="fsub-modal-section-label" htmlFor="fsub-feedback">
                  Faculty Feedback{returning ? ' (required)' : ''}
                </label>
                <textarea
                  id="fsub-feedback"
                  rows={4}
                  maxLength={MAX_FEEDBACK_LENGTH}
                  className="fsub-feedback-input"
                  value={feedbackInput}
                  onChange={(e) => {
                    setFeedbackInput(e.target.value);
                    setMarksFieldError(null);
                  }}
                  placeholder={
                    returning
                      ? 'Explain what the student needs to change before resubmitting…'
                      : 'Provide constructive feedback and comments for the student…'
                  }
                />
              </div>

              {/* Feedback messages */}
              {saveError && (
                <div className="fsub-message fsub-message-error">
                  <AlertCircle size={14} />
                  <span>{saveError}</span>
                </div>
              )}
              {saveSuccess && (
                <div className="fsub-message fsub-message-success">
                  <CheckCircle2 size={14} />
                  <span>
                    {openSubmission.status === 'Returned'
                      ? 'Submission returned. The student can see your feedback and resubmit.'
                      : 'Evaluation saved successfully. Student can now see marks & feedback.'}
                  </span>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" className="fsub-cancel-btn" onClick={closeSubmissionModal}>
                Close
              </button>
              <button
                type="button"
                className="fsub-save-btn"
                onClick={handleSaveEvaluation}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <RefreshCw size={14} className="fsub-spin" /> Saving…
                  </>
                ) : (
                  <>
                    {returning ? <RotateCcw size={14} /> : <Save size={14} />}
                    {returning ? ' Return to Student' : ' Save Evaluation'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
