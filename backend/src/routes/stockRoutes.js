const express = require('express');
const stockController = require('../controllers/stockController');

const router = express.Router();

router.get('/search', stockController.searchStocks);
router.get('/:symbol/quote', stockController.getQuote);
router.get('/:symbol/history', stockController.getHistory);
router.get('/:symbol/financials', stockController.getFinancials);

module.exports = router;
