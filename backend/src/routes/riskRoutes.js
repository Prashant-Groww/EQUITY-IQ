const express = require('express');
const riskController = require('../controllers/riskController');

const router = express.Router();

// GET /api/stocks/:symbol/risk
router.get('/stocks/:symbol/risk', riskController.getStockRisk);

// POST /api/ml/risk
router.post('/ml/risk', riskController.predictRiskDirect);

module.exports = router;
