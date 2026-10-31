import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Star,
  Users,
  Heart,
  Clock,
  BookOpen,
  Award,
  PlayCircle,
  ArrowRight,
} from 'lucide-react';

import GlassCard from '../../components/ui/GlassCard';
import ProgressRing from '../../components/ui/ProgressRing';
import SearchBar from '../../components/ui/SearchBar';
import PageState from '../../components/ui/PageState';
import { getCourses, getCourseDomains } from '../../api/courseApi';
import { getLevelColor } from '../../utils/helpers';
import useLearningSummary from '../../hooks/useLearningSummary';
import { getMyEnrollments } from '../../api/enrollmentApi';

const levels = [
  'All Levels',
  'Beginner',
  'Intermediate',
  'Advanced',
];

const sortOptions = [
  { id: 'recommended', label: 'Recommended' },
  { id: 'domain', label: 'Domain (A–Z)' },
  { id: 'domain_desc', label: 'Domain (Z–A)' },
  { id: 'rating', label: 'Highest Rated' },
  { id: 'students', label: 'Most Popular' },
  { id: 'progress', label: 'My Progress' },
];

const defaultDomains = [
  { id: 'All', label: 'All Domains', icon: '🌟' },
  { id: 'Web Development', label: 'Web Development', icon: '🌐' },
  { id: 'Programming & CS', label: 'Programming & CS', icon: '💻' },
  { id: 'Data Science & AI', label: 'Data Science & AI', icon: '🤖' },
  { id: 'Business & Finance', label: 'Business & Finance', icon: '📈' },
  { id: 'Design & Creative', label: 'Design & Creative', icon: '🎨' },
  { id: 'Music & Audio', label: 'Music & Audio', icon: '🎵' },
  { id: 'Engineering', label: 'Engineering', icon: '⚙️' },
];

/*
 * Convert the backend Course document into the
 * shape expected by the existing frontend UI.
 */
const normalizeCourse = (course) => {
  const modules = Array.isArray(course?.modules)
    ? course.modules
    : [];

  const totalLessons = modules.reduce(
    (total, module) =>
      total +
      (Array.isArray(module?.lessons)
        ? module.lessons.length
        : 0),
    0
  );

  const completedLessons = modules.reduce(
    (total, module) =>
      total +
      (Array.isArray(module?.lessons)
        ? module.lessons.filter(
            (lesson) => lesson?.done === true
          ).length
        : 0),
    0
  );

  const progress =
    totalLessons > 0
      ? Math.round(
          (completedLessons / totalLessons) * 100
        )
      : 0;

  const instructor =
    typeof course?.instructor === 'string'
      ? course.instructor
      : course?.faculty?.fullName || 'Study Buddy';

  return {
    ...course,

    /*
     * Frontend-compatible fields
     */
    title:
      course?.courseName ||
      course?.title ||
      'Untitled Course',

    instructor,

    instructorTitle:
      course?.instructorTitle ||
      'Learning Specialist',

    totalLessons,

    completedLessons,

    progress:
      Number.isFinite(Number(course?.progress))
        ? Number(course.progress)
        : progress,

    nextLesson:
      course?.nextLesson ||
      (totalLessons > completedLessons
        ? modules
            .flatMap((module) =>
              Array.isArray(module?.lessons)
                ? module.lessons
                : []
            )
            .find(
              (lesson) => !lesson?.done
            )?.title
        : null),

    domain:
      course?.domain ||
      course?.category ||
      'General Studies',

    category:
      course?.category ||
      course?.domain ||
      course?.subject ||
      'Programming',

    level:
      course?.level ||
      'Beginner',

    students:
      Number(course?.students) || 0,

    rating:
      Number(course?.rating) || 0,

    duration:
      course?.duration || '4 weeks',

    skills:
      Array.isArray(course?.skills)
        ? course.skills
        : [],

    certificate:
      Boolean(course?.certificate),

    color:
      course?.color || '#E75480',

    thumbnail:
      course?.thumbnail || '📘',
  };
};

