import {
  checkCompilerStatus as checkStatus,
  runCode as runCodeApi,
  submitCode as submitCodeApi,
  getCompilerSubmissions as getSubmissionsApi,
} from '../api/compilerApi';

/**
 * Run code against test cases or custom input via the backend.
 * Returns a normalised result object regardless of backend response shape.
 */
export async function runCode({ code, language, testCases, customInput, onStage }) {
  onStage?.('Preparing run payload...');

  try {
    const response = await runCodeApi({ code, language, testCases, customInput });

    if (response?.data?.fallback) {
      return { fallback: true, message: response.data.message };
    }

    const payload = response?.data ?? {};
    return {
      status: payload.status || 'Completed',
      stdout: payload.stdout || '',
      stderr: payload.stderr || '',
      compileOutput: payload.compileOutput || '',
      time: payload.time ?? null,
      memory: payload.memory ?? null,
      exitCode: payload.exitCode ?? null,
      results: payload.results || [],
    };
  } catch (error) {
    const msg = error?.response?.data?.message || error.message || 'Execution failed.';
    const status = error?.response?.status;

    if (status === 404) throw new Error('Compiler endpoint not found. Is the backend running?');
    if (status >= 500) throw new Error('Backend server error — please try again.');
    if (error.code === 'ERR_NETWORK') throw new Error('Network error — cannot reach the backend.');
    throw new Error(msg);
  }
}

/**
 * Submit code for full judging (visible + hidden test cases).
 * Auth token is automatically attached by the Axios interceptor.
 * userId is derived from JWT on the backend — we do NOT send it from the frontend.
 */
export async function submitCode({ code, language, testCases, hiddenTestCases = [], problemId, onStage }) {
  onStage?.('Preparing submission...');

  try {
    const response = await submitCodeApi({ code, language, testCases, hiddenTestCases, problemId });

    if (response?.data?.fallback) {
      return { fallback: true, message: response.data.message };
    }

    const payload = response?.data ?? {};
    return {
      verdict: payload.verdict,
      status: payload.status || payload.verdict || 'Completed',
      error: payload.error || null,
      compileOutput: payload.compileOutput || '',
      stdout: payload.stdout || '',
      stderr: payload.stderr || '',
      time: payload.time ?? null,
      memory: payload.memory ?? null,
      passedCount: payload.passedCount ?? 0,
      total: payload.total ?? payload.results?.length ?? 0,
      results: payload.results || [],
    };
  } catch (error) {
    const msg = error?.response?.data?.message || error.message || 'Submission failed.';
    const status = error?.response?.status;

    if (status === 401) throw new Error('Authentication required. Please log in again.');
    if (status >= 500) throw new Error('Backend server error during submission.');
    if (error.code === 'ERR_NETWORK') throw new Error('Network error — cannot reach the backend.');
    throw new Error(msg);
  }
}

/**
 * Fetch submission history for the authenticated user.
 */
export async function getSubmissions() {
  try {
    const response = await getSubmissionsApi();
    return response?.data?.submissions || [];
  } catch (error) {
    const status = error?.response?.status;
    if (status === 401) return []; // Silently return empty if not authed
    console.error('Failed to fetch submissions:', error.message);
    return [];
  }
}

/**
 * Validate test cases (placeholder — currently resolved client-side).
 */
export async function validateTestCases(testCases) {
  return Promise.resolve({ data: { ok: true, testCases } });
}

/**
 * Check if the compiler (Judge0) is available.
 */
export async function checkCompilerStatus() {
  try {
    const response = await checkStatus();
    return response?.data ?? { judge0Available: false, message: 'Status request failed.' };
  } catch {
    return { judge0Available: false, message: 'Compiler status check failed.' };
  }
}
