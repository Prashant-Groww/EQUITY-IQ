const express = require('express');
const { optionalAuthenticate } = require('../middleware/authenticate');
const portfolioController = require('../controllers/portfolioController');

const router = express.Router();

// GET /api/portfolio - Fetch user or guest portfolio, holdings, metrics & watchlist
router.get('/', optionalAuthenticate, portfolioController.getPortfolio);

// POST /api/portfolio/holdings - Add or update a position
router.post('/holdings', optionalAuthenticate, portfolioController.addOrUpdateHolding);

// DELETE /api/portfolio/holdings/:symbol - Remove a position
router.delete('/holdings/:symbol', optionalAuthenticate, portfolioController.removeHolding);

// POST /api/portfolio/watchlist - Toggle symbol on watchlist
router.post('/watchlist', optionalAuthenticate, portfolioController.toggleWatchlist);

// POST /api/portfolio/optimize - Run AI portfolio health check & rebalancing advisor
router.post('/optimize', optionalAuthenticate, portfolioController.optimizePortfolio);

module.exports = router;
