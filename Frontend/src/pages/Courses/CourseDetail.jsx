import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCheck,
  Play,
  FileText,
  MessageCircle,
  Download,
  Star,
  Users,
  Heart,
  Share2,
  Award,
  Clock,
  BookOpen,
  BarChart3,
  CheckCircle2,
} from 'lucide-react';

import GlassCard from '../../components/ui/GlassCard';
import ProgressBar from '../../components/ui/ProgressBar';
import ProgressRing from '../../components/ui/ProgressRing';
import PageState from '../../components/ui/PageState';
import { getCourse, getCourses } from '../../api/courseApi';
import { getCourseProgress } from '../../api/progressApi';
import { logCourseOpened } from '../../api/activityApi';
import { generateInitials, getLevelColor } from '../../utils/helpers';

const tabs = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'modules', label: 'Curriculum', icon: Play },
  { id: 'resources', label: 'Resources', icon: FileText },
  { id: 'reviews', label: 'Reviews', icon: Star },
  { id: 'discussion', label: 'Discussion', icon: MessageCircle },
];

const resources = [
  {
    id: 'resource-1',
    title: 'Course Materials',
    type: 'Course Resource',
    size: 'Available',
  },
  {
    id: 'resource-2',
    title: 'Practice Materials',
    type: 'Practice',
    size: 'Available',
  },
];

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [wishlisted, setWishlisted] = useState(false);
  const [course, setCourse] = useState(null);
  const [relatedCourses, setRelatedCourses] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [studentProgress, setStudentProgress] = useState(null);

  const loadCourse = async () => {
    setLoading(true);
    setError('');

    try {
      const [courseRes, allCourses] = await Promise.all([
        getCourse(id),
        getCourses(),
      ]);

      const selectedCourse =
        courseRes?.data?.data ??
        courseRes?.data ??
        null;

      setCourse(selectedCourse);

      const list = Array.isArray(allCourses?.data?.data)
        ? allCourses.data.data
        : [];

      setRelatedCourses(
        list
          .filter((c) => c._id !== selectedCourse?._id)
          .slice(0, 3)
      );

      // Fetch this student's own persisted progress for this course
      // (does not affect other students, and never touches the shared
      // Course document itself).
      try {
        const progressRes = await getCourseProgress(id);
        setStudentProgress(progressRes?.data?.data ?? null);
      } catch (progressErr) {
        // Non-fatal: the course still renders without progress data.
        setStudentProgress(null);
      }

      // Fire-and-forget activity log — never blocks or breaks the page.
      if (selectedCourse?._id) {
        logCourseOpened(selectedCourse._id).catch(() => {});
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          'Unable to load this course.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourse();
  }, [id]);

  /*
   * Backend structure:
   *
   * course.modules = [
   *   {
   *     id,
   *     title,
   *     lessons: [
   *       {
   *         id,
   *         title,
   *         duration,
   *         done,
   *         codeFile
   *       }
   *     ]
   *   }
   * ]
   */

  const totalLessons = useMemo(() => {
    if (!Array.isArray(course?.modules)) return 0;

    return course.modules.reduce((total, module) => {
      return total + (
        Array.isArray(module?.lessons)
          ? module.lessons.length
          : 0
      );
    }, 0);
  }, [course]);

  const completedLessons = useMemo(() => {
    if (!Array.isArray(course?.modules)) return 0;

    return course.modules.reduce((total, module) => {
      const lessons = Array.isArray(module?.lessons)
        ? module.lessons
        : [];

      return (
        total +
        lessons.filter((lesson) => lesson?.done === true).length
      );
    }, 0);
  }, [course]);

  const remainingLessons = Math.max(
    0,
    totalLessons - completedLessons
  );

  const flattenedLessons = useMemo(() => {
    if (!Array.isArray(course?.modules)) {
      return [];
    }

    const lessons = [];

    course.modules.forEach((module, moduleIndex) => {
      const moduleLessons = Array.isArray(module?.lessons)
        ? module.lessons
        : [];

      moduleLessons.forEach((lesson, lessonIndex) => {
        lessons.push({
          ...lesson,
          moduleIndex,
          lessonIndex,
          moduleTitle: module?.title || `Module ${moduleIndex + 1}`,
        });
      });
    });

    return lessons;
  }, [course]);

  const selectedLessonIndex = useMemo(() => {
    if (!selectedLesson || !flattenedLessons.length) {
      return -1;
    }

    return flattenedLessons.findIndex(
      (lesson) =>
        lesson?.moduleIndex === selectedLesson.moduleIndex &&
        lesson?.lessonIndex === selectedLesson.lessonIndex &&
        lesson?.id === selectedLesson.lesson?.id
    );
  }, [selectedLesson, flattenedLessons]);

  const courseTitle =
    course?.courseName ||
    course?.title ||
    'Untitled Course';

  const instructorName =
    typeof course?.instructor === 'string'
      ? course.instructor
      : course?.faculty?.fullName || 'Study Buddy';

  const instructorEmail =
    course?.faculty?.email || '';

  const courseColor =
    course?.color || '#E75480';

  const courseProgress =
    studentProgress?.percentage ??
    Number(course?.progress) ??
    0;

  const avgReviewRating = useMemo(() => {
    const reviews = Array.isArray(course?.reviews)
      ? course.reviews
      : [];

    if (!reviews.length) {
      return '0.0';
    }

    return (
      reviews.reduce(
        (sum, review) =>
          sum + (Number(review?.rating) || 0),
        0
      ) / reviews.length
    ).toFixed(1);
  }, [course]);

  const handleStartCourse = () => {
    navigate(`/courses/${id}/learn`);
  };

  const handleLessonStart = (lesson, moduleIndex, lessonIndex) => {
    setSelectedLesson({
      moduleIndex,
      lessonIndex,
      lesson,
    });
    setActiveTab('modules');

    setTimeout(() => {
      const lessonElement = document.getElementById(
        `lesson-${lesson?.id || `${moduleIndex}-${lessonIndex}`}`
      );

      lessonElement?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 100);
  };

  const handleLessonComplete = () => {
    if (!selectedLesson || !course?.modules) {
      return;
    }

    const updatedModules = course.modules.map((module, moduleIndex) => {
      if (moduleIndex !== selectedLesson.moduleIndex) {
        return module;
      }

      const updatedLessons = (module.lessons || []).map((lesson, lessonIndex) =>
        lessonIndex === selectedLesson.lessonIndex
          ? { ...lesson, done: true }
          : lesson
      );

      return {
        ...module,
        lessons: updatedLessons,
      };
    });

    setCourse({
      ...course,
      modules: updatedModules,
    });

    setSelectedLesson((current) =>
      current
        ? {
            ...current,
            lesson: {
              ...current.lesson,
              done: true,
            },
          }
        : current
    );
  };

  const handleLessonNavigation = (direction) => {
    if (!flattenedLessons.length || !selectedLesson) {
      return;
    }

    const nextIndex =
      selectedLessonIndex === -1
        ? 0
        : (selectedLessonIndex + direction + flattenedLessons.length) %
          flattenedLessons.length;

    const nextLesson = flattenedLessons[nextIndex];

    setSelectedLesson({
      moduleIndex: nextLesson.moduleIndex,
      lessonIndex: nextLesson.lessonIndex,
      lesson: nextLesson,
    });
  };

  if (loading) {
    return (
      <PageState
        title="Loading course details"
        message="Fetching the full lesson experience…"
      />
    );
  }

  if (error) {
    return (
      <PageState
        type="error"
        title="Unable to load course"
        message={error}
        onRetry={loadCourse}
      />
    );
  }

  if (!course) {
    return (
      <PageState
        type="empty"
        title="Course not found"
        message="This course is not available right now."
      />
    );
  }

  return (
    <div className="animate-fade-in">

      {/* Back Button */}
      <button
        className="btn btn-ghost btn-sm"
        style={{
          marginBottom: 'var(--space-5)',
        }}
        onClick={() => navigate('/courses')}
      >
        <ArrowLeft size={16} />
        Back to Courses
      </button>

      {/* Course Banner */}
      <div
        className="course-banner"
        style={{
          background: `linear-gradient(
            135deg,
            ${courseColor}20,
            ${courseColor}05
          )`,
        }}
      >

        <div
          className="course-banner-icon"
          style={{
            background: `${courseColor}22`,
          }}
        >
          {course.thumbnail || '📘'}
        </div>

        <div className="course-banner-info">

          {/* Tags */}
          <div className="course-banner-tags">

            <span
              className="chip active"
              style={{
                background: `${courseColor}22`,
                color: courseColor,
                borderColor: 'transparent',
              }}
            >
              {course.category || 'Programming'}
            </span>

            <span
              className="level-badge static"
              style={{
                color: getLevelColor(
                  course.level || 'Beginner'
                ),
                background: `${getLevelColor(
                  course.level || 'Beginner'
                )}1f`,
              }}
            >
              {course.level || 'Beginner'}
            </span>

            {course.certificate && (
              <span className="cert-pill">
                <Award size={13} />
                Certificate on Completion
              </span>
            )}

          </div>

          {/* Title */}
          <h1>{courseTitle}</h1>

          {/* Description */}
          <p className="course-banner-desc">
            {course.description ||
              'A thoughtfully structured course designed to help you learn with clarity.'}
          </p>

          {/* Instructor */}
          <div className="course-banner-instructor">

            <span
              className="course-card-avatar lg"
              style={{
                background: courseColor,
              }}
            >
              {generateInitials(instructorName)}
            </span>

            <div>
              <strong>{instructorName}</strong>

              <span>
                {course.instructorTitle ||
                  'Learning Specialist'}
              </span>
            </div>

          </div>

          {/* Stats */}
          <div
            className="course-card-stats"
            style={{
              marginTop: 'var(--space-4)',
            }}
          >

            <span>
              <Star
                size={13}
                fill="currentColor"
              />
              {course.rating ?? '4.8'} (
              {course.reviewsCount ?? 0} reviews)
            </span>

            <span>
              <Users size={13} />
              {Number(
                course.students ?? 0
              ).toLocaleString()}{' '}
              students
            </span>

            <span>
              <Clock size={13} />
              {course.duration || '4 weeks'}
            </span>

            <span>
              <BookOpen size={13} />
              {totalLessons} lessons
            </span>

          </div>

        </div>

        {/* Banner Side */}
        <div className="course-banner-side">

          <ProgressRing
            value={courseProgress}
            size={92}
            strokeWidth={7}
            color={courseColor}
          />

          <button
            className="hero-btn hero-btn-primary"
            onClick={handleStartCourse}
          >
            <Play size={16} />

            {courseProgress > 0
              ? `Continue: ${
                  course.nextLesson ||
                  'the next lesson'
                }`
              : 'Start Course'}
          </button>

          <div className="course-banner-actions">

            <button
              className={`btn btn-ghost btn-icon ${
                wishlisted
                  ? 'wishlist-btn active inline'
                  : ''
              }`}
              onClick={() =>
                setWishlisted((w) => !w)
              }
              aria-label="Wishlist"
            >
              <Heart
                size={16}
                fill={
                  wishlisted
                    ? 'currentColor'
                    : 'none'
                }
              />
            </button>

            <button
              className="btn btn-ghost btn-icon"
              aria-label="Share"
            >
              <Share2 size={16} />
            </button>

          </div>

        </div>

      </div>

      {/* Main Content */}
      <div className="two-col-grid">

        <div>

          {/* Tabs */}
          <div
            className="tabs-nav"
            style={{
              marginBottom: 'var(--space-6)',
              flexWrap: 'wrap',
            }}
          >
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className={`tab-item ${
                  activeTab === tab.id
                    ? 'active'
                    : ''
                }`}
                onClick={() =>
                  setActiveTab(tab.id)
                }
              >
                {tab.label}
              </div>
            ))}
          </div>

          {/* Overview */}
          {activeTab === 'overview' && (
            <GlassCard>

              <h3 className="section-title">
                About this course
              </h3>

              <p className="course-overview-text">
                {course.description ||
                  'A thoughtfully structured course designed to help you learn with clarity.'}
              </p>

              <h3
                className="section-title"
                style={{
                  marginTop: 'var(--space-6)',
                }}
              >
                What you'll learn
              </h3>

              <div className="outcomes-grid">

                {(course.outcomes ?? []).map(
                  (outcome, index) => (
                    <div
                      key={`${outcome}-${index}`}
                      className="outcome-item"
                    >
                      <CheckCircle2
                        size={16}
                        style={{
                          color: courseColor,
                          flexShrink: 0,
                          marginTop: 2,
                        }}
                      />

                      <span>{outcome}</span>
                    </div>
                  )
                )}

              </div>

              <h3
                className="section-title"
                style={{
                  marginTop: 'var(--space-6)',
                }}
              >
                Skills you'll gain
              </h3>

              <div
                className="course-card-skills"
                style={{
                  marginBottom: 0,
                }}
              >
                {(course.skills ?? []).map(
                  (skill, index) => (
                    <span
                      key={`${skill}-${index}`}
                      className="skill-tag lg"
                      style={{
                        background: `${courseColor}18`,
                        color: courseColor,
                      }}
                    >
                      {skill}
                    </span>
                  )
                )}
              </div>

            </GlassCard>
          )}

          {/* Curriculum */}
          {activeTab === 'modules' && (
            <>
              {selectedLesson && (
                <GlassCard
                  style={{
                    marginBottom: 'var(--space-6)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: 'var(--space-4)',
                      marginBottom: 'var(--space-5)',
                    }}
                  >
                    <div>
                      <span
                        className="chip active"
                        style={{
                          background: `${courseColor}22`,
                          color: courseColor,
                          borderColor: 'transparent',
                        }}
                      >
                        {selectedLesson.lesson?.moduleTitle || 'Lesson'}
                      </span>

                      <h3
                        style={{
                          margin: 'var(--space-2) 0 0',
                          fontSize: 'var(--font-size-lg)',
                        }}
                      >
                        {selectedLesson.lesson?.title || 'Lesson'}
                      </h3>
                    </div>

                    <button
                      className="btn btn-primary btn-sm"
                      onClick={handleLessonComplete}
                    >
                      {selectedLesson.lesson?.done ? 'Completed' : 'Mark as Complete'}
                    </button>
                  </div>

                  <p
                    style={{
                      color: 'var(--text-secondary)',
                      marginBottom: 'var(--space-5)',
                      lineHeight: 1.7,
                    }}
                  >
                    {selectedLesson.lesson?.description || 'Lesson description not available.'}
                  </p>

                  <div
                    style={{
                      background: 'rgba(30, 41, 59, 0.02)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: 'var(--space-4)',
                      marginBottom: 'var(--space-5)',
                    }}
                  >
                    <h5
                      style={{
                        marginBottom: 'var(--space-2)',
                        fontSize: 'var(--font-size-sm)',
                      }}
                    >
                      Lesson content
                    </h5>

                    <p
                      style={{
                        margin: 0,
                        whiteSpace: 'pre-line',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.7,
                      }}
                    >
                      {selectedLesson.lesson?.content || 'No lesson content is available for this lesson yet.'}
                    </p>
                  </div>

                  {(selectedLesson.lesson?.codeFile || selectedLesson.lesson?.code || selectedLesson.lesson?.exampleCode) && (
                    <div
                      style={{
                        background: '#0f172a',
                        color: '#e2e8f0',
                        borderRadius: 'var(--radius-md)',
                        padding: 'var(--space-4)',
                        marginBottom: 'var(--space-5)',
                        overflowX: 'auto',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 'var(--space-3)',
                          marginBottom: 'var(--space-3)',
                        }}
                      >
                        <strong>Example</strong>
                        {selectedLesson.lesson?.codeFile && (
                          <span
                            style={{
                              fontSize: 'var(--font-size-xs)',
                              opacity: 0.8,
                            }}
                          >
                            {selectedLesson.lesson.codeFile}
                          </span>
                        )}
                      </div>

                      <pre
                        style={{
                          margin: 0,
                          whiteSpace: 'pre-wrap',
                          fontSize: 'var(--font-size-xs)',
                          lineHeight: 1.6,
                        }}
                      >
                        {selectedLesson.lesson?.exampleCode ||
                          selectedLesson.lesson?.code ||
                          `// Example file: ${selectedLesson.lesson?.codeFile || 'lesson.js'}
// Lesson content is available in the course data.`}
                      </pre>
                    </div>
                  )}

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 'var(--space-3)',
                    }}
                  >
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleLessonNavigation(-1)}
                      disabled={!flattenedLessons.length}
                    >
                      Previous
                    </button>

                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleLessonNavigation(1)}
                      disabled={!flattenedLessons.length}
                    >
                      Next
                    </button>
                  </div>
                </GlassCard>
              )}

              <GlassCard>

              <div
                id="course-curriculum"
                className="module-list"
              >

                {Array.isArray(course.modules) &&
                course.modules.length > 0 ? (

                  course.modules.map(
                    (module, moduleIndex) => {

                      const lessons =
                        Array.isArray(
                          module?.lessons
                        )
                          ? module.lessons
                          : [];

                      return (
                        <div
                          key={
                            module?.id ||
                            `module-${moduleIndex + 1}`
                          }
                          className="module-block"
                        >

                          <h4>
                            {module?.title ||
                              `Module ${
                                moduleIndex + 1
                              }`}
                          </h4>

                          {lessons.length > 0 ? (

                            lessons.map(
                              (
                                lesson,
                                lessonIndex
                              ) => (

                                <div
                                  key={
                                    lesson?.id ||
                                    `lesson-${
                                      lessonIndex + 1
                                    }`
                                  }
                                  id={`lesson-${
                                    lesson?.id ||
                                    `${moduleIndex}-${lessonIndex}`
                                  }`}
                                  className="lesson-row"
                                >

                                  <div
                                    className={`lesson-check ${
                                      lesson?.done
                                        ? 'done'
                                        : ''
                                    }`}
                                  >
                                    {lesson?.done && (
                                      <CheckCheck
                                        size={12}
                                      />
                                    )}
                                  </div>

                                  <div className="lesson-row-info">

                                    <h5>
                                      {lesson?.title ||
                                        `Lesson ${
                                          lessonIndex + 1
                                        }`}
                                    </h5>

                                    <span>
                                      {lesson?.duration ||
                                        '30 min'}
                                    </span>

                                  </div>

                                  <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={() =>
                                      navigate(
                                        `/courses/${id}/learn/${
                                          module?.id || `module-${moduleIndex + 1}`
                                        }/${lesson?.id || `lesson-${lessonIndex + 1}`}`
                                      )
                                    }
                                  >
                                    <Play size={14} />

                                    {lesson?.done
                                      ? 'Rewatch'
                                      : 'Start'}
                                  </button>

                                </div>

                              )
                            )

                          ) : (

                            <div
                              style={{
                                padding:
                                  'var(--space-4)',
                                color:
                                  'var(--text-tertiary)',
                              }}
                            >
                              No lessons available
                              in this module.
                            </div>

                          )}

                        </div>
                      );
                    }
                  )

                ) : (

                  <div
                    style={{
                      padding: 'var(--space-6)',
                      textAlign: 'center',
                      color:
                        'var(--text-tertiary)',
                    }}
                  >
                    <BookOpen
                      size={32}
                      style={{
                        marginBottom:
                          'var(--space-3)',
                      }}
                    />

                    <h4>
                      No curriculum available
                    </h4>

                    <p>
                      Lessons for this course
                      have not been added yet.
                    </p>
                  </div>

                )}

              </div>

              </GlassCard>
            </>
          )}

          {/* Resources */}
          {activeTab === 'resources' && (
            <GlassCard>

              {resources.map((resource) => (
                <div
                  key={resource.id}
                  className="resource-row"
                >

                  <FileText
                    size={20}
                    style={{
                      color: courseColor,
                      flexShrink: 0,
                    }}
                  />

                  <div
                    style={{
                      flex: 1,
                    }}
                  >
                    <h5
                      style={{
                        fontSize:
                          'var(--font-size-sm)',
                        fontWeight: 600,
                      }}
                    >
                      {resource.title}
                    </h5>

                    <span
                      style={{
                        fontSize:
                          'var(--font-size-xs)',
                        color:
                          'var(--text-tertiary)',
                      }}
                    >
                      {resource.type} •{' '}
                      {resource.size}
                    </span>
                  </div>

                  <button
                    className="btn btn-ghost btn-icon"
                  >
                    <Download size={16} />
                  </button>

                </div>
              ))}

            </GlassCard>
          )}

          {/* Reviews */}
          {activeTab === 'reviews' && (
            <GlassCard>

              <div className="reviews-summary">

                <div className="reviews-summary-score">

                  <strong>
                    {avgReviewRating}
                  </strong>

                  <div className="reviews-summary-stars">

                    {[1, 2, 3, 4, 5].map(
                      (number) => (
                        <Star
                          key={number}
                          size={14}
                          fill={
                            number <=
                            Math.round(
                              Number(
                                avgReviewRating
                              )
                            )
                              ? 'currentColor'
                              : 'none'
                          }
                        />
                      )
                    )}

                  </div>

                  <span>
                    {course.reviewsCount ?? 0}{' '}
                    reviews
                  </span>

                </div>

              </div>

              {(course.reviews ?? []).map(
                (review, index) => (
                  <div
                    key={
                      review?.id ||
                      `review-${index}`
                    }
                    className="discussion-item"
                  >

                    <div
                      className="avatar sm"
                      style={{
                        background:
                          review?.avatarColor ||
                          courseColor,
                      }}
                    >
                      {generateInitials(
                        review?.name ||
                          'Student'
                      )}
                    </div>

                    <div className="discussion-item-body">

                      <div>

                        <span
                          style={{
                            fontWeight: 600,
                            fontSize:
                              'var(--font-size-sm)',
                          }}
                        >
                          {review?.name ||
                            'Student'}
                        </span>

                        <span>
                          {review?.date || ''}
                        </span>

                      </div>

                      <div
                        className="reviews-summary-stars"
                        style={{
                          margin: '4px 0',
                        }}
                      >

                        {[1, 2, 3, 4, 5].map(
                          (number) => (
                            <Star
                              key={number}
                              size={12}
                              fill={
                                number <=
                                (review?.rating ||
                                  0)
                                  ? 'currentColor'
                                  : 'none'
                              }
                            />
                          )
                        )}

                      </div>

                      <p>
                        {review?.text || ''}
                      </p>

                    </div>

                  </div>
                )
              )}

            </GlassCard>
          )}

          {/* Discussion */}
          {activeTab === 'discussion' && (
            <GlassCard>

              {(course.discussion ?? []).map(
                (post, index) => (
                  <div
                    key={
                      post?.id ||
                      `post-${index}`
                    }
                    className="discussion-item"
                  >

                    <div
                      className="avatar sm"
                      style={{
                        background:
                          post?.avatarColor ||
                          courseColor,
                      }}
                    >
                      {generateInitials(
                        post?.name ||
                          'Student'
                      )}
                    </div>

                    <div className="discussion-item-body">

                      <div>

                        <span
                          style={{
                            fontWeight: 600,
                            fontSize:
                              'var(--font-size-sm)',
                          }}
                        >
                          {post?.name ||
                            'Student'}
                        </span>

                        <span>
                          {post?.time || ''}
                        </span>

                      </div>

                      <p>
                        {post?.message || ''}
                      </p>

                    </div>

                  </div>
                )
              )}

              {(!course.discussion ||
                course.discussion.length === 0) && (
                <div
                  style={{
                    padding: 'var(--space-6)',
                    textAlign: 'center',
                    color:
                      'var(--text-tertiary)',
                  }}
                >
                  No discussions yet.
                </div>
              )}

            </GlassCard>
          )}

        </div>

        {/* Right Sidebar */}
        <div>

          {/* Course Includes */}
          <GlassCard
            style={{
              marginBottom:
                'var(--space-6)',
            }}
          >

            <h3 className="section-title">
              Course includes
            </h3>

            <div className="course-includes-list">

              <div className="course-includes-row">
                <BookOpen size={15} />
                {totalLessons} on-demand lessons
              </div>

              <div className="course-includes-row">
                <Clock size={15} />
                {course.duration ||
                  '4 weeks'}{' '}
                of content
              </div>

              <div className="course-includes-row">
                <BarChart3 size={15} />
                {course.level ||
                  'Beginner'}{' '}
                level
              </div>

              <div className="course-includes-row">
                <Award size={15} />
                {course.certificate
                  ? 'Certificate of completion'
                  : 'No certificate'}
              </div>

            </div>

            <ProgressBar
              value={courseProgress}
              size="md"
              color={courseColor}
              className="course-includes-progress"
            />

            <div
              className="course-detail-progress"
              style={{
                marginTop:
                  'var(--space-2)',
              }}
            >

              <span
                style={{
                  fontSize:
                    'var(--font-size-xs)',
                  color:
                    'var(--text-tertiary)',
                }}
              >
                {remainingLessons > 0
                  ? `${remainingLessons} lessons left`
                  : 'Course complete'}
              </span>

              <strong
                style={{
                  color: courseColor,
                  fontSize:
                    'var(--font-size-sm)',
                }}
              >
                {courseProgress}%
              </strong>

            </div>

          </GlassCard>

          {/* Instructor */}
          <GlassCard
            style={{
              marginBottom:
                'var(--space-6)',
            }}
          >

            <h3 className="section-title">
              Instructor
            </h3>

            <div className="instructor-card-body">

              <span
                className="course-card-avatar lg"
                style={{
                  background: courseColor,
                }}
              >
                {generateInitials(
                  instructorName
                )}
              </span>

              <div>

                <strong>
                  {instructorName}
                </strong>

                <span>
                  {course.instructorTitle ||
                    'Learning Specialist'}
                </span>

              </div>

            </div>

            <p className="instructor-bio">

              {instructorName
                .split(' ')
                .slice(-1)[0]}{' '}
              specializes in{' '}
              {course.category ||
                'programming'}
              , bringing real classroom and
              industry experience to every
              lesson in this course.

              {instructorEmail && (
                <span
                  style={{
                    display: 'block',
                    marginTop:
                      'var(--space-2)',
                  }}
                >
                  {instructorEmail}
                </span>
              )}

            </p>

          </GlassCard>

          {/* Related Courses */}
          {relatedCourses.length > 0 && (
            <GlassCard>

              <h3 className="section-title">
                Related Courses
              </h3>

              <div className="related-courses-list">

                {relatedCourses.map((relatedCourse) => {

                  const relatedId =
                    relatedCourse._id ||
                    relatedCourse.id;

                  const relatedTitle =
                    relatedCourse.courseName ||
                    relatedCourse.title ||
                    'Untitled Course';

                  return (
                    <div
                      key={relatedId}
                      className="related-course-row"
                      onClick={() =>
                        navigate(
                          `/courses/${relatedId}`
                        )
                      }
                    >

                      <span
                        className="course-card-avatar"
                        style={{
                          background:
                            relatedCourse.color ||
                            courseColor,
                        }}
                      >
                        {relatedCourse.thumbnail ||
                          '📘'}
                      </span>

                      <div className="related-course-info">

                        <h5 className="line-clamp-2">
                          {relatedTitle}
                        </h5>

                        <span>
                          <Star
                            size={11}
                            fill="currentColor"
                          />{' '}
                          {relatedCourse.rating ??
                            '4.8'}{' '}
                          •{' '}
                          {relatedCourse.duration ||
                            '4 weeks'}
                        </span>

                      </div>

                    </div>
                  );
                })}

              </div>

            </GlassCard>
          )}

        </div>

      </div>

    </div>
  );
}