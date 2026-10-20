import { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Brain,
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
  Hash,
  RefreshCw,
  Clock,
  HelpCircle,
  Award,
} from 'lucide-react';
import { getCourses, getCourse } from '../../api/courseApi';
import { createQuiz, getQuizzesForLesson } from '../../api/quizApi';
import { profile } from '../../api/authApi';
import './FacultyQuizGenerator.css';

const emptyQuestion = () => ({
  questionText: '',
  options: ['', '', '', ''],
  correctAnswerIndex: null,
  marks: 1,
});

export default function FacultyQuizGenerator({ onBack }) {
  /* ── Loading state ─────────────────── */
  const [loadingCourses, setLoadingCourses] = useState(true);

  /* ── Course/module/lesson pickers ──── */
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [selectedLessonId, setSelectedLessonId] = useState('');

  /* ── Existing quizzes for the selected lesson ── */
  const [existingQuizzes, setExistingQuizzes] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [quizzesError, setQuizzesError] = useState(null);

  /* ── Quiz form fields ──────────────── */
  const [title, setTitle] = useState('');
  const [timeLimit, setTimeLimit] = useState('');
  const [questions, setQuestions] = useState([emptyQuestion()]);

  /* ── Submit state ──────────────────── */
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [errors, setErrors] = useState({});
  const [savedQuiz, setSavedQuiz] = useState(null);

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

      const coursesRes = await getCourses({ limit: 200 });
      const allCourses = coursesRes?.data?.data || [];
      const myCourses = allCourses.filter((c) => {
        const fid = c.faculty?._id || c.faculty;
        return fid === user._id;
      });
      setCourses(myCourses);
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

  /* ── When lesson changes, load its existing quizzes ── */
  useEffect(() => {
    setSavedQuiz(null);
    setMessage(null);
    if (!selectedCourseId || !selectedModuleId || !selectedLessonId) {
      setExistingQuizzes([]);
      return;
    }
    fetchQuizzesForLesson();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourseId, selectedModuleId, selectedLessonId]);

  const fetchQuizzesForLesson = async () => {
    setLoadingQuizzes(true);
    setQuizzesError(null);
    try {
      const res = await getQuizzesForLesson(
        selectedCourseId,
        selectedModuleId,
        selectedLessonId
      );
      setExistingQuizzes(res?.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch quizzes for lesson:', err);
      setQuizzesError(
        err?.response?.data?.message || err.message || 'Failed to load existing quizzes'
      );
    } finally {
      setLoadingQuizzes(false);
    }
  };

  /* ── Derived data ─────────────────── */
  const modules = useMemo(() => selectedCourse?.modules || [], [selectedCourse]);

  const selectedModule = useMemo(
    () => modules.find((m) => m.id === selectedModuleId) || null,
    [modules, selectedModuleId]
  );

  const lessons = useMemo(() => selectedModule?.lessons || [], [selectedModule]);

  const selectedLesson = useMemo(
    () => lessons.find((l) => l.id === selectedLessonId) || null,
    [lessons, selectedLessonId]
  );

  const contextReady = !!(selectedCourseId && selectedModuleId && selectedLessonId);

  const totalMarks = useMemo(
    () => questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0),
    [questions]
  );

  /* ── Question helpers ─────────────── */
  const addQuestion = () => {
    setQuestions((prev) => [...prev, emptyQuestion()]);
  };

  const removeQuestion = (index) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const updateQuestion = (index, field, value) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, [field]: value } : q))
    );
  };

  const updateOption = (qIndex, optIndex, value) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        const options = [...q.options];
        options[optIndex] = value;
        return { ...q, options };
      })
    );
  };

  const setCorrectAnswer = (qIndex, optIndex) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === qIndex ? { ...q, correctAnswerIndex: optIndex } : q))
    );
  };

  /* ── Validation ───────────────────── */
  const validate = () => {
    const errs = {};

    if (!title.trim()) errs.title = 'Quiz title is required';
    else if (title.trim().length < 3) errs.title = 'Title must be at least 3 characters';

    if (!selectedCourseId) errs.course = 'Select a course';
    if (!selectedModuleId) errs.module = 'Select a module';
    if (!selectedLessonId) errs.lesson = 'Select a lesson';

    if (timeLimit !== '' && (Number.isNaN(Number(timeLimit)) || Number(timeLimit) <= 0)) {
      errs.timeLimit = 'Time limit must be a positive number of minutes';
    }

    if (questions.length === 0) {
      errs.questions = 'Add at least one question';
    } else {
      const questionErrors = {};
      questions.forEach((q, i) => {
        const qErr = {};
        if (!q.questionText.trim()) qErr.questionText = 'Question text is required';
        if (q.options.some((o) => !o.trim())) qErr.options = 'All 4 options must be filled in';
        if (q.correctAnswerIndex === null || q.correctAnswerIndex === undefined) {
          qErr.correctAnswerIndex = 'Select the correct answer';
        }
        const marks = Number(q.marks);
        if (Number.isNaN(marks) || marks <= 0) qErr.marks = 'Marks must be positive';
        if (Object.keys(qErr).length > 0) questionErrors[i] = qErr;
      });
      if (Object.keys(questionErrors).length > 0) errs.questionErrors = questionErrors;
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /* ── Reset form (after successful save, or manually) ── */
  const resetForm = () => {
    setTitle('');
    setTimeLimit('');
    setQuestions([emptyQuestion()]);
    setErrors({});
  };

  /* ── Submit ───────────────────────── */
  const handleSubmit = async () => {
    if (!validate()) {
      setMessage({ type: 'error', text: 'Please fix the highlighted fields before saving.' });
      return;
    }

    setSubmitting(true);
    setMessage(null);
    setSavedQuiz(null);

    try {
      const payload = {
        title: title.trim(),
        courseId: selectedCourseId,
        moduleId: selectedModuleId,
        lessonId: selectedLessonId,
        timeLimit: timeLimit === '' ? null : Number(timeLimit),
        questions: questions.map((q) => ({
          questionText: q.questionText.trim(),
          options: q.options.map((o) => o.trim()),
          correctAnswerIndex: q.correctAnswerIndex,
          marks: Number(q.marks),
        })),
      };

      const res = await createQuiz(payload);
      const created = res?.data?.data;

      setMessage({ type: 'success', text: 'Quiz created successfully!' });
      setSavedQuiz(created || null);
      setExistingQuizzes((prev) => [created, ...prev].filter(Boolean));
      resetForm();
    } catch (err) {
      const msg =
        err?.response?.data?.message || err.message || 'Failed to create quiz';
      setMessage({ type: 'error', text: msg });
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Loading state ─────────────────── */
  if (loadingCourses) {
    return (
      <div className="fqz-root">
        <div className="fqz-loading-state">
          <div className="fqz-loader" />
          <p>Loading your courses…</p>
        </div>
      </div>
    );
  }

  /* ── Render ─────────────────────────── */
  return (
    <div className="fqz-root">
      {/* ── Header ── */}
      <div className="fqz-header">
        <button className="fqz-back-btn" onClick={onBack}>
          <ArrowLeft size={14} /> Back
        </button>
        <h1 className="fqz-page-title">
          <Brain size={20} />
          Quiz Creator
        </h1>
        <p className="fqz-page-subtitle">
          Create a quiz with multiple-choice questions for a specific lesson.
        </p>
      </div>

      {/* ── Message ── */}
      {message && (
        <div className={`fqz-message fqz-message-${message.type}`}>
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
        <div className="fqz-context">
          <span className="fqz-context-item">
            <BookOpen size={12} />
            {selectedCourse?.courseName}
          </span>
          <span className="fqz-context-sep">
            <ChevronRight size={11} />
          </span>
          <span className="fqz-context-item">
            <Layers size={12} />
            {selectedModule?.title}
          </span>
          <span className="fqz-context-sep">
            <ChevronRight size={11} />
          </span>
          <span className="fqz-context-item">
            <FileText size={12} />
            {selectedLesson?.title}
          </span>
        </div>
      )}

      {/* ── Step 1: Pick course / module / lesson ── */}
      <div className="fqz-picker-section">
        <div className="fqz-picker-title">
          <Layers size={14} />
          Step 1 — Select Course, Module &amp; Lesson
        </div>
        <div className="fqz-picker-grid">
          {/* Course */}
          <div className="fqz-picker-group">
            <label className="fqz-picker-label">Course</label>
            <select
              className="fqz-picker-select"
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
            {errors.course && <span className="fqz-field-error">{errors.course}</span>}
          </div>

          {/* Module */}
          <div className="fqz-picker-group">
            <label className="fqz-picker-label">Module</label>
            <select
              className="fqz-picker-select"
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
            {errors.module && <span className="fqz-field-error">{errors.module}</span>}
          </div>

          {/* Lesson */}
          <div className="fqz-picker-group">
            <label className="fqz-picker-label">Lesson</label>
            <select
              className="fqz-picker-select"
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
            {errors.lesson && <span className="fqz-field-error">{errors.lesson}</span>}
          </div>
        </div>
      </div>

      {/* ── Existing quizzes for this lesson ── */}
      {contextReady && (
        <div className="fqz-existing-section">
          <div className="fqz-picker-title">
            <HelpCircle size={14} />
            Existing Quizzes for This Lesson
          </div>

          {loadingQuizzes ? (
            <div className="fqz-inline-loading">
              <div className="fqz-loader fqz-loader-sm" />
              <span>Loading existing quizzes…</span>
            </div>
          ) : quizzesError ? (
            <div className="fqz-inline-error">
              <AlertCircle size={14} />
              <span>{quizzesError}</span>
              <button className="fqz-inline-retry" onClick={fetchQuizzesForLesson}>
                <RefreshCw size={12} /> Retry
              </button>
            </div>
          ) : existingQuizzes.length === 0 ? (
            <p className="fqz-no-existing">No quizzes yet for this lesson.</p>
          ) : (
            <div className="fqz-existing-list">
              {existingQuizzes.map((q) => (
                <div key={q._id} className="fqz-existing-card">
                  <div className="fqz-existing-icon">
                    <Brain size={15} />
                  </div>
                  <div className="fqz-existing-info">
                    <h4>{q.title}</h4>
                    <div className="fqz-existing-meta">
                      <span>
                        <HelpCircle size={11} /> {q.questions?.length || 0} question
                        {(q.questions?.length || 0) !== 1 ? 's' : ''}
                      </span>
                      <span>
                        <Award size={11} /> {q.totalMarks} marks
                      </span>
                      {q.timeLimit && (
                        <span>
                          <Clock size={11} /> {q.timeLimit} min
                        </span>
                      )}
                      <span className={`fqz-status-badge fqz-status-${(q.status || 'Published').toLowerCase()}`}>
                        {q.status || 'Published'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Step 2: Quiz form (only when context is ready) ── */}
      {contextReady && (
        <div className="fqz-form-card">
          <div className="fqz-form-card-title">
            <Brain size={14} />
            Step 2 — Create Quiz
          </div>

          <div className="fqz-form">
            {/* Title + Time limit */}
            <div className="fqz-form-row">
              <div className="fqz-form-group">
                <label>
                  Quiz Title <span className="fqz-required">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Week 3 Concept Check"
                />
                {errors.title && <span className="fqz-field-error">{errors.title}</span>}
              </div>
              <div className="fqz-form-group">
                <label>Time Limit (minutes, optional)</label>
                <input
                  type="number"
                  min="1"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(e.target.value)}
                  placeholder="e.g. 15"
                />
                {errors.timeLimit && (
                  <span className="fqz-field-error">{errors.timeLimit}</span>
                )}
              </div>
            </div>

            {/* Questions */}
            <div className="fqz-form-group">
              <div className="fqz-questions-header">
                <span className="fqz-questions-title">
                  Questions ({questions.length}) · Total {totalMarks} marks
                </span>
                <button className="fqz-add-question-btn" onClick={addQuestion} type="button">
                  <Plus size={13} /> Add Question
                </button>
              </div>
              {errors.questions && (
                <span className="fqz-field-error">{errors.questions}</span>
              )}

              <div className="fqz-question-list">
                {questions.map((q, i) => {
                  const qErr = errors.questionErrors?.[i] || {};
                  return (
                    <div key={i} className="fqz-question-card">
                      <div className="fqz-question-card-header">
                        <span className="fqz-question-number">Q{i + 1}</span>
                        {questions.length > 1 && (
                          <button
                            className="fqz-question-remove"
                            onClick={() => removeQuestion(i)}
                            title="Remove question"
                            type="button"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>

                      <div className="fqz-question-fields">
                        <textarea
                          rows={2}
                          value={q.questionText}
                          onChange={(e) => updateQuestion(i, 'questionText', e.target.value)}
                          placeholder="Enter the question…"
                        />
                        {qErr.questionText && (
                          <span className="fqz-field-error">{qErr.questionText}</span>
                        )}

                        <div className="fqz-options-grid">
                          {q.options.map((opt, optIndex) => (
                            <label
                              key={optIndex}
                              className={`fqz-option-row ${
                                q.correctAnswerIndex === optIndex ? 'fqz-option-correct' : ''
                              }`}
                            >
                              <input
                                type="radio"
                                name={`correct-answer-${i}`}
                                checked={q.correctAnswerIndex === optIndex}
                                onChange={() => setCorrectAnswer(i, optIndex)}
                              />
                              <input
                                type="text"
                                className="fqz-option-input"
                                value={opt}
                                onChange={(e) => updateOption(i, optIndex, e.target.value)}
                                placeholder={`Option ${optIndex + 1}`}
                              />
                            </label>
                          ))}
                        </div>
                        {qErr.options && (
                          <span className="fqz-field-error">{qErr.options}</span>
                        )}
                        {qErr.correctAnswerIndex && (
                          <span className="fqz-field-error">{qErr.correctAnswerIndex}</span>
                        )}

                        <div className="fqz-question-row">
                          <label className="fqz-marks-label">
                            Marks
                            <input
                              type="number"
                              min="0.5"
                              step="0.5"
                              className="fqz-question-marks-input"
                              value={q.marks}
                              onChange={(e) =>
                                updateQuestion(i, 'marks', Number(e.target.value))
                              }
                              placeholder="Marks"
                            />
                          </label>
                          {qErr.marks && (
                            <span className="fqz-field-error">{qErr.marks}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="fqz-actions">
              <button className="fqz-cancel-btn" onClick={onBack}>
                <X size={14} /> Cancel
              </button>
              <button
                className="fqz-submit-btn"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <RefreshCw size={14} className="fqz-spin" /> Saving…
                  </>
                ) : (
                  <>
                    <Save size={14} /> Save Quiz
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Saved quiz confirmation ── */}
      {savedQuiz && (
        <div className="fqz-saved-card">
          <div className="fqz-saved-header">
            <CheckCircle2 size={16} />
            <span>Quiz Saved</span>
          </div>
          <h3>{savedQuiz.title}</h3>
          <div className="fqz-existing-meta">
            <span>
              <HelpCircle size={11} /> {savedQuiz.questions?.length || 0} questions
            </span>
            <span>
              <Award size={11} /> {savedQuiz.totalMarks} marks
            </span>
            {savedQuiz.timeLimit && (
              <span>
                <Clock size={11} /> {savedQuiz.timeLimit} min
              </span>
            )}
            <span>
              <Hash size={11} /> {selectedLesson?.title}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
