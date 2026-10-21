const axios = require("axios");
const mongoose = require("mongoose");
const Course = require("../models/Course");

// ==========================
// Course recommendations (content-based ML model)
//
// The model itself lives in the separate Python service in /ML
// (TF-IDF + cosine similarity, scikit-learn). That service only returns
// ranked course ids and scores; this controller validates the request,
// asks the service, then loads the canonical course data from MongoDB.
// If the service is down the endpoint says so (503) — it never invents
// recommendations.
// ==========================

const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 10;
const MAX_QUERY_LENGTH = 200;
const SERVICE_TIMEOUT_MS = 8000;

// Locally the Python service runs on port 8001 (see ML/README.md). On
// Render it must be configured explicitly with RECOMMENDER_URL.
const getServiceUrl = () =>
  (process.env.RECOMMENDER_URL || (process.env.RENDER ? "" : "http://127.0.0.1:8001"))
    .trim()
    .replace(/\/+$/, "");

// Fields the recommendation cards need — no module/lesson trees.
const CARD_FIELDS =
  "courseName courseCode category level description thumbnail color rating reviewsCount students duration";

// Text fields the model is trained on (read-only export, see ML/train_model.py).
// Lesson titles are left out: in the imported catalog they are generated
// from the category ("Web Development Fundamentals 1 — Beginner"), add no
// signal, and made up ~90% of the export size.
const CATALOG_FIELDS =
  "courseName courseCode category level description skills outcomes modules.title modules.summary contentMeta.summary";

// ==========================
// GET /api/recommendations?q=<text>&courseId=<id>&limit=<1-10>
// Either q (a search query / interests) or courseId (find similar
// courses; the course itself is excluded) is required.
// ==========================
const getRecommendations = async (req, res) => {
  const query = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const courseId = typeof req.query.courseId === "string" ? req.query.courseId.trim() : "";
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(req.query.limit, 10) || DEFAULT_LIMIT));

  if (!query && !courseId) {
    return res.status(400).json({
      success: false,
      message: "Provide a search query (q) or a courseId.",
    });
  }

  if (query.length > MAX_QUERY_LENGTH) {
    return res.status(400).json({
      success: false,
      message: `Query must be at most ${MAX_QUERY_LENGTH} characters.`,
    });
  }

  if (courseId && !mongoose.isValidObjectId(courseId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid courseId.",
    });
  }

  const serviceUrl = getServiceUrl();

  if (!serviceUrl) {
    return res.status(503).json({
      success: false,
      message: "Recommendation service is not configured. Set RECOMMENDER_URL in the backend environment.",
    });
  }

  try {
    const payload = { k: limit };

    if (courseId) {
      const selected = await Course.findById(courseId)
        .select("courseName category skills description")
        .lean();

      if (!selected) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      // The service uses its stored vector for this course; the text is
      // only used if the course was added after the model was trained.
      payload.course_id = courseId;
      payload.text = [selected.courseName, selected.category, ...(selected.skills || []), selected.description]
        .filter(Boolean)
        .join(" ");
    }

    if (query) {
      payload.query = query;
    }

    const headers = process.env.RECOMMENDER_API_TOKEN
      ? { Authorization: `Bearer ${process.env.RECOMMENDER_API_TOKEN}` }
      : {};

    const response = await axios.post(`${serviceUrl}/recommend`, payload, {
      headers,
      timeout: SERVICE_TIMEOUT_MS,
    });

    const ranked = Array.isArray(response.data?.results) ? response.data.results : null;

    if (!ranked) {
      return res.status(502).json({
        success: false,
        message: "Invalid response from the recommendation service.",
      });
    }

    const validIds = ranked
      .map((item) => String(item?.id || ""))
      .filter((id) => mongoose.isValidObjectId(id) && id !== courseId);

    // Canonical course data comes from MongoDB; ids the index still has
    // but the catalog no longer does (deleted/archived) are dropped.
    const courses = await Course.find({ _id: { $in: validIds }, status: { $ne: "Archived" } })
      .select(CARD_FIELDS)
      .lean();
    const byId = new Map(courses.map((course) => [String(course._id), course]));

    const data = ranked
      .filter((item) => byId.has(String(item.id)) && String(item.id) !== courseId)
      .slice(0, limit)
      .map((item) => ({
        ...byId.get(String(item.id)),
        score: Number(item.score) || 0,
      }));

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
      query: query || null,
      courseId: courseId || null,
      model: response.data?.model || null,
    });
  } catch (error) {
    // Log only the status/code — never the service URL or token.
    console.error("Recommendation Error:", error.response?.status || error.code || error.message);

    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      return res.status(504).json({
        success: false,
        message: "Recommendation service took too long to respond.",
      });
    }

    if (error.response || error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
      return res.status(503).json({
        success: false,
        message: "Recommendation service is unavailable right now.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to load recommendations.",
    });
  }
};

// ==========================
// GET /api/recommendations/catalog
// Read-only export of the public course text fields, used by
// ML/train_model.py to fit the model. Sorted by _id (indexed) so it never
// hits MongoDB's in-memory sort limit; no answer keys or lesson bodies.
// ==========================
const getRecommendationCatalog = async (req, res) => {
  try {
    const courses = await Course.find({ status: { $ne: "Archived" } })
      .select(CATALOG_FIELDS)
      .sort({ _id: 1 })
      .lean();

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    console.error("Recommendation Catalog Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getRecommendations,
  getRecommendationCatalog,
};
