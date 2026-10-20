// ==============================
// Robust JSON extraction for LLM output.
//
// Models occasionally wrap JSON in ```json fences or add a sentence
// before/after it even when asked not to. This pulls out the first
// complete top-level JSON object/array and parses it.
// ==============================

const stripFences = (text) =>
  String(text || "")
    .replace(/^﻿/, "")
    .replace(/```(?:json)?\s*/gi, "")
    .replace(/```/g, "")
    .trim();

const extractBalanced = (text) => {
  const start = text.search(/[[{]/);
  if (start === -1) return null;

  const open = text[start];
  const close = open === "{" ? "}" : "]";
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < text.length; i++) {
    const ch = text[i];

    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }

    if (ch === '"') inString = true;
    else if (ch === open) depth++;
    else if (ch === close) {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }

  return null;
};

const parseJsonLoose = (raw) => {
  const text = stripFences(raw);

  try {
    return JSON.parse(text);
  } catch {
    const candidate = extractBalanced(text);
    if (!candidate) {
      throw new Error("Model response did not contain a JSON object.");
    }
    try {
      return JSON.parse(candidate);
    } catch (error) {
      throw new Error(`Model returned malformed JSON: ${error.message}`);
    }
  }
};

module.exports = { parseJsonLoose };
