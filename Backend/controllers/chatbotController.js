const Course = require("../models/Course");
const { createTutorResponse, createGeneralResponse } = require("../services/chatbotService");
const { getLLMConfig, isConfigured, createLLMClient, describeError, classifyLLMError } = require("../services/llm");

// Shown to the student when the built-in engine had to answer instead of the
// AI model. Deliberately generic: no provider details or configuration names.
const FALLBACK_NOTICES = {
  not_configured: "The AI model isn't available right now, so this is a basic built-in answer.",
  quota: "Buddy has reached the usage limit for now, so this is a basic built-in answer. Please try again later.",
  timeout: "Buddy took too long to respond, so this is a basic built-in answer. Please try again.",
  auth: "The AI model isn't available right now, so this is a basic built-in answer.",
  provider: "Buddy ran into a problem, so this is a basic built-in answer. Please try again.",
};

let warnedNotConfigured = false;

const TUTOR_DEFAULT_GEMINI_MODEL = "gemini-flash-lite-latest";

// ==============================
// AI Tutor
//
// When an LLM provider is configured (TUTOR_LLM_* or shared LLM_* env
// vars), answers come from the model, grounded in the current course /
// lesson. Otherwise — or if the provider fails — the original rule-based
// engine in services/chatbotService.js answers, so the tutor never goes
// silent. The response contract ({ answer, courseId, courseName }) is
// unchanged; `source` says which engine answered.
// ==============================

const TUTOR_SYSTEM_PROMPT = [
  "You are Buddy, the personal AI Tutor in Study Buddy, a learning platform for university students. Introduce and refer to yourself as Buddy.",
  "Explain concepts clearly and accurately, adapting depth to the student's question (simpler if they are confused, more rigorous if they ask for detail).",
  "For maths, science and programming, work step by step and show reasoning; use fenced code blocks for code.",
  "When the student asks for an exam-style answer (e.g. 2, 5, 8 or 15 marks), match the expected length and structure: definition, explanation, key points, example, and a diagram description where useful.",
  "Use Markdown: short paragraphs, ## headings for longer answers, bullet lists.",
  "If course material is provided below, ground your answer in it and use its terminology. If the material does not cover the question, say so in one short sentence and then answer from general knowledge.",
  "Never invent facts about the course itself (content not shown, deadlines, grading, instructors). Do not make up citations or URLs.",
  "Encourage understanding: when helpful, end with one short follow-up question or practice idea.",
].join(" ");

const MAX_CONTEXT_CHARS = 7000;

let cachedClient = null;
let cachedKey = "";

const getTutorClient = () => {
  const config = getLLMConfig({ prefix: "TUTOR" });
  if (!isConfigured(config)) return null;
  // Interactive requests: fail fast and fall back rather than retrying for minutes.
  if (!process.env.TUTOR_LLM_MAX_RETRIES && !process.env.LLM_MAX_RETRIES) config.maxRetries = 1;
  if (!process.env.TUTOR_LLM_TIMEOUT_MS) config.timeoutMs = Math.min(config.timeoutMs, 30000);
  config.retryTimeouts = false; // a timed-out request is not retried; the student gets the fallback
  // Chat needs fast replies: full Flash models measured 30-40 s per answer on
  // the free tier (past the timeout), the lite model ~2 s. LLM_MODEL still
  // applies to the content pipeline; set TUTOR_LLM_MODEL to override this.
  if (config.provider === "gemini" && !process.env.TUTOR_LLM_MODEL) config.model = TUTOR_DEFAULT_GEMINI_MODEL;
  const key = JSON.stringify(config);
  if (key !== cachedKey) {
    cachedClient = createLLMClient(config);
    cachedKey = key;
  }
  return cachedClient;
};

const list = (title, items) => (items?.length ? `${title}:\n${items.map((item) => `- ${item}`).join("\n")}` : "");

