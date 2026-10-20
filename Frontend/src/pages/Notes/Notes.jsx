import { useState } from 'react';
import { Plus } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import Modal from '../../components/ui/Modal';

const swatches = ['#F8C8DC', '#C9B6E4', '#F4B3CE', '#5BB974', '#6FA8DC'];

export default function Notes() {
  const [notes, setNotes] = useState([
    { id: 1, title: 'Binary Search Trees', course: 'DSA', updatedAt: 'Today', color: '#F8C8DC', preview: 'Remember the invariant for balanced trees.' },
    { id: 2, title: 'React Patterns', course: 'Frontend', updatedAt: 'Yesterday', color: '#C9B6E4', preview: 'Hooks simplify component state management.' },
  ]);
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [course, setCourse] = useState('');
  const [preview, setPreview] = useState('');

  const createNote = () => {
    if (!title.trim()) return;
    setNotes(prev => [
      { id: Date.now(), title, course: course || 'General', updatedAt: 'Just now', color: swatches[prev.length % swatches.length], preview: preview || 'No content yet — tap to start writing.' },
      ...prev,
    ]);
    setTitle(''); setCourse(''); setPreview('');
    setIsOpen(false);
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Notes</h1>
          <p>{notes.length} notes across your courses</p>
        </div>
      </div>

      <div className="notes-page-grid">
        <button className="new-note-btn" onClick={() => setIsOpen(true)}>
          <Plus size={22} />
          <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>New Note</span>
        </button>

        {notes.map((note, i) => (
          <GlassCard key={note.id} hoverable className={`note-page-card animate-fade-in-up stagger-${(i % 8) + 1}`}>
            <div className="note-color" style={{ background: note.color, height: 6, borderRadius: 6, marginBottom: 'var(--space-3)' }} />
            <h4 style={{ marginBottom: 'var(--space-2)' }}>{note.title}</h4>
            <p className="line-clamp-3" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>{note.preview}</p>
            <div className="note-meta" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
              <span>{note.course}</span>
              <span>{note.updatedAt}</span>
            </div>
          </GlassCard>
        ))}
      </div>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="New Note"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setIsOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={createNote}>Save Note</button>
          </>
        }
      >
        <div className="input-group" style={{ marginBottom: 'var(--space-4)' }}>
          <label className="input-label">Title</label>
          <input className="input-field" style={{ background: 'rgba(46,46,46,0.03)', border: '1px solid var(--border-color)' }} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Binary Search Trees" />
        </div>
        <div className="input-group" style={{ marginBottom: 'var(--space-4)' }}>
          <label className="input-label">Course</label>
          <input className="input-field" style={{ background: 'rgba(46,46,46,0.03)', border: '1px solid var(--border-color)' }} value={course} onChange={e => setCourse(e.target.value)} placeholder="e.g. DSA" />
        </div>
        <div className="input-group">
          <label className="input-label">Content</label>
          <textarea className="input-field" style={{ background: 'rgba(46,46,46,0.03)', border: '1px solid var(--border-color)', minHeight: 100 }} value={preview} onChange={e => setPreview(e.target.value)} placeholder="Start writing..." />
        </div>
      </Modal>
    </div>
  );
}
