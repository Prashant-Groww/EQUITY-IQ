const portfolioService = require('../services/portfolioService');
const logger = require('../utils/logger');

const getUserIdAndGuest = (req) => {
  const userId = req.user ? req.user.id || req.user._id : null;
  const guestId = req.headers['x-guest-id'] || 'default_guest';
  return { userId, guestId };
};

const getPortfolio = async (req, res, next) => {
  try {
    const { userId, guestId } = getUserIdAndGuest(req);
    const data = await portfolioService.getPortfolioSummary(userId, guestId);
    res.status(200).json({ status: 'success', data });
  } catch (err) {
    logger.error({ err: err.message }, 'getPortfolio error');
    next(err);
  }
};

const addOrUpdateHolding = async (req, res, next) => {
  try {
    const { userId, guestId } = getUserIdAndGuest(req);
    const { symbol, quantity, avgBuyPrice, companyName } = req.body;

    if (!symbol || !quantity || !avgBuyPrice) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Symbol, quantity, and avgBuyPrice are required',
        },
      });
    }

    const data = await portfolioService.addOrUpdateHolding(userId, guestId, {
      symbol,
      quantity,
      avgBuyPrice,
      companyName,
    });

    res.status(200).json({ status: 'success', data });
  } catch (err) {
    logger.error({ err: err.message }, 'addOrUpdateHolding error');
    next(err);
  }
};

const removeHolding = async (req, res, next) => {
  try {
    const { userId, guestId } = getUserIdAndGuest(req);
    const { symbol } = req.params;

    if (!symbol) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Symbol parameter is required',
        },
      });
    }

    const data = await portfolioService.removeHolding(userId, guestId, symbol);
    res.status(200).json({ status: 'success', data });
  } catch (err) {
    logger.error({ err: err.message }, 'removeHolding error');
    next(err);
  }
};

const toggleWatchlist = async (req, res, next) => {
  try {
    const { userId, guestId } = getUserIdAndGuest(req);
    const { symbol, companyName } = req.body;

    if (!symbol) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Symbol parameter is required',
        },
      });
    }

    const data = await portfolioService.toggleWatchlistSymbol(userId, guestId, { symbol, companyName });
    res.status(200).json({ status: 'success', data });
  } catch (err) {
    logger.error({ err: err.message }, 'toggleWatchlist error');
    next(err);
  }
};

const optimizePortfolio = async (req, res, next) => {
  try {
    const { userId, guestId } = getUserIdAndGuest(req);
    const data = await portfolioService.optimizePortfolioWithAI(userId, guestId);
    res.status(200).json({ status: 'success', data });
  } catch (err) {
    logger.error({ err: err.message }, 'optimizePortfolio error');
    next(err);
  }
};

module.exports = {
  getPortfolio,
  addOrUpdateHolding,
  removeHolding,
  toggleWatchlist,
  optimizePortfolio,
};
