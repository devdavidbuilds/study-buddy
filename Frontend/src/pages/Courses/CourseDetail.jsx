import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, CheckCheck, Play, FileText, MessageCircle, Download, Star, Users,
  Heart, Share2, Award, Clock, BookOpen, BarChart3, CheckCircle2,
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import ProgressBar from '../../components/ui/ProgressBar';
import ProgressRing from '../../components/ui/ProgressRing';
import PageState from '../../components/ui/PageState';
import { getCourse, getCourses } from '../../api/courseApi';
import { generateInitials, getLevelColor } from '../../utils/helpers';

const tabs = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'modules', label: 'Curriculum', icon: Play },
  { id: 'resources', label: 'Resources', icon: FileText },
  { id: 'reviews', label: 'Reviews', icon: Star },
  { id: 'discussion', label: 'Discussion', icon: MessageCircle },
];

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [wishlisted, setWishlisted] = useState(false);
  const [course, setCourse] = useState(null);
  const [relatedCourses, setRelatedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadCourse = async () => {
    setLoading(true);
    setError('');
    try {
      const [courseRes, allCourses] = await Promise.all([getCourse(id), getCourses()]);
      const selectedCourse = courseRes?.data?.data ?? courseRes?.data ?? null;
      setCourse(selectedCourse);
      const list = Array.isArray(allCourses?.data?.data) ? allCourses.data.data : [];
      setRelatedCourses(list.filter(c => c._id !== selectedCourse?._id).slice(0, 3));
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load this course.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourse();
  }, [id]);

  const avgReviewRating = useMemo(() => {
    const reviews = course?.reviews ?? [];
    if (!reviews.length) return '0.0';
    return (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1);
  }, [course]);
  const remainingLessons = (course?.totalLessons ?? 0) - (course?.completedLessons ?? 0);

  if (loading) return <PageState title="Loading course details" message="Fetching the full lesson experience…" />;
  if (error) return <PageState type="error" title="Unable to load course" message={error} onRetry={loadCourse} />;
  if (!course) return <PageState type="empty" title="Course not found" message="This course is not available right now." />;

  return (
    <div className="animate-fade-in">
      <button className="btn btn-ghost btn-sm" style={{ marginBottom: 'var(--space-5)' }} onClick={() => navigate('/courses')}>
        <ArrowLeft size={16} /> Back to Courses
      </button>

      <div className="course-banner" style={{ background: `linear-gradient(135deg, ${course.color}20, ${course.color}05)` }}>
        <div className="course-banner-icon" style={{ background: `${course.color}22` }}>{course.thumbnail}</div>
        <div className="course-banner-info">
          <div className="course-banner-tags">
            <span className="chip active" style={{ background: `${course.color}22`, color: course.color, borderColor: 'transparent' }}>{course.category || 'Programming'}</span>
            <span className="level-badge static" style={{ color: getLevelColor(course.level), background: `${getLevelColor(course.level)}1f` }}>{course.level || 'Beginner'}</span>
            {course.certificate && <span className="cert-pill"><Award size={13} /> Certificate on Completion</span>}
          </div>
          <h1>{course.title}</h1>
          <p className="course-banner-desc">{course.description || 'A thoughtfully structured course designed to help you learn with clarity.'}</p>

          <div className="course-banner-instructor">
            <span className="course-card-avatar lg" style={{ background: course.color }}>{generateInitials(course.instructor || 'Study Buddy')}</span>
            <div>
              <strong>{course.instructor || 'Study Buddy'}</strong>
              <span>{course.instructorTitle || 'Learning Specialist'}</span>
            </div>
          </div>

          <div className="course-card-stats" style={{ marginTop: 'var(--space-4)' }}>
            <span><Star size={13} fill="currentColor" /> {course.rating ?? '4.8'} ({course.reviewsCount ?? 0} reviews)</span>
            <span><Users size={13} /> {Number(course.students ?? 0).toLocaleString()} students</span>
            <span><Clock size={13} /> {course.duration || '4 weeks'}</span>
            <span><BookOpen size={13} /> {course.totalLessons ?? 0} lessons</span>
          </div>
        </div>

        <div className="course-banner-side">
          <ProgressRing value={course.progress || 0} size={92} strokeWidth={7} color={course.color} />
          <button className="hero-btn hero-btn-primary" onClick={() => setActiveTab('modules')}>
            <Play size={16} /> {(course.progress || 0) > 0 ? `Continue: ${course.nextLesson || 'the next lesson'}` : 'Start Course'}
          </button>
          <div className="course-banner-actions">
            <button className={`btn btn-ghost btn-icon ${wishlisted ? 'wishlist-btn active inline' : ''}`} onClick={() => setWishlisted(w => !w)} aria-label="Wishlist">
              <Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} />
            </button>
            <button className="btn btn-ghost btn-icon" aria-label="Share">
              <Share2 size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="two-col-grid">
        <div>
          <div className="tabs-nav" style={{ marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
            {tabs.map(t => (
              <div key={t.id} className={`tab-item ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
                {t.label}
              </div>
            ))}
          </div>

          {activeTab === 'overview' && (
            <GlassCard>
              <h3 className="section-title">About this course</h3>
              <p className="course-overview-text">{course.description || 'A thoughtfully structured course designed to help you learn with clarity.'}</p>

              <h3 className="section-title" style={{ marginTop: 'var(--space-6)' }}>What you'll learn</h3>
              <div className="outcomes-grid">
                {(course.outcomes ?? []).map(outcome => (
                  <div key={outcome} className="outcome-item">
                    <CheckCircle2 size={16} style={{ color: course.color, flexShrink: 0, marginTop: 2 }} />
                    <span>{outcome}</span>
                  </div>
                ))}
              </div>

              <h3 className="section-title" style={{ marginTop: 'var(--space-6)' }}>Skills you'll gain</h3>
              <div className="course-card-skills" style={{ marginBottom: 0 }}>
                {(course.skills ?? []).map(skill => (
                  <span key={skill} className="skill-tag lg" style={{ background: `${course.color}18`, color: course.color }}>{skill}</span>
                ))}
              </div>
            </GlassCard>
          )}

          {activeTab === 'modules' && (
            <GlassCard>
              <div className="module-list">
                {(course.modules ?? []).map(mod => (
                  <div key={mod.id} className="module-block">
                    <h4>{mod.title}</h4>
                    {mod.lessons.map(lesson => (
                      <div key={lesson.id} className="lesson-row">
                        <div className={`lesson-check ${lesson.done ? 'done' : ''}`}>
                          {lesson.done && <CheckCheck size={12} />}
                        </div>
                        <div className="lesson-row-info">
                          <h5>{lesson.title}</h5>
                          <span>{lesson.duration}</span>
                        </div>
                        <button className="btn btn-ghost btn-sm">
                          <Play size={14} /> {lesson.done ? 'Rewatch' : 'Start'}
                        </button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {activeTab === 'resources' && (
            <GlassCard>
              {resources.map(res => (
                <div key={res.id} className="resource-row">
                  <FileText size={20} style={{ color: course.color, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <h5 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>{res.title}</h5>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>{res.type} • {res.size}</span>
                  </div>
                  <button className="btn btn-ghost btn-icon"><Download size={16} /></button>
                </div>
              ))}
            </GlassCard>
          )}

          {activeTab === 'reviews' && (
            <GlassCard>
              <div className="reviews-summary">
                <div className="reviews-summary-score">
                  <strong>{avgReviewRating}</strong>
                  <div className="reviews-summary-stars">
                    {[1, 2, 3, 4, 5].map(n => (
                      <Star key={n} size={14} fill={n <= Math.round(avgReviewRating) ? 'currentColor' : 'none'} />
                    ))}
                  </div>
                  <span>{course.reviewsCount} reviews</span>
                </div>
              </div>
              {(course.reviews ?? []).map(review => (
                <div key={review.id} className="discussion-item">
                  <div className="avatar sm" style={{ background: review.avatarColor }}>{generateInitials(review.name)}</div>
                  <div className="discussion-item-body">
                    <div>
                      <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{review.name}</span>
                      <span>{review.date}</span>
                    </div>
                    <div className="reviews-summary-stars" style={{ margin: '4px 0' }}>
                      {[1, 2, 3, 4, 5].map(n => (
                        <Star key={n} size={12} fill={n <= review.rating ? 'currentColor' : 'none'} />
                      ))}
                    </div>
                    <p>{review.text}</p>
                  </div>
                </div>
              ))}
            </GlassCard>
          )}

          {activeTab === 'discussion' && (
            <GlassCard>
              {(course.discussion ?? []).map(post => (
                <div key={post.id} className="discussion-item">
                  <div className="avatar sm" style={{ background: post.avatarColor }}>{generateInitials(post.name)}</div>
                  <div className="discussion-item-body">
                    <div>
                      <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{post.name}</span>
                      <span>{post.time}</span>
                    </div>
                    <p>{post.message}</p>
                  </div>
                </div>
              ))}
            </GlassCard>
          )}
        </div>

        <div>
          <GlassCard style={{ marginBottom: 'var(--space-6)' }}>
            <h3 className="section-title">Course includes</h3>
            <div className="course-includes-list">
              <div className="course-includes-row"><BookOpen size={15} /> {course.totalLessons ?? 0} on-demand lessons</div>
              <div className="course-includes-row"><Clock size={15} /> {course.duration || '4 weeks'} of content</div>
              <div className="course-includes-row"><BarChart3 size={15} /> {course.level || 'Beginner'} level</div>
              <div className="course-includes-row"><Award size={15} /> {course.certificate ? 'Certificate of completion' : 'No certificate'}</div>
            </div>
            <ProgressBar value={course.progress || 0} size="md" color={course.color} className="course-includes-progress" />
            <div className="course-detail-progress" style={{ marginTop: 'var(--space-2)' }}>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                {remainingLessons > 0 ? `${remainingLessons} lessons left` : 'Course complete'}
              </span>
              <strong style={{ color: course.color, fontSize: 'var(--font-size-sm)' }}>{course.progress || 0}%</strong>
            </div>
          </GlassCard>

          <GlassCard style={{ marginBottom: 'var(--space-6)' }}>
            <h3 className="section-title">Instructor</h3>
            <div className="instructor-card-body">
              <span className="course-card-avatar lg" style={{ background: course.color }}>{generateInitials(course.instructor || 'Study Buddy')}</span>
              <div>
                <strong>{course.instructor || 'Study Buddy'}</strong>
                <span>{course.instructorTitle || 'Learning Specialist'}</span>
              </div>
            </div>
            <p className="instructor-bio">
              {(course.instructor || 'Study Buddy').split(' ').slice(-1)[0]} specializes in {course.category || 'programming'}, bringing real classroom and industry experience to every lesson in this course.
            </p>
          </GlassCard>

          {relatedCourses.length > 0 && (
            <GlassCard>
              <h3 className="section-title">Related Courses</h3>
              <div className="related-courses-list">
                {relatedCourses.map(rc => {
                  const rcId = rc._id || rc.id;
                  return (
                    <div key={rcId} className="related-course-row" onClick={() => navigate(`/courses/${rcId}`)}>
                      <span className="course-card-avatar" style={{ background: rc.color }}>{rc.thumbnail || '📘'}</span>
                      <div className="related-course-info">
                        <h5 className="line-clamp-2">{rc.title}</h5>
                        <span><Star size={11} fill="currentColor" /> {rc.rating ?? '4.8'} • {rc.duration || '4 weeks'}</span>
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
