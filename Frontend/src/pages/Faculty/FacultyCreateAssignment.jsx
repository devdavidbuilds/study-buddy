import { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  ClipboardList,
  BookOpen,
  Layers,
  FileText,
  Plus,
  Trash2,
  Save,
  X,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Calendar,
  Hash,
  RefreshCw,
} from 'lucide-react';
import { getCourses, getCourse, getMyFacultyCourses } from '../../api/courseApi';
import { createAssignment } from '../../api/assignmentApi';
import { profile } from '../../api/authApi';
import './FacultyCreateAssignment.css';

export default function FacultyCreateAssignment({ onBack }) {
  /* ── Loading state ─────────────────── */
  const [loadingCourses, setLoadingCourses] = useState(true);

  /* ── Course/module/lesson pickers ──── */
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [selectedLessonId, setSelectedLessonId] = useState('');

  /* ── Form fields ───────────────────── */
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [totalMarks, setTotalMarks] = useState(10);
  const [dueDate, setDueDate] = useState('');
  const [questions, setQuestions] = useState([]);
  const [resources, setResources] = useState([]);

  /* ── Submit state ──────────────────── */
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [errors, setErrors] = useState({});

  /* ── Fetch faculty's courses on mount ── */
  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    setLoadingCourses(true);
    try {
      const profileRes = await profile();
      const user = profileRes?.data?.user;
      if (!user?._id) return;

      try {
        const myCoursesRes = await getMyFacultyCourses();
        setCourses(myCoursesRes?.data?.data || []);
      } catch {
        const coursesRes = await getCourses({ faculty: user._id, limit: 100 });
        const allCourses = coursesRes?.data?.data || [];
        const myCourses = allCourses.filter((c) => {
          const fid = c.faculty?._id || c.faculty;
          return String(fid) === String(user._id);
        });
        setCourses(myCourses);
      }
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    } finally {
      setLoadingCourses(false);
    }
  };

  /* ── When course changes, load full course data ── */
  useEffect(() => {
    if (!selectedCourseId) {
      setSelectedCourse(null);
      setSelectedModuleId('');
      setSelectedLessonId('');
      return;
    }
    const loadCourse = async () => {
      try {
        const res = await getCourse(selectedCourseId);
        setSelectedCourse(res?.data?.data || null);
      } catch {
        setSelectedCourse(null);
      }
      setSelectedModuleId('');
      setSelectedLessonId('');
    };
    loadCourse();
  }, [selectedCourseId]);

  /* ── Reset lesson when module changes ── */
  useEffect(() => {
    setSelectedLessonId('');
  }, [selectedModuleId]);

  /* ── Derived data ─────────────────── */
  const modules = useMemo(
    () => selectedCourse?.modules || [],
    [selectedCourse]
  );

  const selectedModule = useMemo(
    () => modules.find((m) => m.id === selectedModuleId) || null,
    [modules, selectedModuleId]
  );

  const lessons = useMemo(
    () => selectedModule?.lessons || [],
    [selectedModule]
  );

  const selectedLesson = useMemo(
    () => lessons.find((l) => l.id === selectedLessonId) || null,
    [lessons, selectedLessonId]
  );

  const contextReady = !!(selectedCourseId && selectedModuleId && selectedLessonId);

  /* ── Question helpers ─────────────── */
  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { questionText: '', type: 'text', options: [], correctAnswer: '', marks: 1 },
    ]);
  };

  const removeQuestion = (index) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const updateQuestion = (index, field, value) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, [field]: value } : q))
    );
  };

  /* ── Resource helpers ─────────────── */
  const addResource = () => {
    setResources((prev) => [...prev, '']);
  };

  const removeResource = (index) => {
    setResources((prev) => prev.filter((_, i) => i !== index));
  };

  const updateResource = (index, value) => {
    setResources((prev) => prev.map((r, i) => (i === index ? value : r)));
  };

  /* ── Validation ───────────────────── */
  const validate = () => {
    const errs = {};
    if (!title.trim()) errs.title = 'Title is required';
    if (title.trim().length > 0 && title.trim().length < 3) errs.title = 'Title must be at least 3 characters';
    if (!selectedCourseId) errs.course = 'Select a course';
    if (!selectedModuleId) errs.module = 'Select a module';
    if (!selectedLessonId) errs.lesson = 'Select a lesson';
    if (totalMarks < 0) errs.totalMarks = 'Marks cannot be negative';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /* ── Submit ───────────────────────── */
  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setMessage(null);

    try {
      // Filter out empty questions
      const cleanQuestions = questions
        .filter((q) => q.questionText.trim())
        .map((q) => ({
          questionText: q.questionText.trim(),
          type: q.type,
          marks: q.marks || 1,
        }));

      // Filter out empty resources
      const cleanResources = resources.filter((r) => r.trim());

      await createAssignment({
        title: title.trim(),
        instructions: instructions.trim(),
        courseId: selectedCourseId,
        moduleId: selectedModuleId,
        lessonId: selectedLessonId,
        questions: cleanQuestions,
        totalMarks: Number(totalMarks) || 10,
        dueDate: dueDate || null,
        resources: cleanResources,
      });

      setMessage({ type: 'success', text: 'Assignment created successfully!' });

      // Reset form
      setTitle('');
      setInstructions('');
      setTotalMarks(10);
      setDueDate('');
      setQuestions([]);
      setResources([]);
      setErrors({});
    } catch (err) {
      const msg =
        err?.response?.data?.message || err.message || 'Failed to create assignment';
      setMessage({ type: 'error', text: msg });
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Loading state ─────────────────── */
  if (loadingCourses) {
    return (
      <div className="fca-root">
        <div className="fca-loading-state">
          <div className="fca-loader" />
          <p>Loading your courses…</p>
        </div>
      </div>
    );
  }

  /* ── Render ─────────────────────────── */
  return (
    <div className="fca-root">
      {/* ── Header ── */}
      <div className="fca-header">
        <button className="fca-back-btn" onClick={onBack}>
          <ArrowLeft size={14} /> Back
        </button>
        <h1 className="fca-page-title">
          <ClipboardList size={20} />
          Create Assignment
        </h1>
        <p className="fca-page-subtitle">
          Create an assignment for a specific lesson in one of your courses.
        </p>
      </div>

      {/* ── Message ── */}
      {message && (
        <div className={`fca-message fca-message-${message.type}`}>
          {message.type === 'success' ? (
            <CheckCircle2 size={14} />
          ) : (
            <AlertCircle size={14} />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* ── Context breadcrumb ── */}
      {contextReady && (
        <div className="fca-context">
          <span className="fca-context-item">
            <BookOpen size={12} />
            {selectedCourse?.courseName}
          </span>
          <span className="fca-context-sep">
            <ChevronRight size={11} />
          </span>
          <span className="fca-context-item">
            <Layers size={12} />
            {selectedModule?.title}
          </span>
          <span className="fca-context-sep">
            <ChevronRight size={11} />
          </span>
          <span className="fca-context-item">
            <FileText size={12} />
            {selectedLesson?.title}
          </span>
        </div>
      )}

      {/* ── Step 1: Pick course / module / lesson ── */}
      <div className="fca-picker-section">
        <div className="fca-picker-title">
          <Layers size={14} />
          Step 1 — Select Course, Module & Lesson
        </div>
        <div className="fca-picker-grid">
          {/* Course */}
          <div className="fca-picker-group">
            <label className="fca-picker-label">Course</label>
            <select
              className="fca-picker-select"
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
            >
              <option value="">Select a course…</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.courseName} ({c.courseCode})
                </option>
              ))}
            </select>
            {errors.course && <span className="fca-field-error">{errors.course}</span>}
          </div>

          {/* Module */}
          <div className="fca-picker-group">
            <label className="fca-picker-label">Module</label>
            <select
              className="fca-picker-select"
              value={selectedModuleId}
              onChange={(e) => setSelectedModuleId(e.target.value)}
              disabled={!selectedCourseId || modules.length === 0}
            >
              <option value="">
                {!selectedCourseId
                  ? 'Select course first…'
                  : modules.length === 0
                    ? 'No modules'
                    : 'Select a module…'}
              </option>
              {modules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
            {errors.module && <span className="fca-field-error">{errors.module}</span>}
          </div>

          {/* Lesson */}
          <div className="fca-picker-group">
            <label className="fca-picker-label">Lesson</label>
            <select
              className="fca-picker-select"
              value={selectedLessonId}
              onChange={(e) => setSelectedLessonId(e.target.value)}
              disabled={!selectedModuleId || lessons.length === 0}
            >
              <option value="">
                {!selectedModuleId
                  ? 'Select module first…'
                  : lessons.length === 0
                    ? 'No lessons'
                    : 'Select a lesson…'}
              </option>
              {lessons.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title}
                </option>
              ))}
            </select>
            {errors.lesson && <span className="fca-field-error">{errors.lesson}</span>}
          </div>
        </div>
      </div>

      {/* ── Step 2: Assignment form (only when context is ready) ── */}
      {contextReady && (
        <div className="fca-form-card">
          <div className="fca-form-card-title">
            <ClipboardList size={14} />
            Step 2 — Assignment Details
          </div>

          <div className="fca-form">
            {/* Title + Total Marks */}
            <div className="fca-form-row">
              <div className="fca-form-group">
                <label>
                  Title <span className="fca-required">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Week 3 Lab Exercise"
                />
                {errors.title && (
                  <span className="fca-field-error">{errors.title}</span>
                )}
              </div>
              <div className="fca-form-group">
                <label>Total Marks</label>
                <input
                  type="number"
                  min="0"
                  value={totalMarks}
                  onChange={(e) => setTotalMarks(e.target.value)}
                  placeholder="10"
                />
                {errors.totalMarks && (
                  <span className="fca-field-error">{errors.totalMarks}</span>
                )}
              </div>
            </div>

            {/* Due Date */}
            <div className="fca-form-row">
              <div className="fca-form-group">
                <label>Due Date</label>
                <input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
              <div />
            </div>

            {/* Instructions */}
            <div className="fca-form-group">
              <label>Instructions</label>
              <textarea
                rows={4}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Provide detailed instructions for the assignment…"
              />
            </div>

            {/* Questions */}
            <div className="fca-form-group">
              <div className="fca-questions-header">
                <span className="fca-questions-title">
                  Questions ({questions.length})
                </span>
                <button
                  className="fca-add-question-btn"
                  onClick={addQuestion}
                  type="button"
                >
                  <Plus size={13} /> Add Question
                </button>
              </div>

              {questions.length > 0 && (
                <div className="fca-question-list">
                  {questions.map((q, i) => (
                    <div key={i} className="fca-question-card">
                      <div className="fca-question-card-header">
                        <span className="fca-question-number">Q{i + 1}</span>
                        <button
                          className="fca-question-remove"
                          onClick={() => removeQuestion(i)}
                          title="Remove question"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <div className="fca-question-fields">
                        <textarea
                          rows={2}
                          value={q.questionText}
                          onChange={(e) =>
                            updateQuestion(i, 'questionText', e.target.value)
                          }
                          placeholder="Enter the question…"
                        />
                        <div className="fca-question-row">
                          <input
                            type="text"
                            value={q.correctAnswer}
                            onChange={(e) =>
                              updateQuestion(i, 'correctAnswer', e.target.value)
                            }
                            placeholder="Expected answer (optional)"
                          />
                          <input
                            type="number"
                            min="0"
                            className="fca-question-marks-input"
                            value={q.marks}
                            onChange={(e) =>
                              updateQuestion(i, 'marks', Number(e.target.value))
                            }
                            title="Marks"
                            placeholder="Marks"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Resources */}
            <div className="fca-form-group">
              <div className="fca-questions-header">
                <span className="fca-questions-title">
                  Resources ({resources.length})
                </span>
                <button
                  className="fca-add-resource-btn"
                  onClick={addResource}
                  type="button"
                >
                  <Plus size={13} /> Add Resource
                </button>
              </div>

              {resources.length > 0 && (
                <div className="fca-resources-list">
                  {resources.map((r, i) => (
                    <div key={i} className="fca-resource-row">
                      <input
                        type="text"
                        value={r}
                        onChange={(e) => updateResource(i, e.target.value)}
                        placeholder="Resource URL or description"
                      />
                      <button
                        className="fca-resource-remove"
                        onClick={() => removeResource(i)}
                        title="Remove resource"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="fca-actions">
              <button className="fca-cancel-btn" onClick={onBack}>
                <X size={14} /> Cancel
              </button>
              <button
                className="fca-submit-btn"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <RefreshCw size={14} className="fca-spin" /> Saving…
                  </>
                ) : (
                  <>
                    <Save size={14} /> Create Assignment
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
