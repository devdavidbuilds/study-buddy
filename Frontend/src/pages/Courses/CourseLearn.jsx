import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock,
  ClipboardList,
  Award,
  ListChecks,
  Menu,
  Play,
  Send,
  Sparkles,
  Target,
  User,
  Video,
  X,
} from 'lucide-react';

import GlassCard from '../../components/ui/GlassCard';
import ProgressBar from '../../components/ui/ProgressBar';
import PageState from '../../components/ui/PageState';
import LessonContentRenderer from '../../components/course/LessonContentRenderer';
import VisualExplanations from '../../components/course/VisualExplanations';
import {
  ExpandableSection,
  KeyConceptCards,
  CodeDemo,
  EmbeddedQuiz,
  ResourcesList,
} from '../../components/course/InteractiveLearningElements';
import {
  LessonObjectives,
  WorkedExamples,
  RealWorldApplications,
  MistakesAndTips,
  TakeawaysAndRevision,
  PracticeActivities,
} from '../../components/course/StructuredLessonSections';

import { getCourse } from '../../api/courseApi';
import {
  getCourseProgress,
  markLessonComplete,
  submitAssignment,
  submitLessonCheck,
} from '../../api/progressApi';
import { getAssignmentsForLesson } from '../../api/assignmentApi';
import PdfUploadField from '../../components/assignment/PdfUploadField';
import { getQuizzesForLesson, submitQuiz } from '../../api/quizApi';
import { logLessonOpened } from '../../api/activityApi';
import {
  buildAssignment,
  getKeyConcepts,
  getLessonObjective,
  getLessonMinutes,
  formatMinutes,
} from '../../utils/lessonAssignment';
import { generateInitials } from '../../utils/helpers';

// ========================================
// HELPERS
// ========================================

/** Detect if a URL is a YouTube or Vimeo link and return an embeddable src. */
function getEmbedUrl(url) {
  if (!url) return null;

  // YouTube
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/
  );
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

  return null;
}

/** Check if a URL points to a direct video file. */
function isDirectVideo(url) {
  if (!url) return false;
  return /\.(mp4|webm|ogg)(\?|$)/i.test(url);
}

// ========================================
// MAIN COMPONENT
// ========================================

