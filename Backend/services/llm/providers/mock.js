// ==============================
// Mock provider — for tests and pipeline dry-runs only.
//
// Never calls a network service. For JSON requests the caller supplies a
// `mockResponse()` function that builds a structurally valid payload; the
// content-enrichment pipeline refuses to save mock output to real courses.
// ==============================

const createMockProvider = ({ model } = {}) => {
  let failuresRemaining = Number(process.env.LLM_MOCK_FAIL_FIRST || 0);

  const call = async ({ messages, json, mockResponse }) => {
    if (failuresRemaining > 0) {
      failuresRemaining -= 1;
      throw Object.assign(new Error("Mock provider simulated a transient failure."), {
        status: 503,
      });
    }

    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    const text = json
      ? JSON.stringify(typeof mockResponse === "function" ? mockResponse() : {})
      : `[Mock tutor] You asked: "${String(lastUser?.content || "").slice(0, 120)}". ` +
        "Set GEMINI_API_KEY to get real answers.";

    return {
      text,
      usage: { inputTokens: 0, outputTokens: Math.ceil(text.length / 4) },
    };
  };

  return { name: "mock", model: model || "mock", isMock: true, call };
};

module.exports = { createMockProvider };
