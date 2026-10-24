const stockService = require('../services/stockService');

const searchStocks = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string' || q.trim().length === 0) {
      const error = new Error('Query parameter "q" is required');
      error.statusCode = 400;
      error.code = 'INVALID_QUERY';
      return next(error);
    }

    // Sanitize and limit query length to 100 characters
    const sanitizedQuery = q.trim().slice(0, 100);
    const results = await stockService.searchStocks(sanitizedQuery);
    res.status(200).json(results);
  } catch (err) {
    next(err);
  }
};

const getQuote = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    if (!symbol || typeof symbol !== 'string' || symbol.trim().length === 0) {
      const error = new Error('Stock symbol parameter is required');
      error.statusCode = 400;
      error.code = 'INVALID_SYMBOL';
      return next(error);
    }

    const cleanSymbol = symbol.trim().slice(0, 20);
    const quote = await stockService.getStockQuote(cleanSymbol);
    res.status(200).json(quote);
  } catch (err) {
    next(err);
  }
};

const getHistory = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const { range } = req.query;
    const validRanges = ['1D', '1W', '1M', '1Y', '5Y'];
    const selectedRange = validRanges.includes(range) ? range : '1M';

    if (!symbol || symbol.trim().length === 0) {
      const error = new Error('Stock symbol parameter is required');
      error.statusCode = 400;
      error.code = 'INVALID_SYMBOL';
      return next(error);
    }

    const historyData = await stockService.getStockHistory(symbol.trim(), selectedRange);
    res.status(200).json(historyData);
  } catch (err) {
    next(err);
  }
};

const getFinancials = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    if (!symbol || symbol.trim().length === 0) {
      const error = new Error('Stock symbol parameter is required');
      error.statusCode = 400;
      error.code = 'INVALID_SYMBOL';
      return next(error);
    }

    const financialsData = await stockService.getStockFinancials(symbol.trim());
    res.status(200).json(financialsData);
  } catch (err) {
    next(err);
  }
};

const getRating = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    if (!symbol || symbol.trim().length === 0) {
      const error = new Error('Stock symbol parameter is required');
      error.statusCode = 400;
      error.code = 'INVALID_SYMBOL';
      return next(error);
    }

    const ratingData = await stockService.getStockRating(symbol.trim());
    res.status(200).json(ratingData);
  } catch (err) {
    next(err);
  }
};


const getAvailableSectors = async (req, res, next) => {
  try {
    const sectors = await stockService.getAvailableSectors();
    res.status(200).json(sectors);
  } catch (err) {
    next(err);
  }
};

const getSectorRecommendations = async (req, res, next) => {
  try {
    const { sector } = req.query;
    const recommendations = await stockService.getSectorRecommendations(sector);
    res.status(200).json(recommendations);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  searchStocks,
  getQuote,
  getHistory,
  getFinancials,
  getRating,
  getAvailableSectors,
  getSectorRecommendations,
};
