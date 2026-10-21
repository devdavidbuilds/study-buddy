const express = require("express");
const router = express.Router();

const {
  getRecommendations,
  getRecommendationCatalog,
} = require("../controllers/recommendationController");

// ===============================
// Public Routes — same visibility as GET /api/courses
// ===============================

// Ranked course recommendations from the ML service
router.get("/", getRecommendations);

// Course text fields used to train the ML model (read-only)
router.get("/catalog", getRecommendationCatalog);

module.exports = router;
