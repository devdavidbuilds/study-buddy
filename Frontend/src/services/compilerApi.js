import { checkCompilerStatus as checkStatus, runCode as runCodeApi, submitCode as submitCodeApi } from '../api/compilerApi';

export async function runCode({ code, language, testCases, customInput, onStage }) {
  onStage?.('Preparing run payload...');
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
}

export async function submitCode({ code, language, testCases, hiddenTestCases = [], problemId, userId, onStage }) {
  onStage?.('Preparing submission...');
  const response = await submitCodeApi({ code, language, testCases, hiddenTestCases, problemId, userId });

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
}

export async function validateTestCases(testCases) {
  return Promise.resolve({ data: { ok: true, testCases } });
}

export async function checkCompilerStatus() {
  const response = await checkStatus();
  return response?.data ?? { judge0Available: false, message: 'Status request failed.' };
}
