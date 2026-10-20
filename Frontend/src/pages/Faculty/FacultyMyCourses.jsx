import { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Plus,
  Filter,
  Edit3,
  Layers,
  FileText,
  ChevronDown,
  RefreshCw,
  AlertCircle,
  X,
  Hash,
  GraduationCap,
  Clock,
} from 'lucide-react';
import { getCourses } from '../../api/courseApi';
import { profile } from '../../api/authApi';
import './FacultyMyCourses.css';

/* ── Status badge color map ──────── */
const statusColors = {
  Active: 'fmc-status-active',
  Archived: 'fmc-status-archived',
};

/* ── Level badge color map ───────── */
const levelColors = {
  Beginner: 'fmc-level-beginner',
  Intermediate: 'fmc-level-intermediate',
  Advanced: 'fmc-level-advanced',
};

export default function FacultyMyCourses({ onNavigate }) {
  /* ── State ───────────────────────── */
  const [courses, setCourses] = useState([]);
  const [facultyId, setFacultyId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [levelFilter, setLevelFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');

  /* ── Fetch profile + courses ─────── */
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch profile to get faculty ID
      const profileRes = await profile();
      const user = profileRes?.data?.user;
      if (!user?._id) throw new Error('Unable to verify faculty identity');
      setFacultyId(user._id);

      // Fetch all courses (API has pagination, fetch a large page)
      const coursesRes = await getCourses({ limit: 200 });
      const allCourses = coursesRes?.data?.data || [];

      // Filter to only this faculty's courses
      const myCourses = allCourses.filter((c) => {
        const fid = c.faculty?._id || c.faculty;
        return fid === user._id;
      });

      setCourses(myCourses);
    } catch (err) {
      console.error('FacultyMyCourses fetch error:', err);
      setError(err?.response?.data?.message || err.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  /* ── Derived filter options ──────── */
  const departments = useMemo(() => {
    const set = new Set(courses.map((c) => c.department).filter(Boolean));
    return ['All', ...Array.from(set).sort()];
  }, [courses]);

  const levels = useMemo(() => {
    const set = new Set(courses.map((c) => c.level).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [courses]);

  /* ── Filtered courses ────────────── */
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      // Search
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        c.courseName?.toLowerCase().includes(q) ||
        c.courseCode?.toLowerCase().includes(q) ||
        c.category?.toLowerCase().includes(q) ||
        c.department?.toLowerCase().includes(q);

      // Status
      const matchStatus = statusFilter === 'All' || c.status === statusFilter;

      // Level
      const matchLevel = levelFilter === 'All' || c.level === levelFilter;

      // Department
      const matchDept = departmentFilter === 'All' || c.department === departmentFilter;

      return matchSearch && matchStatus && matchLevel && matchDept;
    });
  }, [courses, searchQuery, statusFilter, levelFilter, departmentFilter]);

  /* ── Helpers ─────────────────────── */
  const countModules = (c) => c.modules?.length || 0;
  const countLessons = (c) =>
    (c.modules || []).reduce((sum, m) => sum + (m.lessons?.length || 0), 0);

  const hasActiveFilters =
    searchQuery || statusFilter !== 'All' || levelFilter !== 'All' || departmentFilter !== 'All';

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setLevelFilter('All');
    setDepartmentFilter('All');
  };

  /* ── Render ──────────────────────── */
  return (
    <div className="fmc-root">
      {/* ── Page header ───────────────── */}
      <div className="fmc-page-header">
        <div className="fmc-page-title-row">
          <div>
            <h1 className="fmc-page-title">
              <GraduationCap size={22} />
              My Courses
            </h1>
            <p className="fmc-page-subtitle">
              Manage and organize your courses
              {!loading && <span className="fmc-count-badge">{courses.length} course{courses.length !== 1 ? 's' : ''}</span>}
            </p>
          </div>
          <button className="fmc-create-btn" onClick={() => onNavigate?.('create-course')}>
            <Plus size={16} />
            Create Course
          </button>
        </div>
      </div>

      {/* ── Toolbar: search + filters ── */}
      <div className="fmc-toolbar">
        <div className="fmc-search-wrap">
          <Search size={16} className="fmc-search-icon" />
          <input
            type="text"
            className="fmc-search-input"
            placeholder="Search by name, code, category…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="fmc-search-clear" onClick={() => setSearchQuery('')}>
              <X size={14} />
            </button>
          )}
        </div>

        <div className="fmc-filters">
          <div className="fmc-filter-group">
            <label className="fmc-filter-label">Status</label>
            <select
              className="fmc-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          <div className="fmc-filter-group">
            <label className="fmc-filter-label">Level</label>
            <select
              className="fmc-filter-select"
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
            >
              {levels.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          <div className="fmc-filter-group">
            <label className="fmc-filter-label">Department</label>
            <select
              className="fmc-filter-select"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <button className="fmc-clear-filters" onClick={clearFilters}>
              <X size={13} />
              Clear
            </button>
          )}

          <button
            className="fmc-refresh-btn"
            onClick={fetchData}
            disabled={loading}
            title="Refresh"
          >
            <RefreshCw size={15} className={loading ? 'fmc-spin' : ''} />
          </button>
        </div>
      </div>

      {/* ── Content ────────────────────── */}
      {loading ? (
        <div className="fmc-loading-state">
          <div className="fmc-loader" />
          <p>Loading your courses…</p>
        </div>
      ) : error ? (
        <div className="fmc-error-state">
          <AlertCircle size={32} />
          <h3>Something went wrong</h3>
          <p>{error}</p>
          <button className="fmc-retry-btn" onClick={fetchData}>
            <RefreshCw size={14} />
            Retry
          </button>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="fmc-empty-state">
          <BookOpen size={36} className="fmc-empty-icon" />
          {courses.length === 0 ? (
            <>
              <h3>No courses yet</h3>
              <p>Create your first course to get started teaching.</p>
              <button className="fmc-create-btn" onClick={() => onNavigate?.('create-course')}>
                <Plus size={16} />
                Create Course
              </button>
            </>
          ) : (
            <>
              <h3>No matching courses</h3>
              <p>Try adjusting your search or filters.</p>
              <button className="fmc-clear-filters-btn" onClick={clearFilters}>
                Clear all filters
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="fmc-course-grid">
          {filteredCourses.map((course) => (
            <div key={course._id} className="fmc-course-card">
              {/* Color accent bar */}
              <div
                className="fmc-card-accent"
                style={{ background: course.color || 'var(--gradient-primary)' }}
              />

              <div className="fmc-card-body">
                {/* Top row: thumbnail + badges */}
                <div className="fmc-card-top">
                  <span className="fmc-card-thumb">{course.thumbnail || '📘'}</span>
                  <div className="fmc-card-badges">
                    <span className={`fmc-badge ${statusColors[course.status] || ''}`}>
                      {course.status || 'Active'}
                    </span>
                    <span className={`fmc-badge ${levelColors[course.level] || ''}`}>
                      {course.level || 'Beginner'}
                    </span>
                  </div>
                </div>

                {/* Course info */}
                <div className="fmc-card-info">
                  <h3 className="fmc-card-name">{course.courseName}</h3>
                  <div className="fmc-card-code">
                    <Hash size={12} />
                    {course.courseCode}
                  </div>
                  {course.description && (
                    <p className="fmc-card-desc">{course.description}</p>
                  )}
                </div>

                {/* Stats row */}
                <div className="fmc-card-stats">
                  <div className="fmc-card-stat" title="Modules">
                    <Layers size={14} />
                    <span>{countModules(course)} module{countModules(course) !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="fmc-card-stat" title="Lessons">
                    <FileText size={14} />
                    <span>{countLessons(course)} lesson{countLessons(course) !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="fmc-card-stat" title="Department">
                    <BookOpen size={14} />
                    <span>{course.department}</span>
                  </div>
                </div>

                {/* Meta row */}
                <div className="fmc-card-meta">
                  <span className="fmc-card-meta-item">
                    <Clock size={12} />
                    Sem {course.semester}
                  </span>
                  {course.category && (
                    <span className="fmc-card-meta-item">
                      {course.category}
                    </span>
                  )}
                </div>

                {/* Action buttons */}
                <div className="fmc-card-actions">
                  <button
                    className="fmc-action-btn fmc-action-edit"
                    onClick={() => onNavigate?.('edit-course', course._id)}
                  >
                    <Edit3 size={14} />
                    Edit
                  </button>
                  <button
                    className="fmc-action-btn fmc-action-manage"
                    onClick={() => onNavigate?.('manage-content', course._id)}
                  >
                    <Layers size={14} />
                    Manage Content
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
