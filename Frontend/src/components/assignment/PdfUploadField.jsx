import { useRef, useState } from 'react';
import { FileText, UploadCloud, X, Download, ExternalLink } from 'lucide-react';
import ProgressBar from '../ui/ProgressBar';
import { openSubmissionPdf, downloadSubmissionPdf } from '../../api/assignmentApi';

// Keep in sync with ASSIGNMENT_PDF_MAX_MB on the backend (server re-checks).
const MAX_PDF_MB = 10;

const formatFileSize = (bytes) => {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (value) => {
  if (!value) return '';
  try {
    return new Date(value).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return '';
  }
};

const validatePdf = (file) => {
  if (!file) return 'No file selected.';
  // Some systems report no type for PDFs; the extension is still required.
  const typeOk = !file.type || file.type === 'application/pdf' || file.type === 'application/x-pdf';
  if (!typeOk || !/\.pdf$/i.test(file.name)) return 'Only PDF files can be uploaded.';
  if (file.size === 0) return 'This file is empty.';
  if (file.size > MAX_PDF_MB * 1024 * 1024) return `The PDF is too large. The maximum size is ${MAX_PDF_MB} MB.`;
  return null;
};

// A submitted PDF: icon, name, size, upload date, open/download actions.
export function SubmittedPdf({ file, compact = false }) {
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  if (!file) return null;

  const run = (kind, action) => async () => {
    setBusy(kind);
    setError('');
    try {
      await action(file);
    } catch (err) {
      setError(
        err?.response?.status === 404
          ? 'This PDF is not available.'
          : 'Could not load the PDF. Please try again.'
      );
    } finally {
      setBusy('');
    }
  };

  return (
    <div className={`pdf-file-card ${compact ? 'compact' : ''}`}>
      <span className="pdf-file-icon" aria-hidden="true">
        <FileText size={18} />
        <span>PDF</span>
      </span>
      <div className="pdf-file-info">
        <span className="pdf-file-name" title={file.originalName}>{file.originalName || 'submission.pdf'}</span>
        <span className="pdf-file-meta">
          {formatFileSize(file.size)}
          {file.uploadedAt ? ` · Uploaded ${formatDate(file.uploadedAt)}` : ''}
        </span>
        {error && <span className="pdf-upload-error">{error}</span>}
      </div>
      <div className="pdf-file-actions">
        <button type="button" className="btn btn-ghost btn-sm" onClick={run('open', openSubmissionPdf)} disabled={Boolean(busy)}>
          <ExternalLink size={14} /> {busy === 'open' ? 'Opening…' : 'Open'}
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={run('download', downloadSubmissionPdf)} disabled={Boolean(busy)}>
          <Download size={14} /> {busy === 'download' ? 'Downloading…' : 'Download'}
        </button>
      </div>
    </div>
  );
}

// Drag-and-drop / file-picker field for one PDF.
// file: the newly chosen File (or null); progress: 0-100 while uploading.
export default function PdfUploadField({ file, onFileChange, progress = null, disabled = false, existingFile = null }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');

  const accept = (candidate) => {
    const problem = validatePdf(candidate);
    setError(problem || '');
    onFileChange(problem ? null : candidate);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    if (disabled) return;
    const files = Array.from(event.dataTransfer?.files || []);
    if (files.length > 1) {
      setError('Upload one PDF per submission.');
      return;
    }
    if (files[0]) accept(files[0]);
  };

  const openPicker = () => {
    if (!disabled) inputRef.current?.click();
  };

  return (
    <div className="pdf-upload">
      <label className="input-label">
        Attach PDF <span className="pdf-upload-optional">(optional, max {MAX_PDF_MB} MB)</span>
      </label>

      {existingFile && !file && (
        <div className="pdf-upload-current">
          <span className="pdf-upload-current-label">Submitted file</span>
          <SubmittedPdf file={existingFile} compact />
        </div>
      )}

      {file ? (
        <div className="pdf-file-card">
          <span className="pdf-file-icon" aria-hidden="true">
            <FileText size={18} />
            <span>PDF</span>
          </span>
          <div className="pdf-file-info">
            <span className="pdf-file-name" title={file.name}>{file.name}</span>
            <span className="pdf-file-meta">
              {formatFileSize(file.size)}
              {progress !== null ? ` · ${progress < 100 ? `Uploading ${progress}%` : 'Processing…'}` : ' · Ready to submit'}
            </span>
            {progress !== null && <ProgressBar value={progress} size="sm" className="pdf-upload-progress" />}
          </div>
          {progress === null && (
            <button
              type="button"
              className="pdf-file-remove"
              onClick={() => onFileChange(null)}
              disabled={disabled}
              aria-label="Remove selected PDF"
            >
              <X size={16} />
            </button>
          )}
        </div>
      ) : (
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          className={`pdf-dropzone ${dragging ? 'dragging' : ''} ${disabled ? 'disabled' : ''}`}
          onClick={openPicker}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              openPicker();
            }
          }}
          onDragOver={(event) => {
            event.preventDefault();
            if (!disabled) setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <UploadCloud size={22} />
          <span className="pdf-dropzone-title">
            {existingFile ? 'Drop a new PDF to replace it, or ' : 'Drag & drop your PDF here, or '}
            <span className="pdf-dropzone-link">browse</span>
          </span>
          <span className="pdf-dropzone-hint">PDF only · up to {MAX_PDF_MB} MB</span>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        hidden
        data-testid="pdf-file-input"
        onChange={(event) => {
          const chosen = event.target.files?.[0];
          if (chosen) accept(chosen);
          event.target.value = '';
        }}
      />

      {error && <p className="pdf-upload-error" role="alert">{error}</p>}
    </div>
  );
}
