import { useState, useMemo } from 'react';
import { Search, Bookmark, Star, Clock, CheckCircle2 } from 'lucide-react';

const codeProblems = [
  { id: 1, title: 'Two Sum', category: 'Arrays', difficulty: 'Easy', acceptance: 92, tags: ['Hash Map'] },
  { id: 2, title: 'Longest Substring', category: 'Strings', difficulty: 'Medium', acceptance: 86, tags: ['Sliding Window'] },
  { id: 3, title: 'Binary Search', category: 'Algorithms', difficulty: 'Easy', acceptance: 90, tags: ['Binary Search'] },
];
const categoryList = ['All', 'Arrays', 'Strings', 'Algorithms'];
const difficultyList = ['Easy', 'Medium', 'Hard'];

const diffClass = { Easy: 'diff-easy', Medium: 'diff-medium', Hard: 'diff-hard' };

export default function ProblemSidebar({
  activeProblemId, onSelectProblem, solvedIds, bookmarkedIds, onToggleBookmark, recentIds,
}) {
  const [query, setQuery] = useState('');
  const [difficulty, setDifficulty] = useState('All');
  const [topic, setTopic] = useState('All');
  const [view, setView] = useState('all'); // all | bookmarks | recent

  const filtered = useMemo(() => {
    let list = codeProblems;
    if (view === 'bookmarks') list = list.filter(p => bookmarkedIds.includes(p.id));
    if (view === 'recent') list = list.filter(p => recentIds.includes(p.id));
    return list.filter(p => {
      const matchQuery = p.title.toLowerCase().includes(query.toLowerCase());
      const matchDiff = difficulty === 'All' || p.difficulty === difficulty;
      const matchTopic = topic === 'All' || p.category === topic;
      return matchQuery && matchDiff && matchTopic;
    });
  }, [query, difficulty, topic, view, bookmarkedIds, recentIds]);

  return (
    <aside className="codelab-sidebar">
      <div className="codelab-sidebar-search">
        <Search size={15} />
        <input
          type="text"
          placeholder="Search problems..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      <div className="codelab-view-tabs">
        <button className={view === 'all' ? 'active' : ''} onClick={() => setView('all')}>All</button>
        <button className={view === 'bookmarks' ? 'active' : ''} onClick={() => setView('bookmarks')}>
          <Bookmark size={12} /> Saved
        </button>
        <button className={view === 'recent' ? 'active' : ''} onClick={() => setView('recent')}>
          <Clock size={12} /> Recent
        </button>
      </div>

      <div className="codelab-filter-group">
        <span className="codelab-filter-label">Difficulty</span>
        <div className="codelab-chip-row">
          <span className={`codelab-chip ${difficulty === 'All' ? 'active' : ''}`} onClick={() => setDifficulty('All')}>All</span>
          {difficultyList.map(d => (
            <span key={d} className={`codelab-chip ${diffClass[d]} ${difficulty === d ? 'active' : ''}`} onClick={() => setDifficulty(d)}>{d}</span>
          ))}
        </div>
      </div>

      <div className="codelab-filter-group">
        <span className="codelab-filter-label">Topic</span>
        <div className="codelab-chip-row">
          <span className={`codelab-chip ${topic === 'All' ? 'active' : ''}`} onClick={() => setTopic('All')}>All</span>
          {categoryList.map(c => (
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
              {solvedIds.includes(p.id)
                ? <CheckCircle2 size={15} className="solved-icon" />
                : <span className="unsolved-dot" />}
            </div>
            <div className="codelab-problem-info">
              <span className="codelab-problem-title">{p.title}</span>
              <span className="codelab-problem-meta">{p.category} • {p.acceptance}% acceptance</span>
            </div>
            <button
              className={`codelab-bookmark-btn ${bookmarkedIds.includes(p.id) ? 'active' : ''}`}
              onClick={(e) => { e.stopPropagation(); onToggleBookmark(p.id); }}
              aria-label="Toggle bookmark"
            >
              <Star size={13} fill={bookmarkedIds.includes(p.id) ? 'currentColor' : 'none'} />
            </button>
            <span className={`codelab-diff-tag ${diffClass[p.difficulty]}`}>{p.difficulty}</span>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="codelab-empty-list">No problems match your filters.</div>
        )}
      </div>
    </aside>
  );
}
