import { useState } from 'react';
import { HelpCircle, X, Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import { createDoubt } from '../../api/doubtApi';
import './AskDoubtModal.css';

export default function AskDoubtModal({
  isOpen,
  onClose,
  courseId,
  courseName,
  lessonTitle = '',
  onDoubtSubmitted,
}) {
  const [title, setTitle] = useState('');
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !question.trim()) {
      setError('Please provide both a title and details for your doubt.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await createDoubt({
        courseId,
        title: title.trim(),
        question: question.trim(),
        lessonTitle: lessonTitle.trim(),
      });
      setSuccess(true);
      setTimeout(() => {
        onDoubtSubmitted?.(res?.data?.data);
        setTitle('');
        setQuestion('');
        setSuccess(false);
        onClose();
      }, 1400);
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not submit doubt. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="adm-overlay animate-fade-in" onClick={onClose}>
      <div
        className="adm-modal animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="adm-header">
          <div className="adm-title-box">
            <div className="adm-icon-wrap">
              <HelpCircle size={20} />
            </div>
            <div>
              <h3>Ask the Faculty</h3>
              <p>Your question will be sent directly to the course instructor.</p>
            </div>
          </div>
          <button
            type="button"
            className="adm-close-btn"
            onClick={onClose}
            disabled={loading}
          >
            <X size={18} />
          </button>
        </div>

        {success ? (
          <div className="adm-success animate-fade-in">
            <CheckCircle2 size={48} className="adm-success-icon" />
            <h4>Doubt Submitted!</h4>
            <p>The instructor has been notified and will reply shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="adm-form">
            {error && (
              <div className="adm-error animate-shake">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="adm-field">
              <label>Course & Context</label>
              <div className="adm-context-tag">
                <strong>{courseName || 'This Course'}</strong>
                {lessonTitle && <span> • Lesson: {lessonTitle}</span>}
              </div>
            </div>

            <div className="adm-field">
              <label htmlFor="doubt-title">
                Question Title <span className="adm-required">*</span>
              </label>
              <input
                id="doubt-title"
                type="text"
                placeholder="e.g. What is the time complexity in this example?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                required
                disabled={loading}
              />
            </div>

            <div className="adm-field">
              <label htmlFor="doubt-desc">
                Details & Code (if any) <span className="adm-required">*</span>
              </label>
              <textarea
                id="doubt-desc"
                placeholder="Explain what part you are confused about, what you tried, or paste relevant code snippets..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={5}
                required
                disabled={loading}
              />
            </div>

            <div className="adm-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!title.trim() || !question.trim() || loading}
              >
                <Send size={15} />
                {loading ? 'Submitting…' : 'Submit Doubt'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
