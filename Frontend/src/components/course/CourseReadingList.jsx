import { useMemo, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import './CourseExtras.css';

// Course reading list: books, research papers, documentation, standards
// and guides (course.references). Links open in a new tab.

const TYPES = {
  book: { icon: '📘', label: 'Books' },
  paper: { icon: '📄', label: 'Research papers' },
  documentation: { icon: '📚', label: 'Documentation' },
  standard: { icon: '📐', label: 'Standards' },
  guide: { icon: '🧭', label: 'Guides' },
};

export default function CourseReadingList({ references = [] }) {
  const [type, setType] = useState('all');
  const available = useMemo(() => Object.keys(TYPES).filter((t) => references.some((r) => r.type === t)), [references]);
  const shown = type === 'all' ? references : references.filter((r) => r.type === type);

  if (!references.length) {
    return <p className="cx-muted">No reading list has been added for this course yet.</p>;
  }

  return (
    <div>
      <p className="cx-ref-note" style={{ marginBottom: 'var(--space-4)' }}>
        Go deeper with books, research papers and official documentation chosen for this course.
        Items marked <span className="cx-tag free" style={{ marginLeft: 0 }}>Free</span> can be read online;
        {' '}<span className="cx-tag library" style={{ marginLeft: 0 }}>Library access</span> items are usually available through your college library.
      </p>

      <div className="cx-filters">
        <button className={`chip ${type === 'all' ? 'active' : ''}`} onClick={() => setType('all')}>
          All ({references.length})
        </button>
        {available.map((t) => (
          <button key={t} className={`chip ${type === t ? 'active' : ''}`} onClick={() => setType(t)}>
            {TYPES[t].icon} {TYPES[t].label} ({references.filter((r) => r.type === t).length})
          </button>
        ))}
      </div>

      {shown.map((r) => (
        <div key={r.url} className="cx-ref">
          <div className="cx-ref-icon">{TYPES[r.type]?.icon || '🔗'}</div>
          <div className="cx-ref-body">
            <a className="cx-ref-title" href={r.url} target="_blank" rel="noopener noreferrer">
              {r.title} <ExternalLink size={12} style={{ verticalAlign: 'middle' }} />
            </a>
            <span className={`cx-tag ${r.access}`}>{r.access === 'library' ? 'Library access' : 'Free'}</span>
            <div className="cx-ref-meta">
              {[r.authors, r.year, r.source].filter(Boolean).join(' · ')}
            </div>
            {r.note && <p className="cx-ref-note">{r.note}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
