import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  FolderOpen,
  FileText,
  Presentation,
  UploadCloud,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Download,
  Pencil,
  Trash2,
  Save,
  X,
  Hash,
} from 'lucide-react';
import { getMyFacultyCourses, getCourse } from '../../api/courseApi';
import {
  MAX_MATERIAL_MB,
  MATERIAL_ACCEPT,
  validateMaterialFile,
  getMyMaterials,
  uploadMaterial,
  updateMaterial,
  deleteMaterial,
  previewMaterial,
  downloadMaterial,
  formatFileSize,
  materialTypeLabel,
} from '../../api/materialApi';
import './FacultySubmissions.css';
import './FacultyLectureMaterials.css';

const formatDateTime = (value) => {
  if (!value) return '--';
  try {
    return new Date(value).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return '--';
  }
};

const errorMessage = (err, fallback) => err?.response?.data?.message || err?.message || fallback;

// Modules of one course, loaded on demand (the course list only carries counts).
function useCourseModules(courseId) {
  const [modules, setModules] = useState([]);
  useEffect(() => {
    let cancelled = false;
    setModules([]);
    if (!courseId) return undefined;
    getCourse(courseId)
      .then((res) => {
        const course = res?.data?.data ?? res?.data ?? null;
        if (!cancelled) setModules(Array.isArray(course?.modules) ? course.modules : []);
      })
      .catch(() => {
        if (!cancelled) setModules([]);
      });
    return () => {
      cancelled = true;
    };
  }, [courseId]);
  return modules;
}

function FilePicker({ file, onChange, disabled, label }) {
  const inputRef = useRef(null);
  return (
    <div className="flm-file-picker">
      <button type="button" className="fsub-cancel-btn" onClick={() => inputRef.current?.click()} disabled={disabled}>
        <UploadCloud size={14} /> {file ? 'Change file' : label}
      </button>
      <span className="flm-file-name">
        {file ? `${file.name} · ${formatFileSize(file.size)}` : `PDF, PPT or PPTX · up to ${MAX_MATERIAL_MB} MB`}
      </span>
      <input
        ref={inputRef}
        type="file"
        accept={MATERIAL_ACCEPT}
        hidden
        onChange={(event) => {
          onChange(event.target.files?.[0] || null);
          event.target.value = '';
        }}
      />
    </div>
  );
}

