import { useEffect, useRef, useState } from 'react';
import { Play, Square, Eraser } from 'lucide-react';

// A terminal-style view of one program run: output is shown as it is
// printed, and when the program reads input the student types it inline
// after the prompt. Enter sends the line, Ctrl+D ends input, Ctrl+C stops.
//
// session: { segments: [{ kind: 'out' | 'err' | 'in' | 'sys', text }],
//            status: 'idle' | 'starting' | 'running' | 'waiting' | 'collecting' | 'done',
//            title, images }
export default function Terminal({ session, onRun, onSubmitLine, onEndInput, onStop, onClear }) {
  const { segments = [], status = 'idle', title = 'terminal', images = [] } = session || {};
  const [draft, setDraft] = useState('');
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const bodyRef = useRef(null);
  const inputRef = useRef(null);

  const acceptsInput = status === 'waiting' || status === 'collecting';
  const busy = status === 'starting' || status === 'running' || acceptsInput;

  useEffect(() => {
    const body = bodyRef.current;
    if (body) body.scrollTop = body.scrollHeight;
  }, [segments, status, images.length]);

  useEffect(() => {
    if (acceptsInput) inputRef.current?.focus({ preventScroll: true });
  }, [acceptsInput]);

  const submit = () => {
    onSubmitLine(draft);
    if (draft.trim()) setHistory(h => [...h, draft].slice(-50));
    setHistoryIndex(-1);
    setDraft('');
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submit();
    } else if (e.ctrlKey && (e.key === 'd' || e.key === 'D')) {
      e.preventDefault();
      if (draft) submit();
      onEndInput();
    } else if (e.ctrlKey && (e.key === 'c' || e.key === 'C') && !window.getSelection()?.toString()) {
      e.preventDefault();
      onStop();
    } else if (e.key === 'ArrowUp' && history.length) {
      e.preventDefault();
      const i = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(i);
      setDraft(history[i]);
    } else if (e.key === 'ArrowDown' && historyIndex !== -1) {
      e.preventDefault();
      const i = historyIndex + 1;
      setHistoryIndex(i >= history.length ? -1 : i);
      setDraft(i >= history.length ? '' : history[i]);
    }
  };

  // Ctrl+C while the program runs but is not reading input.
  const onBodyKeyDown = (e) => {
    if (!acceptsInput && busy && e.ctrlKey && (e.key === 'c' || e.key === 'C') && !window.getSelection()?.toString()) {
      e.preventDefault();
      onStop();
    }
  };

  const focusInput = () => {
    if (acceptsInput && !window.getSelection()?.toString()) inputRef.current?.focus({ preventScroll: true });
  };

  return (
    <div className="codelab-terminal">
      <div className="codelab-terminal-bar">
        <span className="codelab-terminal-dots" aria-hidden="true"><i /><i /><i /></span>
        <span className="codelab-terminal-title">{title}</span>
        <div className="codelab-terminal-actions">
          {busy ? (
            <button onClick={onStop} title="Stop the program (Ctrl+C)"><Square size={11} /> Stop</button>
          ) : (
            <button onClick={onRun} title="Run the program in this terminal"><Play size={11} /> Run</button>
          )}
          <button onClick={onClear} disabled={busy} title="Clear the terminal"><Eraser size={11} /> Clear</button>
        </div>
      </div>

      <div
        className="codelab-terminal-body"
        ref={bodyRef}
        onClick={focusInput}
        onKeyDown={onBodyKeyDown}
        tabIndex={-1}
        role="log"
        aria-live="polite"
      >
        {status === 'idle' && segments.length === 0 ? (
          <span className="term-sys">
            Press Run to start your program. When it asks for input, type it here and press Enter.
          </span>
        ) : (
          segments.map((s, i) => <span key={i} className={`term-${s.kind}`}>{s.text}</span>)
        )}
        {acceptsInput && (
          <input
            ref={inputRef}
            className="codelab-terminal-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            style={{ width: `${Math.max(draft.length + 1, 2)}ch` }}
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            aria-label="Program input"
          />
        )}
        {(status === 'starting' || status === 'running') && <span className="codelab-terminal-cursor" aria-hidden="true" />}
        {images.map((src, i) => (
          <img key={i} className="codelab-output-image" src={`data:image/png;base64,${src}`} alt={`Plot ${i + 1}`} />
        ))}
      </div>

      {acceptsInput && (
        <div className="codelab-terminal-hint">
          <span>
            {status === 'collecting'
              ? 'Type every input line (Enter after each), then press Ctrl+D to run.'
              : 'Waiting for input: type and press Enter · Ctrl+D ends input · Ctrl+C stops'}
          </span>
          <button onClick={() => { if (draft) submit(); onEndInput(); }}>
            {status === 'collecting' ? 'Run with this input' : 'End input'}
          </button>
        </div>
      )}
    </div>
  );
}
