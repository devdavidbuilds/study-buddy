const axios = require("axios");
const wandbox = require("./wandboxService");

// ==============================
// Judge0 Language ID Mapping
// ==============================
const LANGUAGE_MAP = {
  c: 50,       // C (GCC 9.2.0)
  cpp: 54,     // C++ (GCC 9.2.0)
  python: 71,  // Python (3.8.1)
};

// ==============================
// Judge0 Status Codes
// ==============================
const STATUS = {
  IN_QUEUE: 1,
  PROCESSING: 2,
  ACCEPTED: 3,
  WRONG_ANSWER: 4,
  TIME_LIMIT: 5,
  COMPILATION_ERROR: 6,
  RUNTIME_SIGSEGV: 7,
  RUNTIME_SIGXFSZ: 8,
  RUNTIME_SIGFPE: 9,
  RUNTIME_SIGABRT: 10,
  RUNTIME_NZEC: 11,
  RUNTIME_OTHER: 12,
  INTERNAL_ERROR: 13,
  EXEC_FORMAT_ERROR: 14,
};

const RUNTIME_STATUSES = [
  STATUS.RUNTIME_SIGSEGV,
  STATUS.RUNTIME_SIGXFSZ,
  STATUS.RUNTIME_SIGFPE,
  STATUS.RUNTIME_SIGABRT,
  STATUS.RUNTIME_NZEC,
  STATUS.RUNTIME_OTHER,
];

// ==============================
// API Configuration
// ==============================
function getApiConfig() {
  const apiUrl = process.env.JUDGE0_API_URL || "https://judge0-ce.p.rapidapi.com";
  const apiKey = process.env.JUDGE0_API_KEY || "";

  const headers = {
    "Content-Type": "application/json",
  };

  // If using RapidAPI hosted Judge0
  if (apiKey && apiUrl.includes("rapidapi.com")) {
    headers["X-RapidAPI-Key"] = apiKey;
    headers["X-RapidAPI-Host"] = "judge0-ce.p.rapidapi.com";
  }
  // If using self-hosted Judge0 with auth token
  else if (apiKey) {
    headers["X-Auth-Token"] = apiKey;
  }

  return { apiUrl, headers, isConfigured: !!apiKey };
}

// ==============================
// Execute Single Code Submission
// ==============================
async function executeCode(code, language, stdin = "") {
  const { apiUrl, headers, isConfigured } = getApiConfig();

  // No Judge0 key: run on the free Wandbox service instead.
  if (!isConfigured) {
    return wandbox.executeCode(code, language, stdin);
  }

  const languageId = LANGUAGE_MAP[language];
  if (!languageId) {
    return {
      success: false,
      error: `Unsupported language: ${language}`,
    };
  }

  try {
    // Create submission
    const createResponse = await axios.post(
      `${apiUrl}/submissions?base64_encoded=true&wait=false`,
      {
        source_code: Buffer.from(code).toString("base64"),
        language_id: languageId,
        stdin: Buffer.from(stdin).toString("base64"),
        cpu_time_limit: 5,
        memory_limit: 128000,
      },
      { headers, timeout: 10000 }
    );

    const token = createResponse.data.token;
    if (!token) {
      return { success: false, error: "Failed to create submission — no token returned." };
    }

    // Poll for result (max 30 seconds)
    const result = await pollSubmission(token, apiUrl, headers);
    return result;
  } catch (error) {
    console.error("Judge0 executeCode error:", error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Judge0 API request failed.",
      fallback: error.code === "ECONNREFUSED" || error.code === "ENOTFOUND",
    };
  }
}

// ==============================
// Poll Submission Until Complete
// ==============================
async function pollSubmission(token, apiUrl, headers, maxAttempts = 15) {
  for (let i = 0; i < maxAttempts; i++) {
    await delay(1000 + i * 500); // Progressive delay

    try {
      const response = await axios.get(
        `${apiUrl}/submissions/${token}?base64_encoded=true&fields=stdout,stderr,compile_output,status,time,memory,exit_code`,
        { headers, timeout: 10000 }
      );

      const data = response.data;

      // Still processing
      if (data.status?.id === STATUS.IN_QUEUE || data.status?.id === STATUS.PROCESSING) {
        continue;
      }

      // Decode base64 fields
      return {
        success: true,
        stdout: decodeBase64(data.stdout),
        stderr: decodeBase64(data.stderr),
        compileOutput: decodeBase64(data.compile_output),
        statusId: data.status?.id,
        statusDescription: data.status?.description,
        time: data.time ? parseFloat(data.time) * 1000 : null, // Convert to ms
        memory: data.memory ? (data.memory / 1024).toFixed(2) : null, // Convert to MB
        exitCode: data.exit_code,
      };
    } catch (error) {
      if (i === maxAttempts - 1) {
        return { success: false, error: "Polling timed out." };
      }
    }
  }

  return { success: false, error: "Execution timed out after polling." };
}

