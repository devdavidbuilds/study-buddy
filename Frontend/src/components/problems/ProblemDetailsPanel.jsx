import { useState } from 'react';
import { Lightbulb, BookOpenCheck, Lock, Play } from 'lucide-react';
import { languageLabel } from '../../data/codeLabPrograms';

const diffClass = { Easy: 'diff-easy', Medium: 'diff-medium', Hard: 'diff-hard' };

export default function ProblemDetailsPanel({ problem, solved }) {
  const [tab, setTab] = useState('description');
  const [revealedHints, setRevealedHints] = useState(0);
  const [editorialUnlocked, setEditorialUnlocked] = useState(false);
  const isProgram = problem.kind === 'program';

  if (isProgram) {
    return (
      <aside className="codelab-details-panel">
        <div className="codelab-details-header">
          <h2>{problem.title}</h2>
          <div className="codelab-details-meta">
            <span className="codelab-diff-tag codelab-lang-tag">{languageLabel(problem.language)}</span>
            <span>Sample program</span>
            <span>{problem.category}</span>
          </div>
          <div className="codelab-tag-row">
            {problem.tags.map(t => <span key={t} className="codelab-tag">{t}</span>)}
          </div>
        </div>

        <div className="codelab-details-body">
          <p className="codelab-statement">{problem.statement}</p>

          <h4>How to use</h4>
          <p className="codelab-format-text">
            <Play size={12} /> Press <strong>Run</strong> to execute it. The printed result appears in the Output tab of the console.
            Edit the code freely — <strong>Reset</strong> restores the original.
          </p>

          {problem.sampleInput && (
            <>
              <h4>Sample input</h4>
              <p className="codelab-format-text">Pre-filled in the console's Input tab. Change it and run again.</p>
              <pre className="codelab-sample-input">{problem.sampleInput}</pre>
            </>
          )}

          {problem.language === 'python' && (
            <>
              <h4>Runs in your browser</h4>
              <p className="codelab-format-text">
                Python runs locally with Pyodide. Imported libraries (numpy, pandas, scikit-learn, scipy, sympy, matplotlib…)
                are downloaded automatically the first time, so the first run can take a little longer.
              </p>
            </>
          )}
        </div>
      </aside>
    );
  }

  return (
    <aside className="codelab-details-panel">
      <div className="codelab-details-header">
        <h2>{problem.title}</h2>
        <div className="codelab-details-meta">
          <span className={`codelab-diff-tag ${diffClass[problem.difficulty]}`}>{problem.difficulty}</span>
          <span>Acceptance: {problem.acceptance}%</span>
          <span>{problem.category}</span>
        </div>
        <div className="codelab-tag-row">
          {problem.tags.map(t => <span key={t} className="codelab-tag">{t}</span>)}
        </div>
      </div>

      <div className="codelab-details-tabs">
        <button className={tab === 'description' ? 'active' : ''} onClick={() => setTab('description')}>Description</button>
        <button className={tab === 'hints' ? 'active' : ''} onClick={() => setTab('hints')}>
          <Lightbulb size={13} /> Hints
        </button>
        <button className={tab === 'editorial' ? 'active' : ''} onClick={() => setTab('editorial')}>
          <BookOpenCheck size={13} /> Editorial
        </button>
      </div>

      <div className="codelab-details-body">
        {tab === 'description' && (
          <>
            <p className="codelab-statement">{problem.statement}</p>

            <h4>Constraints</h4>
            <ul className="codelab-constraints">
              {problem.constraints.map((c, i) => <li key={i}><code>{c}</code></li>)}
            </ul>

            <h4>Input Format</h4>
            <p className="codelab-format-text">{problem.inputFormat}</p>

            <h4>Output Format</h4>
            <p className="codelab-format-text">{problem.outputFormat}</p>

            <h4>Examples</h4>
            {problem.examples.map((ex, i) => (
              <div key={i} className="codelab-example">
                <div className="codelab-example-row"><strong>Input:</strong> <code>{ex.input}</code></div>
                <div className="codelab-example-row"><strong>Output:</strong> <code>{ex.output}</code></div>
                {ex.explanation && <div className="codelab-example-explain">{ex.explanation}</div>}
              </div>
            ))}
          </>
        )}

        {tab === 'hints' && (
          <div className="codelab-hints">
            {problem.hints.slice(0, revealedHints).map((hint, i) => (
              <div key={i} className="codelab-hint-card">
                <span className="codelab-hint-num">Hint {i + 1}</span>
                <p>{hint}</p>
              </div>
            ))}
            {revealedHints < problem.hints.length ? (
              <button className="btn btn-secondary btn-sm" onClick={() => setRevealedHints(n => n + 1)}>
                Reveal Hint {revealedHints + 1} / {problem.hints.length}
              </button>
            ) : (
              <p className="codelab-hints-done">You've unlocked every hint for this problem 🌸</p>
            )}
          </div>
        )}

        {tab === 'editorial' && (
          editorialUnlocked || solved ? (
            <div className="codelab-editorial">
              <h4>Approach</h4>
              <p>{problem.editorial.approach}</p>
              <h4>Complexity</h4>
              <p>{problem.editorial.complexity}</p>
            </div>
          ) : (
            <div className="codelab-editorial-locked">
              <Lock size={28} />
              <p>Try solving the problem first — the editorial reveals the full approach and can spoil the challenge.</p>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditorialUnlocked(true)}>Unlock anyway</button>
            </div>
          )
        )}
      </div>
    </aside>
  );
}
