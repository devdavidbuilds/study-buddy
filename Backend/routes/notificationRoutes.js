const express = require("express");
const router = express.Router();

const { getNotifications } = require("../controllers/notificationController");
const { protect } = require("../middleware/authMiddleware");

// ===============================
// Notifications for the logged-in user, built from real records.
// ===============================
router.use(protect);

router.get("/", getNotifications);

module.exports = router;
