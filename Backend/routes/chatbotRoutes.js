const express = require("express");
const { sendChatbotMessage } = require("../controllers/chatbotController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/message", protect, sendChatbotMessage);

module.exports = router;
