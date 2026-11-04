const express = require("express");
const multer = require("multer");
const { sendChatbotMessage, summarizeNotes } = require("../controllers/chatbotController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
});

const handleUpload = (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ success: false, message: "File size exceeds the 15MB limit." });
      }
      return res.status(400).json({ success: false, message: err.message || "File upload failed." });
    }
    next();
  });
};

router.post("/message", protect, sendChatbotMessage);
router.post("/summarize-notes", protect, handleUpload, summarizeNotes);

module.exports = router;
