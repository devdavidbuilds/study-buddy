const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Import Database Connection
const connectDB = require("./config/db");

// Import Routes
const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");
const compilerRoutes = require("./routes/compilerRoutes");
<<<<<<< HEAD
const progressRoutes = require("./routes/progressRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const quizRoutes = require("./routes/quizRoutes");
const activityRoutes = require("./routes/activityRoutes");
const facultyProgressRoutes = require("./routes/facultyProgressRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");
const submissionFileRoutes = require("./routes/submissionFileRoutes");
const aiChatRoutes = require("./routes/aiChat");
const lectureMaterialRoutes = require("./routes/lectureMaterialRoutes");
=======
>>>>>>> origin/main

// Load Environment Variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express App
const app = express();

// Middleware
<<<<<<< HEAD
const allowedOrigins = (
  process.env.FRONTEND_URLS || "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: "256kb" }));
=======
app.use(cors());
app.use(express.json());
>>>>>>> origin/main
app.use(express.urlencoded({ extended: true }));

// Root Route
app.get("/", (req, res) => {
  res.send("🚀 Study Buddy Backend is Running!");
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/compiler", compilerRoutes);
<<<<<<< HEAD
app.use("/api/progress", progressRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/faculty/courses", facultyProgressRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/submissions", submissionFileRoutes);
app.use("/api/materials", lectureMaterialRoutes);

// Fine-tuned AI Chat Route
app.use("/api/ai-chat", aiChatRoutes);
=======
>>>>>>> origin/main

// Handle Unknown Routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

<<<<<<< HEAD
// Error Handler
app.use((err, req, res, next) => {
  console.error("Backend error:", err.message);

  res.status(err.status || 500).json({
    success: false,
    message: "An internal server error occurred.",
  });
});

=======
>>>>>>> origin/main
// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});