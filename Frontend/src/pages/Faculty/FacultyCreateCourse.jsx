import { useState, useMemo } from 'react';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Sparkles,
  Layers,
  Clock,
  Hash,
  Palette,
  Award,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { createCourse } from '../../api/courseApi';
import './FacultyCreateCourse.css';

/* ── Department options (strictly matching backend enum) ── */
const DEPARTMENTS = ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL'];

/* ── Semester options (1 to 8) ── */
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

/* ── Level options ── */
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

/* ── Domain taxonomy ── */
const DOMAINS = [
  'Programming & CS',
  'Data Science & AI',
  'Engineering',
  'Web Development',
  'Business & Finance',
  'Design & Creative',
];

/* ── Suggested categories ── */
const CATEGORIES = [
  'Programming',
  'Web Development',
  'Data Science & AI',
  'Data Structures & Algorithms',
  'Database Management',
  'Computer Networks',
  'Cloud Computing',
  'Cybersecurity',
  'Operating Systems',
  'Software Engineering',
  'Machine Learning',
  'Mobile App Development',
];

/* ── Preset emoji thumbnails ── */
const PRESET_THUMBNAILS = ['📘', '💻', '🧠', '🌐', '⚡', '⚙️', '🔒', '📊', '🚀', '🤖', '📱', '🎨'];

/* ── Preset accent colors ── */
const PRESET_COLORS = [
  '#6366f1', // Indigo
  '#e75480', // Sakura Pink
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#14b8a6', // Teal
  '#f97316', // Orange
];

