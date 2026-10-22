// In-browser Python execution (Pyodide in a Web Worker). The worker is
// reused between runs; if a run exceeds the time limit (or the student
// stops it) the worker is terminated (the only way to stop a busy
// WebAssembly thread) and a new one is created on the next run.

const RUN_TIME_LIMIT_MS = 20000;
const STDIN_SW_URL = '/codelab-stdin-sw.js';

let worker = null;
let workerHasStdinRelay = false;
let nextId = 1;
let stopCurrent = null;

const resetWorker = () => {
  worker?.terminate();
  worker = null;
};

// The terminal's input relay (public/codelab-stdin-sw.js). A worker only
// goes through the service worker if the page was already controlled when
// the worker was created, so the worker is recreated once control arrives.
let relayReady = null;
const ensureStdinRelay = () => {
  if (!relayReady) {
    relayReady = (async () => {
      if (!('serviceWorker' in navigator)) return false;
      try {
        await navigator.serviceWorker.register(STDIN_SW_URL, { scope: '/' });
        if (!navigator.serviceWorker.controller) {
          await Promise.race([
            new Promise((resolve) => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true })),
            new Promise((resolve) => setTimeout(resolve, 4000)),
          ]);
        }
        return !!navigator.serviceWorker.controller;
      } catch {
        return false;
      }
    })();
  }
  return relayReady;
};

const getWorker = () => {
  const controlled = typeof navigator !== 'undefined' && !!navigator.serviceWorker?.controller;
  if (worker && controlled && !workerHasStdinRelay) resetWorker();
  if (!worker) {
    worker = new Worker(new URL('../workers/pyodideWorker.js', import.meta.url));
    workerHasStdinRelay = controlled;
  }
  return worker;
};

/** True when the page can relay typed input to a running Python program. */
export const canRunInteractively = ensureStdinRelay;

/** Stops the program that is currently running, if any. */
export const stopPython = () => stopCurrent?.();

/**
 * Run Python source with the given stdin.
 * Resolves { stdout, stderr, error, images, installed, time, timedOut, stopped }.
 * onStage receives progress messages (runtime/library download).
 *
 * Interactive mode (the terminal): pass onOutput(text, 'stdout' | 'stderr')
 * and onInputRequest(sendLine). Output is streamed instead of collected, and
 * every read of stdin calls onInputRequest; the caller answers with
 * sendLine('typed text\n') or sendLine(null) for end of input. Time spent
 * waiting for input does not count towards the time limit.
 */
export function runPython(code, stdin = '', { onStage, onOutput, onInputRequest } = {}) {
  const interactive = typeof onInputRequest === 'function';
  const id = nextId++;
  const runId = `${Date.now().toString(36)}-${id}`;
  const w = getWorker();

  return new Promise((resolve) => {
    let timer = null;
    let budget = RUN_TIME_LIMIT_MS;
    let resumedAt = 0;
    let done = false;

    const pauseClock = () => {
      if (!timer) return;
      clearTimeout(timer);
      timer = null;
      budget -= performance.now() - resumedAt;
    };

    const finish = (result) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      w.removeEventListener('message', onMessage);
      stopCurrent = null;
      resolve(result);
    };

    const kill = (fields) => {
      resetWorker();
      finish({ stdout: '', stderr: '', images: [], installed: [], time: RUN_TIME_LIMIT_MS - budget, timedOut: false, stopped: false, ...fields });
    };

    const startClock = () => {
      resumedAt = performance.now();
      timer = setTimeout(() => kill({
        error: `Time Limit Exceeded — the program ran longer than ${RUN_TIME_LIMIT_MS / 1000} seconds.`,
        timedOut: true,
      }), Math.max(budget, 0));
    };

    const sendLine = (text) => {
      if (done) return;
      navigator.serviceWorker?.controller?.postMessage({ type: 'codelab-stdin', runId, text });
      startClock();
    };

    stopCurrent = () => kill({ error: '', stopped: true });

    const onMessage = (event) => {
      const data = event.data;
      if (data.id !== id) return;

      if (data.type === 'stage') onStage?.(data.message);
      if (data.type === 'stdout' || data.type === 'stderr') onOutput?.(data.text, data.type);
      if (data.type === 'input-request') {
        pauseClock();
        onInputRequest?.(sendLine);
      }

      // The limit covers the program only, not the one-off runtime and
      // library downloads that happen before it starts.
      if (data.type === 'started') startClock();

      if (data.type === 'result') finish({ ...data, time: data.time, timedOut: false, stopped: false });
    };

    w.addEventListener('message', onMessage);
    w.postMessage({ id, code, stdin, interactive: interactive && workerHasStdinRelay, runId });
  });
}

/**
 * Run Python against stdin/expected test cases, mirroring the backend's
 * result shape so the Code Lab can render either source.
 */
export async function runPythonTestCases(code, testCases, { onStage } = {}) {
  const results = [];
  let totalTime = 0;

  for (const tc of testCases) {
    const run = await runPython(code, tc.input || '', { onStage });
    totalTime += run.time || 0;

    const actual = (run.stdout || '').trim();
    const expected = (tc.expected || '').trim();
    const failedStatus = run.timedOut ? 'Time Limit Exceeded' : run.error ? 'Runtime Error' : null;
    const passed = !failedStatus && actual === expected;

    results.push({
      id: tc.id,
      input: tc.input,
      expected: tc.expected,
      actual: failedStatus ? run.error : actual,
      passed,
      time: run.time || 0,
      memory: 0,
      status: failedStatus || (passed ? 'Accepted' : 'Wrong Answer'),
    });
  }

  return {
    status: results.every((r) => r.passed) ? 'All Test Cases Passed' : 'Some Test Cases Failed',
    results,
    time: totalTime,
  };
}
