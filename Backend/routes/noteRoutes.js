const express = require("express");
const router = express.Router();

const { getNotes, createNote, updateNote, deleteNote } = require("../controllers/noteController");
const { protect } = require("../middleware/authMiddleware");
const validateObjectId = require("../middleware/validateObjectId");

// ===============================
// Personal notes — every route is scoped to the logged-in user.
// ===============================
router.use(protect);

router.get("/", getNotes);
router.post("/", createNote);
router.put("/:id", validateObjectId("id"), updateNote);
router.delete("/:id", validateObjectId("id"), deleteNote);

module.exports = router;
