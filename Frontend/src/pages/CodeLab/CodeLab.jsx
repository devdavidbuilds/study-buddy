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
import '../../styles/codelab/codelab.css';

const codeProblems = [
  { id: 1, title: 'Two Sum', category: 'Arrays', difficulty: 'Easy', acceptance: 92, tags: ['Hash Map'], statement: 'Given an array of integers and a target, return the indices of two numbers that add up to the target.', constraints: ['1 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9'], inputFormat: 'Line 1: n, target; Line 2: array values', outputFormat: 'Return the indices as a list.', examples: [{ input: '4 9\n2 7 11 15', output: '[0, 1]' }], hints: ['Think about using a hash map to remember seen values.'], editorial: { approach: 'Store complements in a map while iterating.', complexity: 'O(n) time and O(n) space.' } },
  { id: 2, title: 'Longest Substring', category: 'Strings', difficulty: 'Medium', acceptance: 86, tags: ['Sliding Window'], statement: 'Find the length of the longest substring without repeating characters.', constraints: ['0 <= s.length <= 5 * 10^4'], inputFormat: 'Line 1: a string', outputFormat: 'Return the length of the longest substring.', examples: [{ input: 'abcabcbb', output: '3' }], hints: ['Use a sliding window with a set or map.'], editorial: { approach: 'Move the left pointer when duplicates appear.', complexity: 'O(n) time and O(n) space.' } },
  { id: 3, title: 'Binary Search', category: 'Algorithms', difficulty: 'Easy', acceptance: 90, tags: ['Binary Search'], statement: 'Search for a target value in a sorted array.', constraints: ['1 <= nums.length <= 10^5'], inputFormat: 'Line 1: sorted array values; Line 2: target', outputFormat: 'Return the index or -1.', examples: [{ input: '[-1,0,3,5,9,12]\n9', output: '4' }], hints: ['Use the midpoint repeatedly.'], editorial: { approach: 'Halve the search interval each step.', complexity: 'O(log n) time and O(1) space.' } },
];
const languages = [
  { id: 'python', label: 'Python', ext: '.py', monacoId: 'python' },
  { id: 'cpp', label: 'C++', ext: '.cpp', monacoId: 'cpp' },
  { id: 'c', label: 'C', ext: '.c', monacoId: 'c' },
];
const getTemplate = (problemId, language) => {
  const templates = {
    1: { python: 'def two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        if target - num in seen:\n            return [seen[target - num], i]\n        seen[num] = i\n    return []\n', cpp: '#include <iostream>\n#include <vector>\n#include <unordered_map>\nusing namespace std;\nint main() { return 0; }\n', c: '#include <stdio.h>\nint main() { return 0; }\n' },
    2: { python: 'def length_of_longest_substring(s):\n    return len(s)\n', cpp: '#include <iostream>\n#include <string>\nusing namespace std;\nint main() { return 0; }\n', c: '#include <stdio.h>\nint main() { return 0; }\n' },
    3: { python: 'def search(nums, target):\n    return -1\n', cpp: '#include <iostream>\n#include <vector>\nusing namespace std;\nint main() { return 0; }\n', c: '#include <stdio.h>\nint main() { return 0; }\n' },
  };
  return templates[problemId]?.[language] || '';
};

