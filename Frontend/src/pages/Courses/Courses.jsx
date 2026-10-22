import { useEffect, useMemo, useState } from 'react';
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
import { getCourses } from '../../api/courseApi';
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
  { id: 'progress', label: 'My Progress' },
  { id: 'rating', label: 'Highest Rated' },
  { id: 'students', label: 'Most Popular' },
];

const categories = [
  'All',
  'Programming',
  'Data Science',
  'Design',
  'Productivity',
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

    category:
      course?.category ||
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
  const [category, setCategory] = useState('All');
  const [level, setLevel] = useState('All Levels');
  const [sort, setSort] = useState('recommended');

  const [courses, setCourses] = useState([]);

  // The student's own progress per course (GET /api/progress/summary).
  // Course documents don't carry per-student progress, so it is merged in
  // here. Non-students simply see the catalog without progress.
  const { summary } = useLearningSummary();

  // Enrollment status per course: approved courses can be started; others
  // open the course preview where the student can request enrollment.
  const [enrollmentStatus, setEnrollmentStatus] = useState(new Map());
  useEffect(() => {
    getMyEnrollments()
      .then((res) => setEnrollmentStatus(new Map((res?.data?.data || []).map((e) => [String(e.course?._id), e.status]))))
      .catch(() => setEnrollmentStatus(new Map()));
  }, []);
  const progressById = useMemo(
    () => new Map((summary?.courses || []).map((c) => [String(c._id), c])),
    [summary]
  );
  const withProgress = (course) => {
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
  };

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
        category,
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
  }, [query, category, level, sort]);

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
   * Courses currently being continued.
   */
  const continueLearning = useMemo(() => {
    return (summary?.courses || [])
      .map((c) => withProgress(normalizeCourse(c)))
      .filter(
        (course) =>
          course.progress > 0 &&
          course.progress < 100
      )
      .sort(
        (a, b) =>
          b.progress - a.progress
      )
      .slice(0, 4);
  }, [summary]);

  /*
   * Filtering + sorting.
   */
  const filtered = useMemo(() => {
    let list = courses.map(withProgress).filter((course) => {
      const title = String(
        course.title || ''
      ).toLowerCase();

      const instructor = String(
        course.instructor || ''
      ).toLowerCase();

      const courseCategory = String(
        course.category || ''
      ).toLowerCase();

      const searchText =
        query.toLowerCase();

      const matchesQuery =
        title.includes(searchText) ||
        instructor.includes(searchText) ||
        courseCategory.includes(searchText);

      /*
       * The imported Udemy dataset contains
       * subjects such as "Web Development",
       * "Business Finance", etc.
       *
       * Keep "All" unrestricted and provide
       * useful broad category matching.
       */
      let matchesCategory = true;

      if (category !== 'All') {
        const categoryText =
          courseCategory;

        if (category === 'Programming') {
          matchesCategory =
            categoryText.includes(
              'program'
            ) ||
            categoryText.includes(
              'development'
            ) ||
            categoryText.includes(
              'software'
            ) ||
            categoryText.includes(
              'web'
            ) ||
            categoryText.includes(
              'code'
            ) ||
            categoryText.includes(
              'computer'
            );
        } else if (
          category === 'Data Science'
        ) {
          matchesCategory =
            categoryText.includes(
              'data'
            ) ||
            categoryText.includes(
              'machine'
            ) ||
            categoryText.includes(
              'statistics'
            ) ||
            categoryText.includes(
              'analytics'
            );
        } else if (
          category === 'Design'
        ) {
          matchesCategory =
            categoryText.includes(
              'design'
            ) ||
            categoryText.includes(
              'graphic'
            ) ||
            categoryText.includes(
              'ui'
            ) ||
            categoryText.includes(
              'ux'
            );
        } else if (
          category === 'Productivity'
        ) {
          matchesCategory =
            categoryText.includes(
              'productivity'
            ) ||
            categoryText.includes(
              'office'
            ) ||
            categoryText.includes(
              'business'
            );
        }
      }

      const matchesLevel =
        level === 'All Levels' ||
        course.level === level;

      return (
        matchesQuery &&
        matchesCategory &&
        matchesLevel
      );
    });

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
    category,
    courses,
    level,
    progressById,
    query,
    sort,
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
        onRetry={loadCourses}
      />
    );
  }

  if (!courses.length) {
    return (
      <PageState
        type="empty"
        title="No courses yet"
        message="Your course catalog is empty right now."
      />
    );
  }

  return (
    <div className="animate-fade-in">

      {/* =========================
          PAGE HEADER
      ========================== */}

      <div className="page-header">

        <div>
          <h1>
            Course Marketplace
          </h1>

          <p>
            {totalCourses.toLocaleString()}{' '}
            courses across multiple tracks
            • pick up where you left off
          </p>
        </div>

        <div className="courses-hero-stats">

          <div className="courses-hero-stat">
            <strong>
              {totalCourses.toLocaleString()}
            </strong>
            <span>Courses</span>
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
          CONTINUE LEARNING
      ========================== */}

      {continueLearning.length > 0 && (
        <div className="continue-strip-section">

          <h3 className="section-title">
            🌸 Continue Learning
          </h3>

          <div className="continue-strip">

            {continueLearning.map(
              (course) => {

                const courseId =
                  course._id ||
                  course.id;

                return (
                  <GlassCard
                    key={courseId}
                    hoverable
                    compact
                    className="continue-card"
                    onClick={() =>
                      navigate(
                        `/courses/${courseId}`
                      )
                    }
                  >

                    <ProgressRing
                      value={
                        course.progress || 0
                      }
                      size={52}
                      strokeWidth={5}
                      color={course.color}
                    />

                    <div className="continue-card-info">

                      <h5 className="line-clamp-2">
                        {course.title}
                      </h5>

                      <span>
                        Next:{' '}
                        {course.nextLesson ||
                          'Continue where you left off'}
                      </span>

                    </div>

                    <PlayCircle
                      size={18}
                      style={{
                        color:
                          course.color,
                        flexShrink: 0,
                      }}
                    />

                  </GlassCard>
                );
              }
            )}

          </div>

        </div>
      )}

      {/* =========================
          SEARCH + SORT
      ========================== */}

      <div className="courses-toolbar">

        <SearchBar
          placeholder="Search courses or instructors..."
          value={query}
          onChange={setQuery}
        />

        <select
          className="sort-select"
          value={sort}
          onChange={(e) =>
            setSort(e.target.value)
          }
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

        <div className="category-chips">

          {categories.map((cat) => (
            <span
              key={cat}
              className={`chip ${
                category === cat
                  ? 'active'
                  : ''
              }`}
              onClick={() =>
                setCategory(cat)
              }
            >
              {cat}
            </span>
          ))}

        </div>

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
            >
              {item}
            </span>
          ))}

        </div>

      </div>

      {/* =========================
          RESULT COUNT
      ========================== */}

      <div
        style={{
          marginBottom:
            'var(--space-4)',
          color:
            'var(--text-tertiary)',
          fontSize:
            'var(--font-size-sm)',
        }}
      >
        Showing{' '}
        {filtered.length.toLocaleString()}{' '}
        of{' '}
        {totalCourses.toLocaleString()}{' '}
        matching courses
      </div>

      {/* =========================
          COURSE GRID
      ========================== */}

      <div className="courses-grid">

        {visibleCourses.map(
          (course, index) => {

            const courseId =
              course._id ||
              course.id;

            const isWishlisted =
              wishlist.has(courseId);

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
                    {course.category}
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
                  <div className="course-card-skills">

                    {course.skills
                      .slice(0, 2)
                      .map(
                        (
                          skill,
                          skillIndex
                        ) => (
                          <span
                            key={`${skill}-${skillIndex}`}
                            className="skill-tag"
                          >
                            {skill}
                          </span>
                        )
                      )}

                  </div>

                  {/* Footer */}
                  <div className="course-card-footer">

                    <span>
                      <BookOpen size={13} />

                      {course.completedLessons}
                      /
                      {course.totalLessons}{' '}
                      lessons
                    </span>

                    {course.certificate && (
                      <span className="cert-pill">

                        <Award size={13} />

                        Certificate

                      </span>
                    )}

                  </div>

                  {/* CTA */}
                  <button
                    className="course-card-cta"
                    style={{
                      background:
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
              term, category, or level.
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