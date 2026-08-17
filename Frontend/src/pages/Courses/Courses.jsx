  import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Users, Heart, Clock, BookOpen, Award, PlayCircle, ArrowRight } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import ProgressRing from '../../components/ui/ProgressRing';
import SearchBar from '../../components/ui/SearchBar';
import PageState from '../../components/ui/PageState';
import { getCourses } from '../../api/courseApi';
import { getLevelColor } from '../../utils/helpers';

const levels = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'];
const sortOptions = [
  { id: 'recommended', label: 'Recommended' },
  { id: 'progress', label: 'My Progress' },
  { id: 'rating', label: 'Highest Rated' },
  { id: 'students', label: 'Most Popular' },
];
const categories = ['All', 'Programming', 'Data Science', 'Design', 'Productivity'];

export default function Courses() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [level, setLevel] = useState('All Levels');
  const [sort, setSort] = useState('recommended');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [wishlist, setWishlist] = useState(new Set());

  const loadCourses = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getCourses();
      setCourses(Array.isArray(res?.data?.data) ? res.data.data : []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load courses right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const toggleWishlist = (e, id) => {
    e.stopPropagation();
    setWishlist(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const continueLearning = useMemo(
    () => courses.filter(c => c.progress > 0 && c.progress < 100).sort((a, b) => b.progress - a.progress).slice(0, 4),
    [courses]
  );

  const filtered = useMemo(() => {
    let list = courses.filter(c => {
      const title = String(c.title || '').toLowerCase();
      const instructor = String(c.instructor || '').toLowerCase();
      const matchesQuery = title.includes(query.toLowerCase()) || instructor.includes(query.toLowerCase());
      const matchesCategory = category === 'All' || c.category === category;
      const matchesLevel = level === 'All Levels' || c.level === level;
      return matchesQuery && matchesCategory && matchesLevel;
    });
    if (sort === 'progress') list = [...list].sort((a, b) => b.progress - a.progress);
    if (sort === 'rating') list = [...list].sort((a, b) => b.rating - a.rating);
    if (sort === 'students') list = [...list].sort((a, b) => b.students - a.students);
    return list;
  }, [category, courses, level, query, sort]);

  const completedCount = courses.filter(c => c.progress === 100).length;

  if (loading) return <PageState title="Loading courses" message="Fetching your latest course catalog…" />;
  if (error) return <PageState type="error" title="Unable to load courses" message={error} onRetry={loadCourses} />;
  if (!courses.length) return <PageState type="empty" title="No courses yet" message="Your course catalog is empty right now." />;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Course Marketplace</h1>
          <p>{courses.length} courses across {categories.length - 1} tracks • pick up where you left off</p>
        </div>
        <div className="courses-hero-stats">
          <div className="courses-hero-stat">
            <strong>{courses.length}</strong>
            <span>Enrolled</span>
          </div>
          <div className="courses-hero-stat">
            <strong>{completedCount}</strong>
            <span>Completed</span>
          </div>
          <div className="courses-hero-stat">
            <strong>{wishlist.size}</strong>
            <span>Wishlisted</span>
          </div>
        </div>
      </div>

      {continueLearning.length > 0 && (
        <div className="continue-strip-section">
          <h3 className="section-title">🌸 Continue Learning</h3>
          <div className="continue-strip">
            {continueLearning.map(course => (
              <GlassCard
                key={course._id || course.id}
                hoverable
                compact
                className="continue-card"
                onClick={() => navigate(`/courses/${course._id || course.id}`)}
              >
                <ProgressRing value={course.progress || 0} size={52} strokeWidth={5} color={course.color} />
                <div className="continue-card-info">
                  <h5 className="line-clamp-2">{course.title}</h5>
                  <span>Next: {course.nextLesson || 'Continue where you left off'}</span>
                </div>
                <PlayCircle size={18} style={{ color: course.color, flexShrink: 0 }} />
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      <div className="courses-toolbar">
        <SearchBar placeholder="Search courses or instructors..." value={query} onChange={setQuery} />
        <select className="sort-select" value={sort} onChange={e => setSort(e.target.value)}>
          {sortOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
        </select>
      </div>

      <div className="filter-row">
        <div className="category-chips">
          {categories.map(cat => (
            <span
              key={cat}
              className={`chip ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </span>
          ))}
        </div>
        <div className="category-chips">
          {levels.map(lvl => (
            <span
              key={lvl}
              className={`chip ${level === lvl ? 'active' : ''}`}
              onClick={() => setLevel(lvl)}
            >
              {lvl}
            </span>
          ))}
        </div>
      </div>

      <div className="courses-grid">
        {filtered.map((course, i) => {
          const courseId = course._id || course.id;
          const isWishlisted = wishlist.has(courseId);
          return (
            <GlassCard
              key={courseId}
              hoverable
              noPadding
              className={`course-card animate-fade-in-up stagger-${(i % 8) + 1}`}
              onClick={() => navigate(`/courses/${courseId}`)}
            >
              <div className="course-card-thumb" style={{ background: `linear-gradient(145deg, ${course.color}2e, ${course.color}0a)` }}>
                <span className="course-card-emoji">{course.thumbnail || '📘'}</span>
                <span className="level-badge" style={{ color: getLevelColor(course.level), background: `${getLevelColor(course.level)}1f` }}>
                  {course.level || 'Beginner'}
                </span>
                <button
                  className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
                  onClick={e => toggleWishlist(e, courseId)}
                  aria-label="Toggle wishlist"
                >
                  <Heart size={14} fill={isWishlisted ? 'currentColor' : 'none'} />
                </button>
                {(course.progress || 0) > 0 && (
                  <div className="course-card-ring">
                    <ProgressRing value={course.progress || 0} size={44} strokeWidth={4} color={course.color} />
                  </div>
                )}
              </div>

              <div className="course-card-body">
                <span className="course-card-category">{course.category || 'Programming'}</span>
                <h3 className="line-clamp-2">{course.title}</h3>
                <div className="course-card-instructor">
                  <span className="course-card-avatar" style={{ background: course.color }}>
                    {String(course.instructor || 'Study Buddy').split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                  {course.instructor || 'Study Buddy'}
                </div>

                <div className="course-card-stats">
                  <span><Star size={12} fill="currentColor" /> {course.rating ?? '4.8'}</span>
                  <span><Users size={12} /> {Number(course.students ?? 0).toLocaleString()}</span>
                  <span><Clock size={12} /> {course.duration || '4 weeks'}</span>
                </div>

                <div className="course-card-skills">
                  {(course.skills ?? []).slice(0, 2).map(skill => (
                    <span key={skill} className="skill-tag">{skill}</span>
                  ))}
                </div>

                <div className="course-card-footer">
                  <span><BookOpen size={13} /> {course.completedLessons ?? 0}/{course.totalLessons ?? 0} lessons</span>
                  {course.certificate && (
                    <span className="cert-pill"><Award size={13} /> Certificate</span>
                  )}
                </div>

                <button className="course-card-cta" style={{ background: course.color }}>
                  {(course.progress || 0) > 0 ? 'Continue Learning' : 'Start Course'}
                  <ArrowRight size={14} />
                </button>
              </div>
            </GlassCard>
          );
        })}

        {filtered.length === 0 && (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <div className="empty-state-icon">🌸</div>
            <h3>No courses found</h3>
            <p>Try a different search term, category, or level.</p>
          </div>
        )}
      </div>
    </div>
  );
}
