const Course = require("../models/Course");
const { createTutorResponse, createGeneralResponse } = require("../services/chatbotService");

const sendChatbotMessage = async (req, res) => {
  const { message, courseId, context, history } = req.body || {};

  if (!message || typeof message !== "string" || !message.trim() || message.length > 4000) {
    return res.status(400).json({ success: false, message: "A message is required." });
  }

  if (history !== undefined && (!Array.isArray(history) || history.length > 20)) {
    return res.status(400).json({ success: false, message: "Conversation history is invalid or too long." });
  }

  try {
    // ── Course-Aware Mode ──
    // When a courseId is provided, look up the course and use it as context.
    if (courseId) {
      const course = await Course.findById(courseId).lean();
      if (!course) {
        return res.status(404).json({ success: false, message: "Current course not found." });
      }

      if (context?.moduleId || context?.lessonId) {
        const module = (course.modules || []).find((entry) => entry.id === context.moduleId);
        const lesson = module?.lessons?.find((entry) => entry.id === context.lessonId);
        if (!module || !lesson) {
          return res.status(400).json({ success: false, message: "Lesson context does not belong to this course." });
        }
      }

      const answer = createTutorResponse({
        course,
        question: message.trim(),
        history,
        courseContext: context,
      });

      return res.status(200).json({
        success: true,
        data: { answer, courseId: course._id, courseName: course.courseName },
      });
    }

    // ── General Mode ──
    // No course selected — answer using the AI's general knowledge.
    const answer = createGeneralResponse({
      question: message.trim(),
      history,
    });

    return res.status(200).json({
      success: true,
      data: { answer },
    });
  } catch (error) {
    console.error("Chatbot Error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong while generating the response. Please try again." });
  }
};

module.exports = { sendChatbotMessage };
