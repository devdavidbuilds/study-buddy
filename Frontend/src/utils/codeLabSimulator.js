/* ========================================
   CODE LAB — EXECUTION SIMULATOR
   Mocks a compiler/judge backend (e.g. Judge0).
   Swap runCode()/submitCode() internals for real API calls later —
   the return shape is designed to match a typical judge response.
   ======================================== */

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const randomBetween = (min, max) => Math.round((min + Math.random() * (max - min)) * 100) / 100;

/**
 * Simulates compiling + running code against test cases.
 * onStage(stageLabel) is called as execution progresses so the UI can show live status.
 */
export async function runCode({ code, language, testCases, onStage }) {
  onStage?.('Saving...');
  await delay(300);

  onStage?.('Compiling...');
  await delay(500);

  // Very naive mock "compile error" detection so the demo feels responsive to obviously broken code.
  const trimmed = code.trim();
  if (!trimmed) {
    return {
      status: 'Compilation Error',
      error: 'error: empty source file — nothing to compile.',
      time: null,
      memory: null,
      results: [],
    };
  }
  if (language === 'cpp' && !trimmed.includes('main')) {
    return {
      status: 'Compilation Error',
      error: "error: undefined reference to 'main' — a C++ program requires a main() function.",
      time: null,
      memory: null,
      results: [],
    };
  }
  if (language === 'c' && !trimmed.includes('main')) {
    return {
      status: 'Compilation Error',
      error: "error: undefined reference to 'main' — a C program requires a main() function.",
      time: null,
      memory: null,
      results: [],
    };
  }
  if (language === 'python' && /def\s+\w+\(([^)]*$)/m.test(trimmed)) {
    return {
      status: 'Compilation Error',
      error: 'SyntaxError: unexpected EOF while parsing — check for unclosed parentheses.',
      time: null,
      memory: null,
      results: [],
    };
  }

  onStage?.('Running Test Cases...');
  await delay(600 + testCases.length * 150);

  // Mock pass/fail: weight toward passing so the demo feels encouraging, but keep it plausible.
  const results = testCases.map((tc) => {
    const passed = Math.random() > 0.18;
    return {
      id: tc.id,
      input: tc.input,
      expected: tc.expected,
      actual: passed ? tc.expected : mutateOutput(tc.expected),
      passed,
      time: randomBetween(2, 85),
    };
  });

  onStage?.('Execution Complete');
  await delay(200);

  const allPassed = results.every((r) => r.passed);

  return {
    status: allPassed ? 'All Test Cases Passed' : 'Some Test Cases Failed',
    error: null,
    time: randomBetween(4, 120),
    memory: randomBetween(6.2, 42.8),
    results,
  };
}

/**
 * Simulates submitting to an online judge.
 */
export async function submitCode({ code, language, testCases, onStage }) {
  const runResult = await runCode({ code, language, testCases, onStage });

  if (runResult.status === 'Compilation Error') {
    return { verdict: 'Compilation Error', ...runResult };
  }

  onStage?.('Judging Submission...');
  await delay(500);

  const passedCount = runResult.results.filter((r) => r.passed).length;
  const total = runResult.results.length;

  let verdict = 'Accepted';
  if (passedCount < total) {
    const roll = Math.random();
    if (roll < 0.55) verdict = 'Wrong Answer';
    else if (roll < 0.72) verdict = 'Time Limit Exceeded';
    else if (roll < 0.85) verdict = 'Runtime Error';
    else if (roll < 0.95) verdict = 'Memory Limit Exceeded';
    else verdict = 'Presentation Error';
  }

  return {
    verdict,
    passedCount,
    total,
    time: runResult.time,
    memory: runResult.memory,
    results: runResult.results,
  };
}

function mutateOutput(expected) {
  if (expected === 'true') return 'false';
  if (expected === 'false') return 'true';
  if (/^-?\d+$/.test(expected)) return String(Number(expected) + (Math.random() > 0.5 ? 1 : -1));
  return expected + ' ';
}
