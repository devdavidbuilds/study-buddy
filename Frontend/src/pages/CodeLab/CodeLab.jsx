import { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import ProblemSidebar from '../../components/problems/ProblemSidebar';
import ProblemDetailsPanel from '../../components/problems/ProblemDetailsPanel';
import CodeEditor from '../../components/editor/CodeEditor';
import EditorTabs from '../../components/editor/EditorTabs';
import EditorStatusBar from '../../components/editor/EditorStatusBar';
import ConsolePanel from '../../components/console/ConsolePanel';
import Toolbar from '../../components/codelab/Toolbar';
import AIPanel from '../../components/ai/AIPanel';
import CodeLabHeader from '../../components/layout/CodeLabHeader';
import { runCode, submitCode, checkCompilerStatus } from '../../services/compilerApi';
import { runPython, runPythonTestCases, canRunInteractively, stopPython } from '../../services/pythonRunner';
import {
  codeProblems,
  samplePrograms,
  codeLabLanguages as languages,
  getStarterCode,
} from '../../data/codeLabPrograms';
import '../../styles/codelab/codelab.css';

// v2: problems now read stdin and print; older drafts used function-only
// starters that produced no output, so they are not reloaded.
const DRAFTS_KEY = 'codelabCodeMap.v2';
const allItems = [...codeProblems, ...samplePrograms];

let nextTestId = 1000;
let nextScratchId = 1;

const pythonRuntimeNote = (installed = []) =>
  `Python ran in your browser (Pyodide).${installed.length ? `\nLibraries downloaded this run: ${installed.join(', ')}` : ''}`;

// The terminal keeps roughly this much text; older output is dropped.
const TERMINAL_MAX_CHARS = 200000;
const STOPPED = Symbol('stopped');
const EMPTY_TERMINAL = { segments: [], status: 'idle', title: 'terminal', images: [] };

// Keeps the newest `limit` characters of a segment list.
const trimSegments = (segments, limit) => {
  const kept = [];
  let room = limit;
  for (let i = segments.length - 1; i >= 0 && room > 0; i--) {
    const { kind, text } = segments[i];
    kept.unshift({ kind, text: text.length > room ? text.slice(-room) : text });
    room -= text.length;
  }
  return kept;
};

// Whether a program reads stdin (decides if C/C++ input is collected first).
const INPUT_PATTERNS = {
  python: /\binput\s*\(|sys\.stdin|stdin\.read/,
  c: /\b(scanf|getchar|fgets|gets|getline|fgetc|getc)\s*\(/,
  cpp: /\bcin\s*>>|\bgetline\s*\(|\b(scanf|getchar|fgets|gets)\s*\(/,
};
const readsInput = (code, language) => INPUT_PATTERNS[language]?.test(code) ?? false;

export default function CodeLab() {
  const [activeProblemId, setActiveProblemId] = useState(codeProblems[0].id);
  const [language, setLanguage] = useState('python');
  const [codeMap, setCodeMap] = useState({});
  const [scratchTabs, setScratchTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState('main');
  const [fontSize, setFontSize] = useState(14);
  const [cursor, setCursor] = useState({ line: 1, column: 1 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [consoleCollapsed, setConsoleCollapsed] = useState(false);

  // Load persisted editor drafts from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFTS_KEY);
      if (raw) setCodeMap(JSON.parse(raw));
    } catch {
      // ignore parse errors
    }
  }, []);

  // Persist editor drafts to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(DRAFTS_KEY, JSON.stringify(codeMap));
    } catch {
      // ignore storage errors
    }
  }, [codeMap]);

  const [testCasesByProblem, setTestCasesByProblem] = useState({});
  const [results, setResults] = useState(null);
  const [executionResult, setExecutionResult] = useState(null);
  const [compileOutput, setCompileOutput] = useState('');
  const [lastError, setLastError] = useState('');
  const [terminal, setTerminal] = useState(EMPTY_TERMINAL);
  const lineResolverRef = useRef(null);
  const presetLinesRef = useRef([]);
  const collectedRef = useRef([]);
  const [requestedTab, setRequestedTab] = useState(null);
  const [statusLine, setStatusLine] = useState('');
  const [logs, setLogs] = useState([]);
  const [customInput, setCustomInput] = useState('');
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [solvedIds, setSolvedIds] = useState([]);
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [recentIds, setRecentIds] = useState([codeProblems[0].id]);
  const [verdictBanner, setVerdictBanner] = useState(null);

  const shellRef = useRef(null);

  const problem = useMemo(
    () => allItems.find(p => p.id === activeProblemId) || codeProblems[0],
    [activeProblemId]
  );
  const isProgram = problem.kind === 'program';
  const activeLang = languages.find(l => l.id === language);
  const codeKey = `${activeProblemId}:${language}`;

  const testCases = testCasesByProblem[activeProblemId] ?? problem.defaultTestCases ?? [];

  const pushLog = useCallback((message) => {
    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), message }]);
  }, []);

  const showTab = (name) => setRequestedTab({ name, nonce: Date.now() });

  useEffect(() => {
    // Ensure starter code is present the first time a problem/language combo is opened
    setCodeMap(prev => (prev[codeKey] !== undefined ? prev : { ...prev, [codeKey]: getStarterCode(problem, language) }));
  }, [codeKey, problem, language]);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const result = await checkCompilerStatus();
        if (result?.judge0Available === false) {
          setStatusLine(result.message || 'Code runner unavailable.');
          pushLog(result.message || 'Code runner unavailable.');
        }
      } catch {
        setStatusLine('Checking compiler status failed.');
      }
    }
    fetchStatus();
  }, [pushLog]);

  const mainTabName = `${isProgram ? 'program' : 'solution'}${activeLang?.ext || '.txt'}`;
  const tabs = [{ id: 'main', name: mainTabName, dirty: false }, ...scratchTabs.map(t => ({ ...t, dirty: false }))];

  const activeTabContent = activeTabId === 'main' ? (codeMap[codeKey] ?? '') : (scratchTabs.find(t => t.id === activeTabId)?.content ?? '');
  const activeTabLanguage = activeTabId === 'main' ? activeLang?.monacoId : 'plaintext';
  const wordCount = activeTabContent.trim() ? activeTabContent.trim().split(/\s+/).length : 0;

  const handleEditorChange = (value) => {
    if (activeTabId === 'main') {
      setCodeMap(prev => ({ ...prev, [codeKey]: value }));
    } else {
      setScratchTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, content: value } : t));
    }
  };

  const clearRunState = () => {
    setResults(null);
    setExecutionResult(null);
    setCompileOutput('');
    setLastError('');
    setStatusLine('');
    setVerdictBanner(null);
  };

  const handleSelectProblem = (id) => {
    const item = allItems.find(p => p.id === id);
    setActiveProblemId(id);
    setActiveTabId('main');
    handleTerminalStop();
    clearRunState();
    setTerminal(EMPTY_TERMINAL);
    setLogs([]);
    if (item?.kind === 'program') {
      setLanguage(item.language);
      setCustomInput(item.sampleInput || '');
      showTab('Terminal');
    } else {
      setCustomInput('');
      showTab('Test Cases');
    }
    setRecentIds(prev => [id, ...prev.filter(p => p !== id)].slice(0, 8));
  };

  const handleAddScratchTab = () => {
    const id = `scratch-${nextScratchId++}`;
    setScratchTabs(prev => [...prev, { id, name: `notes-${nextScratchId - 1}.txt`, content: '' }]);
    setActiveTabId(id);
  };

  const handleCloseTab = (id) => {
    setScratchTabs(prev => prev.filter(t => t.id !== id));
    if (activeTabId === id) setActiveTabId('main');
  };

  const stageFn = useCallback((stage) => {
    setStatusLine(stage);
    pushLog(stage);
  }, [pushLog]);

  // ---- Terminal ----
  // segments are appended as the program prints; consecutive pieces of the
  // same kind are merged so long outputs stay a handful of DOM nodes.
  const appendTerminal = useCallback((kind, text) => {
    if (!text) return;
    setTerminal(prev => {
      const segments = prev.segments.slice();
      const last = segments[segments.length - 1];
      if (last && last.kind === kind) segments[segments.length - 1] = { kind, text: last.text + text };
      else segments.push({ kind, text });
      const size = segments.reduce((n, s) => n + s.text.length, 0);
      if (size > TERMINAL_MAX_CHARS) {
        segments.splice(0, segments.length, { kind: 'sys', text: '… earlier output trimmed …\n' }, ...trimSegments(segments, TERMINAL_MAX_CHARS / 2));
      }
      return { ...prev, segments };
    });
  }, []);

  // Starts a line of system text on a fresh line.
  const appendSystem = useCallback((text) => {
    setTerminal(prev => {
      const lastText = prev.segments[prev.segments.length - 1]?.text || '';
      const lead = lastText && !lastText.endsWith('\n') ? '\n' : '';
      return { ...prev, segments: [...prev.segments, { kind: 'sys', text: `${lead}${text}\n` }] };
    });
  }, []);

  const setTerminalStatus = (status) => setTerminal(prev => ({ ...prev, status }));

  // Resolves with one typed line ('text\n') or null for end of input. Lines
  // given up front (the Input tab) are typed for the student first.
  const readTerminalLine = useCallback(() => {
    const preset = presetLinesRef.current;
    if (preset.length) {
      const line = `${preset.shift()}\n`;
      appendTerminal('in', line);
      return Promise.resolve(line);
    }
    return new Promise((resolve) => {
      lineResolverRef.current = resolve;
      setTerminalStatus('waiting');
    });
  }, [appendTerminal]);

  const handleTerminalLine = (text) => {
    const resolve = lineResolverRef.current;
    if (!resolve) return;
    appendTerminal('in', `${text}\n`);
    if (terminal.status === 'collecting') {
      collectedRef.current.push(text);
      return;
    }
    lineResolverRef.current = null;
    setTerminalStatus('running');
    resolve(`${text}\n`);
  };

  const handleTerminalEnd = () => {
    const resolve = lineResolverRef.current;
    if (!resolve) return;
    lineResolverRef.current = null;
    setTerminalStatus('running');
    resolve(null);
  };

  const handleTerminalStop = () => {
    stopPython();
    if (lineResolverRef.current) {
      const resolve = lineResolverRef.current;
      lineResolverRef.current = null;
      resolve(STOPPED);
    }
  };

  // Every line until Ctrl+D, for runs that need all input before starting
  // (C/C++ run on the server in one go). Resolves null when stopped.
  const collectAllInput = () => new Promise((resolve) => {
    collectedRef.current = [];
    lineResolverRef.current = (value) => resolve(value === STOPPED ? null : collectedRef.current.join('\n'));
    setTerminalStatus('collecting');
  });

  const finishTerminal = useCallback((summary, images = []) => {
    appendSystem(summary);
    setTerminal(prev => ({ ...prev, status: 'done', images }));
  }, [appendSystem]);

  // Runs the program in the Terminal tab. Python runs in the browser and
  // reads input as the student types it. C/C++ run on the server in one
  // go, so their input is typed first and the program runs on Ctrl+D.
  const runInTerminal = useCallback(async (code, presetInput = '') => {
    stopPython();
    setRunning(true);
    clearRunState();
    showTab('Terminal');
    const fileName = `${isProgram ? 'program' : 'solution'}${activeLang?.ext || ''}`;
    const command = language === 'python' ? `python3 ${fileName}` : `./${fileName.replace(/\.\w+$/, '')}`;
    presetLinesRef.current = presetInput ? presetInput.replace(/\n$/, '').split('\n') : [];
    setTerminal({ segments: [{ kind: 'prompt', text: '$ ' }, { kind: 'cmd', text: `${command}\n` }], status: 'starting', title: `${fileName} — terminal`, images: [] });

    try {
      if (language === 'python') {
        const interactive = await canRunInteractively();
        let stdin = '';
        if (!interactive && readsInput(code, 'python') && !presetLinesRef.current.length) {
          appendSystem('This browser cannot pause the program for input, so type all of it first.');
          stdin = await collectAllInput();
          if (stdin === null) { finishTerminal('^C  Stopped.'); return; }
        } else if (!interactive) {
          stdin = presetLinesRef.current.join('\n');
          presetLinesRef.current.forEach(line => appendTerminal('in', `${line}\n`));
        }

        setTerminalStatus('running');
        const run = await runPython(code, stdin, {
          onStage: stageFn,
          ...(interactive && {
            onOutput: (text, stream) => appendTerminal(stream === 'stderr' ? 'err' : 'out', text),
            onInputRequest: async (sendLine) => {
              const line = await readTerminalLine();
              if (line === STOPPED) return;
              sendLine(line);
            },
          }),
        });

        // Only non-streamed runs collect stdout; streamed output is already shown.
        if (run.stdout) appendTerminal('out', `${run.stdout}\n`);
        if (run.error) appendTerminal('err', `${run.error}\n`);
        setLastError(run.error || '');
        setCompileOutput(pythonRuntimeNote(run.installed));
        if (run.installed?.length) pushLog(`Installed: ${run.installed.join(', ')}`);

        const status = run.stopped ? 'Stopped' : run.timedOut ? 'Time Limit Exceeded' : run.error ? 'Runtime Error' : 'Completed';
        setStatusLine(status);
        setExecutionResult({ status, time: run.time, memory: null, passedCount: 0, totalCount: 0 });
        finishTerminal(
          run.stopped ? '^C  Stopped.'
            : run.timedOut ? '[Process killed: time limit exceeded]'
              : `[Process ${run.error ? 'exited with an error' : 'finished'} in ${run.time} ms]`,
          run.images || [],
        );
        return;
      }

      let stdin = presetLinesRef.current.join('\n');
      if (presetLinesRef.current.length) {
        presetLinesRef.current.forEach(line => appendTerminal('in', `${line}\n`));
      } else if (readsInput(code, language)) {
        appendSystem('C/C++ runs on the server in one go: type all the input first, then press Ctrl+D to run.');
        stdin = await collectAllInput();
        if (stdin === null) { finishTerminal('^C  Stopped.'); return; }
      }

      setTerminalStatus('running');
      stageFn('Compiling and running on the server…');
      const res = await runCode({ code, language, customInput: stdin, onStage: stageFn });

      if (res.fallback || res.status === 'Error') {
        const message = res.error || res.message || 'Compiler service unavailable.';
        setLastError(message);
        setStatusLine('Run failed');
        appendTerminal('err', `${message}\n`);
        finishTerminal('[Run failed]');
        return;
      }

      setStatusLine(res.status);
      setCompileOutput(res.compileOutput || 'Compiled successfully.');
      if (res.status === 'Compilation Error') {
        const message = res.compileOutput || res.stderr || 'Compilation failed.';
        setLastError(message);
        appendTerminal('err', `${message.replace(/\n?$/, '\n')}`);
        finishTerminal('[Compilation failed]');
        return;
      }

      appendTerminal('out', res.stdout || '');
      if (res.stderr) appendTerminal('err', res.stderr.replace(/\n?$/, '\n'));
      const failed = res.status !== 'Accepted' && res.status !== 'Completed';
      setLastError(failed ? [res.status, res.stderr].filter(Boolean).join('\n') : res.stderr || '');
      setExecutionResult({ status: res.status, time: res.time, memory: res.memory, passedCount: 0, totalCount: 0 });
      finishTerminal(failed ? `[${res.status}]` : '[Process finished]');
    } catch (error) {
      setLastError(error.message || 'Execution failed.');
      setStatusLine('Execution failed');
      appendTerminal('err', `${error.message || 'Execution failed.'}\n`);
      finishTerminal('[Run failed]');
    } finally {
      lineResolverRef.current = null;
      setRunning(false);
    }
  }, [language, isProgram, activeLang, stageFn, pushLog, appendTerminal, appendSystem, finishTerminal, readTerminalLine]);

  const executeSubset = useCallback(async (subset, { isSubmit = false } = {}) => {
    const code = codeMap[codeKey] ?? getStarterCode(problem, language);
    setLastError('');

    if (isSubmit) {
      setSubmitting(true);
    } else {
      setRunning(true);
    }

    try {
      if (isSubmit) {
        const hiddenTestCases = problem.hiddenTestCases || [];
        const res = await submitCode({
          code,
          language,
          testCases: subset,
          hiddenTestCases,
          problemId: activeProblemId,
          onStage: stageFn,
        });

        setStatusLine(res.verdict || res.status);

        if (res.fallback || (!res.verdict && res.error)) {
          setLastError(res.error || res.message || 'Compiler service unavailable.');
          showTab('Error');
          return;
        }

        setVerdictBanner(res);

        if (res.results?.length) {
          const visibleResults = res.results.filter(r => subset.some(tc => tc.id === r.id));
          setResults(visibleResults);
        }

        if (res.verdict === 'Compilation Error' || res.status === 'Compilation Error') {
          setLastError(res.error || 'Compilation failed.');
          setCompileOutput(res.compileOutput || `error: ${res.error || 'Compilation failed.'}`);
          setExecutionResult(null);
          showTab('Error');
        } else {
          setCompileOutput(res.compileOutput || 'Compiled successfully.');
          setExecutionResult({
            status: res.verdict,
            time: res.time,
            memory: res.memory,
            passedCount: res.passedCount,
            totalCount: res.total,
          });
          if (res.verdict === 'Accepted') {
            setSolvedIds(prev => prev.includes(activeProblemId) ? prev : [...prev, activeProblemId]);
          }
          const failedRun = (res.results || []).find(r => r.status === 'Runtime Error' || r.status === 'Time Limit Exceeded');
          if (failedRun) {
            setLastError(`${failedRun.status}:\n${failedRun.actual}`);
            showTab('Error');
          }
        }

        return;
      }

      let res;
      if (language === 'python') {
        // Visible test cases run instantly in the browser.
        res = await runPythonTestCases(code, subset, { onStage: stageFn });
        setCompileOutput(pythonRuntimeNote());
      } else {
        stageFn('Compiling and running test cases on the server…');
        res = await runCode({ code, language, testCases: subset, onStage: stageFn });

        if (res.fallback || res.status === 'Error') {
          setLastError(res.error || res.message || 'Compiler service unavailable.');
          setStatusLine('Run failed');
          showTab('Error');
          return;
        }

        if (res.status === 'Compilation Error') {
          setStatusLine(res.status);
          setLastError(res.error || res.stderr || res.compileOutput || 'Compilation failed.');
          setCompileOutput(res.error || res.compileOutput || 'Compilation error detected.');
          setExecutionResult(null);
          showTab('Error');
          return;
        }
        setCompileOutput(res.compileOutput || 'Compiled successfully.');
      }

      setStatusLine(res.status);
      setResults(prev => {
        const merged = new Map((prev || []).map(r => [r.id, r]));
        (res.results || []).forEach(r => merged.set(r.id, r));
        return Array.from(merged.values());
      });
      const firstError = (res.results || []).find(r => r.status === 'Runtime Error' || r.status === 'Time Limit Exceeded');
      setLastError(firstError ? `Case ${firstError.id}: ${firstError.actual}` : '');
      setExecutionResult({
        status: res.status,
        time: res.time,
        memory: res.memory ?? null,
        passedCount: (res.results || []).filter(r => r.passed).length,
        totalCount: (res.results || []).length,
      });
      showTab('Test Cases');
    } catch (error) {
      setLastError(error.message || 'Execution failed.');
      setCompileOutput(error.message || 'Execution failed.');
      setStatusLine('Execution failed');
      setExecutionResult(null);
      showTab('Error');
    } finally {
      setRunning(false);
      setSubmitting(false);
    }
  }, [codeMap, codeKey, activeProblemId, language, problem, stageFn]);

  const currentCode = () => codeMap[codeKey] ?? getStarterCode(problem, language);

  const handleRun = () => {
    if (isProgram || testCases.length === 0) {
      runInTerminal(currentCode());
    } else {
      executeSubset(testCases);
    }
  };
  const handleSubmit = () => {
    if (isProgram) return;
    executeSubset(testCases, { isSubmit: true });
  };
  const handleRunOne = (id) => executeSubset(testCases.filter(tc => tc.id === id));
  const handleRunCustom = () => runInTerminal(currentCode(), customInput);

  const handleSave = () => {
    pushLog('Saved solution.');
    setStatusLine('Saved');
  };

  const handleResetCode = () => {
    setCodeMap(prev => ({ ...prev, [codeKey]: getStarterCode(problem, language) }));
    pushLog(isProgram ? 'Restored the original program.' : 'Reset code to starter template.');
  };

  const handleLoadSubmissionCode = (code, lang, problemId) => {
    const pid = problemId || activeProblemId;
    const langId = lang || language;
    const key = `${pid}:${langId}`;
    setActiveProblemId(pid);
    setLanguage(langId);
    setCodeMap(prev => ({ ...prev, [key]: code }));
    setActiveTabId('main');
    pushLog('Loaded submission into editor.');
  };

  const handleDownload = () => {
    const code = codeMap[codeKey] ?? '';
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${problem.id}${activeLang?.ext || '.txt'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUpload = (content) => {
    setCodeMap(prev => ({ ...prev, [codeKey]: content }));
    pushLog('Uploaded code from file.');
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      shellRef.current?.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const testCaseHandlers = {
    testCases,
    hiddenCount: (problem.hiddenTestCases || []).length,
    results,
    running,
    onAdd: () => setTestCasesByProblem(prev => ({
      ...prev,
      [activeProblemId]: [...testCases, { id: nextTestId++, input: '', expected: '' }],
    })),
    onDelete: (id) => setTestCasesByProblem(prev => ({
      ...prev,
      [activeProblemId]: testCases.filter(tc => tc.id !== id),
    })),
    onDuplicate: (id) => {
      const source = testCases.find(tc => tc.id === id);
      if (!source) return;
      setTestCasesByProblem(prev => ({
        ...prev,
        [activeProblemId]: [...testCases, { ...source, id: nextTestId++ }],
      }));
    },
    onUpdate: (id, patch) => setTestCasesByProblem(prev => ({
      ...prev,
      [activeProblemId]: testCases.map(tc => tc.id === id ? { ...tc, ...patch } : tc),
    })),
    onRunOne: handleRunOne,
    onRunAll: handleRun,
    onReset: () => {
      setTestCasesByProblem(prev => ({ ...prev, [activeProblemId]: problem.defaultTestCases }));
      setResults(null);
    },
  };

  return (
    <div className={`codelab-shell ${isFullscreen ? 'is-fullscreen' : ''}`} ref={shellRef}>
      {!isFullscreen && <CodeLabHeader />}

      <Toolbar
        language={language}
        onLanguageChange={setLanguage}
        onRun={handleRun}
        onSubmit={handleSubmit}
        onSave={handleSave}
        onReset={handleResetCode}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        onDownload={handleDownload}
        onUpload={handleUpload}
        aiOpen={aiOpen}
        onToggleAI={() => setAiOpen(o => !o)}
        running={running}
        submitting={submitting}
        submitDisabled={isProgram}
        fontSize={fontSize}
        onFontSizeChange={(delta) => setFontSize(f => Math.min(24, Math.max(10, f + delta)))}
      />

      {verdictBanner && (
        <div className={`codelab-verdict-banner ${verdictBanner.verdict === 'Accepted' ? 'accepted' : 'rejected'}`}>
          <strong>{verdictBanner.verdict}</strong>
          <span>
            {verdictBanner.passedCount}/{verdictBanner.total} test cases passed
            {verdictBanner.time ? ` • ${Math.round(verdictBanner.time)}ms` : ''}
            {verdictBanner.memory ? ` • ${verdictBanner.memory}MB` : ''}
          </span>
          <button onClick={() => setVerdictBanner(null)} aria-label="Dismiss">×</button>
        </div>
      )}

      <div className="codelab-body">
        <ProblemSidebar
          problems={codeProblems}
          programs={samplePrograms}
          activeProblemId={activeProblemId}
          onSelectProblem={handleSelectProblem}
          solvedIds={solvedIds}
          bookmarkedIds={bookmarkedIds}
          onToggleBookmark={(id) => setBookmarkedIds(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id])}
          recentIds={recentIds}
        />

        <div className="codelab-center">
          <EditorTabs
            tabs={tabs}
            activeTabId={activeTabId}
            onSelect={setActiveTabId}
            onClose={handleCloseTab}
            onAdd={handleAddScratchTab}
          />
          <div className="codelab-editor-wrap">
            <CodeEditor
              value={activeTabContent}
              language={activeTabLanguage}
              onChange={handleEditorChange}
              fontSize={fontSize}
              onCursorChange={setCursor}
              onRun={handleRun}
              onSave={handleSave}
            />
          </div>
          <EditorStatusBar
            language={activeLang?.label}
            cursor={cursor}
            wordCount={wordCount}
            fontSize={fontSize}
            onZoom={(delta) => setFontSize(f => Math.min(24, Math.max(10, f + delta)))}
          />
          <ConsolePanel
            collapsed={consoleCollapsed}
            onToggleCollapse={() => setConsoleCollapsed(c => !c)}
            customInput={customInput}
            onCustomInputChange={setCustomInput}
            onRunCustom={handleRunCustom}
            terminalProps={{
              session: terminal,
              onRun: () => runInTerminal(currentCode()),
              onSubmitLine: handleTerminalLine,
              onEndInput: handleTerminalEnd,
              onStop: handleTerminalStop,
              onClear: () => setTerminal(EMPTY_TERMINAL),
            }}
            lastError={lastError}
            executionResult={executionResult}
            compileOutput={compileOutput}
            logs={logs}
            statusLine={statusLine}
            running={running || submitting}
            testCaseProps={testCaseHandlers}
            onLoadSubmissionCode={handleLoadSubmissionCode}
            requestedTab={requestedTab}
          />
        </div>

        <ProblemDetailsPanel key={problem.id} problem={problem} solved={solvedIds.includes(problem.id)} />
      </div>

      <AIPanel open={aiOpen} onClose={() => setAiOpen(false)} problem={problem} lastError={lastError} />
    </div>
  );
}
