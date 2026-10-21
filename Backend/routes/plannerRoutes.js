const express = require("express");
const router = express.Router();

const {
  getSessions,
  createSession,
  updateSession,
  deleteSession,
  getGoals,
  setGoal,
} = require("../controllers/plannerController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const validateObjectId = require("../middleware/validateObjectId");

// ===============================
// Study Planner — every route is scoped to the authenticated student;
// the student id always comes from req.user, never from the request.
// ===============================
router.use(protect, authorizeRoles("student"));

router.get("/sessions", getSessions);
router.post("/sessions", createSession);
router.patch("/sessions/:id", validateObjectId("id"), updateSession);
router.delete("/sessions/:id", validateObjectId("id"), deleteSession);

router.get("/goals", getGoals);
router.put("/goals/:courseId", validateObjectId("courseId"), setGoal);

module.exports = router;