const HIDDEN_COUNT = 6;
let nextTestId = 1000;
let nextScratchId = 1;

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

  const [testCasesByProblem, setTestCasesByProblem] = useState({});
  const [results, setResults] = useState(null);
  const [executionResult, setExecutionResult] = useState(null);
  const [compileOutput, setCompileOutput] = useState('');
  const [lastError, setLastError] = useState('');
  const [lastOutput, setLastOutput] = useState('');
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
    () => codeProblems.find(p => p.id === activeProblemId) || codeProblems[0],
    [activeProblemId]
  );
  const activeLang = languages.find(l => l.id === language);
  const codeKey = `${activeProblemId}:${language}`;

  const testCases = testCasesByProblem[activeProblemId] || problem.defaultTestCases;

  const pushLog = useCallback((message) => {
    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), message }]);
  }, []);

  useEffect(() => {
    // Ensure a template is present the first time a problem/language combo is opened
    setCodeMap(prev => (prev[codeKey] !== undefined ? prev : { ...prev, [codeKey]: getTemplate(activeProblemId, language) }));
  }, [codeKey, activeProblemId, language]);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const result = await checkCompilerStatus();
        if (result?.judge0Available === false) {
          setStatusLine(result.message || 'Judge0 not configured.');
          pushLog(result.message || 'Judge0 not configured.');
        }
      } catch {
        setStatusLine('Checking compiler status failed.');
      }
    }
    fetchStatus();
  }, [pushLog]);

  const mainTabName = `solution${activeLang?.ext || '.txt'}`;
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

  const handleSelectProblem = (id) => {
    setActiveProblemId(id);
    setActiveTabId('main');
    setResults(null);
    setExecutionResult(null);
    setCompileOutput('');
    setLastError('');
    setLastOutput('');
    setStatusLine('');
    setLogs([]);
    setVerdictBanner(null);
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

  const executeSubset = useCallback(async (subset, { isSubmit = false } = {}) => {
    const code = codeMap[codeKey] ?? getTemplate(activeProblemId, language);
    setLastError('');

    if (isSubmit) {
      setSubmitting(true);
    } else {
      setRunning(true);
    }

    const stageFn = (stage) => {
      setStatusLine(stage);
      pushLog(stage);
    };

    try {
      if (isSubmit) {
        const hiddenTestCases = problem.hiddenTestCases || [];
        const res = await submitCode({
          code,
          language,
          testCases: subset,
          hiddenTestCases,
          problemId: activeProblemId,
          userId: 'anonymous',
          onStage: stageFn,
        });

        setSubmitting(false);
        setStatusLine(res.verdict || res.status);
        setVerdictBanner(res);

        if (res.results?.length) {
          const visibleResults = res.results.filter(r => subset.some(tc => tc.id === r.id));
          setResults(visibleResults);
        }

        if (res.verdict === 'Compilation Error' || res.status === 'Compilation Error') {
          setLastError(res.error || 'Compilation failed.');
          setCompileOutput(res.compileOutput || `error: ${res.error || 'Compilation failed.'}`);
          setExecutionResult(null);
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
        }

        return;
      }

      const res = await runCode({
        code,
        language,
        testCases: subset,
        customInput: subset.length === 1 && subset[0].id === 'custom' ? customInput : undefined,
        onStage: stageFn,
      });

      setRunning(false);
      setStatusLine(res.status);

      if (res.fallback) {
        setCompileOutput('Compiler service is unavailable. Please try again later.');
        setLastError('Compiler service unavailable.');
        setExecutionResult(null);
        return;
      }

      if (res.status === 'Compilation Error') {
        setLastError(res.stderr || res.compileOutput || 'Compilation failed.');
        setCompileOutput(res.compileOutput || res.stderr || 'Compilation error detected.');
        setExecutionResult(null);
        return;
      }

      const mergedResults = subset[0]?.id === 'custom' ? [] : res.results;
      setResults(prev => {
        const merged = new Map((prev || []).map(r => [r.id, r]));
        (mergedResults || []).forEach(r => merged.set(r.id, r));
        return Array.from(merged.values());
      });
      setLastOutput(res.stdout || (res.results?.map(r => `Case ${r.id}: ${r.actual}`).join('\n')) || '');
      setCompileOutput(res.compileOutput || 'Compiled successfully.');
      setExecutionResult({
        status: res.status,
        time: res.time,
        memory: res.memory,
        passedCount: res.results ? res.results.filter(r => r.passed).length : 0,
        totalCount: res.results ? res.results.length : 0,
      });
    } catch (error) {
      setRunning(false);
      setSubmitting(false);
      setLastError(error.message || 'Execution failed.');
      setCompileOutput(error.message || 'Execution failed.');
      setStatusLine('Execution failed');
      setExecutionResult(null);
    }
  }, [codeMap, codeKey, activeProblemId, language, problem, customInput, pushLog]);

  const handleRun = () => executeSubset(testCases);
  const handleSubmit = () => executeSubset(testCases, { isSubmit: true });
  const handleRunOne = (id) => executeSubset(testCases.filter(tc => tc.id === id));
  const handleRunCustom = () => {
    const custom = { id: 'custom', input: customInput, expected: '' };
    executeSubset([custom]);
  };

  const handleSave = () => {
    pushLog('Saved solution.');
    setStatusLine('Saved');
  };

  const handleResetCode = () => {
    setCodeMap(prev => ({ ...prev, [codeKey]: getTemplate(activeProblemId, language) }));
    pushLog('Reset code to starter template.');
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
    hiddenCount: HIDDEN_COUNT,
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
        fontSize={fontSize}
        onFontSizeChange={(delta) => setFontSize(f => Math.min(24, Math.max(10, f + delta)))}
      />

      {verdictBanner && (
        <div className={`codelab-verdict-banner ${verdictBanner.verdict === 'Accepted' ? 'accepted' : 'rejected'}`}>
          <strong>{verdictBanner.verdict}</strong>
          <span>{verdictBanner.passedCount}/{verdictBanner.total} test cases passed • {verdictBanner.time}ms • {verdictBanner.memory}MB</span>
          <button onClick={() => setVerdictBanner(null)} aria-label="Dismiss">×</button>
        </div>
      )}

      <div className="codelab-body">
        <ProblemSidebar
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
            lastOutput={lastOutput}
            lastError={lastError}
            executionResult={executionResult}
            compileOutput={compileOutput}
            logs={logs}
            statusLine={statusLine}
            running={running || submitting}
            testCaseProps={testCaseHandlers}
          />
        </div>

        <ProblemDetailsPanel key={problem.id} problem={problem} solved={solvedIds.includes(problem.id)} />
      </div>

      <AIPanel open={aiOpen} onClose={() => setAiOpen(false)} problem={problem} lastError={lastError} />
    </div>
  );
}
