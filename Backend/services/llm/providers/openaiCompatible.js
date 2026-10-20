const axios = require("axios");

// ==============================
// OpenAI-compatible Chat Completions provider.
//
// Works with any service exposing POST {baseUrl}/chat/completions, e.g.
//   Groq        https://api.groq.com/openai/v1
//   OpenRouter  https://openrouter.ai/api/v1
//   OpenAI      https://api.openai.com/v1
//   Ollama      http://localhost:11434/v1   (local, no key needed)
// ==============================

const createOpenAICompatibleProvider = ({ apiKey, model, baseUrl, timeoutMs }) => {
  if (!baseUrl) throw new Error("LLM_BASE_URL is required for the openai provider.");

  const url = `${baseUrl.replace(/\/$/, "")}/chat/completions`;

  const call = async ({ system, messages, maxOutputTokens, temperature, json }) => {
    const response = await axios.post(
      url,
      {
        model,
        temperature,
        max_tokens: maxOutputTokens,
        messages: [
          ...(system ? [{ role: "system", content: system }] : []),
          ...messages.map((message) => ({
            role: message.role === "assistant" ? "assistant" : "user",
            content: String(message.content || ""),
          })),
        ],
        ...(json ? { response_format: { type: "json_object" } } : {}),
      },
      {
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
        timeout: timeoutMs,
      }
    );

    const choice = response.data?.choices?.[0];
    const text = choice?.message?.content || "";

    if (!text) {
      throw Object.assign(new Error("Provider returned no text."), { retryable: true });
    }

    if (choice?.finish_reason === "length") {
      throw Object.assign(new Error("Provider response was truncated (max_tokens)."), { truncated: true });
    }

    const usage = response.data?.usage || {};
    return {
      text,
      usage: {
        inputTokens: usage.prompt_tokens || 0,
        outputTokens: usage.completion_tokens || 0,
      },
    };
  };

  return { name: "openai", model, call };
};

module.exports = { createOpenAICompatibleProvider };
