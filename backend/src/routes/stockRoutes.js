const express = require('express');
const stockController = require('../controllers/stockController');

const router = express.Router();

router.get('/search', stockController.searchStocks);
router.get('/recommendations/sectors', stockController.getAvailableSectors);
router.get('/recommendations/sector', stockController.getSectorRecommendations);
router.get('/:symbol/quote', stockController.getQuote);
router.get('/:symbol/history', stockController.getHistory);
router.get('/:symbol/financials', stockController.getFinancials);
router.get('/:symbol/rating', stockController.getRating);

module.exports = router;
