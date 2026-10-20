const judge0Service = require("../services/judge0Service");
const Submission = require("../models/Submission");

<<<<<<< HEAD
const MAX_CODE_LENGTH = 100000;
const MAX_INPUT_LENGTH = 20000;
const MAX_TEST_CASES = 20;

const validateExecutionPayload = (code, testCases) => {
  if (typeof code !== "string" || code.length > MAX_CODE_LENGTH) {
    return "Code is required and must be under 100 KB.";
  }
  if (testCases && (!Array.isArray(testCases) || testCases.length > MAX_TEST_CASES)) {
    return `No more than ${MAX_TEST_CASES} test cases are allowed.`;
  }
  if (Array.isArray(testCases) && testCases.some((testCase) =>
    String(testCase?.input || "").length > MAX_INPUT_LENGTH ||
    String(testCase?.expected || "").length > MAX_INPUT_LENGTH
  )) {
    return "Test case input and expected output must be under 20 KB each.";
  }
  return null;
};

=======
>>>>>>> origin/main
// ==============================
// Run Code (Visible Test Cases)
// ==============================
const runCode = async (req, res) => {
  try {
    const { code, language, testCases, customInput } = req.body;

    if (!code || !language) {
      return res.status(400).json({
        success: false,
        message: "Code and language are required.",
      });
    }

<<<<<<< HEAD
    const payloadError = validateExecutionPayload(code, testCases);
    if (payloadError) {
      return res.status(400).json({ success: false, message: payloadError });
    }

    if (customInput !== undefined && String(customInput).length > MAX_INPUT_LENGTH) {
      return res.status(400).json({
        success: false,
        message: "Custom input must be under 20 KB.",
      });
    }

=======
>>>>>>> origin/main
    // If custom input is provided, run single execution
    if (customInput !== undefined && customInput !== null) {
      const result = await judge0Service.executeCode(code, language, customInput);

      if (result.fallback) {
        return res.status(200).json({
          success: true,
          fallback: true,
          message: "Judge0 not configured — use frontend simulator.",
        });
      }

      if (!result.success) {
        return res.status(200).json({
          success: true,
          status: "Error",
          error: result.error,
        });
      }

      return res.status(200).json({
        success: true,
        status: result.statusDescription || "Completed",
        stdout: result.stdout,
        stderr: result.stderr,
        compileOutput: result.compileOutput,
        time: result.time,
        memory: result.memory,
        exitCode: result.exitCode,
      });
    }

    // Run against test cases
    if (!testCases || !Array.isArray(testCases) || testCases.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one test case is required.",
      });
    }

    const result = await judge0Service.runTestCases(code, language, testCases);

    if (result.fallback) {
      return res.status(200).json({
        success: true,
        fallback: true,
        message: "Judge0 not configured — use frontend simulator.",
      });
    }

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Compiler Run Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error during code execution.",
    });
  }
};

// ==============================
// Submit Code (All Test Cases)
// ==============================
const submitCode = async (req, res) => {
  try {
    const { code, language, testCases, hiddenTestCases, problemId } = req.body;
    const userId = req.user?._id || req.user?.id;

    if (!code || !language) {
      return res.status(400).json({
        success: false,
        message: "Code and language are required.",
      });
    }

<<<<<<< HEAD
    const payloadError = validateExecutionPayload(code, testCases);
    if (payloadError) {
      return res.status(400).json({ success: false, message: payloadError });
    }

    if (Array.isArray(hiddenTestCases) && hiddenTestCases.length > MAX_TEST_CASES) {
      return res.status(400).json({
        success: false,
        message: `No more than ${MAX_TEST_CASES} hidden test cases are allowed.`,
      });
    }

=======
>>>>>>> origin/main
    if (!testCases || !Array.isArray(testCases)) {
      return res.status(400).json({
        success: false,
        message: "Test cases are required.",
      });
    }

<<<<<<< HEAD
    if (testCases.length > MAX_TEST_CASES) {
      return res.status(400).json({
        success: false,
        message: `No more than ${MAX_TEST_CASES} test cases are allowed.`,
      });
    }

=======
>>>>>>> origin/main
    const result = await judge0Service.submitSolution(
      code,
      language,
      testCases,
      hiddenTestCases || []
    );

    if (result.fallback) {
      return res.status(200).json({
        success: true,
        fallback: true,
        message: "Judge0 not configured — use frontend simulator.",
      });
    }

    // Save submission to database (if user context exists)
    if (problemId && userId) {
      try {
        await Submission.create({
          userId: String(userId),
          problemId,
          language,
          code,
          verdict: result.verdict || result.status,
          passedCount: result.passedCount || 0,
          totalCount: result.total || 0,
          executionTime: result.time ? parseFloat(result.time) : 0,
          memoryUsed: result.memory ? parseFloat(result.memory) : 0,
        });
      } catch (dbError) {
        // Don't fail the submission if DB save fails
        console.error("Failed to save submission:", dbError.message);
      }
    }

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Compiler Submit Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error during code submission.",
    });
  }
};

// ==============================
// Validate Test Cases
// ==============================
const validateTestCases = async (req, res) => {
  try {
    const { testCases } = req.body;

    if (!testCases || !Array.isArray(testCases)) {
      return res.status(400).json({
        success: false,
        message: "Test cases array is required.",
      });
    }

<<<<<<< HEAD
    if (testCases.length > MAX_TEST_CASES || testCases.some((testCase) =>
      String(testCase?.input || "").length > MAX_INPUT_LENGTH ||
      String(testCase?.expected || "").length > MAX_INPUT_LENGTH
    )) {
      return res.status(400).json({
        success: false,
        message: "Test cases exceed the allowed size or count.",
      });
    }

=======
>>>>>>> origin/main
    const validated = testCases.map((tc, index) => ({
      id: tc.id || index + 1,
      input: (tc.input || "").trim(),
      expected: (tc.expected || "").trim(),
      valid: !!(tc.input !== undefined && tc.expected !== undefined),
    }));

    return res.status(200).json({
      success: true,
      testCases: validated,
      totalValid: validated.filter((tc) => tc.valid).length,
      totalInvalid: validated.filter((tc) => !tc.valid).length,
    });
  } catch (error) {
    console.error("Test Case Validation Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

// ==============================
// Fetch Submission History
// ==============================
const getSubmissions = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    const submissions = await Submission.find({ userId: String(userId) })
      .sort({ createdAt: -1 })
      .limit(12)
      .lean();

    return res.status(200).json({
      success: true,
      submissions,
    });
  } catch (error) {
    console.error("Fetch Submissions Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch submission history.",
    });
  }
};

// ==============================
// Check Judge0 Availability
// ==============================
const checkStatus = async (req, res) => {
  try {
    const available = await judge0Service.isAvailable();
    return res.status(200).json({
      success: true,
      judge0Available: available,
      message: available
        ? "Judge0 API is connected and ready."
        : "Judge0 API is not configured — using simulator mode.",
    });
  } catch (error) {
    return res.status(200).json({
      success: true,
      judge0Available: false,
      message: "Judge0 API check failed — using simulator mode.",
    });
  }
};

module.exports = {
  runCode,
  submitCode,
  validateTestCases,
  checkStatus,
  getSubmissions,
}