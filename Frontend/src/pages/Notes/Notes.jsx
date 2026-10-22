import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import Modal from '../../components/ui/Modal';
import PageState from '../../components/ui/PageState';
import { getNotes, createNote, updateNote, deleteNote } from '../../api/notesApi';
import { getRelativeTime } from '../../utils/helpers';

const swatches = ['#F8C8DC', '#C9B6E4', '#F4B3CE', '#5BB974', '#6FA8DC'];
const fieldStyle = { background: 'rgba(46,46,46,0.03)', border: '1px solid var(--border-color)' };

// Notes are saved to the user's account (GET/POST/PUT/DELETE /api/notes).
export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState(null); // note being edited, or null for a new note
  const [title, setTitle] = useState('');
  const [course, setCourse] = useState('');
  const [preview, setPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const loadNotes = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const res = await getNotes();
      setNotes(Array.isArray(res?.data?.data) ? res.data.data : []);
    } catch (err) {
      setLoadError(err?.response?.data?.message || 'Unable to load your notes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  const openNew = () => {
    setEditing(null);
    setTitle(''); setCourse(''); setPreview('');
    setFormError('');
    setIsOpen(true);
  };

  const openNote = (note) => {
    setEditing(note);
    setTitle(note.title); setCourse(note.course === 'General' ? '' : note.course); setPreview(note.content);
    setFormError('');
    setIsOpen(true);
  };

  const saveNote = async () => {
    if (!title.trim()) {
      setFormError('Please give the note a title.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const data = { title: title.trim(), course: course.trim() || 'General', content: preview };
      if (editing) {
        const res = await updateNote(editing._id, data);
        setNotes(prev => [res.data.data, ...prev.filter(n => n._id !== editing._id)]);
      } else {
        const res = await createNote({ ...data, color: swatches[notes.length % swatches.length] });
        setNotes(prev => [res.data.data, ...prev]);
      }
      setIsOpen(false);
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Could not save the note. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const removeNote = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await deleteNote(editing._id);
      setNotes(prev => prev.filter(n => n._id !== editing._id));
      setIsOpen(false);
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Could not delete the note.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageState title="Loading notes" message="Fetching your notes…" />;
  if (loadError) return <PageState type="error" title="Unable to load notes" message={loadError} onRetry={loadNotes} />;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Notes</h1>
          <p>{notes.length} {notes.length === 1 ? 'note' : 'notes'} across your courses</p>
        </div>
      </div>

      <div className="notes-page-grid">
        <button className="new-note-btn" onClick={openNew}>
          <Plus size={22} />
          <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>New Note</span>
        </button>

        {notes.map((note, i) => (
          <GlassCard key={note._id} hoverable onClick={() => openNote(note)} className={`note-page-card animate-fade-in-up stagger-${(i % 8) + 1}`}>
            <div className="note-color" style={{ background: note.color, height: 6, borderRadius: 6, marginBottom: 'var(--space-3)' }} />
            <h4 style={{ marginBottom: 'var(--space-2)' }}>{note.title}</h4>
            <p className="line-clamp-3" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>{note.content || 'No content yet — tap to start writing.'}</p>
            <div className="note-meta" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
              <span>{note.course}</span>
              <span>{getRelativeTime(note.updatedAt)}</span>
            </div>
          </GlassCard>
        ))}
      </div>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={editing ? 'Edit Note' : 'New Note'}
        footer={
          <>
            {editing && <button className="btn btn-ghost" onClick={removeNote} disabled={saving} style={{ marginRight: 'auto', color: 'var(--color-danger)' }}>Delete</button>}
            <button className="btn btn-ghost" onClick={() => setIsOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={saveNote} disabled={saving}>{saving ? 'Saving…' : 'Save Note'}</button>
          </>
        }
      >
        {formError && <p style={{ color: 'var(--color-danger)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-3)' }}>{formError}</p>}
        <div className="input-group" style={{ marginBottom: 'var(--space-4)' }}>
          <label className="input-label">Title</label>
          <input className="input-field" style={fieldStyle} value={title} maxLength={120} onChange={e => setTitle(e.target.value)} placeholder="e.g. Binary Search Trees" />
        </div>
        <div className="input-group" style={{ marginBottom: 'var(--space-4)' }}>
          <label className="input-label">Course</label>
          <input className="input-field" style={fieldStyle} value={course} maxLength={120} onChange={e => setCourse(e.target.value)} placeholder="e.g. HTML for Beginners" />
        </div>
        <div className="input-group">
          <label className="input-label">Content</label>
          <textarea className="input-field" style={{ ...fieldStyle, minHeight: 100 }} value={preview} maxLength={5000} onChange={e => setPreview(e.target.value)} placeholder="Start writing..." />
        </div>
      </Modal>
    </div>
  );
}