const buildCourseContext = (course, module, lesson) => {
  const parts = [
    `Course: ${course.courseName} (${course.level || "Beginner"}, ${course.category || "General"})`,
  ];

  if (lesson) {
    const learning = lesson.learning || {};
    parts.push(
      `Current module: ${module.title}`,
      `Current lesson: ${lesson.title}`,
      list("Lesson objectives", learning.objectives),
      list("Key concepts", (learning.concepts || []).map((c) => `${c.term}: ${c.definition}`)),
      list("Key takeaways", learning.takeaways),
      `Lesson material:\n${String(learning.explanation || lesson.content || lesson.description || "").slice(0, MAX_CONTEXT_CHARS)}`
    );
  } else {
    parts.push(
      "Course outline:",
      (course.modules || [])
        .map((m) => `- ${m.title}: ${(m.lessons || []).map((l) => l.title).join("; ")}`)
        .join("\n")
        .slice(0, MAX_CONTEXT_CHARS)
    );
  }

  return parts.filter(Boolean).join("\n\n");
};

// Gemini and most chat APIs want alternating turns that start with the user.
const toChatMessages = (history, message) => {
  const turns = (Array.isArray(history) ? history : [])
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));

  turns.push({ role: "user", content: message });

  const merged = [];
  for (const turn of turns) {
    const last = merged[merged.length - 1];
    if (last && last.role === turn.role) last.content += `\n\n${turn.content}`;
    else merged.push({ ...turn });
  }
  while (merged.length && merged[0].role !== "user") merged.shift();
  return merged;
};

const sendChatbotMessage = async (req, res) => {
  const { message, courseId, context, history } = req.body || {};

  if (!message || typeof message !== "string" || !message.trim() || message.length > 4000) {
    return res.status(400).json({ success: false, message: "A message is required." });
  }

  if (history !== undefined && (!Array.isArray(history) || history.length > 20)) {
    return res.status(400).json({ success: false, message: "Conversation history is invalid or too long." });
  }

  try {
    let course = null;
    let module = null;
    let lesson = null;

    // ── Course-Aware Mode ── (optional: the tutor works without a course)
    if (courseId) {
      course = await Course.findById(courseId).lean();
      if (!course) {
        return res.status(404).json({ success: false, message: "Current course not found." });
      }

      if (context?.moduleId || context?.lessonId) {
        module = (course.modules || []).find((entry) => entry.id === context.moduleId);
        lesson = module?.lessons?.find((entry) => entry.id === context.lessonId);
        if (!module || !lesson) {
          return res.status(400).json({ success: false, message: "Lesson context does not belong to this course." });
        }
      }
    }

    const question = message.trim();
    let answer = "";
    let source = "rules";
    let fallbackReason = null;

    const client = getTutorClient();
    if (!client) {
      fallbackReason = "not_configured";
      if (!warnedNotConfigured) {
        warnedNotConfigured = true;
        console.warn("AI Tutor: no LLM configured (set GEMINI_API_KEY); using the built-in engine.");
      }
    } else {
      try {
        const system = course
          ? `${TUTOR_SYSTEM_PROMPT}\n\n--- Course material ---\n${buildCourseContext(course, module, lesson)}`
          : TUTOR_SYSTEM_PROMPT;
        const result = await client.chat({ system, messages: toChatMessages(history, question), maxOutputTokens: 1500 });
        answer = result.text;
        source = client.isMock ? "mock" : "llm";
      } catch (error) {
        fallbackReason = classifyLLMError(error);
        // describeError never includes the API key.
        console.error(`AI Tutor provider error (${fallbackReason}), using fallback:`, describeError(error));
      }
    }

    if (!answer) {
      answer = course
        ? createTutorResponse({ course, question, history, courseContext: context })
        : createGeneralResponse({ question, history });
    }

    return res.status(200).json({
      success: true,
      data: {
        answer,
        source,
        // Present only when the built-in engine answered instead of the AI model.
        ...(source === "rules" && fallbackReason ? { notice: FALLBACK_NOTICES[fallbackReason] } : {}),
        ...(course ? { courseId: course._id, courseName: course.courseName } : {}),
      },
    });
  } catch (error) {
    console.error("Chatbot Error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong while generating the response. Please try again." });
  }
};

module.exports = { sendChatbotMessage };
