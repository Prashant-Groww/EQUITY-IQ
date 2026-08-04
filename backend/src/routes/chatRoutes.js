const express = require('express');
const chatController = require('../controllers/chatController');

const router = express.Router();

// POST /api/ml/chat
router.post('/chat', chatController.chatWithCopilot);

module.exports = router;
