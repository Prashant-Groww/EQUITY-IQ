const express = require('express');
const ragController = require('../controllers/ragController');

const router = express.Router();

// POST /api/ml/rag-query
router.post('/rag-query', ragController.queryRAG);

module.exports = router;
