const path = require("path");
const dotenv = require("dotenv");

// Load Backend/.env first — before any module reads process.env — and
// even when the server is started from another folder
// (e.g. `node Backend/server.js` from the repo root).
dotenv.config({ path: path.join(__dirname, ".env") });

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");
const compilerRoutes = require("./routes/compilerRoutes");
const progressRoutes = require("./routes/progressRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const quizRoutes = require("./routes/quizRoutes");
const activityRoutes = require("./routes/activityRoutes");
const facultyProgressRoutes = require("./routes/facultyProgressRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");
const submissionFileRoutes = require("./routes/submissionFileRoutes");
const aiChatRoutes = require("./routes/aiChat");
const lectureMaterialRoutes = require("./routes/lectureMaterialRoutes");
const plannerRoutes = require("./routes/plannerRoutes");
const certificateRoutes = require("./routes/certificateRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");
const noteRoutes = require("./routes/noteRoutes");
const facultyStudentRoutes = require("./routes/facultyStudentRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");
const { startRecommenderKeepWarm } = require("./controllers/recommendationController");

connectDB();

const app = express();

// Exact origins only. The production domain is always allowed so a missing or
// mistyped FRONTEND_URLS on Render cannot block login; FRONTEND_URL (the
// OAuth redirect target) is the frontend too, so it is allowed as well.
const PRODUCTION_FRONTEND = "https://study-buddy-tau-ochre.vercel.app";

const allowedOrigins = [
  ...new Set(
    [
      ...(process.env.FRONTEND_URLS || "http://localhost:5173").split(","),
      process.env.FRONTEND_URL || "",
      PRODUCTION_FRONTEND,
    ]
      .map((origin) => origin.trim().replace(/^["']|["']$/g, "").replace(/\/+$/, ""))
      .filter(Boolean)
  ),
];

app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: "256kb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Study Buddy Backend is Running!");
});

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/compiler", compilerRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/faculty/courses", facultyProgressRoutes);
app.use("/api/faculty/students", facultyStudentRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/submissions", submissionFileRoutes);
app.use("/api/materials", lectureMaterialRoutes);
app.use("/api/planner", plannerRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/ai-chat", aiChatRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/enrollments", enrollmentRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

app.use((err, req, res, next) => {
  console.error("Backend error:", err.message);

  res.status(err.status || 500).json({
    success: false,
    message: "An internal server error occurred.",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Study Buddy Backend running on port ${PORT}`);
  startRecommenderKeepWarm();
});
