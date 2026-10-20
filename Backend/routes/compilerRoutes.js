const express = require("express");
const {
  runCode,
  submitCode,
  validateTestCases,
  checkStatus,
  getSubmissions,
} = require("../controllers/compilerController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Code execution consumes a shared external service and requires auth.
router.post("/run", protect, runCode);

// POST /api/compiler/submit — Submit solution for full judging (auth required)
router.post("/submit", protect, submitCode);

// POST /api/compiler/testcases — Validate test cases
router.post("/testcases", protect, validateTestCases);

// GET /api/compiler/status — Check Judge0 availability
router.get("/status", protect, checkStatus);

// GET /api/compiler/submissions — Fetch recent submission history (auth required)
router.get("/submissions", protect, getSubmissions);

module.exports = router;
