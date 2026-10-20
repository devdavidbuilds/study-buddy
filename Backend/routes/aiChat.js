const express = require("express");
const axios = require("axios");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

const MAX_MESSAGE_LENGTH = 4000;
const MODEL_TIMEOUT_MS = 120000;

router.post("/", protect, async (req, res) => {
  const { message } = req.body || {};

  // Validate the user's question
  if (typeof message !== "string" || !message.trim()) {
    return res.status(400).json({
      success: false,
      message: "Please enter a question.",
    });
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({
      success: false,
      message: `Question must be at most ${MAX_MESSAGE_LENGTH} characters.`,
    });
  }

  // Read ML API configuration from backend .env (never sent to the client)
  const modelUrl = process.env.STUDY_BUDDY_MODEL_URL;
  const apiToken = process.env.STUDY_BUDDY_API_TOKEN;

  if (!modelUrl || !apiToken) {
    return res.status(503).json({
      success: false,
      message:
        "AI model is not configured. Set STUDY_BUDDY_MODEL_URL and STUDY_BUDDY_API_TOKEN in the backend .env.",
    });
  }

  try {
    // Send the question to the fine-tuned model
    const response = await axios.post(
      modelUrl,
      { message: message.trim() },
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          // Stops ngrok's free-tier interstitial page from replacing the JSON response
          "ngrok-skip-browser-warning": "1",
        },
        timeout: MODEL_TIMEOUT_MS,
      }
    );

    const reply = response.data?.reply;

    if (typeof reply !== "string" || !reply.trim()) {
      return res.status(502).json({
        success: false,
        message: "Invalid response from AI model.",
      });
    }

    return res.json({ success: true, reply });
  } catch (error) {
    // Log only the status/code and a hint — never the URL, headers or token
    const status = error.response?.status;
    const hint =
      status === 401
        ? "model API rejected STUDY_BUDDY_API_TOKEN (does it match the Colab secret?)"
        : status === 404
          ? "model URL not found (ngrok tunnel offline or URL changed?)"
          : "";
    console.error("AI Chat Error:", status || error.code || "request failed", hint);

    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      return res.status(504).json({
        success: false,
        message: "AI tutor took too long to respond. Please try again.",
      });
    }

    return res.status(502).json({
      success: false,
      message: "AI tutor is temporarily unavailable. Please try again.",
    });
  }
});

module.exports = router;
