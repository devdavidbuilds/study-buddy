const { createGeminiProvider } = require("./providers/gemini");
const { createOpenAICompatibleProvider } = require("./providers/openaiCompatible");
const { createMockProvider } = require("./providers/mock");
const { parseJsonLoose } = require("./jsonUtil");

// ==============================
// Provider-agnostic LLM client shared by the AI Tutor and the course
// content pipeline.
//
// Configuration comes only from environment variables (never hardcoded):
//   LLM_PROVIDER   gemini | openai | mock | none
//                  (default: gemini when GEMINI_API_KEY is set, otherwise none)
//   GEMINI_API_KEY Gemini key — the only place the gemini provider reads its key
//   LLM_API_KEY    key for the openai-compatible provider (not needed for local Ollama / mock)
//   LLM_MODEL      model id, e.g. gemini-3.8-flash, llama-3.3-70b-versatile
//   LLM_BASE_URL   required for "openai" (Groq/OpenRouter/OpenAI/Ollama URL)
//   LLM_RPM        max requests per minute (client-side throttle, default 10)
//   LLM_THINKING   gemini thinking level: low | medium | high (unset = model default;
//                  "low" is much faster for tutoring and content writing)
//   LLM_TIMEOUT_MS request timeout (default 60000)
//   LLM_MAX_RETRIES retries for 429/5xx/network errors (default 4)
//
// A prefix lets one feature override another, e.g. CONTENT_LLM_MODEL or
// TUTOR_LLM_PROVIDER take precedence over the shared LLM_* values.
// ==============================

const DEFAULT_MODELS = {
  gemini: "gemini-flash-latest",
  openai: "llama-3.3-70b-versatile",
  mock: "mock",
};

const readEnv = (name, prefix, env) =>
  (prefix && env[`${prefix}_${name}`]) || env[`LLM_${name}`] || "";

const getLLMConfig = ({ prefix = "", env = process.env, overrides = {} } = {}) => {
  const geminiKey = String(env.GEMINI_API_KEY || "").trim();
  const provider = String(
    overrides.provider || readEnv("PROVIDER", prefix && `${prefix}_LLM`, env) || (geminiKey ? "gemini" : "none")
  )
    .trim()
    .toLowerCase();

  const pick = (name) => overrides[name.toLowerCase()] ?? readEnv(name, prefix && `${prefix}_LLM`, env);

  return {
    provider,
    // Gemini reads its key only from GEMINI_API_KEY; LLM_API_KEY is for the
    // openai-compatible provider.
    apiKey: provider === "gemini" ? overrides.api_key ?? geminiKey : pick("API_KEY"),
    model: pick("MODEL") || DEFAULT_MODELS[provider] || "",
    baseUrl: pick("BASE_URL"),
    rpm: Number(pick("RPM")) || 10,
    // Gemini thinking level: low | medium | high (unset = model default).
    thinking: String(pick("THINKING") || "").trim().toLowerCase(),
    timeoutMs: Number(pick("TIMEOUT_MS")) || 60000,
    maxRetries: Number.isFinite(Number(pick("MAX_RETRIES"))) && pick("MAX_RETRIES") !== ""
      ? Number(pick("MAX_RETRIES"))
      : 4,
  };
};

