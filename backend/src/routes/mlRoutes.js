const express = require('express');
const mlController = require('../controllers/mlController');

const router = express.Router();

router.post('/sentiment', mlController.predictSentiment);

module.exports = router;