export default function FacultyLectureMaterials({ onBack }) {
  /* ── Data ── */
  const [courses, setCourses] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  /* ── Upload form ── */
  const [form, setForm] = useState({ courseId: '', moduleId: '', title: '', description: '' });
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);
  const formModules = useCourseModules(form.courseId);

  /* ── List filters ── */
  const [filterCourseId, setFilterCourseId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [rowError, setRowError] = useState(null);

  /* ── Edit modal ── */
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', moduleId: '' });
  const [editFile, setEditFile] = useState(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState(null);
  const editModules = useCourseModules(editing?.courseId);

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [coursesRes, materialsRes] = await Promise.all([getMyFacultyCourses(), getMyMaterials()]);
      setCourses(Array.isArray(coursesRes?.data?.data) ? coursesRes.data.data : []);
      setMaterials(Array.isArray(materialsRes?.data?.data) ? materialsRes.data.data : []);
    } catch (err) {
      setLoadError(errorMessage(err, 'Failed to load lecture materials'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredMaterials = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return materials.filter((m) => {
      if (filterCourseId !== 'all' && String(m.courseId) !== String(filterCourseId)) return false;
      if (!q) return true;
      return [m.title, m.description, m.courseName, m.courseCode, m.moduleTitle, m.file?.originalName]
        .some((value) => (value || '').toLowerCase().includes(q));
    });
  }, [materials, filterCourseId, searchQuery]);

  // Only courses that have materials are offered in the list filter.
  const coursesWithMaterials = useMemo(() => {
    const seen = new Map();
    materials.forEach((m) => seen.set(String(m.courseId), { _id: m.courseId, courseName: m.courseName, courseCode: m.courseCode }));
    return [...seen.values()];
  }, [materials]);

  /* ── Upload ── */
  const handleUpload = async (event) => {
    event.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    if (!form.courseId) return setFormError('Select a course.');
    if (form.title.trim().length < 3) return setFormError('Title must be at least 3 characters.');
    const fileProblem = validateMaterialFile(file);
    if (fileProblem) return setFormError(fileProblem);

    setUploadProgress(0);
    try {
      const res = await uploadMaterial(
        { ...form, title: form.title.trim(), description: form.description.trim() },
        file,
        { onUploadProgress: setUploadProgress }
      );
      const created = res?.data?.data;
      if (created) setMaterials((prev) => [created, ...prev]);
      setForm((prev) => ({ ...prev, moduleId: '', title: '', description: '' }));
      setFile(null);
      setFormSuccess(`Uploaded "${created?.title || 'material'}". Students can now see it.`);
    } catch (err) {
      setFormError(errorMessage(err, 'Upload failed'));
    } finally {
      setUploadProgress(null);
    }
  };

  /* ── Row actions ── */
  const runFileAction = async (action, material) => {
    setRowError(null);
    try {
      await action(material);
    } catch (err) {
      setRowError(err?.response?.status === 404 ? `"${material.title}" is no longer available.` : `Could not open "${material.title}".`);
    }
  };

  const handleDelete = async (material) => {
    if (!window.confirm(`Delete "${material.title}"? Students will no longer be able to access it.`)) return;
    setRowError(null);
    try {
      await deleteMaterial(material._id);
      setMaterials((prev) => prev.filter((m) => m._id !== material._id));
    } catch (err) {
      setRowError(errorMessage(err, 'Delete failed'));
    }
  };

  const openEdit = (material) => {
    setEditing(material);
    setEditForm({ title: material.title, description: material.description || '', moduleId: material.moduleId || '' });
    setEditFile(null);
    setEditError(null);
  };

  const handleSaveEdit = async () => {
    if (editForm.title.trim().length < 3) return setEditError('Title must be at least 3 characters.');
    if (editFile) {
      const fileProblem = validateMaterialFile(editFile);
      if (fileProblem) return setEditError(fileProblem);
    }
    setEditSaving(true);
    setEditError(null);
    try {
      const res = await updateMaterial(
        editing._id,
        { title: editForm.title.trim(), description: editForm.description.trim(), moduleId: editForm.moduleId },
        editFile
      );
      const updated = res?.data?.data;
      if (updated) setMaterials((prev) => prev.map((m) => (m._id === updated._id ? updated : m)));
      setEditing(null);
    } catch (err) {
      setEditError(errorMessage(err, 'Save failed'));
    } finally {
      setEditSaving(false);
    }
  };

  const uploading = uploadProgress !== null;

  return (
    <div className="fsub-root">
      {/* ── Page Header ── */}
      <div className="fsub-header">
        <button className="fsub-back-btn" onClick={onBack}>
          <ArrowLeft size={14} /> Back to Dashboard
        </button>
        <h1 className="fsub-page-title">
          <FolderOpen size={22} />
          Lecture Materials
        </h1>
        <p className="fsub-page-subtitle">
          Upload slides and notes (PDF, PPT, PPTX) for your courses. Students see them under the course&apos;s Lecture Materials tab.
        </p>
      </div>

      {/* ── Upload form ── */}
      <form className="flm-card" onSubmit={handleUpload}>
        <div className="flm-form-grid">
          <div className="flm-field">
            <label className="fsub-modal-section-label" htmlFor="flm-course">Course *</label>
            <select
              id="flm-course"
              className="fsub-select flm-input"
              value={form.courseId}
              onChange={(e) => setForm((prev) => ({ ...prev, courseId: e.target.value, moduleId: '' }))}
              disabled={uploading}
            >
              <option value="">Select a course…</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.courseCode ? `${c.courseCode} - ` : ''}{c.courseName}
                </option>
              ))}
            </select>
          </div>

          <div className="flm-field">
            <label className="fsub-modal-section-label" htmlFor="flm-module">Module / Unit (optional)</label>
            <select
              id="flm-module"
              className="fsub-select flm-input"
              value={form.moduleId}
              onChange={(e) => setForm((prev) => ({ ...prev, moduleId: e.target.value }))}
              disabled={uploading || !form.courseId}
            >
              <option value="">Whole course</option>
              {formModules.map((m) => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
            </select>
          </div>

          <div className="flm-field flm-field-wide">
            <label className="fsub-modal-section-label" htmlFor="flm-title">Title *</label>
            <input
              id="flm-title"
              className="fsub-search-input flm-input"
              maxLength={200}
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="e.g. Unit 1 — Introduction slides"
              disabled={uploading}
            />
          </div>

          <div className="flm-field flm-field-wide">
            <label className="fsub-modal-section-label" htmlFor="flm-description">Description</label>
            <textarea
              id="flm-description"
              rows={2}
              maxLength={2000}
              className="fsub-feedback-input"
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="What does this material cover?"
              disabled={uploading}
            />
          </div>
        </div>

        <div className="flm-form-footer">
          <FilePicker
            file={file}
            onChange={(chosen) => {
              setFormError(chosen ? validateMaterialFile(chosen) : null);
              setFile(chosen && !validateMaterialFile(chosen) ? chosen : null);
            }}
            disabled={uploading}
            label="Choose file"
          />
          <button type="submit" className="fsub-save-btn" disabled={uploading}>
            {uploading ? (
              <>
                <RefreshCw size={14} className="fsub-spin" /> {uploadProgress < 100 ? `Uploading ${uploadProgress}%` : 'Processing…'}
              </>
            ) : (
              <>
                <UploadCloud size={14} /> Upload Material
              </>
            )}
          </button>
        </div>

        {formError && (
          <div className="fsub-message fsub-message-error">
            <AlertCircle size={14} /> <span>{formError}</span>
          </div>
        )}
        {formSuccess && (
          <div className="fsub-message fsub-message-success">
            <CheckCircle2 size={14} /> <span>{formSuccess}</span>
          </div>
        )}
      </form>

      {/* ── Filter & Search ── */}
      <div className="fsub-filter-row">
        <div className="fsub-chips">
          <span className="fsub-chip active">
            <span>Uploaded</span>
            <span className="fsub-chip-count">{materials.length}</span>
          </span>
        </div>
        <div className="fsub-controls">
          <select
            className="fsub-select"
            value={filterCourseId}
            onChange={(e) => setFilterCourseId(e.target.value)}
            aria-label="Filter by course"
          >
            <option value="all">All Courses</option>
            {coursesWithMaterials.map((c) => (
              <option key={c._id} value={c._id}>
                {c.courseCode ? `${c.courseCode} - ` : ''}{c.courseName}
              </option>
            ))}
          </select>
          <div className="fsub-search-wrap">
            <Search size={14} className="fsub-search-icon" />
            <input
              type="text"
              className="fsub-search-input"
              placeholder="Search materials…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button type="button" className="fsub-retry-btn" onClick={load} title="Refresh">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {rowError && (
        <div className="fsub-message fsub-message-error" style={{ marginBottom: 'var(--space-3)' }}>
          <AlertCircle size={14} /> <span>{rowError}</span>
        </div>
      )}

      {/* ── Materials list ── */}
      {loading ? (
        <div className="fsub-loading-state">
          <div className="fsub-loader" />
          <p>Loading lecture materials…</p>
        </div>
      ) : loadError ? (
        <div className="fsub-error-state">
          <AlertCircle size={32} />
          <h3>Something went wrong</h3>
          <p>{loadError}</p>
          <button className="fsub-retry-btn" onClick={load}>
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div className="fsub-empty-state">
          <FolderOpen size={36} className="fsub-empty-icon" />
          <h3>No lecture materials found</h3>
          <p>
            {materials.length === 0
              ? 'Upload your first PDF or slide deck using the form above.'
              : 'No materials match your selected course or search.'}
          </p>
        </div>
      ) : (
        <div className="fsub-submission-list">
          {filteredMaterials.map((m) => {
            const isPdf = m.file?.kind === 'pdf';
            const Icon = isPdf ? FileText : Presentation;
            return (
              <div key={m._id} className="fsub-submission-row flm-row">
                <div className="fsub-col-assign">
                  <div className="fsub-assign-title" title={m.title}>{m.title}</div>
                  {m.description && <div className="fsub-assign-course" title={m.description}>{m.description}</div>}
                </div>

                <div className="fsub-col-assign">
                  <div className="fsub-assign-course" title={m.courseName}>
                    <span>{m.courseName}</span>
                    {m.courseCode && (
                      <span className="fsub-course-code">
                        <Hash size={10} /> {m.courseCode}
                      </span>
                    )}
                  </div>
                  <div className="fsub-assign-course">{m.moduleTitle || 'Whole course'}</div>
                </div>

                <div className="fsub-col-file">
                  <span className={`fsub-file-chip ${isPdf ? '' : 'flm-ppt-chip'}`} title={m.file?.originalName}>
                    <Icon size={12} />
                    <span>{materialTypeLabel(m.file?.kind)}</span>
                  </span>
                  <div className="fsub-file-size">{formatFileSize(m.file?.size)}</div>
                </div>

                <div className="fsub-col-dates">
                  <div className="fsub-date-item">{formatDateTime(m.createdAt)}</div>
                  <div className="fsub-date-item">by {m.uploadedBy?.fullName || 'Faculty'}</div>
                </div>

                <div className="flm-actions">
                  {isPdf && (
                    <button type="button" className="btn btn-ghost btn-sm" title="Preview" onClick={() => runFileAction(previewMaterial, m)}>
                      <ExternalLink size={14} />
                    </button>
                  )}
                  <button type="button" className="btn btn-ghost btn-sm" title="Download" onClick={() => runFileAction(downloadMaterial, m)}>
                    <Download size={14} />
                  </button>
                  {m.canManage && (
                    <>
                      <button type="button" className="btn btn-ghost btn-sm" title="Edit" onClick={() => openEdit(m)}>
                        <Pencil size={14} />
                      </button>
                      <button type="button" className="btn btn-ghost btn-sm flm-danger" title="Delete" onClick={() => handleDelete(m)}>
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══════════ Edit Modal ══════════ */}
      {editing && (
        <div className="modal-overlay" onClick={() => !editSaving && setEditing(null)}>
          <div className="modal-content fsub-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Lecture Material</h3>
              <button type="button" className="fsub-modal-close" onClick={() => setEditing(null)} aria-label="Close modal" disabled={editSaving}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="fsub-modal-meta">
                <div className="fsub-modal-meta-item">
                  <span className="fsub-modal-meta-label">Course</span>
                  <span>{editing.courseName} {editing.courseCode ? `(${editing.courseCode})` : ''}</span>
                </div>
                <div className="fsub-modal-meta-item">
                  <span className="fsub-modal-meta-label">Current file</span>
                  <span>{editing.file?.originalName} · {formatFileSize(editing.file?.size)}</span>
                </div>
              </div>

              <div className="fsub-modal-section">
                <label className="fsub-modal-section-label" htmlFor="flm-edit-title">Title</label>
                <input
                  id="flm-edit-title"
                  className="fsub-search-input flm-input"
                  maxLength={200}
                  value={editForm.title}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div className="fsub-modal-section">
                <label className="fsub-modal-section-label" htmlFor="flm-edit-description">Description</label>
                <textarea
                  id="flm-edit-description"
                  rows={3}
                  maxLength={2000}
                  className="fsub-feedback-input"
                  value={editForm.description}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="fsub-modal-section">
                <label className="fsub-modal-section-label" htmlFor="flm-edit-module">Module / Unit</label>
                <select
                  id="flm-edit-module"
                  className="fsub-select flm-input"
                  value={editForm.moduleId}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, moduleId: e.target.value }))}
                >
                  <option value="">Whole course</option>
                  {editForm.moduleId && !editModules.some((x) => x.id === editForm.moduleId) && (
                    <option value={editForm.moduleId}>{editing.moduleTitle || editForm.moduleId}</option>
                  )}
                  {editModules.map((x) => (
                    <option key={x.id} value={x.id}>{x.title}</option>
                  ))}
                </select>
              </div>

              <div className="fsub-modal-section">
                <label className="fsub-modal-section-label">Replace file (optional)</label>
                <FilePicker
                  file={editFile}
                  onChange={(chosen) => {
                    setEditError(chosen ? validateMaterialFile(chosen) : null);
                    setEditFile(chosen && !validateMaterialFile(chosen) ? chosen : null);
                  }}
                  disabled={editSaving}
                  label="Choose new file"
                />
              </div>

              {editError && (
                <div className="fsub-message fsub-message-error">
                  <AlertCircle size={14} /> <span>{editError}</span>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" className="fsub-cancel-btn" onClick={() => setEditing(null)} disabled={editSaving}>
                Cancel
              </button>
              <button type="button" className="fsub-save-btn" onClick={handleSaveEdit} disabled={editSaving}>
                {editSaving ? (
                  <>
                    <RefreshCw size={14} className="fsub-spin" /> Saving…
                  </>
                ) : (
                  <>
                    <Save size={14} /> Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
