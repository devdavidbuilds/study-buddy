import { Plus, Copy, Trash2, Play, RotateCcw, Lock, CheckCircle2, XCircle } from 'lucide-react';

export default function TestCasePanel({
  testCases, hiddenCount, results, onAdd, onDelete, onDuplicate, onUpdate, onRunOne, onRunAll, onReset, running,
}) {
  return (
    <div className="codelab-testcases">
      <div className="codelab-testcases-toolbar">
        <button className="btn btn-ghost btn-sm" onClick={onAdd}><Plus size={14} /> Add Case</button>
        <button className="btn btn-ghost btn-sm" onClick={onReset}><RotateCcw size={14} /> Reset</button>
        <button className="btn btn-primary btn-sm" onClick={onRunAll} disabled={running}>
          <Play size={14} /> Run All
        </button>
      </div>

      <div className="codelab-testcases-list">
        {testCases.map((tc, i) => {
          const result = results?.find(r => r.id === tc.id);
          return (
            <div key={tc.id} className={`codelab-testcase-card ${result ? (result.passed ? 'passed' : 'failed') : ''}`}>
              <div className="codelab-testcase-head">
                <span>Case {i + 1}</span>
                <div className="codelab-testcase-actions">
                  {result && (result.passed
                    ? <CheckCircle2 size={14} className="tc-pass-icon" />
                    : <XCircle size={14} className="tc-fail-icon" />)}
                  <button onClick={() => onRunOne(tc.id)} title="Run this case" disabled={running}><Play size={12} /></button>
                  <button onClick={() => onDuplicate(tc.id)} title="Duplicate"><Copy size={12} /></button>
                  {!tc.locked && <button onClick={() => onDelete(tc.id)} title="Delete"><Trash2 size={12} /></button>}
                </div>
              </div>
              <label className="codelab-testcase-label">Input</label>
              <textarea
                value={tc.input}
                onChange={e => onUpdate(tc.id, { input: e.target.value })}
                rows={2}
              />
              <label className="codelab-testcase-label">Expected Output</label>
              <textarea
                value={tc.expected}
                onChange={e => onUpdate(tc.id, { expected: e.target.value })}
                rows={1}
              />
              {result && (
                <div className="codelab-testcase-result">
                  <span>Got: <code>{result.actual}</code></span>
                  <span>{result.time}ms</span>
                </div>
              )}
            </div>
          );
        })}

        {Array.from({ length: hiddenCount }).map((_, i) => (
          <div key={`hidden-${i}`} className="codelab-testcase-card locked">
            <div className="codelab-testcase-head">
              <span><Lock size={11} /> Hidden Case {i + 1}</span>
            </div>
            <p className="codelab-hidden-note">Hidden — evaluated only when you Submit.</p>
          </div>
        ))}
      </div>
    </div>
  );
}