const isConfigured = (config) => {
  if (!config || config.provider === "none" || !config.provider) return false;
  if (config.provider === "mock") return true;
  if (config.provider === "gemini") return Boolean(config.apiKey);
  if (config.provider === "openai") return Boolean(config.baseUrl);
  return false;
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryable = (error, config = {}) => {
  if (error.truncated || error.quotaExhausted) return false;
  // Interactive callers (the AI Tutor) would rather fall back than wait twice.
  if (error.timeout && config.retryTimeouts === false) return false;
  if (error.retryable) return true;
  const status = error.response?.status || error.status;
  if (status === 429 || (status >= 500 && status < 600)) return true;
  return ["ECONNRESET", "ETIMEDOUT", "ECONNABORTED", "EAI_AGAIN", "ENOTFOUND"].includes(error.code);
};

const retryAfterMs = (error, attempt) => {
  if (error.retryAfterMs > 0) return Math.min(error.retryAfterMs + 500, 120000);
  const header = error.response?.headers?.["retry-after"];
  const seconds = Number(header);
  if (Number.isFinite(seconds) && seconds > 0) return Math.min(seconds * 1000, 120000);
  return Math.min(2000 * 2 ** attempt, 60000) + Math.floor(Math.random() * 500);
};

// Short, key-free description of an error for logs and job records.
const describeError = (error) => {
  const status = error.response?.status || error.status;
  const detail =
    error.response?.data?.error?.message ||
    (typeof error.response?.data?.error === "string" ? error.response.data.error : "") ||
    error.message;
  return `${status ? `HTTP ${status}: ` : ""}${String(detail).slice(0, 300)}`;
};

const createLLMClient = (config) => {
  if (!isConfigured(config)) {
    throw new Error(
      config?.provider === "gemini"
        ? "Gemini is not configured. Set GEMINI_API_KEY in the backend environment."
        : `LLM provider "${config?.provider || "none"}" is not configured. Set GEMINI_API_KEY for Gemini, or LLM_PROVIDER/LLM_API_KEY/LLM_BASE_URL for an openai-compatible provider.`
    );
  }

  const provider =
    config.provider === "gemini"
      ? createGeminiProvider(config)
      : config.provider === "openai"
      ? createOpenAICompatibleProvider(config)
      : createMockProvider(config);

  const minIntervalMs = Math.ceil(60000 / Math.max(1, config.rpm));
  let nextSlot = 0;
  const usage = { calls: 0, inputTokens: 0, outputTokens: 0 };

  // Serialize request start times so we never exceed the configured RPM.
  const waitForSlot = async () => {
    const now = Date.now();
    const start = Math.max(now, nextSlot);
    nextSlot = start + minIntervalMs;
    if (start > now) await delay(start - now);
  };

  const callWithRetry = async (request) => {
    let lastError;
    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      if (!provider.isMock) await waitForSlot();
      try {
        const result = await provider.call(request);
        usage.calls += 1;
        usage.inputTokens += result.usage.inputTokens;
        usage.outputTokens += result.usage.outputTokens;
        return result;
      } catch (error) {
        lastError = error;
        if (attempt === config.maxRetries || !isRetryable(error, config)) break;
        await delay(provider.isMock ? 5 : retryAfterMs(error, attempt));
      }
    }
    const wrapped = new Error(describeError(lastError));
    wrapped.truncated = Boolean(lastError?.truncated);
    wrapped.quotaExhausted = Boolean(lastError?.quotaExhausted);
    wrapped.timeout = Boolean(lastError?.timeout);
    wrapped.code = lastError?.code;
    wrapped.status = lastError?.response?.status || lastError?.status;
    throw wrapped;
  };

  return {
    name: provider.name,
    model: provider.model,
    isMock: Boolean(provider.isMock),
    usage,

    // Free-form chat (AI Tutor).
    chat: async ({ system, messages, maxOutputTokens = 1024, temperature = 0.4 }) => {
      const result = await callWithRetry({ system, messages, maxOutputTokens, temperature, json: false });
      return { text: result.text.trim(), usage: result.usage };
    },

    // Structured generation (content pipeline). Returns parsed JSON.
    generateJSON: async ({ system, user, maxOutputTokens = 8192, temperature = 0.5, mockResponse }) => {
      const result = await callWithRetry({
        system,
        messages: [{ role: "user", content: user }],
        maxOutputTokens,
        temperature,
        json: true,
        mockResponse,
      });
      return { data: parseJsonLoose(result.text), usage: result.usage };
    },
  };
};

// Sort a provider failure into a category the UI can explain without
// leaking provider details: quota | timeout | auth | provider.
const classifyLLMError = (error) => {
  const status = error?.status || error?.response?.status;
  if (error?.quotaExhausted || status === 429) return "quota";
  if (error?.timeout || ["ETIMEDOUT", "ECONNABORTED"].includes(error?.code)) return "timeout";
  if (status === 401 || status === 403 || (status === 400 && /API key/i.test(error?.message || ""))) return "auth";
  return "provider";
};

module.exports = { getLLMConfig, isConfigured, createLLMClient, describeError, classifyLLMError };
