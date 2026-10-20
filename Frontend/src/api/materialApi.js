import API from './api';

// Keep in sync with LECTURE_MATERIAL_MAX_MB on the backend (server re-checks).
export const MAX_MATERIAL_MB = 25;
export const MATERIAL_ACCEPT = '.pdf,.ppt,.pptx,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation';

// Client-side check before uploading (type by extension, size).
export const validateMaterialFile = (file) => {
  if (!file) return 'Choose a file to upload.';
  if (!/\.(pdf|pptx?)$/i.test(file.name)) return 'Only PDF, PPT and PPTX files can be uploaded.';
  if (file.size === 0) return 'This file is empty.';
  if (file.size > MAX_MATERIAL_MB * 1024 * 1024) return `The file is too large. The maximum size is ${MAX_MATERIAL_MB} MB.`;
  return null;
};

// Students + course faculty: materials for a course (optionally one module)
export const getCourseMaterials = (courseId, params = {}) =>
  API.get(`/materials/course/${courseId}`, { params });

// Faculty: materials in courses they own (optional { courseId })
export const getMyMaterials = (params = {}) => API.get('/materials/mine', { params });

const toForm = (fields, file) => {
  const form = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) form.append(key, value);
  });
  if (file) form.append('file', file);
  return form;
};

const progressHandler = (onUploadProgress) => (event) => {
  if (onUploadProgress && event.total) onUploadProgress(Math.round((event.loaded / event.total) * 100));
};

// Faculty: upload { title, description, courseId, moduleId } + file
export const uploadMaterial = (fields, file, { onUploadProgress } = {}) =>
  API.post('/materials', toForm(fields, file), { onUploadProgress: progressHandler(onUploadProgress) });

// Faculty: edit { title, description, moduleId }; pass a file to replace it too
export const updateMaterial = (id, fields, file = null, { onUploadProgress } = {}) =>
  file
    ? API.put(`/materials/${id}`, toForm(fields, file), { onUploadProgress: progressHandler(onUploadProgress) })
    : API.put(`/materials/${id}`, fields);

export const deleteMaterial = (id) => API.delete(`/materials/${id}`);

// Files are served only with the auth header, so they are fetched as blobs.
const fetchMaterialFile = async (material, { download = false } = {}) => {
  const res = await API.get(`/materials/${material._id}/file`, {
    responseType: 'blob',
    params: download ? { download: 1 } : undefined,
  });
  return new Blob([res.data], { type: material.file?.mimeType || 'application/octet-stream' });
};

// PDFs: open in a new tab with the browser's own viewer.
export const previewMaterial = async (material) => {
  // Open the tab synchronously so pop-up blockers allow it, then load the file.
  const tab = window.open('', '_blank');
  try {
    const url = URL.createObjectURL(await fetchMaterialFile(material));
    if (tab) tab.location.href = url;
    else window.location.assign(url);
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch (err) {
    if (tab) tab.close();
    throw err;
  }
};

export const downloadMaterial = async (material) => {
  const url = URL.createObjectURL(await fetchMaterialFile(material, { download: true }));
  const link = document.createElement('a');
  link.href = url;
  link.download = material.file?.originalName || `material.${material.file?.kind || 'pdf'}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
};

export const formatFileSize = (bytes) => {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const materialTypeLabel = (kind) => ({ pdf: 'PDF', ppt: 'PPT', pptx: 'PPTX' }[kind] || 'File');