// ==============================
// Run Code Against Test Cases
// ==============================
async function runTestCases(code, language, testCases) {
  const results = [];
  let totalTime = 0;
  let maxMemory = 0;

  // The free fallback runner executes every case in one request (it
  // rate-limits bursts); Judge0 runs them in small parallel batches.
  let executions = [];
  if (usingFallback()) {
    executions = await wandbox.executeBatch(
      code,
      language,
      testCases.map((tc) => tc.input || "")
    );
  } else {
    for (let i = 0; i < testCases.length; i += 4) {
      const batch = testCases.slice(i, i + 4);
      executions.push(
        ...(await Promise.all(batch.map((tc) => executeCode(code, language, tc.input || ""))))
      );
    }
  }

  for (const [index, tc] of testCases.entries()) {
    const result = executions[index];

    if (!result.success) {
      // If it's a fallback signal, propagate
      if (result.fallback) return result;

      results.push({
        id: tc.id,
        input: tc.input,
        expected: tc.expected,
        actual: result.error || "Execution failed",
        passed: false,
        time: 0,
        memory: 0,
        status: "Error",
      });
      continue;
    }

    // Check for compilation error
    if (result.statusId === STATUS.COMPILATION_ERROR) {
      return {
        success: true,
        status: "Compilation Error",
        error: result.compileOutput || result.stderr || "Compilation failed.",
        results: [],
        time: null,
        memory: null,
      };
    }

    // Check for runtime error
    if (RUNTIME_STATUSES.includes(result.statusId)) {
      results.push({
        id: tc.id,
        input: tc.input,
        expected: tc.expected,
        actual: result.stderr || result.statusDescription || "Runtime Error",
        passed: false,
        time: result.time || 0,
        memory: result.memory || 0,
        status: "Runtime Error",
      });
      continue;
    }

    // Check for time limit exceeded
    if (result.statusId === STATUS.TIME_LIMIT) {
      results.push({
        id: tc.id,
        input: tc.input,
        expected: tc.expected,
        actual: "Time Limit Exceeded",
        passed: false,
        time: result.time || 5000,
        memory: result.memory || 0,
        status: "Time Limit Exceeded",
      });
      continue;
    }

    // Compare output
    const actualOutput = (result.stdout || "").trim();
    const expectedOutput = (tc.expected || "").trim();
    const passed = actualOutput === expectedOutput;

    if (result.time) totalTime += result.time;
    if (result.memory) maxMemory = Math.max(maxMemory, parseFloat(result.memory));

    results.push({
      id: tc.id,
      input: tc.input,
      expected: tc.expected,
      actual: actualOutput,
      passed,
      time: result.time || 0,
      memory: result.memory || 0,
      status: passed ? "Accepted" : "Wrong Answer",
    });
  }

  const allPassed = results.every((r) => r.passed);

  return {
    success: true,
    status: allPassed ? "All Test Cases Passed" : "Some Test Cases Failed",
    results,
    time: totalTime.toFixed(2),
    memory: maxMemory.toFixed(2),
  };
}

// ==============================
// Submit Code (Run + Hidden Test Cases)
// ==============================
async function submitSolution(code, language, visibleTestCases, hiddenTestCases = []) {
  const allTestCases = [...visibleTestCases, ...hiddenTestCases];
  const result = await runTestCases(code, language, allTestCases);

  if (!result.success) return result;
  if (result.status === "Compilation Error") {
    return { ...result, verdict: "Compilation Error" };
  }

  const passedCount = result.results.filter((r) => r.passed).length;
  const total = result.results.length;

  let verdict = "Accepted";
  if (passedCount < total) {
    const failedResult = result.results.find((r) => !r.passed);
    if (failedResult?.status === "Runtime Error") verdict = "Runtime Error";
    else if (failedResult?.status === "Time Limit Exceeded") verdict = "Time Limit Exceeded";
    else verdict = "Wrong Answer";
  }

  return {
    success: true,
    verdict,
    passedCount,
    total,
    time: result.time,
    memory: result.memory,
    results: result.results,
  };
}

// ==============================
// Check if Judge0 is Available
// ==============================
async function isAvailable() {
  const { apiUrl, headers, isConfigured } = getApiConfig();
  // Without a Judge0 key the Wandbox fallback is always used.
  if (!isConfigured) return true;

  try {
    await axios.get(`${apiUrl}/statuses`, { headers, timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

// ==============================
// Helpers
// ==============================
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function decodeBase64(str) {
  if (!str) return "";
  try {
    return Buffer.from(str, "base64").toString("utf-8");
  } catch {
    return str;
  }
}

const usingFallback = () => !getApiConfig().isConfigured;

module.exports = {
  executeCode,
  usingFallback,
  runTestCases,
  submitSolution,
  isAvailable,
  LANGUAGE_MAP,
};
