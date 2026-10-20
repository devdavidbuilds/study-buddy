import { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  ClipboardCheck,
  BookOpen,
  FileText,
  Layers,
  Hash,
  Clock,
  User,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Circle,
  X,
  Save,
  Eye,
  ChevronRight,
} from 'lucide-react';
import { getCourses } from '../../api/courseApi';
import { profile } from '../../api/authApi';
import {
  getAssignmentsByCourse,
  getSubmissionsForAssignment,
  evaluateSubmission,
} from '../../api/assignmentApi';
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

export default function FacultySubmissions({ onBack }) {
  /* ── View state: 'courses' | 'assignments' | 'submissions' ── */
  const [view, setView] = useState('courses');

  /* ── Faculty identity (from verified profile, never trusted from UI) ── */
  const [facultyId, setFacultyId] = useState(null);

  /* ── Courses ─────────────────────── */
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [coursesError, setCoursesError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  /* ── Assignments ─────────────────── */
  const [assignments, setAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [assignmentsError, setAssignmentsError] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  /* ── Submissions ──────────────────── */
  const [submissions, setSubmissions] = useState([]);
  const [assignmentMeta, setAssignmentMeta] = useState(null);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [submissionsError, setSubmissionsError] = useState(null);

  /* ── Open submission modal ────────── */
  const [openSubmission, setOpenSubmission] = useState(null);
  const [marksInput, setMarksInput] = useState('');
  const [feedbackInput, setFeedbackInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [marksFieldError, setMarksFieldError] = useState(null);

  /* ── Fetch faculty's own courses on mount ── */
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoadingCourses(true);
    setCoursesError(null);
    try {
      const profileRes = await profile();
      const user = profileRes?.data?.user;
      if (!user?._id) throw new Error('Unable to verify faculty identity');
      setFacultyId(user._id);

      const coursesRes = await getCourses({ limit: 200 });
      const allCourses = coursesRes?.data?.data || [];
      const myCourses = allCourses.filter((c) => {
        const fid = c.faculty?._id || c.faculty;
        return fid === user._id;
      });
      setCourses(myCourses);
    } catch (err) {
      console.error('FacultySubmissions courses fetch error:', err);
      setCoursesError(
        err?.response?.data?.message || err.message || 'Failed to load courses'
      );
    } finally {
      setLoadingCourses(false);
    }
  };

  /* ── Select a course → load its assignments ── */
  const selectCourse = async (course) => {
    setSelectedCourse(course);
    setView('assignments');
    setAssignments([]);
    setAssignmentsError(null);
    setLoadingAssignments(true);
    try {
      const res = await getAssignmentsByCourse(course._id);
      const data = res?.data?.data || [];
      setAssignments(data);
    } catch (err) {
      console.error('FacultySubmissions assignments fetch error:', err);
      setAssignmentsError(
        err?.response?.data?.message || err.message || 'Failed to load assignments'
      );
    } finally {
      setLoadingAssignments(false);
    }
  };

  /* ── Select an assignment → load its submissions ── */
  const selectAssignment = async (assignment) => {
    setSelectedAssignment(assignment);
    setView('submissions');
    fetchSubmissions(assignment._id);
  };

  const fetchSubmissions = async (assignmentId) => {
    setSubmissions([]);
    setAssignmentMeta(null);
    setSubmissionsError(null);
    setLoadingSubmissions(true);
    try {
      const res = await getSubmissionsForAssignment(assignmentId);
      const data = res?.data?.data;
      setSubmissions(data?.submissions || []);
      setAssignmentMeta(data?.assignment || null);
    } catch (err) {
      console.error('FacultySubmissions submissions fetch error:', err);
      setSubmissionsError(
        err?.response?.data?.message || err.message || 'Failed to load submissions'
      );
    } finally {
      setLoadingSubmissions(false);
    }
  };

  /* ── Navigation ────────────────────── */
  const backToCourses = () => {
    setView('courses');
    setSelectedCourse(null);
    setAssignments([]);
  };

  const backToAssignments = () => {
    setView('assignments');
    setSelectedAssignment(null);
    setSubmissions([]);
    setAssignmentMeta(null);
  };

  /* ── Open a submission for grading ─── */
  const handleOpenSubmission = (submission) => {
    setOpenSubmission(submission);
    setMarksInput(
      submission.status === 'Evaluated' ? String(submission.marks ?? '') : ''
    );
    setFeedbackInput(submission.feedback || '');
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

  const maxMarks = openSubmission?.maxMarks ?? assignmentMeta?.totalMarks ?? 0;

  const validateMarks = (value) => {
    if (value === '' || value === null || value === undefined) {
      return 'Marks are required.';
    }
    const n = Number(value);
    if (Number.isNaN(n)) return 'Marks must be a number.';
    if (n < 0) return 'Marks cannot be negative.';
    if (n > maxMarks) return `Marks cannot exceed ${maxMarks}.`;
    return null;
  };

  /* ── Save evaluation ──────────────── */
  const handleSaveEvaluation = async () => {
    const err = validateMarks(marksInput);
    if (err) {
      setMarksFieldError(err);
      return;
    }
    setMarksFieldError(null);
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const res = await evaluateSubmission(
        openSubmission.assignmentId,
        openSubmission.studentId,
        { marks: Number(marksInput), feedback: feedbackInput.trim() }
      );

      const updated = res?.data?.data;

      // Reflect the saved evaluation in the submissions list immediately.
      setSubmissions((prev) =>
        prev.map((s) =>
          s.studentId === openSubmission.studentId
            ? {
                ...s,
                marks: updated?.marks ?? Number(marksInput),
                feedback: updated?.feedback ?? feedbackInput.trim(),
                status: updated?.status || 'Evaluated',
                evaluatedAt: updated?.evaluatedAt || new Date().toISOString(),
              }
            : s
        )
      );

      setOpenSubmission((prev) =>
        prev
          ? {
              ...prev,
              marks: updated?.marks ?? Number(marksInput),
              feedback: updated?.feedback ?? feedbackInput.trim(),
              status: updated?.status || 'Evaluated',
              evaluatedAt: updated?.evaluatedAt || new Date().toISOString(),
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

  /* ── Derived counts ────────────────── */
  const evaluatedCount = useMemo(
    () => submissions.filter((s) => s.status === 'Evaluated').length,
    [submissions]
  );
  const pendingCount = submissions.length - evaluatedCount;

  /* ════════════════════════════════════════════
     RENDER
     ════════════════════════════════════════════ */
  return (
    <div className="fsub-root">
      {/* ── Header ── */}
      <div className="fsub-header">
        <button className="fsub-back-btn" onClick={onBack}>
          <ArrowLeft size={14} /> Back to Dashboard
        </button>
        <h1 className="fsub-page-title">
          <ClipboardCheck size={20} />
          Submissions &amp; Evaluation
        </h1>
        <p className="fsub-page-subtitle">
          Review student submissions and give marks &amp; feedback.
        </p>
      </div>

      {/* ── Breadcrumb ── */}
      <div className="fsub-breadcrumb">
        <button
          className={`fsub-crumb ${view === 'courses' ? 'active' : ''}`}
          onClick={backToCourses}
        >
          My Courses
        </button>
        {selectedCourse && (
          <>
            <ChevronRight size={13} className="fsub-crumb-sep" />
            <button
              className={`fsub-crumb ${view === 'assignments' ? 'active' : ''}`}
              onClick={() => selectCourse(selectedCourse)}
            >
              {selectedCourse.courseName}
            </button>
          </>
        )}
        {selectedAssignment && (
          <>
            <ChevronRight size={13} className="fsub-crumb-sep" />
            <span className="fsub-crumb active">{selectedAssignment.title}</span>
          </>
        )}
      </div>

      {/* ══════════ STEP 1: My Courses ══════════ */}
      {view === 'courses' && (
        <>
          {loadingCourses ? (
            <div className="fsub-loading-state">
              <div className="fsub-loader" />
              <p>Loading your courses…</p>
            </div>
          ) : coursesError ? (
            <div className="fsub-error-state">
              <AlertCircle size={32} />
              <h3>Something went wrong</h3>
              <p>{coursesError}</p>
              <button className="fsub-retry-btn" onClick={fetchCourses}>
                <RefreshCw size={14} /> Retry
              </button>
            </div>
          ) : courses.length === 0 ? (
            <div className="fsub-empty-state">
              <BookOpen size={36} className="fsub-empty-icon" />
              <h3>No courses yet</h3>
              <p>Create a course before reviewing submissions.</p>
            </div>
          ) : (
            <div className="fsub-course-grid">
              {courses.map((course) => (
                <button
                  key={course._id}
                  className="fsub-course-card"
                  onClick={() => selectCourse(course)}
                >
                  <span className="fsub-course-thumb">{course.thumbnail || '📘'}</span>
                  <div className="fsub-course-info">
                    <h3>{course.courseName}</h3>
                    <span className="fsub-course-code">
                      <Hash size={11} /> {course.courseCode}
                    </span>
                  </div>
                  <ChevronRight size={16} className="fsub-course-arrow" />
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* ══════════ STEP 2: Assignments for course ══════════ */}
      {view === 'assignments' && selectedCourse && (
        <>
          {loadingAssignments ? (
            <div className="fsub-loading-state">
              <div className="fsub-loader" />
              <p>Loading assignments…</p>
            </div>
          ) : assignmentsError ? (
            <div className="fsub-error-state">
              <AlertCircle size={32} />
              <h3>Something went wrong</h3>
              <p>{assignmentsError}</p>
              <button
                className="fsub-retry-btn"
                onClick={() => selectCourse(selectedCourse)}
              >
                <RefreshCw size={14} /> Retry
              </button>
            </div>
          ) : assignments.length === 0 ? (
            <div className="fsub-empty-state">
              <FileText size={36} className="fsub-empty-icon" />
              <h3>No assignments yet</h3>
              <p>Create an assignment for this course to start receiving submissions.</p>
            </div>
          ) : (
            <div className="fsub-assignment-list">
              {assignments.map((a) => (
                <button
                  key={a._id}
                  className="fsub-assignment-card"
                  onClick={() => selectAssignment(a)}
                >
                  <div className="fsub-assignment-icon">
                    <FileText size={16} />
                  </div>
                  <div className="fsub-assignment-info">
                    <h3>{a.title}</h3>
                    <div className="fsub-assignment-meta">
                      <span>
                        <Layers size={11} /> {a.totalMarks} marks
                      </span>
                      {a.dueDate && (
                        <span>
                          <Clock size={11} /> Due {formatDateTime(a.dueDate)}
                        </span>
                      )}
                      <span className={`fsub-status-badge fsub-status-${(a.status || 'Published').toLowerCase()}`}>
                        {a.status || 'Published'}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="fsub-course-arrow" />
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* ══════════ STEP 3: Student submissions ══════════ */}
      {view === 'submissions' && selectedAssignment && (
        <>
          {!loadingSubmissions && !submissionsError && (
            <div className="fsub-summary-row">
              <div className="fsub-summary-stat">
                <span className="fsub-summary-value">{submissions.length}</span>
                <span className="fsub-summary-label">Total Submissions</span>
              </div>
              <div className="fsub-summary-stat fsub-summary-pending">
                <span className="fsub-summary-value">{pendingCount}</span>
                <span className="fsub-summary-label">Pending</span>
              </div>
              <div className="fsub-summary-stat fsub-summary-evaluated">
                <span className="fsub-summary-value">{evaluatedCount}</span>
                <span className="fsub-summary-label">Evaluated</span>
              </div>
            </div>
          )}

          {loadingSubmissions ? (
            <div className="fsub-loading-state">
              <div className="fsub-loader" />
              <p>Loading submissions…</p>
            </div>
          ) : submissionsError ? (
            <div className="fsub-error-state">
              <AlertCircle size={32} />
              <h3>Something went wrong</h3>
              <p>{submissionsError}</p>
              <button
                className="fsub-retry-btn"
                onClick={() => fetchSubmissions(selectedAssignment._id)}
              >
                <RefreshCw size={14} /> Retry
              </button>
            </div>
          ) : submissions.length === 0 ? (
            <div className="fsub-empty-state">
              <User size={36} className="fsub-empty-icon" />
              <h3>No submissions yet</h3>
              <p>No students have submitted this assignment yet.</p>
            </div>
          ) : (
            <div className="fsub-submission-list">
              {submissions.map((s) => (
                <div key={s.studentId} className="fsub-submission-row">
                  <div className="fsub-submission-student">
                    <div className="fsub-avatar">
                      {(s.studentName || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="fsub-student-name">{s.studentName}</div>
                      <div className="fsub-student-email">{s.studentEmail}</div>
                    </div>
                  </div>

                  <div className="fsub-submission-date">
                    <Clock size={12} />
                    {formatDateTime(s.submittedAt)}
                  </div>

                  <div className="fsub-submission-status">
                    {s.status === 'Evaluated' ? (
                      <span className="fsub-status-badge fsub-status-evaluated">
                        <CheckCircle2 size={12} /> Evaluated ({s.marks}/{s.maxMarks})
                      </span>
                    ) : (
                      <span className="fsub-status-badge fsub-status-pending">
                        <Circle size={12} /> Pending
                      </span>
                    )}
                  </div>

                  <button
                    className="fsub-open-btn"
                    onClick={() => handleOpenSubmission(s)}
                  >
                    <Eye size={13} />
                    Open Submission
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ══════════ Open Submission / Evaluation Modal ══════════ */}
      {openSubmission && (
        <div className="modal-overlay" onClick={closeSubmissionModal}>
          <div
            className="modal-content fsub-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>{openSubmission.studentName}'s Submission</h3>
              <button className="fsub-modal-close" onClick={closeSubmissionModal}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {/* Submission context */}
              <div className="fsub-modal-meta">
                <div className="fsub-modal-meta-item">
                  <span className="fsub-modal-meta-label">Assignment</span>
                  <span>{openSubmission.assignmentTitle}</span>
                </div>
                <div className="fsub-modal-meta-item">
                  <span className="fsub-modal-meta-label">Course</span>
                  <span>{openSubmission.courseName}</span>
                </div>
                <div className="fsub-modal-meta-item">
                  <span className="fsub-modal-meta-label">Submitted</span>
                  <span>{formatDateTime(openSubmission.submittedAt)}</span>
                </div>
                <div className="fsub-modal-meta-item">
                  <span className="fsub-modal-meta-label">Status</span>
                  <span>
                    {openSubmission.status === 'Evaluated' ? (
                      <span className="fsub-status-badge fsub-status-evaluated">
                        <CheckCircle2 size={12} /> Evaluated
                      </span>
                    ) : (
                      <span className="fsub-status-badge fsub-status-pending">
                        <Circle size={12} /> Pending
                      </span>
                    )}
                  </span>
                </div>
              </div>

              {/* Answer(s) */}
              <div className="fsub-modal-section">
                <label className="fsub-modal-section-label">Answer / Submission</label>
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
                            <span className="fsub-muted">No answer provided</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="fsub-answer-text fsub-answer-freeform">
                    {openSubmission.answer || (
                      <span className="fsub-muted">No answer provided</span>
                    )}
                  </div>
                )}
              </div>

              {/* Evaluation form */}
              <div className="fsub-modal-section">
                <label className="fsub-modal-section-label" htmlFor="fsub-marks">
                  Marks (out of {maxMarks})
                </label>
                <input
                  id="fsub-marks"
                  type="number"
                  min="0"
                  max={maxMarks}
                  className="fsub-marks-input"
                  value={marksInput}
                  onChange={(e) => {
                    setMarksInput(e.target.value);
                    setMarksFieldError(null);
                  }}
                  placeholder={`0 - ${maxMarks}`}
                />
                {marksFieldError && (
                  <span className="fsub-field-error">{marksFieldError}</span>
                )}
              </div>

              <div className="fsub-modal-section">
                <label className="fsub-modal-section-label" htmlFor="fsub-feedback">
                  Feedback
                </label>
                <textarea
                  id="fsub-feedback"
                  rows={4}
                  className="fsub-feedback-input"
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                  placeholder="Write feedback for the student…"
                />
              </div>

              {saveError && (
                <div className="fsub-message fsub-message-error">
                  <AlertCircle size={14} />
                  <span>{saveError}</span>
                </div>
              )}
              {saveSuccess && (
                <div className="fsub-message fsub-message-success">
                  <CheckCircle2 size={14} />
                  <span>Evaluation saved successfully.</span>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="fsub-cancel-btn" onClick={closeSubmissionModal}>
                Close
              </button>
              <button
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
                    <Save size={14} /> Save Evaluation
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
