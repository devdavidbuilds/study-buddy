import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Layers,
  FileText,
  Edit3,
  Save,
  X,
  Clock,
  Video,
  Link2,
  BookOpen,
  AlertCircle,
  RefreshCw,
  Plus,
  Trash2,
  Hash,
  ExternalLink,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { getCourse } from '../../api/courseApi';
import './FacultyCourseContent.css';

export default function FacultyCourseContent({ courseId, onBack }) {
  /* ── State ─────────────────────────────────── */
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Module tree
  const [expandedModules, setExpandedModules] = useState(new Set());

  // Lesson selection
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [selectedLessonId, setSelectedLessonId] = useState(null);

  // Edit mode
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saveMessage, setSaveMessage] = useState(null);

  /* ── Fetch course on mount / courseId change ── */
  useEffect(() => {
    if (courseId) fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCourse(courseId);
      const data = res?.data?.data;
      if (!data) throw new Error('Course not found');
      setCourse(data);

      // Auto-expand all modules for easy browsing
      const ids = new Set((data.modules || []).map((m) => m.id));
      setExpandedModules(ids);
    } catch (err) {
      console.error('FacultyCourseContent fetch error:', err);
      setError(
        err?.response?.data?.message || err.message || 'Failed to load course'
      );
    } finally {
      setLoading(false);
    }
  };

  /* ── Module tree helpers ─────────────────────── */
  const toggleModule = (moduleId) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  };

  const selectLesson = (moduleId, lessonId) => {
    setSelectedModuleId(moduleId);
    setSelectedLessonId(lessonId);
    setEditing(false);
    setSaveMessage(null);
  };

  const getSelectedLesson = () => {
    if (!course || !selectedModuleId || !selectedLessonId) return null;
    const mod = course.modules?.find((m) => m.id === selectedModuleId);
    return mod?.lessons?.find((l) => l.id === selectedLessonId) || null;
  };

  /* ── Edit mode helpers ──────────────────────── */
  const startEditing = () => {
    const lesson = getSelectedLesson();
    if (!lesson) return;
    setEditForm({
      title: lesson.title || '',
      duration: lesson.duration || '',
      description: lesson.description || '',
      content: lesson.content || '',
      videoUrl: lesson.videoUrl || '',
      resources: [...(lesson.resources || [])],
    });
    setEditing(true);
    setSaveMessage(null);
  };

  const cancelEditing = () => {
    setEditing(false);
    setEditForm({});
    setSaveMessage(null);
  };

  const handleSave = () => {
    // No PUT /api/courses/:id endpoint exists on the backend.
    // Report this clearly rather than silently failing.
    setSaveMessage({
      type: 'warning',
      text: 'Cannot save: the backend does not have a course update API yet. A PUT /api/courses/:id endpoint is required. Please add it to Backend/routes/courseRoutes.js and Backend/controllers/courseController.js.',
    });
  };

  const updateFormField = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const addResource = () => {
    setEditForm((prev) => ({
      ...prev,
      resources: [...prev.resources, ''],
    }));
  };

  const removeResource = (index) => {
    setEditForm((prev) => ({
      ...prev,
      resources: prev.resources.filter((_, i) => i !== index),
    }));
  };

  const updateResource = (index, value) => {
    setEditForm((prev) => ({
      ...prev,
      resources: prev.resources.map((r, i) => (i === index ? value : r)),
    }));
  };

  /* ── Derived data ───────────────────────────── */
  const selectedLesson = getSelectedLesson();
  const totalModules = course?.modules?.length || 0;
  const totalLessons = (course?.modules || []).reduce(
    (sum, m) => sum + (m.lessons?.length || 0),
    0
  );

  /* ── Render: Loading state ──────────────────── */
  if (loading) {
    return (
      <div className="fcc-root">
        <div className="fcc-loading-state">
          <div className="fcc-loader" />
          <p>Loading course content…</p>
        </div>
      </div>
    );
  }

  /* ── Render: Error state ────────────────────── */
  if (error) {
    return (
      <div className="fcc-root">
        <div className="fcc-header">
          <button className="fcc-back-btn" onClick={onBack}>
            <ArrowLeft size={14} /> Back to My Courses
          </button>
        </div>
        <div className="fcc-error-state">
          <AlertCircle size={32} />
          <h3>Something went wrong</h3>
          <p>{error}</p>
          <button className="fcc-retry-btn" onClick={fetchCourse}>
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      </div>
    );
  }

  /* ── Render: Main content ───────────────────── */
  return (
    <div className="fcc-root">
      {/* ── Header ─────────────────── */}
      <div className="fcc-header">
        <button className="fcc-back-btn" onClick={onBack}>
          <ArrowLeft size={14} /> Back to My Courses
        </button>

        <div className="fcc-course-title-row">
          <div>
            <h1 className="fcc-course-title">
              <Layers size={20} />
              {course?.courseName || 'Untitled Course'}
            </h1>
            <div className="fcc-course-code">
              <Hash size={12} />
              {course?.courseCode}
            </div>
            <div className="fcc-course-meta">
              <span className="fcc-meta-badge fcc-meta-modules">
                <Layers size={11} />
                {totalModules} module{totalModules !== 1 ? 's' : ''}
              </span>
              <span className="fcc-meta-badge fcc-meta-lessons">
                <FileText size={11} />
                {totalLessons} lesson{totalLessons !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Two-column layout ─────── */}
      <div className="fcc-layout">
        {/* ── LEFT: Module tree ────── */}
        <div className="fcc-modules-panel">
          <div className="fcc-modules-panel-title">
            <BookOpen size={14} />
            Course Structure
          </div>

          {totalModules === 0 ? (
            <div className="fcc-no-modules">
              <Layers size={28} />
              <p>No modules yet</p>
              <span>This course has no modules or lessons.</span>
            </div>
          ) : (
            <div className="fcc-modules-scroll">
              {(course.modules || []).map((mod) => (
                <div key={mod.id} className="fcc-module">
                  <button
                    className={`fcc-module-header ${expandedModules.has(mod.id) ? 'expanded' : ''}`}
                    onClick={() => toggleModule(mod.id)}
                  >
                    <span className="fcc-module-toggle">
                      {expandedModules.has(mod.id) ? (
                        <ChevronDown size={14} />
                      ) : (
                        <ChevronRight size={14} />
                      )}
                    </span>
                    <Layers size={13} className="fcc-module-icon" />
                    <span className="fcc-module-title">{mod.title}</span>
                    <span className="fcc-module-count">
                      {mod.lessons?.length || 0}
                    </span>
                  </button>

                  {expandedModules.has(mod.id) && (
                    <div className="fcc-lesson-list">
                      {(mod.lessons || []).length === 0 ? (
                        <div className="fcc-no-lessons">
                          No lessons in this module
                        </div>
                      ) : (
                        (mod.lessons || []).map((lesson) => {
                          const isSelected =
                            selectedModuleId === mod.id &&
                            selectedLessonId === lesson.id;
                          const hasContent = !!(lesson.content);
                          return (
                            <button
                              key={lesson.id}
                              className={`fcc-lesson-item ${isSelected ? 'selected' : ''}`}
                              onClick={() => selectLesson(mod.id, lesson.id)}
                            >
                              <span
                                className={`fcc-lesson-indicator ${hasContent ? 'has-content' : ''}`}
                              >
                                {hasContent ? (
                                  <CheckCircle2 size={12} />
                                ) : (
                                  <Circle size={12} />
                                )}
                              </span>
                              <span className="fcc-lesson-title">
                                {lesson.title}
                              </span>
                              <span className="fcc-lesson-duration">
                                <Clock size={10} />
                                {lesson.duration || '30 min'}
                              </span>
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── RIGHT: Lesson detail / editor ── */}
        <div className="fcc-detail-panel">
          {!selectedLesson ? (
            /* ── Empty state ── */
            <div className="fcc-empty-detail">
              <FileText size={32} />
              <h3>Select a lesson</h3>
              <p>
                Choose a lesson from the module tree to view and edit its
                content.
              </p>
            </div>
          ) : !editing ? (
            /* ── Read-only view ── */
            <div className="fcc-lesson-detail">
              <div className="fcc-detail-header">
                <div>
                  <h2>{selectedLesson.title}</h2>
                  <div className="fcc-detail-header-sub">
                    Module: {course.modules?.find((m) => m.id === selectedModuleId)?.title || '--'}
                  </div>
                </div>
                <button className="fcc-edit-btn" onClick={startEditing}>
                  <Edit3 size={14} />
                  Edit Lesson
                </button>
              </div>

              <div className="fcc-detail-fields">
                {/* Duration */}
                <div className="fcc-field">
                  <label>Duration</label>
                  <span className="fcc-field-value">
                    {selectedLesson.duration || '30 min'}
                  </span>
                </div>

                {/* Status */}
                <div className="fcc-field">
                  <label>Content Status</label>
                  <span className="fcc-field-value">
                    {selectedLesson.content
                      ? '✅ Has content'
                      : '⬜ No content yet'}
                  </span>
                </div>

                {/* Description */}
                <div className="fcc-field fcc-field-full">
                  <label>Description</label>
                  <span className="fcc-field-value">
                    {selectedLesson.description || (
                      <span className="fcc-muted">No description</span>
                    )}
                  </span>
                </div>

                {/* Content */}
                <div className="fcc-field fcc-field-full">
                  <label>Content</label>
                  {selectedLesson.content ? (
                    <div className="fcc-content-preview">
                      {selectedLesson.content}
                    </div>
                  ) : (
                    <span className="fcc-field-value fcc-muted">
                      No content added yet
                    </span>
                  )}
                </div>

                {/* Video URL */}
                <div className="fcc-field fcc-field-full">
                  <label>Video URL</label>
                  {selectedLesson.videoUrl ? (
                    <a
                      href={selectedLesson.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="fcc-video-link"
                    >
                      <Video size={13} />
                      {selectedLesson.videoUrl}
                      <ExternalLink size={11} />
                    </a>
                  ) : (
                    <span className="fcc-field-value fcc-muted">
                      No video linked
                    </span>
                  )}
                </div>

                {/* Resources */}
                <div className="fcc-field fcc-field-full">
                  <label>Resources</label>
                  {(selectedLesson.resources || []).length > 0 ? (
                    <ul className="fcc-resource-list">
                      {selectedLesson.resources.map((r, i) => (
                        <li key={i}>
                          <Link2 size={12} />
                          {r}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="fcc-field-value fcc-muted">
                      No resources
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* ── Edit form ── */
            <div className="fcc-lesson-edit">
              <div className="fcc-edit-header">
                <h2>
                  {editForm.title || 'Untitled'}
                  <span className="fcc-editing-badge">Editing</span>
                </h2>
                <div className="fcc-edit-actions">
                  <button className="fcc-save-btn" onClick={handleSave}>
                    <Save size={14} />
                    Save Changes
                  </button>
                  <button className="fcc-cancel-btn" onClick={cancelEditing}>
                    <X size={14} />
                    Cancel
                  </button>
                </div>
              </div>

              {saveMessage && (
                <div className={`fcc-message fcc-message-${saveMessage.type}`}>
                  <AlertCircle size={14} />
                  <span>{saveMessage.text}</span>
                </div>
              )}

              <div className="fcc-form">
                {/* Title + Duration */}
                <div className="fcc-form-row">
                  <div className="fcc-form-group">
                    <label htmlFor="fcc-title">Title</label>
                    <input
                      id="fcc-title"
                      type="text"
                      value={editForm.title}
                      onChange={(e) =>
                        updateFormField('title', e.target.value)
                      }
                      placeholder="Lesson title"
                    />
                  </div>
                  <div className="fcc-form-group">
                    <label htmlFor="fcc-duration">Duration</label>
                    <input
                      id="fcc-duration"
                      type="text"
                      value={editForm.duration}
                      onChange={(e) =>
                        updateFormField('duration', e.target.value)
                      }
                      placeholder="e.g. 30 min"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="fcc-form-group">
                  <label htmlFor="fcc-description">Description</label>
                  <textarea
                    id="fcc-description"
                    rows={2}
                    value={editForm.description}
                    onChange={(e) =>
                      updateFormField('description', e.target.value)
                    }
                    placeholder="Brief description of this lesson"
                  />
                </div>

                {/* Content */}
                <div className="fcc-form-group">
                  <label htmlFor="fcc-content">Content</label>
                  <textarea
                    id="fcc-content"
                    className="fcc-content-textarea"
                    rows={8}
                    value={editForm.content}
                    onChange={(e) =>
                      updateFormField('content', e.target.value)
                    }
                    placeholder="Lesson content (text, markdown, HTML…)"
                  />
                </div>

                {/* Video URL */}
                <div className="fcc-form-group">
                  <label htmlFor="fcc-video">Video URL</label>
                  <input
                    id="fcc-video"
                    type="url"
                    value={editForm.videoUrl}
                    onChange={(e) =>
                      updateFormField('videoUrl', e.target.value)
                    }
                    placeholder="https://…"
                  />
                </div>

                {/* Resources */}
                <div className="fcc-form-group">
                  <label>Resources</label>
                  <div className="fcc-resources-list-edit">
                    {(editForm.resources || []).map((r, i) => (
                      <div key={i} className="fcc-resource-row">
                        <input
                          type="text"
                          value={r}
                          onChange={(e) => updateResource(i, e.target.value)}
                          placeholder="Resource URL or name"
                        />
                        <button
                          className="fcc-resource-remove"
                          onClick={() => removeResource(i)}
                          title="Remove resource"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button className="fcc-add-resource" onClick={addResource}>
                    <Plus size={13} />
                    Add Resource
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