export default function CourseLearn() {
  const { id, moduleId, lessonId } = useParams();
  const navigate = useNavigate();

  // ---- core state ----
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ---- assignment state ----
  const [answer, setAnswer] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  // ---- real (faculty) assignment ----
  const [realAssignment, setRealAssignment] = useState(null);
  const [loadingRealAssignment, setLoadingRealAssignment] = useState(false);
  const [questionAnswers, setQuestionAnswers] = useState([]);

  // ---- real (faculty-created) quiz ----
  const [lessonQuiz, setLessonQuiz] = useState(null);
  const [loadingLessonQuiz, setLoadingLessonQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [quizError, setQuizError] = useState('');

  // ---- UI state ----
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedModules, setExpandedModules] = useState({});
  const [completedPulse, setCompletedPulse] = useState(false);

  // ==============================
  // Data loading
  // ==============================

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [courseRes, progressRes] = await Promise.all([
        getCourse(id),
        getCourseProgress(id),
      ]);

      setCourse(courseRes?.data?.data ?? null);
      setProgress(progressRes?.data?.data ?? null);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          'Unable to load this course right now.'
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // ==============================
  // Derived data
  // ==============================

  const flattenedLessons = useMemo(() => {
    if (!Array.isArray(course?.modules)) return [];

    const flat = [];

    course.modules.forEach((module) => {
      const lessons = Array.isArray(module?.lessons) ? module.lessons : [];

      lessons.forEach((lesson) => {
        flat.push({
          moduleId: module?.id,
          moduleTitle: module?.title || 'Module',
          lesson,
        });
      });
    });

    return flat;
  }, [course]);

  const completedSet = useMemo(() => {
    const set = new Set();

    (progress?.completedLessons || []).forEach((entry) => {
      set.add(`${entry.moduleId}::${entry.lessonId}`);
    });

    return set;
  }, [progress]);

  const activeEntry = useMemo(() => {
    if (!flattenedLessons.length) return null;

    if (moduleId && lessonId) {
      const found = flattenedLessons.find(
        (entry) => entry.moduleId === moduleId && entry.lesson?.id === lessonId
      );
      if (found) return found;
    }

    const firstIncomplete = flattenedLessons.find(
      (entry) => !completedSet.has(`${entry.moduleId}::${entry.lesson?.id}`)
    );

    return firstIncomplete || flattenedLessons[0];
  }, [flattenedLessons, moduleId, lessonId, completedSet]);

  // Normalize URL
  useEffect(() => {
    if (loading || !activeEntry) return;

    if (!moduleId || !lessonId || moduleId !== activeEntry.moduleId || lessonId !== activeEntry.lesson?.id) {
      navigate(
        `/courses/${id}/learn/${activeEntry.moduleId}/${activeEntry.lesson.id}`,
        { replace: true }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, activeEntry, moduleId, lessonId, id]);

  const activeIndex = useMemo(() => {
    if (!activeEntry) return -1;

    return flattenedLessons.findIndex(
      (entry) =>
        entry.moduleId === activeEntry.moduleId &&
        entry.lesson?.id === activeEntry.lesson?.id
    );
  }, [flattenedLessons, activeEntry]);

  // A lesson can have both a faculty assignment and the legacy lesson
  // prompt; match the entry for whichever one is shown.
  const currentAssignmentEntry = useMemo(() => {
    if (!activeEntry) return null;

    return (
      (progress?.assignments || []).find((a) =>
        realAssignment
          ? String(a.assignmentId) === String(realAssignment._id)
          : !a.assignmentId &&
            a.moduleId === activeEntry.moduleId &&
            a.lessonId === activeEntry.lesson?.id
      ) || null
    );
  }, [progress, activeEntry, realAssignment]);

  const lessonCheckEntry = useMemo(() => {
    if (!activeEntry) return null;

    return (
      (progress?.lessonChecks || []).find(
        (entry) =>
          entry.moduleId === activeEntry.moduleId &&
          entry.lessonId === activeEntry.lesson?.id
      ) || null
    );
  }, [progress, activeEntry]);

  // Estimated study time (from lesson.estimatedMinutes, falling back to
  // the lesson's duration label). No timers — display only.
  const timeSummary = useMemo(() => {
    let total = 0;
    let remaining = 0;
    flattenedLessons.forEach((entry) => {
      const minutes = getLessonMinutes(entry.lesson);
      total += minutes;
      if (!completedSet.has(`${entry.moduleId}::${entry.lesson?.id}`)) remaining += minutes;
    });
    return { total, remaining };
  }, [flattenedLessons, completedSet]);

  // ==============================
  // Side effects
  // ==============================

  // Reset draft on lesson change
  useEffect(() => {
    setAnswer(currentAssignmentEntry?.answer || '');
    setActionMessage('');
    setPdfFile(null);
    setUploadProgress(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeEntry?.moduleId, activeEntry?.lesson?.id]);

  // Auto-expand the module containing the active lesson
  useEffect(() => {
    if (!activeEntry) return;
    setExpandedModules((prev) => ({ ...prev, [activeEntry.moduleId]: true }));
  }, [activeEntry]);

  // Activity log
  useEffect(() => {
    if (!id || !activeEntry?.moduleId || !activeEntry?.lesson?.id) return;

    logLessonOpened(id, activeEntry.moduleId, activeEntry.lesson.id).catch(
      () => {}
    );
  }, [id, activeEntry?.moduleId, activeEntry?.lesson?.id]);

  // Fetch the published faculty quiz for the exact course/module/lesson.
  useEffect(() => {
    if (!id || !activeEntry?.moduleId || !activeEntry?.lesson?.id) {
      setLessonQuiz(null);
      return;
    }

    let cancelled = false;
    setLoadingLessonQuiz(true);
    setQuizError('');
    setQuizStarted(false);
    setQuizResult(null);

    getQuizzesForLesson(id, activeEntry.moduleId, activeEntry.lesson.id)
      .then((res) => {
        if (cancelled) return;
        const quiz = Array.isArray(res?.data?.data) ? res.data.data[0] : null;
        setLessonQuiz(quiz || null);
        setQuizAnswers(Array.from({ length: quiz?.questions?.length || 0 }, () => null));
      })
      .catch((err) => {
        if (!cancelled) {
          setLessonQuiz(null);
          setQuizError(err?.response?.data?.message || 'Could not load the lesson quiz.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingLessonQuiz(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, activeEntry?.moduleId, activeEntry?.lesson?.id]);

  // Real assignment lookup
  useEffect(() => {
    if (!id || !activeEntry?.moduleId || !activeEntry?.lesson?.id) {
      setRealAssignment(null);
      return;
    }

    let cancelled = false;
    setLoadingRealAssignment(true);

    getAssignmentsForLesson(id, activeEntry.moduleId, activeEntry.lesson.id)
      .then((res) => {
        if (cancelled) return;
        const list = Array.isArray(res?.data?.data) ? res.data.data : [];
        setRealAssignment(list[0] || null);
      })
      .catch(() => {
        if (!cancelled) setRealAssignment(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingRealAssignment(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, activeEntry?.moduleId, activeEntry?.lesson?.id]);

  // Prefill per-question answers
  useEffect(() => {
    if (!realAssignment) {
      setQuestionAnswers([]);
      return;
    }

    const questionCount = realAssignment.questions?.length || 0;
    const prior =
      currentAssignmentEntry?.assignmentId === realAssignment._id
        ? currentAssignmentEntry?.answers || []
        : [];

    setQuestionAnswers(
      Array.from({ length: questionCount }, (_, i) => prior[i] || '')
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [realAssignment?._id]);

  // ==============================
  // Computed values
  // ==============================

  const courseColor = course?.color || '#E75480';
  const courseTitle = course?.courseName || course?.title || 'Course';
  const faculty = course?.faculty;

  const isDone = activeEntry
    ? completedSet.has(`${activeEntry.moduleId}::${activeEntry.lesson?.id}`)
    : false;

  const isSubmitted =
    currentAssignmentEntry?.status === 'Submitted' ||
    currentAssignmentEntry?.status === 'Evaluated' ||
    currentAssignmentEntry?.status === 'Returned';
  // Evaluated work is final unless faculty return it ("Returned").
  const isEvaluated = currentAssignmentEntry?.status === 'Evaluated';
  const isReturned = currentAssignmentEntry?.status === 'Returned';
  const statusBadgeClass = isReturned ? 'badge-danger' : isSubmitted ? 'badge-success' : 'badge-ghost';

  const assignment = useMemo(() => {
    if (!course || !activeEntry) return null;

    return buildAssignment(
      course,
      { id: activeEntry.moduleId, title: activeEntry.moduleTitle },
      activeEntry.lesson
    );
  }, [course, activeEntry]);

  const keyConcepts = useMemo(
    () => getKeyConcepts(activeEntry?.lesson),
    [activeEntry]
  );

  const progressPercentage = progress?.percentage ?? 0;

  // Structured lessons are completed after their lesson check (and the
  // faculty assignment, if one exists); legacy lessons keep the original
  // "submit the assignment first" rule.
  const structuredLesson = Boolean(activeEntry?.lesson?.learning?.explanation);
  const hasLessonCheck = structuredLesson && (activeEntry?.lesson?.quiz?.length || 0) > 0;
  const showAssignmentCard = !structuredLesson || Boolean(realAssignment) || loadingRealAssignment;
  const completionRequirementMet = structuredLesson
    ? (!hasLessonCheck || Boolean(lessonCheckEntry)) && (!realAssignment || isSubmitted)
    : isSubmitted;
  const completionHint = structuredLesson
    ? hasLessonCheck && !lessonCheckEntry
      ? 'Complete the lesson check above to unlock lesson completion.'
      : realAssignment && !isSubmitted
      ? 'Submit the assignment above to unlock lesson completion.'
      : ''
    : 'Submit the assignment above before marking this lesson complete.';

  // ==============================
  // Handlers
  // ==============================

  const goToLesson = (entry) => {
    if (!entry) return;
    setActionMessage('');
    setSidebarOpen(false);
    navigate(`/courses/${id}/learn/${entry.moduleId}/${entry.lesson.id}`);
  };

  const toggleModule = (modId) => {
    setExpandedModules((prev) => ({ ...prev, [modId]: !prev[modId] }));
  };

  const questionsUnanswered = realAssignment
    ? questionAnswers.length !== (realAssignment.questions?.length || 0) ||
      questionAnswers.some((a) => !a.trim())
    : false;

  // A PDF (newly chosen or already submitted) can stand in for typed answers.
  const hasPdf = Boolean(pdfFile || currentAssignmentEntry?.file);
  const realAssignmentIncomplete = realAssignment
    ? (realAssignment.questions?.length
        ? questionsUnanswered
        : !questionAnswers.some((a) => a.trim())) && !hasPdf
    : false;

  const handleQuestionAnswerChange = (index, value) => {
    setQuestionAnswers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleQuizAnswerChange = (index, value) => {
    setQuizAnswers((previous) => {
      const next = [...previous];
      next[index] = Number(value);
      return next;
    });
  };

  const handleSubmitQuiz = async (event) => {
    event.preventDefault();
    if (!lessonQuiz || quizAnswers.some((answer) => !Number.isInteger(answer))) return;

    setSubmittingQuiz(true);
    setQuizError('');
    try {
      const res = await submitQuiz(id, lessonQuiz._id, {
        moduleId: activeEntry.moduleId,
        lessonId: activeEntry.lesson.id,
        answers: quizAnswers,
      });
      setQuizResult(res?.data?.data || null);
      setQuizStarted(false);
    } catch (err) {
      setQuizError(err?.response?.data?.message || 'Could not submit the quiz.');
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const handleSubmitLessonCheck = async (answers) => {
    const res = await submitLessonCheck(id, {
      moduleId: activeEntry.moduleId,
      lessonId: activeEntry.lesson.id,
      answers,
    });
    const data = res?.data?.data;

    setProgress((prev) => {
      const checks = (prev?.lessonChecks || []).filter(
        (entry) => !(entry.moduleId === data.moduleId && entry.lessonId === data.lessonId)
      );
      return { ...(prev || {}), lessonChecks: [...checks, data] };
    });

    return data;
  };

  const handleSubmitAssignment = async (event) => {
    event.preventDefault();
    if (!activeEntry) return;

    if (realAssignment) {
      if (realAssignmentIncomplete) return;
    } else if (!answer.trim() && !hasPdf) {
      return;
    }

    setSubmitting(true);
    setActionMessage('');
    if (pdfFile) setUploadProgress(0);

    try {
      const payload = realAssignment
        ? {
            moduleId: activeEntry.moduleId,
            lessonId: activeEntry.lesson.id,
            assignmentId: realAssignment._id,
            answers: questionAnswers.map((a) => a.trim()),
          }
        : {
            moduleId: activeEntry.moduleId,
            lessonId: activeEntry.lesson.id,
            title: activeEntry.lesson.title,
            answer: answer.trim(),
          };
      if (pdfFile) payload.file = pdfFile;

      const res = await submitAssignment(id, payload, {
        onUploadProgress: setUploadProgress,
      });

      setProgress((prev) => ({
        ...(prev || {}),
        assignments: res?.data?.data?.assignments || prev?.assignments || [],
      }));
      setPdfFile(null);

      setActionMessage(
        structuredLesson && hasLessonCheck && !lessonCheckEntry
          ? 'Assignment submitted. Complete the lesson check to finish this lesson.'
          : 'Assignment submitted. You can now mark this lesson complete.'
      );
    } catch (err) {
      setActionMessage(
        err?.response?.data?.message || 'Could not submit the assignment.'
      );
    } finally {
      setSubmitting(false);
      setUploadProgress(null);
    }
  };

  // Status, upload date, PDF, marks and feedback for the current submission.
  const submissionDetails = isSubmitted && currentAssignmentEntry && (
    <div className="submission-status-details-wrap">
      <div className="submission-status-details">
        {currentAssignmentEntry.submittedAt && (
          <span>Submitted {new Date(currentAssignmentEntry.submittedAt).toLocaleString()}</span>
        )}
        {isEvaluated ? (
          <span>
            Score: <strong>{currentAssignmentEntry.marks} / {currentAssignmentEntry.maxMarks}</strong>
          </span>
        ) : isReturned ? (
          <span>Returned for resubmission</span>
        ) : (
          <span>Awaiting evaluation</span>
        )}
        {(isEvaluated || isReturned) && currentAssignmentEntry.evaluatedAt && (
          <span>
            {isReturned ? 'Returned' : 'Evaluated'} {new Date(currentAssignmentEntry.evaluatedAt).toLocaleString()}
          </span>
        )}
      </div>
      {(isEvaluated || isReturned) && currentAssignmentEntry.feedback && (
        <p className="submission-feedback">
          <strong>Faculty feedback:</strong> {currentAssignmentEntry.feedback}
        </p>
      )}
      {isReturned && (
        <p className="submission-feedback">
          Update your answers or upload a new PDF, then press Resubmit.
        </p>
      )}
      {isEvaluated && (
        <p className="submission-feedback">
          This assignment has been evaluated, so it can no longer be resubmitted unless your faculty returns it.
        </p>
      )}
    </div>
  );

  const handleMarkComplete = async () => {
    if (!activeEntry || isDone) return;

    setCompleting(true);
    setActionMessage('');

    try {
      const res = await markLessonComplete(id, {
        moduleId: activeEntry.moduleId,
        lessonId: activeEntry.lesson.id,
      });

      const data = res?.data?.data;

      setProgress((prev) => ({
        ...(prev || {}),
        completedLessons: data?.completedLessons || prev?.completedLessons || [],
        completedCount: data?.completedCount ?? prev?.completedCount,
        totalLessons: data?.totalLessons ?? prev?.totalLessons,
        percentage: data?.percentage ?? prev?.percentage,
      }));

      // Trigger pulse animation
      setCompletedPulse(true);
      setTimeout(() => setCompletedPulse(false), 500);
    } catch (err) {
      setActionMessage(
        err?.response?.data?.message || 'Could not mark this lesson complete.'
      );
    } finally {
      setCompleting(false);
    }
  };

  const handleNext = () => {
    const nextEntry = flattenedLessons[activeIndex + 1];
    if (nextEntry) goToLesson(nextEntry);
  };

  const handlePrev = () => {
    const prevEntry = flattenedLessons[activeIndex - 1];
    if (prevEntry) goToLesson(prevEntry);
  };

  // ==============================
  // Render guards
  // ==============================

  if (loading) {
    return (
      <PageState
        title="Loading your lesson"
        message="Setting up the learning workspace…"
      />
    );
  }

  if (error) {
    return (
      <PageState
        type="error"
        title="Unable to load course"
        message={error}
        onRetry={loadAll}
      />
    );
  }

  if (!course || !activeEntry) {
    return (
      <PageState
        type="empty"
        title="No lessons available"
        message="This course does not have any lessons yet."
      />
    );
  }

  const lesson = activeEntry.lesson;
  const exampleCode = lesson?.exampleCode || lesson?.code;
  const videoUrl = lesson?.videoUrl;
  const embedUrl = getEmbedUrl(videoUrl);
  const directVideo = isDirectVideo(videoUrl);
  const hasVideo = !!(embedUrl || directVideo);

  // ==============================
  // RENDER
  // ==============================

  return (
    <div className="animate-fade-in learn-page">

      {/* Back button */}
      <button
        className="btn btn-ghost btn-sm"
        style={{ marginBottom: 'var(--space-4)' }}
        onClick={() => navigate(`/courses/${id}`)}
      >
        <ArrowLeft size={16} />
        Back to Course
      </button>

      <div className="learn-layout">

        {/* ============================================================
            LEFT SIDEBAR — Course Navigation
            ============================================================ */}
        {sidebarOpen && (
          <div
            className="learn-sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        <GlassCard
          noPadding
          className={`learn-sidebar ${sidebarOpen ? 'open' : ''}`}
        >
          {/* Sidebar Header */}
          <div className="learn-sidebar-header">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-2)' }}>
              <div className="learn-sidebar-course-title">{courseTitle}</div>
              {/* Close button for mobile */}
              <button
                className="btn btn-ghost btn-sm learn-sidebar-close"
                onClick={() => setSidebarOpen(false)}
                style={{ display: sidebarOpen ? 'inline-flex' : 'none', padding: 'var(--space-1)' }}
                aria-label="Close course navigation"
              >
                <X size={18} />
              </button>
            </div>

            <div className="learn-sidebar-progress">
              <ProgressBar
                value={progressPercentage}
                size="sm"
                color={courseColor}
              />
              <span className="learn-sidebar-progress-label">
                {progressPercentage}%
              </span>
            </div>
            {timeSummary.total > 0 && (
              <div className="sl-time-meta">
                {formatMinutes(timeSummary.total)} total · {formatMinutes(timeSummary.remaining)} left
              </div>
            )}
          </div>

          {/* Module / Lesson list */}
          <div className="learn-sidebar-scroll">
            {course.modules.map((mod) => {
              const isExpanded = expandedModules[mod.id] !== false;
              const moduleLessons = mod.lessons || [];
              const completedInModule = moduleLessons.filter((l) =>
                completedSet.has(`${mod.id}::${l.id}`)
              ).length;

              return (
                <div key={mod.id} className="learn-module">
                  {/* Module trigger */}
                  <button
                    type="button"
                    className="learn-module-trigger"
                    onClick={() => toggleModule(mod.id)}
                    aria-expanded={isExpanded}
                  >
                    <span>{mod.title}</span>
                    <span className="learn-module-count">
                      {completedInModule}/{moduleLessons.length}
                    </span>
                    <ChevronDown
                      size={14}
                      className={`learn-module-chevron ${isExpanded ? 'rotated' : ''}`}
                    />
                  </button>

                  {/* Lesson list (animated) */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        className="learn-module-lessons"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                      >
                        <div className="learn-module-lessons-inner">
                          {moduleLessons.map((lessonItem) => {
                            const done = completedSet.has(`${mod.id}::${lessonItem.id}`);
                            const active =
                              activeEntry.moduleId === mod.id &&
                              activeEntry.lesson?.id === lessonItem.id;

                            return (
                              <button
                                key={lessonItem.id}
                                type="button"
                                className={`learn-lesson-item ${active ? 'active' : ''} ${done ? 'done' : ''}`}
                                onClick={() =>
                                  goToLesson({ moduleId: mod.id, lesson: lessonItem })
                                }
                              >
                                {done ? (
                                  <CheckCircle2 size={14} />
                                ) : (
                                  <Circle size={14} />
                                )}
                                <span>{lessonItem.title}</span>
                                <span className="learn-lesson-item-meta">
                                  {lessonItem.videoUrl && <Video size={10} />}
                                  {lessonItem.duration || ''}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Mobile sidebar toggle */}
        <button
          className="learn-sidebar-toggle"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open course navigation"
        >
          <Menu size={22} />
        </button>

        {/* ============================================================
            MAIN CONTENT AREA
            ============================================================ */}
        <div className="learn-main">

          {/* ---- Video Player ---- */}
          {hasVideo && (
            <div className="learn-video-container aspect-16-9">
              {embedUrl ? (
                <iframe
                  src={embedUrl}
                  title={lesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              ) : (
                <video
                  src={videoUrl}
                  controls
                  preload="metadata"
                  aria-label={`Video: ${lesson.title}`}
                />
              )}
            </div>
          )}

          {/* ---- Lesson Header Card ---- */}
          <GlassCard noPadding>
            <div className="learn-lesson-header">
              {/* Breadcrumb */}
              <div className="learn-lesson-breadcrumb">
                <span
                  className="chip active"
                  style={{
                    background: `${courseColor}22`,
                    color: courseColor,
                    borderColor: 'transparent',
                    fontSize: 'var(--font-size-xs)',
                  }}
                >
                  {activeEntry.moduleTitle}
                </span>
              </div>

              {/* Title */}
              <h2 className="learn-lesson-title">{lesson.title}</h2>

              {/* Meta */}
              <div className="learn-lesson-meta">
                <span>
                  <Clock size={13} />
                  {lesson.duration || '30 min'}
                </span>

                {hasVideo && (
                  <span>
                    <Video size={13} />
                    Video lesson
                  </span>
                )}

                <span>
                  Lesson {activeIndex + 1} of {flattenedLessons.length}
                </span>

                {timeSummary.remaining > 0 && (
                  <span>~{formatMinutes(timeSummary.remaining)} left in course</span>
                )}

                {isDone && (
                  <span className={`badge badge-success ${completedPulse ? 'learn-completed-pulse' : ''}`}>
                    Completed
                  </span>
                )}
              </div>

              {/* Instructor */}
              {faculty && (
                <div className="learn-instructor" style={{ marginTop: 'var(--space-4)' }}>
                  <div className="learn-instructor-avatar">
                    {faculty.profileImage ? (
                      <img src={faculty.profileImage} alt={faculty.fullName} />
                    ) : (
                      generateInitials(faculty.fullName || 'Instructor')
                    )}
                  </div>
                  <div className="learn-instructor-info">
                    <span className="learn-instructor-name">
                      {faculty.fullName || 'Course Instructor'}
                    </span>
                    <span className="learn-instructor-role">
                      Course Instructor
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ marginLeft: 'auto' }}
                    onClick={() =>
                      navigate(
                        `/ai-tutor?courseId=${encodeURIComponent(id)}&moduleId=${encodeURIComponent(activeEntry.moduleId)}&lessonId=${encodeURIComponent(lesson.id)}`
                      )
                    }
                  >
                    <Sparkles size={14} />
                    Ask AI Tutor
                  </button>
                </div>
              )}
            </div>

            {/* Learning Objective */}
            <div style={{ padding: '0 var(--space-6) var(--space-5)' }}>
              {lesson.learning?.objectives?.length ? (
                <LessonObjectives objectives={lesson.learning.objectives} />
              ) : (
                <div className="learn-objective">
                  <div className="learn-objective-icon">
                    <Target size={16} />
                  </div>
                  <p>{getLessonObjective(lesson)}</p>
                </div>
              )}
            </div>
          </GlassCard>

          {/* ---- Visual Explanation (topic-matched animation) ---- */}
          <VisualExplanations title={lesson.title} content={lesson.content} />

          {/* ---- Main Learning Content ---- */}
          <GlassCard noPadding>
            <div className="learn-content-section">
              <h3 className="learn-section-heading">
                <BookOpen size={16} />
                Reading Material
              </h3>

              <LessonContentRenderer content={lesson.content} />
            </div>
          </GlassCard>

          {/* ---- Key Concepts (inline for ≤1280px) ---- */}
          {keyConcepts.length > 0 && (
            <div className="learn-right-panel-inline">
              <GlassCard>
                <h3 className="learn-section-heading">
                  <ListChecks size={16} />
                  Key Concepts
                </h3>
                <KeyConceptCards concepts={keyConcepts} />
              </GlassCard>
            </div>
          )}

          {/* ---- Code Demo ---- */}
          {exampleCode && (
            <ExpandableSection
              title={`Example Code${lesson.codeFile ? ` — ${lesson.codeFile}` : ''}`}
              icon={Play}
              defaultOpen
            >
              <CodeDemo
                code={exampleCode}
                codeFile={lesson.codeFile}
              />
            </ExpandableSection>
          )}

          {/* ---- Structured lesson sections (pipeline-generated content) ---- */}
          {lesson.learning && (
            <Fragment key={`sections-${activeEntry.moduleId}::${lesson.id}`}>
              <WorkedExamples examples={lesson.learning.examples} />
              <RealWorldApplications applications={lesson.learning.applications} />
              <MistakesAndTips mistakes={lesson.learning.mistakes} tips={lesson.learning.tips} />
              <TakeawaysAndRevision
                takeaways={lesson.learning.takeaways}
                revisionNotes={lesson.learning.revisionNotes}
              />
              <PracticeActivities practice={lesson.learning.practice} />
            </Fragment>
          )}

          {/* ---- Lesson check (from lesson.quiz[], scored by the server) ---- */}
          {lesson.quiz && lesson.quiz.length > 0 && (
            <EmbeddedQuiz
              key={`check-${activeEntry.moduleId}::${lesson.id}`}
              questions={lesson.quiz}
              onSubmit={handleSubmitLessonCheck}
              previous={lessonCheckEntry}
              title={
                lesson.learning?.kind === 'final-assessment'
                  ? 'Final Assessment'
                  : structuredLesson
                  ? 'Lesson Check'
                  : 'Quick Check'
              }
            />
          )}

          {/* ---- Faculty-created lesson quiz ---- */}
          {!loadingLessonQuiz && lessonQuiz && (
            <GlassCard>
              <div className="learn-section-heading">
                <ClipboardList size={16} />
                Lesson Quiz
              </div>
              {!quizStarted && !quizResult && (
                <>
                  <h3 style={{ margin: 'var(--space-3) 0 var(--space-2)' }}>{lessonQuiz.title}</h3>
                  <p className="learn-assignment-instructions">
                    {lessonQuiz.questions?.length || 0} questions · {lessonQuiz.totalMarks} total marks
                    {lessonQuiz.timeLimit ? ` · ${lessonQuiz.timeLimit} minute limit` : ''}
                  </p>
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => setQuizStarted(true)}>
                    <Play size={14} /> Start Quiz
                  </button>
                </>
              )}

              {quizStarted && (
                <form onSubmit={handleSubmitQuiz}>
                  {(lessonQuiz.questions || []).map((question, questionIndex) => (
                    <div key={questionIndex} className="input-group" style={{ marginTop: 'var(--space-4)' }}>
                      <label className="input-label">
                        {questionIndex + 1}. {question.questionText} ({question.marks} marks)
                      </label>
                      <div className="learn-mcq-options">
                        {(question.options || []).map((option, optionIndex) => (
                          <label key={optionIndex} className="learn-mcq-option">
                            <input
                              type="radio"
                              name={`quiz-question-${questionIndex}`}
                              value={optionIndex}
                              checked={quizAnswers[questionIndex] === optionIndex}
                              onChange={(event) => handleQuizAnswerChange(questionIndex, event.target.value)}
                            />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    style={{ marginTop: 'var(--space-4)' }}
                    disabled={submittingQuiz || quizAnswers.some((answer) => !Number.isInteger(answer))}
                  >
                    <Send size={14} /> {submittingQuiz ? 'Submitting…' : 'Submit Quiz'}
                  </button>
                </form>
              )}

              {quizResult && (
                <div style={{ marginTop: 'var(--space-3)' }}>
                  <p className="learn-assignment-instructions">
                    <Award size={14} style={{ verticalAlign: 'middle' }} /> Quiz result
                  </p>
                  <div className="learn-lesson-meta">
                    <span>Score: {quizResult.score} / {quizResult.totalMarks}</span>
                    <span>Percentage: {quizResult.percentage}%</span>
                    <span>Correct: {quizResult.correctAnswers}</span>
                    <span>Incorrect: {quizResult.incorrectAnswers}</span>
                    <span>Total questions: {quizResult.totalQuestions}</span>
                  </div>
                </div>
              )}

              {quizError && <p className="learn-action-message">{quizError}</p>}
            </GlassCard>
          )}

          {/* ---- Resources (inline for ≤1280px) ---- */}
          {lesson.resources && lesson.resources.length > 0 && (
            <div className="learn-right-panel-inline">
              <ResourcesList resources={lesson.resources} />
            </div>
          )}

          {/* ---- Assignment ---- */}
          {showAssignmentCard && (
          <GlassCard noPadding>
            <div className="learn-assignment-section">
              <h3 className="learn-section-heading">
                <ClipboardList size={16} />
                Assignment
              </h3>

              {loadingRealAssignment ? (
                <p className="learn-assignment-instructions">Checking for an assignment…</p>
              ) : realAssignment ? (
                <>
                  <p className="learn-assignment-question" style={{ fontWeight: 600 }}>
                    {realAssignment.title}
                  </p>
                  {realAssignment.instructions && (
                    <p className="learn-assignment-instructions">
                      {realAssignment.instructions}
                    </p>
                  )}
                  {realAssignment.dueDate && (
                    <p className="learn-assignment-instructions">
                      Due: {new Date(realAssignment.dueDate).toLocaleDateString()}
                    </p>
                  )}

                  <form onSubmit={handleSubmitAssignment}>
                    {(realAssignment.questions || []).map((q, index) => (
                      <div className="input-group" key={index} style={{ marginBottom: 'var(--space-4)' }}>
                        <label className="input-label">
                          {index + 1}. {q.questionText}
                          {q.marks ? ` (${q.marks} marks)` : ''}
                        </label>

                        {q.type === 'mcq' && Array.isArray(q.options) && q.options.length > 0 ? (
                          <div className="learn-mcq-options">
                            {q.options.map((opt, optIndex) => (
                              <label key={optIndex} className="learn-mcq-option">
                                <input
                                  type="radio"
                                  name={`question-${index}`}
                                  value={opt}
                                  checked={questionAnswers[index] === opt}
                                  onChange={(event) =>
                                    handleQuestionAnswerChange(index, event.target.value)
                                  }
                                />
                                <span>{opt}</span>
                              </label>
                            ))}
                          </div>
                        ) : (
                          <textarea
                            className="input-field"
                            style={{
                              minHeight: q.type === 'code' ? 160 : 100,
                              width: '100%',
                              background: 'rgba(46,46,46,0.03)',
                              border: '1px solid var(--border-color)',
                              resize: 'vertical',
                              fontFamily: q.type === 'code' ? 'monospace' : 'inherit',
                            }}
                            value={questionAnswers[index] || ''}
                            onChange={(event) =>
                              handleQuestionAnswerChange(index, event.target.value)
                            }
                            placeholder={
                              q.type === 'code' ? 'Write your code here…' : 'Write your response here…'
                            }
                          />
                        )}
                      </div>
                    ))}

                    <PdfUploadField
                      file={pdfFile}
                      onFileChange={setPdfFile}
                      progress={uploadProgress}
                      disabled={submitting || isEvaluated}
                      existingFile={currentAssignmentEntry?.file || null}
                    />

                    <div className="learn-assignment-actions">
                      <span className={`badge ${statusBadgeClass}`}>
                        {currentAssignmentEntry?.status || 'Not Started'}
                      </span>

                      <button
                        type="submit"
                        className="btn btn-primary btn-sm"
                        disabled={submitting || isEvaluated || realAssignmentIncomplete}
                      >
                        <Send size={14} />
                        {submitting ? 'Submitting…' : isSubmitted ? 'Resubmit' : 'Submit'}
                      </button>
                    </div>

                    {submissionDetails}
                  </form>
                </>
              ) : (
                <>
                  <p className="learn-assignment-instructions">
                    {assignment?.instructions}
                  </p>

                  <p className="learn-assignment-question">
                    {assignment?.question}
                  </p>

                  <form onSubmit={handleSubmitAssignment}>
                    <div className="input-group">
                      <label className="input-label">Your Answer</label>
                      <textarea
                        className="input-field"
                        style={{
                          minHeight: 140,
                          width: '100%',
                          background: 'rgba(46,46,46,0.03)',
                          border: '1px solid var(--border-color)',
                          resize: 'vertical',
                        }}
                        value={answer}
                        onChange={(event) => setAnswer(event.target.value)}
                        placeholder="Write your response here…"
                      />
                    </div>

                    <PdfUploadField
                      file={pdfFile}
                      onFileChange={setPdfFile}
                      progress={uploadProgress}
                      disabled={submitting || isEvaluated}
                      existingFile={currentAssignmentEntry?.file || null}
                    />

                    <div className="learn-assignment-actions">
                      <span className={`badge ${statusBadgeClass}`}>
                        {currentAssignmentEntry?.status || 'Not Started'}
                      </span>

                      <button
                        type="submit"
                        className="btn btn-primary btn-sm"
                        disabled={submitting || isEvaluated || (!answer.trim() && !hasPdf)}
                      >
                        <Send size={14} />
                        {submitting ? 'Submitting…' : isSubmitted ? 'Resubmit' : 'Submit'}
                      </button>
                    </div>

                    {submissionDetails}
                  </form>
                </>
              )}
            </div>
          </GlassCard>
          )}

          {/* ---- Footer — Navigation + Mark Complete ---- */}
          <GlassCard noPadding>
            <div className="learn-footer">
              {actionMessage && (
                <p className="learn-action-message">{actionMessage}</p>
              )}

              <div className="learn-footer-actions">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={handlePrev}
                  disabled={activeIndex <= 0}
                  aria-label="Previous lesson"
                >
                  <ChevronLeft size={14} />
                  Previous
                </button>

                <div className="learn-footer-center">
                  <span className="learn-lesson-counter">
                    {activeIndex + 1} / {flattenedLessons.length}
                  </span>

                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handleMarkComplete}
                    disabled={completing || isDone || !completionRequirementMet}
                    title={!completionRequirementMet ? completionHint : ''}
                  >
                    <CheckCircle2 size={14} />
                    {isDone ? 'Completed' : 'Mark Complete'}
                  </button>
                </div>

                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={handleNext}
                  disabled={activeIndex === flattenedLessons.length - 1}
                  aria-label="Next lesson"
                >
                  Next
                  <ChevronRight size={14} />
                </button>
              </div>

              {!isDone && !completionRequirementMet && completionHint && (
                <p className="learn-hint-text">{completionHint}</p>
              )}
            </div>
          </GlassCard>
        </div>

        {/* ============================================================
            RIGHT PANEL (desktop ≥1280px only)
            ============================================================ */}
        <div className="learn-right-panel">
          {/* Key Concepts */}
          {keyConcepts.length > 0 && (
            <GlassCard compact className="learn-right-card">
              <div className="learn-right-card-title">
                <ListChecks size={15} />
                Key Concepts
              </div>
              <KeyConceptCards concepts={keyConcepts} />
            </GlassCard>
          )}

          {/* Resources */}
          {lesson.resources && lesson.resources.length > 0 && (
            <ResourcesList resources={lesson.resources} />
          )}

          {/* AI Tutor */}
          <GlassCard compact className="learn-right-card">
            <div className="learn-right-card-title">
              <Sparkles size={15} />
              Need Help?
            </div>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-3)' }}>
              Ask the AI Tutor about this lesson.
            </p>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              style={{ width: '100%' }}
              onClick={() =>
                navigate(
                  `/ai-tutor?courseId=${encodeURIComponent(id)}&moduleId=${encodeURIComponent(activeEntry.moduleId)}&lessonId=${encodeURIComponent(lesson.id)}`
                )
              }
            >
              <Sparkles size={14} />
              Ask AI Tutor
            </button>
          </GlassCard>
        </div>

      </div>
    </div>
  );
}