export default function FacultyCreateCourse({ onBack, onCreated, onViewCourses }) {
  /* ── Form State ── */
  const [courseName, setCourseName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [department, setDepartment] = useState('CSE');
  const [semester, setSemester] = useState(1);
  const [level, setLevel] = useState('Beginner');
  const [category, setCategory] = useState('Programming');
  const [domain, setDomain] = useState('Programming & CS');
  const [duration, setDuration] = useState('4 weeks');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState('📘');
  const [color, setColor] = useState('#6366f1');
  const [skillsInput, setSkillsInput] = useState('');
  const [outcomes, setOutcomes] = useState(['']);
  const [modules, setModules] = useState([
    { title: 'Module 1: Introduction and Fundamentals', summary: '' },
  ]);

  /* ── UI / Submit State ── */
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [createdCourse, setCreatedCourse] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  /* ── Auto-sync domain when category changes ── */
  const handleCategoryChange = (cat) => {
    setCategory(cat);
    if (/data|ai|machine|deep|ml/i.test(cat)) {
      setDomain('Data Science & AI');
    } else if (/web|frontend|fullstack/i.test(cat)) {
      setDomain('Web Development');
    } else if (/circuit|mech|civil|electric|embedded|vlsi/i.test(cat)) {
      setDomain('Engineering');
    } else {
      setDomain('Programming & CS');
    }
  };

  /* ── Outcome handlers ── */
  const handleAddOutcome = () => {
    setOutcomes((prev) => [...prev, '']);
  };

  const handleOutcomeChange = (index, val) => {
    setOutcomes((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };

  const handleRemoveOutcome = (index) => {
    setOutcomes((prev) => prev.filter((_, i) => i !== index));
  };

  /* ── Module handlers ── */
  const handleAddModule = () => {
    setModules((prev) => [
      ...prev,
      { title: `Module ${prev.length + 1}: `, summary: '' },
    ]);
  };

  const handleModuleChange = (index, field, val) => {
    setModules((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };

  const handleRemoveModule = (index) => {
    setModules((prev) => prev.filter((_, i) => i !== index));
  };

  /* ── Validation ── */
  const validate = () => {
    const errs = {};
    if (!courseName.trim()) {
      errs.courseName = 'Course name is required.';
    } else if (courseName.trim().length < 3) {
      errs.courseName = 'Course name must be at least 3 characters.';
    } else if (courseName.trim().length > 100) {
      errs.courseName = 'Course name cannot exceed 100 characters.';
    }

    if (!courseCode.trim()) {
      errs.courseCode = 'Course code is required.';
    } else if (!/^[A-Za-z0-9_-]+$/.test(courseCode.trim())) {
      errs.courseCode = 'Course code can only contain letters, numbers, hyphens, and underscores.';
    }

    if (!department) {
      errs.department = 'Department is required.';
    }

    if (!semester) {
      errs.semester = 'Semester is required.';
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /* ── Submit Handler ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    try {
      // Parse skills
      const parsedSkills = skillsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      // Clean outcomes
      const cleanedOutcomes = outcomes
        .map((o) => o.trim())
        .filter(Boolean);

      // Clean modules
      const cleanedModules = modules
        .filter((m) => m.title.trim())
        .map((m, idx) => ({
          id: `mod-${idx + 1}`,
          title: m.title.trim(),
          summary: m.summary ? m.summary.trim() : '',
          lessons: [],
        }));

      const payload = {
        courseName: courseName.trim(),
        courseCode: courseCode.trim().toUpperCase(),
        department,
        semester: Number(semester),
        category: category.trim() || 'Programming',
        domain,
        level,
        duration: duration.trim() || '4 weeks',
        description: description.trim(),
        thumbnail: thumbnail || '📘',
        color: color || '#6366f1',
        skills: parsedSkills,
        outcomes: cleanedOutcomes,
        modules: cleanedModules,
      };

      const res = await createCourse(payload);
      const createdData = res?.data?.data;

      setCreatedCourse(createdData || payload);
    } catch (err) {
      console.error('Error creating course:', err);
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to create course. Please try again.';
      setErrorMessage(message);
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Success Screen ── */
  if (createdCourse) {
    return (
      <div className="fcc-root">
        <div className="fcc-success-card">
          <div className="fcc-success-icon-wrap">
            <CheckCircle2 size={48} className="fcc-success-check" />
          </div>
          <h2 className="fcc-success-title">Course Created Successfully!</h2>
          <p className="fcc-success-subtitle">
            <strong>{createdCourse.courseName}</strong> ({createdCourse.courseCode}) has been
            published to your faculty catalog.
          </p>

          <div className="fcc-success-details">
            <div className="fcc-success-detail-pill">
              <span>Department:</span>
              <strong>{createdCourse.department}</strong>
            </div>
            <div className="fcc-success-detail-pill">
              <span>Semester:</span>
              <strong>{createdCourse.semester}</strong>
            </div>
            <div className="fcc-success-detail-pill">
              <span>Level:</span>
              <strong>{createdCourse.level || level}</strong>
            </div>
            <div className="fcc-success-detail-pill">
              <span>Modules:</span>
              <strong>{createdCourse.modules?.length || modules.length}</strong>
            </div>
          </div>

          <div className="fcc-success-actions">
            <button
              type="button"
              className="fcc-btn-primary"
              onClick={() => onCreated?.(createdCourse)}
            >
              <Layers size={16} />
              Manage Content & Add Lessons
            </button>
            <button
              type="button"
              className="fcc-btn-secondary"
              onClick={() => onViewCourses?.()}
            >
              <BookOpen size={16} />
              View in My Courses
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Form View ── */
  return (
    <div className="fcc-root">
      {/* ── Header ── */}
      <div className="fcc-header">
        <button type="button" className="fcc-back-btn" onClick={onBack}>
          <ArrowLeft size={15} /> Back to Courses
        </button>
        <div className="fcc-header-row">
          <div>
            <h1 className="fcc-page-title">
              <Sparkles size={22} className="fcc-title-icon" />
              Create New Course
            </h1>
            <p className="fcc-page-subtitle">
              Design a rich curriculum outline and publish a new course for your students.
            </p>
          </div>
        </div>
      </div>

      {/* ── Error Banner ── */}
      {errorMessage && (
        <div className="fcc-error-banner">
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ── Form Layout with Live Preview ── */}
      <div className="fcc-layout">
        {/* Main Form */}
        <form onSubmit={handleSubmit} className="fcc-form" noValidate>
          {/* Card: Basic Info */}
          <section className="fcc-card">
            <div className="fcc-card-header">
              <BookOpen size={18} className="fcc-section-icon" />
              <div>
                <h2>Basic Course Information</h2>
                <p>Core metadata to identify and register your course in the university catalog.</p>
              </div>
            </div>

            <div className="fcc-grid-2">
              {/* Course Name */}
              <div className="fcc-field full-width">
                <label className="fcc-label">
                  Course Name <span className="fcc-required">*</span>
                </label>
                <input
                  type="text"
                  className={`fcc-input ${fieldErrors.courseName ? 'fcc-input-error' : ''}`}
                  placeholder="e.g. Modern Full Stack Web Development with React & Node.js"
                  value={courseName}
                  onChange={(e) => {
                    setCourseName(e.target.value);
                    if (fieldErrors.courseName) {
                      setFieldErrors((prev) => ({ ...prev, courseName: null }));
                    }
                  }}
                  maxLength={100}
                />
                <div className="fcc-hint-row">
                  {fieldErrors.courseName ? (
                    <span className="fcc-field-error">{fieldErrors.courseName}</span>
                  ) : (
                    <span className="fcc-hint">A clear, descriptive title for students</span>
                  )}
                  <span className="fcc-char-count">{courseName.length}/100</span>
                </div>
              </div>

              {/* Course Code */}
              <div className="fcc-field">
                <label className="fcc-label">
                  Course Code <span className="fcc-required">*</span>
                </label>
                <div className="fcc-input-icon-wrap">
                  <Hash size={16} className="fcc-input-icon" />
                  <input
                    type="text"
                    className={`fcc-input fcc-input-with-icon ${
                      fieldErrors.courseCode ? 'fcc-input-error' : ''
                    }`}
                    placeholder="e.g. CS301"
                    value={courseCode}
                    onChange={(e) => {
                      setCourseCode(e.target.value.toUpperCase());
                      if (fieldErrors.courseCode) {
                        setFieldErrors((prev) => ({ ...prev, courseCode: null }));
                      }
                    }}
                    maxLength={15}
                  />
                </div>
                {fieldErrors.courseCode && (
                  <span className="fcc-field-error">{fieldErrors.courseCode}</span>
                )}
              </div>

              {/* Department */}
              <div className="fcc-field">
                <label className="fcc-label">
                  Department <span className="fcc-required">*</span>
                </label>
                <select
                  className={`fcc-select ${fieldErrors.department ? 'fcc-input-error' : ''}`}
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept} Department
                    </option>
                  ))}
                </select>
              </div>

              {/* Semester */}
              <div className="fcc-field">
                <label className="fcc-label">
                  Semester <span className="fcc-required">*</span>
                </label>
                <select
                  className="fcc-select"
                  value={semester}
                  onChange={(e) => setSemester(Number(e.target.value))}
                >
                  {SEMESTERS.map((sem) => (
                    <option key={sem} value={sem}>
                      Semester {sem}
                    </option>
                  ))}
                </select>
              </div>

              {/* Level */}
              <div className="fcc-field">
                <label className="fcc-label">Difficulty Level</label>
                <select
                  className="fcc-select"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                >
                  {LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div className="fcc-field">
                <label className="fcc-label">Category</label>
                <input
                  type="text"
                  list="category-suggestions"
                  className="fcc-input"
                  placeholder="e.g. Web Development"
                  value={category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                />
                <datalist id="category-suggestions">
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>

              {/* Domain */}
              <div className="fcc-field">
                <label className="fcc-label">Domain Taxonomy</label>
                <select
                  className="fcc-select"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                >
                  {DOMAINS.map((dom) => (
                    <option key={dom} value={dom}>
                      {dom}
                    </option>
                  ))}
                </select>
              </div>

              {/* Duration */}
              <div className="fcc-field">
                <label className="fcc-label">Estimated Duration</label>
                <div className="fcc-input-icon-wrap">
                  <Clock size={16} className="fcc-input-icon" />
                  <input
                    type="text"
                    className="fcc-input fcc-input-with-icon"
                    placeholder="e.g. 4 weeks or 40 hours"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="fcc-field full-width">
                <label className="fcc-label">Course Description</label>
                <textarea
                  className="fcc-textarea"
                  rows={3}
                  placeholder="Provide an overview of the course, what students will learn, and expectations..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={500}
                />
                <div className="fcc-hint-row">
                  <span className="fcc-hint">Summarize the topics and benefits of taking this course</span>
                  <span className="fcc-char-count">{description.length}/500</span>
                </div>
              </div>
            </div>
          </section>

          {/* Card: Branding & Visual Style */}
          <section className="fcc-card">
            <div className="fcc-card-header">
              <Palette size={18} className="fcc-section-icon" />
              <div>
                <h2>Card Visuals & Accent</h2>
                <p>Choose an emoji icon and color banner for your course card in the catalog.</p>
              </div>
            </div>

            <div className="fcc-branding-grid">
              {/* Emoji Picker */}
              <div className="fcc-field">
                <label className="fcc-label">Course Thumbnail Emoji</label>
                <div className="fcc-emoji-selector">
                  {PRESET_THUMBNAILS.map((emo) => (
                    <button
                      key={emo}
                      type="button"
                      className={`fcc-emoji-btn ${thumbnail === emo ? 'active' : ''}`}
                      onClick={() => setThumbnail(emo)}
                    >
                      {emo}
                    </button>
                  ))}
                  <input
                    type="text"
                    className="fcc-custom-emoji-input"
                    value={thumbnail}
                    onChange={(e) => setThumbnail(e.target.value)}
                    maxLength={4}
                    title="Or type custom emoji"
                  />
                </div>
              </div>

              {/* Color Accent Picker */}
              <div className="fcc-field">
                <label className="fcc-label">Accent Color Banner</label>
                <div className="fcc-color-selector">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`fcc-color-btn ${color === c ? 'active' : ''}`}
                      style={{ backgroundColor: c }}
                      onClick={() => setColor(c)}
                    />
                  ))}
                  <input
                    type="color"
                    className="fcc-custom-color-input"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    title="Choose custom color"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Card: Skills & Learning Outcomes */}
          <section className="fcc-card">
            <div className="fcc-card-header">
              <Award size={18} className="fcc-section-icon" />
              <div>
                <h2>Skills & Learning Outcomes</h2>
                <p>Clarify key competencies and concrete skills students will gain.</p>
              </div>
            </div>

            <div className="fcc-field full-width">
              <label className="fcc-label">Key Skills (Comma separated)</label>
              <input
                type="text"
                className="fcc-input"
                placeholder="e.g. JavaScript, React, Node.js, Express, MongoDB, REST APIs"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
              />
              <span className="fcc-hint">
                Separate tags with commas. These help students search and discover your course.
              </span>
            </div>

            <div className="fcc-field full-width" style={{ marginTop: '16px' }}>
              <div className="fcc-field-header-row">
                <label className="fcc-label">Learning Outcomes</label>
                <button
                  type="button"
                  className="fcc-add-btn"
                  onClick={handleAddOutcome}
                >
                  <Plus size={14} /> Add Outcome
                </button>
              </div>
              <div className="fcc-list-items">
                {outcomes.map((outcome, idx) => (
                  <div key={idx} className="fcc-list-item-row">
                    <span className="fcc-list-num">{idx + 1}.</span>
                    <input
                      type="text"
                      className="fcc-input"
                      placeholder="e.g. Architect and deploy secure production-grade REST APIs"
                      value={outcome}
                      onChange={(e) => handleOutcomeChange(idx, e.target.value)}
                    />
                    {outcomes.length > 1 && (
                      <button
                        type="button"
                        className="fcc-remove-btn"
                        onClick={() => handleRemoveOutcome(idx)}
                        title="Remove outcome"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Card: Initial Curriculum Outline */}
          <section className="fcc-card">
            <div className="fcc-card-header">
              <Layers size={18} className="fcc-section-icon" />
              <div>
                <h2>Initial Curriculum Modules</h2>
                <p>
                  Set up the starting outline. You can flesh out lessons and notes in{' '}
                  <strong>Manage Content</strong> anytime after creating the course.
                </p>
              </div>
            </div>

            <div className="fcc-field full-width">
              <div className="fcc-field-header-row">
                <label className="fcc-label">Modules ({modules.length})</label>
                <button
                  type="button"
                  className="fcc-add-btn"
                  onClick={handleAddModule}
                >
                  <Plus size={14} /> Add Module
                </button>
              </div>

              <div className="fcc-modules-list">
                {modules.map((mod, idx) => (
                  <div key={idx} className="fcc-module-builder-card">
                    <div className="fcc-module-builder-header">
                      <span className="fcc-module-badge">Module {idx + 1}</span>
                      {modules.length > 1 && (
                        <button
                          type="button"
                          className="fcc-remove-btn"
                          onClick={() => handleRemoveModule(idx)}
                          title="Remove module"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                    <div className="fcc-module-builder-inputs">
                      <input
                        type="text"
                        className="fcc-input"
                        placeholder="Module Title (e.g. Core Concepts & State Management)"
                        value={mod.title}
                        onChange={(e) => handleModuleChange(idx, 'title', e.target.value)}
                      />
                      <input
                        type="text"
                        className="fcc-input fcc-input-sm"
                        placeholder="Optional brief summary or learning objective"
                        value={mod.summary}
                        onChange={(e) => handleModuleChange(idx, 'summary', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Form Actions */}
          <div className="fcc-form-actions">
            <button
              type="button"
              className="fcc-btn-cancel"
              onClick={onBack}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="fcc-btn-submit"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <RefreshCw size={16} className="fcc-spin" /> Creating Course…
                </>
              ) : (
                <>
                  <Plus size={16} /> Create Course
                </>
              )}
            </button>
          </div>
        </form>

        {/* Live Course Preview Sidebar */}
        <aside className="fcc-preview-panel">
          <div className="fcc-preview-sticky">
            <div className="fcc-preview-header">
              <Sparkles size={16} />
              <span>Live Card Preview</span>
            </div>
            <p className="fcc-preview-sub">This is how your course will appear to students:</p>

            <div className="fcc-preview-card">
              <div
                className="fcc-card-accent-bar"
                style={{ background: color || '#6366f1' }}
              />
              <div className="fcc-preview-card-body">
                <div className="fcc-preview-card-top">
                  <span className="fcc-preview-thumb">{thumbnail || '📘'}</span>
                  <div className="fcc-preview-badges">
                    <span className="fcc-badge fcc-badge-active">Active</span>
                    <span className="fcc-badge fcc-badge-level">{level}</span>
                  </div>
                </div>

                <h3 className="fcc-preview-title">
                  {courseName || 'Untitled Course Name'}
                </h3>

                <div className="fcc-preview-code">
                  <Hash size={12} />
                  <span>{courseCode || 'COURSE_CODE'}</span>
                </div>

                <p className="fcc-preview-desc">
                  {description || 'Course description will appear here once entered...'}
                </p>

                <div className="fcc-preview-meta">
                  <span>
                    <Layers size={13} /> {modules.length} module{modules.length !== 1 ? 's' : ''}
                  </span>
                  <span>
                    <Clock size={13} /> {duration || '4 weeks'}
                  </span>
                  <span>
                    <BookOpen size={13} /> {department}
                  </span>
                </div>

                <div className="fcc-preview-footer">
                  <span className="fcc-preview-sem">Semester {semester}</span>
                  <span className="fcc-preview-cat">{category || 'Programming'}</span>
                </div>
              </div>
            </div>

            <div className="fcc-preview-tip">
              <strong>Tip:</strong> After creating this course, you can immediately upload lecture
              materials, generate quizzes, and assign homework.
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
