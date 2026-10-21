import { useState, useMemo } from 'react';
import { Search, Bookmark, Star, Clock, CheckCircle2, Code2 } from 'lucide-react';
import { difficultyList } from '../../data/codeLabData';
import { languageLabel } from '../../data/codeLabPrograms';

const diffClass = { Easy: 'diff-easy', Medium: 'diff-medium', Hard: 'diff-hard' };

export default function ProblemSidebar({
  problems, programs = [], activeProblemId, onSelectProblem, solvedIds, bookmarkedIds, onToggleBookmark, recentIds,
}) {
  const [query, setQuery] = useState('');
  const [difficulty, setDifficulty] = useState('All');
  const [topic, setTopic] = useState('All');
  const [view, setView] = useState('all'); // all | programs | bookmarks | recent
  const isPrograms = view === 'programs';

  const filtered = useMemo(() => {
    let list = isPrograms ? programs : problems;
    if (view === 'bookmarks') list = [...problems, ...programs].filter(p => bookmarkedIds.includes(p.id));
    if (view === 'recent') list = [...problems, ...programs].filter(p => recentIds.includes(p.id));
    return list.filter(p => {
      const matchQuery = p.title.toLowerCase().includes(query.toLowerCase())
        || (p.tags || []).some(t => t.toLowerCase().includes(query.toLowerCase()));
      const matchDiff = isPrograms || difficulty === 'All' || p.difficulty === difficulty;
      const matchTopic = topic === 'All' || p.category === topic;
      return matchQuery && matchDiff && matchTopic;
    });
  }, [problems, programs, isPrograms, query, difficulty, topic, view, bookmarkedIds, recentIds]);

  // Derive unique categories from the list being shown
  const categories = useMemo(() => {
    const cats = [...new Set((isPrograms ? programs : problems).map(p => p.category))];
    return isPrograms ? cats : cats.sort();
  }, [problems, programs, isPrograms]);

  const changeView = (next) => {
    setView(next);
    setTopic('All');
  };

  return (
    <aside className="codelab-sidebar">
      <div className="codelab-sidebar-search">
        <Search size={15} />
        <input
          type="text"
          placeholder={isPrograms ? 'Search programs or libraries...' : 'Search problems...'}
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      <div className="codelab-view-tabs">
        <button className={view === 'all' ? 'active' : ''} onClick={() => changeView('all')}>Problems</button>
        <button className={isPrograms ? 'active' : ''} onClick={() => changeView('programs')}>
          <Code2 size={12} /> Programs
        </button>
        <button className={view === 'bookmarks' ? 'active' : ''} onClick={() => changeView('bookmarks')}>
          <Bookmark size={12} /> Saved
        </button>
        <button className={view === 'recent' ? 'active' : ''} onClick={() => changeView('recent')}>
          <Clock size={12} /> Recent
        </button>
      </div>

      {isPrograms && (
        <p className="codelab-programs-hint">
          Ready-to-run examples. Open one and press Run — Python programs download libraries like NumPy and scikit-learn into your browser.
        </p>
      )}

      {!isPrograms && (
      <div className="codelab-filter-group">
        <span className="codelab-filter-label">Difficulty</span>
        <div className="codelab-chip-row">
          <span className={`codelab-chip ${difficulty === 'All' ? 'active' : ''}`} onClick={() => setDifficulty('All')}>All</span>
          {difficultyList.map(d => (
            <span key={d} className={`codelab-chip ${diffClass[d]} ${difficulty === d ? 'active' : ''}`} onClick={() => setDifficulty(d)}>{d}</span>
          ))}
        </div>
      </div>
      )}

      <div className="codelab-filter-group">
        <span className="codelab-filter-label">{isPrograms ? 'Category' : 'Topic'}</span>
        <div className="codelab-chip-row">
          <span className={`codelab-chip ${topic === 'All' ? 'active' : ''}`} onClick={() => setTopic('All')}>All</span>
          {categories.map(c => (
            <span key={c} className={`codelab-chip ${topic === c ? 'active' : ''}`} onClick={() => setTopic(c)}>{c}</span>
          ))}
        </div>
      </div>

      <div className="codelab-problem-list">
        {filtered.map(p => (
          <div
            key={p.id}
            className={`codelab-problem-item ${p.id === activeProblemId ? 'active' : ''}`}
            onClick={() => onSelectProblem(p.id)}
          >
            <div className="codelab-problem-status">
              {p.kind === 'program'
                ? <Code2 size={15} className="program-icon" />
                : solvedIds.includes(p.id)
                  ? <CheckCircle2 size={15} className="solved-icon" />
                  : <span className="unsolved-dot" />}
            </div>
            <div className="codelab-problem-info">
              <span className="codelab-problem-title">{p.title}</span>
              <span className="codelab-problem-meta">
                {p.kind === 'program'
                  ? `${p.category} • ${(p.tags || []).slice(0, 2).join(', ')}`
                  : `${p.category} • ${p.acceptance}% acceptance`}
              </span>
            </div>
            <button
              className={`codelab-bookmark-btn ${bookmarkedIds.includes(p.id) ? 'active' : ''}`}
              onClick={(e) => { e.stopPropagation(); onToggleBookmark(p.id); }}
              aria-label="Toggle bookmark"
            >
              <Star size={13} fill={bookmarkedIds.includes(p.id) ? 'currentColor' : 'none'} />
            </button>
            {p.kind === 'program'
              ? <span className="codelab-diff-tag codelab-lang-tag">{languageLabel(p.language)}</span>
              : <span className={`codelab-diff-tag ${diffClass[p.difficulty]}`}>{p.difficulty}</span>}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="codelab-empty-list">{isPrograms ? 'No programs match your search.' : 'No problems match your filters.'}</div>
        )}
      </div>
    </aside>
  );
}
