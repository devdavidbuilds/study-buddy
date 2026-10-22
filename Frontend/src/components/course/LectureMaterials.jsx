import { useCallback, useEffect, useState } from 'react';
import { FileText, Presentation, Download, ExternalLink } from 'lucide-react';
import PageState from '../ui/PageState';
import {
  getCourseMaterials,
  previewMaterial,
  downloadMaterial,
  formatFileSize,
  materialTypeLabel,
} from '../../api/materialApi';

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : '');

// Lecture materials faculty uploaded for a course, with a module filter.
// PDFs can be previewed in the browser; PowerPoint files are downloaded
// (there is no in-app PowerPoint viewer).
export default function LectureMaterials({ courseId, modules = [], accentColor }) {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [busy, setBusy] = useState({}); // { [materialId]: 'preview' | 'download' }
  const [actionError, setActionError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getCourseMaterials(courseId);
      setMaterials(Array.isArray(res?.data?.data) ? res.data.data : []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load lecture materials.');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (courseId) load();
  }, [courseId, load]);

  const run = (material, kind, action) => async () => {
    setBusy((prev) => ({ ...prev, [material._id]: kind }));
    setActionError('');
    try {
      await action(material);
    } catch (err) {
      setActionError(
        err?.response?.status === 404
          ? `"${material.title}" is no longer available.`
          : err?.response?.status === 403
          ? 'Lecture materials open once your enrollment in this course is approved.'
          : `Could not ${kind === 'preview' ? 'open' : 'download'} "${material.title}". Please try again.`
      );
    } finally {
      setBusy((prev) => ({ ...prev, [material._id]: undefined }));
    }
  };

  if (loading) return <PageState title="Loading lecture materials" message="Fetching files from your faculty…" />;
  if (error) return <PageState type="error" title="Unable to load materials" message={error} onRetry={load} />;
  if (!materials.length) {
    return (
      <PageState
        type="empty"
        title="No lecture materials yet"
        message="Your faculty hasn't uploaded slides or notes for this course. Check back later."
      />
    );
  }

  // Only offer modules that actually have materials.
  const modulesWithMaterials = modules.filter((m) => materials.some((x) => x.moduleId === m.id));
  const hasGeneral = materials.some((x) => !x.moduleId);
  const visible =
    moduleFilter === 'all'
      ? materials
      : materials.filter((m) => (moduleFilter === 'general' ? !m.moduleId : m.moduleId === moduleFilter));

  return (
    <div>
      {(modulesWithMaterials.length > 0) && (
        <div className="assignments-filters" style={{ marginBottom: 'var(--space-3)' }}>
          <span className={`chip ${moduleFilter === 'all' ? 'active' : ''}`} onClick={() => setModuleFilter('all')}>
            All ({materials.length})
          </span>
          {hasGeneral && (
            <span className={`chip ${moduleFilter === 'general' ? 'active' : ''}`} onClick={() => setModuleFilter('general')}>
              Whole course
            </span>
          )}
          {modulesWithMaterials.map((m) => (
            <span key={m.id} className={`chip ${moduleFilter === m.id ? 'active' : ''}`} onClick={() => setModuleFilter(m.id)}>
              {m.title}
            </span>
          ))}
        </div>
      )}

      {actionError && <p className="pdf-upload-error" role="alert">{actionError}</p>}

      {visible.map((material) => {
        const isPdf = material.file?.kind === 'pdf';
        const Icon = isPdf ? FileText : Presentation;
        const state = busy[material._id];
        return (
          <div key={material._id} className="resource-row">
            <Icon size={20} style={{ color: accentColor, flexShrink: 0 }} />

            <div style={{ flex: 1, minWidth: 0 }}>
              <h5 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>{material.title}</h5>
              {material.description && (
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', margin: '2px 0' }}>
                  {material.description}
                </p>
              )}
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                {materialTypeLabel(material.file?.kind)} • {formatFileSize(material.file?.size)}
                {material.moduleTitle ? ` • ${material.moduleTitle}` : ''}
                {` • ${formatDate(material.createdAt)}`}
                {material.uploadedBy?.fullName ? ` • ${material.uploadedBy.fullName}` : ''}
              </span>
            </div>

            {isPdf && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={run(material, 'preview', previewMaterial)}
                disabled={Boolean(state)}
                title="Open in a new tab"
              >
                <ExternalLink size={14} /> {state === 'preview' ? 'Opening…' : 'Preview'}
              </button>
            )}
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={run(material, 'download', downloadMaterial)}
              disabled={Boolean(state)}
              title={`Download ${material.file?.originalName || ''}`}
            >
              <Download size={14} /> {state === 'download' ? 'Downloading…' : 'Download'}
            </button>
          </div>
        );
      })}

      {visible.length === 0 && (
        <PageState type="empty" title="Nothing for this module" message="Pick another module to see its materials." />
      )}
    </div>
  );
}