export default function Courses() {
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [level, setLevel] = useState('All Levels');
  const [sort, setSort] = useState('recommended');
  const [domainList, setDomainList] = useState(defaultDomains);

  const [courses, setCourses] = useState([]);

  // Fetch live domain counts from backend database aggregation
  useEffect(() => {
    let active = true;
    getCourseDomains()
      .then((res) => {
        if (!active) return;
        const apiDomains = res?.data?.data || [];
        if (Array.isArray(apiDomains) && apiDomains.length > 0) {
          const countMap = new Map(
            apiDomains.map((d) => [d._id || d.name, d.count])
          );
          setDomainList((prev) =>
            prev.map((dom) => ({
              ...dom,
              count: dom.id === 'All' ? undefined : countMap.get(dom.id) || 0,
            }))
          );
        }
      })
      .catch((err) => {
        console.warn('Could not load domain counts:', err?.message);
      });
    return () => {
      active = false;
    };
  }, []);

  // The student's own progress per course (GET /api/progress/summary).
  // Course documents don't carry per-student progress, so it is merged in
  // here. Non-students simply see the catalog without progress.
  const { summary } = useLearningSummary();

  // Enrollment status per course: approved courses can be started; others
  // open the course preview where the student can request enrollment.
  const [enrollments, setEnrollments] = useState([]);
  const enrollmentStatus = useMemo(
    () => new Map(enrollments.map((e) => [String(e.course?._id), e.status])),
    [enrollments]
  );
  useEffect(() => {
    getMyEnrollments()
      .then((res) => setEnrollments(res?.data?.data || []))
      .catch(() => setEnrollments([]));
  }, []);
  const progressById = useMemo(
    () => new Map((summary?.courses || []).map((c) => [String(c._id), c])),
    [summary]
  );
  const withProgress = useCallback((course) => {
    const own = progressById.get(String(course._id || course.id));
    return own
      ? {
          ...course,
          progress: own.percentage,
          completedLessons: own.completedLessons,
          totalLessons: own.totalLessons,
          nextLesson: own.nextLesson?.title || '',
        }
      : course;
  }, [progressById]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [wishlist, setWishlist] = useState(
    new Set()
  );

  /*
   * Pagination
   *
   * IMPORTANT:
   * Do not render thousands of courses at once.
   */
  const pageSize = 24;
  const [page, setPage] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadCourses = async (nextPage = 1, append = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError('');

    try {
      const res = await getCourses({
        page: nextPage,
        limit: pageSize,
        search: query,
        domain: selectedDomain !== 'All' ? selectedDomain : undefined,
        category: selectedDomain !== 'All' ? selectedDomain : undefined,
        level,
        sort,
      });

      /*
       * Backend response:
       *
       * {
       *   success: true,
       *   data: [...]
       * }
       */
      const rawCourses = Array.isArray(
        res?.data?.data
      )
        ? res.data.data
        : Array.isArray(res?.data)
        ? res.data
        : [];

      const normalizedCourses =
        rawCourses.map(normalizeCourse);

      setCourses((previous) =>
        append ? [...previous, ...normalizedCourses] : normalizedCourses
      );
      setPage(nextPage);
      setTotalCourses(Number(res?.data?.total) || normalizedCourses.length);
    } catch (err) {
      console.error(
        'Failed to load courses:',
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Unable to load courses right now.'
      );
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadCourses(1);
  }, [query, selectedDomain, level, sort]);

  const toggleWishlist = (e, id) => {
    e.stopPropagation();

    setWishlist((previous) => {
      const next = new Set(previous);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  /*
   * My Courses: everything the student is enrolled in (with progress and
   * the next lesson to resume), then requests still waiting for approval.
   * In progress first, then not started, then completed.
   */
  const myCourses = useMemo(() => {
    const order = (c) => (c.percentage > 0 && c.percentage < 100 ? 0 : c.percentage === 0 ? 1 : 2);
    const enrolled = (summary?.courses || [])
      .filter((c) => enrollmentStatus.get(String(c._id)) !== 'pending')
      .map((c) => ({ ...c, state: 'enrolled' }))
      .sort((a, b) => order(a) - order(b) || new Date(b.lastActivityAt) - new Date(a.lastActivityAt));
    const enrolledIds = new Set(enrolled.map((c) => String(c._id)));
    const waiting = enrollments
      .filter((e) => (e.status === 'pending' || e.status === 'rejected') && e.course && !enrolledIds.has(String(e.course._id)))
      .map((e) => ({ ...e.course, percentage: 0, state: e.status }));
    return [...enrolled, ...waiting];
  }, [summary, enrollments, enrollmentStatus]);

  const openMyCourse = (course) => {
    if (course.state === 'enrolled' && course.nextLesson) {
      navigate(`/courses/${course._id}/learn/${course.nextLesson.moduleId}/${course.nextLesson.lessonId}`);
    } else {
      navigate(`/courses/${course._id}`);
    }
  };

  /*
   * Filtering + sorting (client-side fallback & fast-path).
   */
  const filtered = useMemo(() => {
    let list = courses.map(withProgress).filter((course) => {
      const title = String(
        course.title || ''
      ).toLowerCase();

      const instructor = String(
        course.instructor || ''
      ).toLowerCase();

      const courseDomain = String(
        course.domain || ''
      ).toLowerCase();

      const courseCategory = String(
        course.category || ''
      ).toLowerCase();

      const searchText =
        query.toLowerCase();

      const matchesQuery =
        title.includes(searchText) ||
        instructor.includes(searchText) ||
        courseDomain.includes(searchText) ||
        courseCategory.includes(searchText);

      /*
       * Domain matching
       */
      let matchesDomain = true;

      if (selectedDomain !== 'All') {
        const sDom = selectedDomain.toLowerCase();
        const combined = `${courseDomain} ${courseCategory} ${title}`.toLowerCase();

        if (courseDomain.includes(sDom) || courseCategory.includes(sDom)) {
          matchesDomain = true;
        } else if (selectedDomain === 'Web Development') {
          matchesDomain = /web|html|css|javascript|react|node|vue|angular|frontend|backend/i.test(combined);
        } else if (selectedDomain === 'Programming & CS') {
          matchesDomain = /program|software|algorithm|c\+\+|java|python|code|computer/i.test(combined);
        } else if (selectedDomain === 'Data Science & AI') {
          matchesDomain = /data|machine|intelligence|ai|analytics|statistics|deep learning/i.test(combined);
        } else if (selectedDomain === 'Business & Finance') {
          matchesDomain = /business|finance|accounting|invest|trading|stock|marketing/i.test(combined);
        } else if (selectedDomain === 'Design & Creative') {
          matchesDomain = /design|graphic|photoshop|ui|ux|illustration|animation/i.test(combined);
        } else if (selectedDomain === 'Music & Audio') {
          matchesDomain = /music|audio|sound|piano|guitar|vocal/i.test(combined);
        } else if (selectedDomain === 'Engineering') {
          matchesDomain = /engineer|mechanic|civil|electric|circuits|robot/i.test(combined);
        } else {
          matchesDomain = courseDomain.includes(sDom) || courseCategory.includes(sDom);
        }
      }

      const matchesLevel =
        level === 'All Levels' ||
        course.level === level;

      return (
        matchesQuery &&
        matchesDomain &&
        matchesLevel
      );
    });

    if (sort === 'domain') {
      list = [...list].sort((a, b) =>
        String(a.domain || a.category || '').localeCompare(
          String(b.domain || b.category || '')
        )
      );
    }

    if (sort === 'domain_desc') {
      list = [...list].sort((a, b) =>
        String(b.domain || b.category || '').localeCompare(
          String(a.domain || a.category || '')
        )
      );
    }

    if (sort === 'progress') {
      list = [...list].sort(
        (a, b) =>
          b.progress - a.progress
      );
    }

    if (sort === 'rating') {
      list = [...list].sort(
        (a, b) =>
          b.rating - a.rating
      );
    }

    if (sort === 'students') {
      list = [...list].sort(
        (a, b) =>
          b.students - a.students
      );
    }

    return list;
  }, [
    courses,
    level,
    query,
    selectedDomain,
    sort,
    withProgress,
  ]);

  const visibleCourses = filtered;

  const completedCount =
    summary?.stats?.coursesCompleted ??
    courses.filter(
      (course) =>
        course.progress === 100
    ).length;

  const hasMore = page * pageSize < totalCourses;

  if (loading) {
    return (
      <PageState
        title="Loading courses"
        message="Fetching your latest course catalog…"
      />
    );
  }

  if (error) {
    return (
      <PageState
        type="error"
        title="Unable to load courses"
        message={error}
        actionLabel="Retry"
        onAction={() => loadCourses(1)}
      />
    );
  }

  return (
    <div className="courses-page page-container animate-fade-in">

      {/* =========================
          HERO BANNER
      ========================== */}

      <div className="courses-hero">

        <div className="courses-hero-text">

          <span className="badge badge-primary">
            Course Catalog
          </span>

          <h1>
            Discover, Learn, Excel
          </h1>

          <p>
            Explore expert-led courses across technology, business, design, and science with practical projects and verified certificates.
          </p>

        </div>

        <div className="courses-hero-stats">

          <div className="courses-hero-stat">
            <strong>
              {totalCourses || courses.length}
            </strong>
            <span>Available</span>
          </div>

          <div className="courses-hero-stat">
            <strong>
              {completedCount}
            </strong>
            <span>Completed</span>
          </div>

          <div className="courses-hero-stat">
            <strong>
              {wishlist.size}
            </strong>
            <span>Wishlisted</span>
          </div>

        </div>

      </div>

      {/* =========================
          MY COURSES (enrolled + requested)
      ========================== */}

      <div className="continue-strip-section">

        <h3 className="section-title">
          📚 My Courses
          {myCourses.length > 0 && <span className="section-count">{myCourses.length}</span>}
        </h3>

        {myCourses.length === 0 ? (
          <GlassCard compact>
            <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
              You haven't joined a course yet. Open any course below to preview it, then request enrollment — once your faculty approves, it appears here so you can continue in one click.
            </p>
          </GlassCard>
        ) : (
          <div className="continue-strip">
            {myCourses.map((course) => (
              <GlassCard
                key={course._id}
                hoverable
                compact
                className="continue-card"
                onClick={() => openMyCourse(course)}
              >
                <ProgressRing
                  value={course.percentage || 0}
                  size={52}
                  strokeWidth={5}
                  color={course.color}
                />

                <div className="continue-card-info">
                  <h5 className="line-clamp-2">
                    {course.courseName}
                  </h5>

                  <span>
                    {course.state === 'pending'
                      ? '⏳ Awaiting faculty approval'
                      : course.state === 'rejected'
                      ? 'Request declined — view course'
                      : course.percentage >= 100
                      ? `Completed 🎉 · ${course.totalLessons} lessons`
                      : course.percentage > 0
                      ? `Next: ${course.nextLesson?.title || 'continue'} · ${course.completedLessons}/${course.totalLessons}`
                      : `Start: ${course.nextLesson?.title || 'first lesson'}`}
                  </span>
                </div>

                <PlayCircle
                  size={18}
                  style={{
                    color: course.state === 'enrolled' ? course.color : 'var(--text-tertiary)',
                    flexShrink: 0,
                  }}
                />
              </GlassCard>
            ))}
          </div>
        )}

      </div>

      {/* =========================
          SEARCH + SORT
      ========================== */}

      <div className="courses-toolbar">

        <SearchBar
          placeholder="Search courses, instructors, or domains..."
          value={query}
          onChange={setQuery}
        />

        <select
          className="sort-select"
          value={sort}
          onChange={(e) =>
            setSort(e.target.value)
          }
          aria-label="Sort courses"
        >
          {sortOptions.map((option) => (
            <option
              key={option.id}
              value={option.id}
            >
              {option.label}
            </option>
          ))}
        </select>

      </div>

      {/* =========================
          FILTERS
      ========================== */}

      <div className="filter-row">

        {/* Domain Filter Chips */}
        <div className="category-chips">

          {domainList.map((dom) => (
            <span
              key={dom.id}
              className={`chip ${
                selectedDomain === dom.id
                  ? 'active'
                  : ''
              }`}
              onClick={() =>
                setSelectedDomain(dom.id)
              }
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setSelectedDomain(dom.id);
                }
              }}
            >
              <span aria-hidden="true">{dom.icon}</span>
              <span>{dom.label}</span>
              {typeof dom.count === 'number' && dom.count > 0 && (
                <span
                  style={{
                    fontSize: '0.72rem',
                    opacity: 0.75,
                    marginLeft: '2px',
                  }}
                >
                  ({dom.count})
                </span>
              )}
            </span>
          ))}

        </div>

        {/* Level Filter Chips */}
        <div className="category-chips">

          {levels.map((item) => (
            <span
              key={item}
              className={`chip ${
                level === item
                  ? 'active'
                  : ''
              }`}
              onClick={() =>
                setLevel(item)
              }
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setLevel(item);
                }
              }}
            >
              {item}
            </span>
          ))}

        </div>

      </div>

      {/* =========================
          COURSES GRID
      ========================== */}

      <div className="courses-grid">

        {visibleCourses.map(
          (course, index) => {
            const courseId =
              course._id ||
              course.id;

            const isWishlisted =
              wishlist.has(
                courseId
              );

            return (
              <GlassCard
                key={courseId}
                hoverable
                noPadding
                className={`course-card animate-fade-in-up stagger-${
                  (index % 8) + 1
                }`}
                onClick={() =>
                  navigate(
                    `/courses/${courseId}`
                  )
                }
              >

                {/* Course thumbnail */}
                <div
                  className="course-card-thumb"
                  style={{
                    background: `linear-gradient(
                      145deg,
                      ${course.color}2e,
                      ${course.color}0a
                    )`,
                  }}
                >

                  <span className="course-card-emoji">
                    {course.thumbnail}
                  </span>

                  <span
                    className="level-badge"
                    style={{
                      color:
                        getLevelColor(
                          course.level
                        ),
                      background: `${getLevelColor(
                        course.level
                      )}1f`,
                    }}
                  >
                    {course.level}
                  </span>

                  <button
                    className={`wishlist-btn ${
                      isWishlisted
                        ? 'active'
                        : ''
                    }`}
                    onClick={(e) =>
                      toggleWishlist(
                        e,
                        courseId
                      )
                    }
                    aria-label="Toggle wishlist"
                  >
                    <Heart
                      size={14}
                      fill={
                        isWishlisted
                          ? 'currentColor'
                          : 'none'
                      }
                    />
                  </button>

                  {course.progress > 0 && (
                    <div className="course-card-ring">

                      <ProgressRing
                        value={
                          course.progress
                        }
                        size={44}
                        strokeWidth={4}
                        color={
                          course.color
                        }
                      />

                    </div>
                  )}

                </div>

                {/* Course body */}
                <div className="course-card-body">

                  <span className="course-card-category">
                    {course.domain || course.category}
                  </span>

                  <h3 className="line-clamp-2">
                    {course.title}
                  </h3>

                  {/* Instructor */}
                  <div className="course-card-instructor">

                    <span
                      className="course-card-avatar"
                      style={{
                        background:
                          course.color,
                      }}
                    >
                      {String(
                        course.instructor ||
                          'Study Buddy'
                      )
                        .split(' ')
                        .map(
                          (name) =>
                            name[0]
                        )
                        .join('')
                        .slice(0, 2)}
                    </span>

                    {course.instructor}

                  </div>

                  {/* Stats */}
                  <div className="course-card-stats">

                    <span>
                      <Star
                        size={12}
                        fill="currentColor"
                      />
                      {course.rating ||
                        '4.8'}
                    </span>

                    <span>
                      <Users size={12} />
                      {Number(
                        course.students
                      ).toLocaleString()}
                    </span>

                    <span>
                      <Clock size={12} />
                      {course.duration}
                    </span>

                  </div>

                  {/* Skills */}
                  {course.skills.length >
                    0 && (
                    <div className="course-card-skills">

                      {course.skills
                        .slice(
                          0,
                          3
                        )
                        .map(
                          (
                            skill
                          ) => (
                            <span
                              key={
                                skill
                              }
                              className="skill-pill"
                            >
                              {
                                skill
                              }
                            </span>
                          )
                        )}

                      {course
                        .skills
                        .length >
                        3 && (
                        <span className="skill-pill more">
                          +
                          {course
                            .skills
                            .length -
                            3}
                        </span>
                      )}

                    </div>
                  )}

                </div>

                {/* Course footer */}
                <div className="course-card-footer">

                  <div className="course-card-meta">

                    {course.certificate && (
                      <span className="meta-badge">
                        <Award
                          size={12}
                        />
                        Certificate
                      </span>
                    )}

                    <span className="meta-badge">
                      <BookOpen
                        size={12}
                      />
                      {course.totalLessons}{' '}
                      lessons
                    </span>

                  </div>

                  <button
                    className="course-enroll-btn"
                    style={{
                      '--course-color':
                        course.color,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();

                      navigate(
                        `/courses/${courseId}`
                      );
                    }}
                  >

                    {enrollmentStatus.get(String(courseId)) === 'approved'
                      ? course.progress > 0
                        ? 'Continue Learning'
                        : 'Start Course'
                      : enrollmentStatus.get(String(courseId)) === 'pending'
                      ? 'Awaiting Approval'
                      : 'View Course'}

                    <ArrowRight
                      size={14}
                    />

                  </button>

                </div>

              </GlassCard>
            );
          }
        )}

        {/* No results */}
        {filtered.length === 0 && (
          <div
            className="empty-state"
            style={{
              gridColumn: '1 / -1',
            }}
          >

            <div className="empty-state-icon">
              🌸
            </div>

            <h3>
              No courses found
            </h3>

            <p>
              Try a different search
              term, domain, or level.
            </p>

          </div>
        )}

      </div>

      {/* =========================
          LOAD MORE
      ========================== */}

      {hasMore && (
        <div
          style={{
            display: 'flex',
            justifyContent:
              'center',
            marginTop:
              'var(--space-8)',
            marginBottom:
              'var(--space-8)',
          }}
        >

          <button
            className="hero-btn hero-btn-primary"
            onClick={() => loadCourses(page + 1, true)}
            disabled={loadingMore}
          >
            {loadingMore ? 'Loading Courses...' : 'Load More Courses'}
            <ArrowRight size={16} />
          </button>

        </div>
      )}

    </div>
  );
}
