const { GoogleGenAI, ApiError } = require("@google/genai");

// ==============================
// Google Gemini provider, using Google's official @google/genai SDK.
// Docs: https://ai.google.dev/gemini-api/docs
//
// The API key comes only from GEMINI_API_KEY (see services/llm/index.js) and
// is never logged or returned to clients.
// ==============================

const toGeminiContents = (messages) =>
  messages.map((message) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: String(message.content || "") }],
  }));

// Gemini 2.x models take a token budget; later models take a named level.
const THINKING_BUDGETS = { low: 1024, medium: 4096, high: -1 };
const thinkingConfigFor = (model, thinking) => {
  if (!thinking) return null;
  if (/^gemini-2\./.test(model)) return { thinkingBudget: THINKING_BUDGETS[thinking] ?? -1 };
  return { thinkingLevel: thinking.toUpperCase() };
};

// Normalize SDK/network errors into the shape the shared client expects:
// error.status, error.quotaExhausted, error.retryAfterMs, error.timeout.
const normalizeError = (error, timeoutMs) => {
  if (error?.name === "AbortError" || error?.name === "TimeoutError") {
    return Object.assign(new Error(`Gemini request timed out after ${Math.round(timeoutMs / 1000)}s.`), {
      code: "ETIMEDOUT",
      timeout: true,
    });
  }

  if (error instanceof ApiError || Number.isInteger(error?.status)) {
    const message = String(error.message || "");
    const normalized = Object.assign(new Error(message.slice(0, 500)), { status: error.status });
    // The SDK passes the timeout to Google as a server-side deadline, so a
    // slow model usually fails with 504 DEADLINE_EXCEEDED rather than a local abort.
    if (error.status === 504 || /DEADLINE_EXCEEDED/.test(message)) {
      normalized.timeout = true;
      normalized.code = "ETIMEDOUT";
    }
    // A 429 is only worth retrying for per-minute limits; a per-day quota
    // will not recover within the run.
    if (error.status === 429 && /PerDay/i.test(message)) normalized.quotaExhausted = true;
    const retry = message.match(/"retryDelay"\s*:\s*"([\d.]+)s"/);
    if (retry) normalized.retryAfterMs = Math.ceil(parseFloat(retry[1]) * 1000);
    return normalized;
  }

  return error;
};

// Google rejects server-side deadlines under 10 s (400 INVALID_ARGUMENT).
const MIN_TIMEOUT_MS = 10000;

const createGeminiProvider = ({ apiKey, model, timeoutMs: requestedTimeoutMs, thinking }) => {
  if (!apiKey) throw new Error("GEMINI_API_KEY is required for the gemini provider.");
  const timeoutMs = Math.max(Number(requestedTimeoutMs) || 60000, MIN_TIMEOUT_MS);

  // Retries are handled (and rate-limited) by the shared client in ../index.js,
  // so the SDK's own retries are turned off.
  const ai = new GoogleGenAI({ apiKey, httpOptions: { timeout: timeoutMs, retryOptions: { attempts: 1 } } });
  const thinkingConfig = thinkingConfigFor(model, thinking);

  const call = async ({ system, messages, maxOutputTokens, temperature, json }) => {
    let response;
    try {
      response = await ai.models.generateContent({
        model,
        contents: toGeminiContents(messages),
        config: {
          ...(system ? { systemInstruction: system } : {}),
          temperature,
          maxOutputTokens,
          ...(json ? { responseMimeType: "application/json" } : {}),
          ...(thinkingConfig ? { thinkingConfig } : {}),
          abortSignal: AbortSignal.timeout(timeoutMs),
        },
      });
    } catch (error) {
      throw normalizeError(error, timeoutMs);
    }

    const candidate = response?.candidates?.[0];
    const text = response?.text || "";

    if (!text) {
      const reason = candidate?.finishReason || response?.promptFeedback?.blockReason || "empty response";
      throw Object.assign(new Error(`Gemini returned no text (${reason}).`), { retryable: reason !== "SAFETY" });
    }

    if (candidate?.finishReason === "MAX_TOKENS") {
      throw Object.assign(new Error("Gemini response was truncated (MAX_TOKENS)."), { truncated: true });
    }

    const usage = response.usageMetadata || {};
    return {
      text,
      usage: {
        inputTokens: usage.promptTokenCount || 0,
        outputTokens: usage.candidatesTokenCount || 0,
      },
    };
  };

  return { name: "gemini", model, call };
};

module.exports = { createGeminiProvider };
