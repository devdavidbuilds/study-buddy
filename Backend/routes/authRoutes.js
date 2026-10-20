const express = require("express");

const {
  registerUser,
  loginUser,
  getProfile,
  googleAuth,
  googleCallback,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Public Routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Google OAuth Routes
router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);

// Protected Route
router.get("/profile", protect, getProfile);

module.exports = router;