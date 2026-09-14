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

// POST /api/compiler/run — Run code against test cases (no auth required)
router.post("/run", runCode);

// POST /api/compiler/submit — Submit solution for full judging (auth required)
router.post("/submit", protect, submitCode);

// POST /api/compiler/testcases — Validate test cases
router.post("/testcases", validateTestCases);

// GET /api/compiler/status — Check Judge0 availability
router.get("/status", checkStatus);

// GET /api/compiler/submissions — Fetch recent submission history (auth required)
router.get("/submissions", protect, getSubmissions);

module.exports = router;
