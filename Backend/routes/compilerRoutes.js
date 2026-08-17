const express = require("express");
const {
  runCode,
  submitCode,
  validateTestCases,
  checkStatus,
  getSubmissions,
} = require("../controllers/compilerController");

const router = express.Router();

// POST /api/compiler/run — Run code against test cases
router.post("/run", runCode);

// POST /api/compiler/submit — Submit solution for full judging
router.post("/submit", submitCode);

// POST /api/compiler/testcases — Validate test cases
router.post("/testcases", validateTestCases);

// GET /api/compiler/status — Check Judge0 availability
router.get("/status", checkStatus);

// GET /api/compiler/submissions — Fetch recent submission history
router.get("/submissions", getSubmissions);

module.exports = router;
