// In-browser Python execution (Pyodide in a Web Worker). The worker is
// reused between runs; if a run exceeds the time limit the worker is
// terminated (the only way to stop a busy WebAssembly thread) and a new
// one is created on the next run.

const RUN_TIME_LIMIT_MS = 20000;

let worker = null;
let nextId = 1;

const getWorker = () => {
  if (!worker) {
    worker = new Worker(new URL('../workers/pyodideWorker.js', import.meta.url));
  }
  return worker;
};

const resetWorker = () => {
  worker?.terminate();
  worker = null;
};

/**
 * Run Python source with the given stdin.
 * Resolves { stdout, stderr, error, images, installed, time, timedOut }.
 * onStage receives progress messages (runtime/library download).
 */
export function runPython(code, stdin = '', { onStage } = {}) {
  const id = nextId++;
  const w = getWorker();

  return new Promise((resolve) => {
    let timer = null;

    const finish = (result) => {
      clearTimeout(timer);
      w.removeEventListener('message', onMessage);
      resolve(result);
    };

    const onMessage = (event) => {
      const data = event.data;
      if (data.id !== id) return;

      if (data.type === 'stage') onStage?.(data.message);

      // The limit covers the program only, not the one-off runtime and
      // library downloads that happen before it starts.
      if (data.type === 'started') {
        timer = setTimeout(() => {
          resetWorker();
          finish({
            stdout: '',
            stderr: '',
            error: `Time Limit Exceeded — the program ran longer than ${RUN_TIME_LIMIT_MS / 1000} seconds.`,
            images: [],
            installed: [],
            time: RUN_TIME_LIMIT_MS,
            timedOut: true,
          });
        }, RUN_TIME_LIMIT_MS);
      }

      if (data.type === 'result') finish({ ...data, timedOut: false });
    };

    w.addEventListener('message', onMessage);
    w.postMessage({ id, code, stdin });
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
