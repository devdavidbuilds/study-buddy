import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import TestCasePanel from '../testcases/TestCasePanel';
import OutputSummary from '../output/OutputSummary';
import SubmissionHistory from '../codelab/SubmissionHistory';
import Terminal from './Terminal';

const TABS = ['Terminal', 'Input', 'Error', 'Execution', 'Test Cases', 'History', 'Logs', 'Compilation'];

export default function ConsolePanel({
  collapsed, onToggleCollapse,
  customInput, onCustomInputChange, onRunCustom,
  terminalProps, lastError, executionResult, compileOutput, logs,
  testCaseProps, statusLine, running,
  onLoadSubmissionCode, requestedTab,
}) {
  const [tab, setTab] = useState('Terminal');

  // Lets the page switch tabs (e.g. to Output after running a program).
  // requestedTab is { name, nonce } so the same tab can be requested twice.
  useEffect(() => {
    if (requestedTab?.name) setTab(requestedTab.name);
  }, [requestedTab]);

  return (
    <div className={`codelab-console ${collapsed ? 'collapsed' : ''}`}>
      <div className="codelab-console-header">
        <div className="codelab-console-tabs">
          {TABS.map(t => (
            <button key={t} className={tab === t ? 'active' : ''} onClick={() => { setTab(t); if (collapsed) onToggleCollapse(); }}>
              {t}
            </button>
          ))}
        </div>
        <div className="codelab-console-header-right">
          {statusLine && <span className="codelab-status-line">{statusLine}</span>}
          <button className="codelab-console-collapse" onClick={onToggleCollapse} aria-label="Toggle console">
            {collapsed ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="codelab-console-body">
          {tab === 'Input' && (
            <div className="codelab-console-pane">
              <p className="codelab-console-hint">Paste input here to feed it all at once. It is typed into the terminal for you; anything more the program asks for, you type yourself.</p>
              <textarea
                className="codelab-console-textarea"
                value={customInput}
                onChange={e => onCustomInputChange(e.target.value)}
                placeholder="Type custom input here..."
              />
              <button className="btn btn-primary btn-sm" onClick={onRunCustom} disabled={running}>
                {running ? 'Running...' : 'Run in terminal with this input'}
              </button>
            </div>
          )}

          {tab === 'Terminal' && <Terminal {...terminalProps} />}
 
          {tab === 'Error' && (
            <div className="codelab-console-pane">
              {running ? (
                <div className="codelab-skeleton-grid">
                  <div className="skeleton-line medium" />
                  <div className="skeleton-line" />
                </div>
              ) : (
                <pre className={`codelab-console-output ${lastError ? 'is-error' : ''}`}>
                  {lastError || 'No errors — nice and clean ✨'}
                </pre>
              )}
            </div>
          )}
 
          {tab === 'Execution' && (
            <div className="codelab-console-pane">
              {running ? (
                <div className="codelab-skeleton-grid">
                  <div className="skeleton-line" />
                  <div className="skeleton-line short" />
                  <div className="skeleton-line medium" />
                </div>
              ) : executionResult ? (
                <OutputSummary {...executionResult} />
              ) : (
                <p className="codelab-console-hint">Run your code to see execution stats here.</p>
              )}
            </div>
          )}

          {tab === 'Test Cases' && (
            <TestCasePanel {...testCaseProps} />
          )}

          {tab === 'History' && (
            <SubmissionHistory onLoadCode={onLoadSubmissionCode} />
          )}

          {tab === 'Logs' && (
            <div className="codelab-console-pane">
              <div className="codelab-logs">
                {logs.length === 0 && <p className="codelab-console-hint">No activity yet.</p>}
                {logs.map((l, i) => (
                  <div key={i} className="codelab-log-line">
                    <span className="codelab-log-time">{l.time}</span>
                    <span>{l.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'Compilation' && (
            <div className="codelab-console-pane">
              <pre className="codelab-console-output">{compileOutput || 'No compilation output yet — run your code first.'}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
