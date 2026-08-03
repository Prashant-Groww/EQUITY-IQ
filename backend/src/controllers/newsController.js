const newsService = require('../services/newsService');

const getNews = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const { page, limit } = req.query;

    if (!symbol || symbol.trim().length === 0) {
      const error = new Error('Company symbol is required');
      error.statusCode = 400;
      error.code = 'INVALID_SYMBOL';
      return next(error);
    }

    const result = await newsService.getNewsBySymbol(symbol.trim(), page, limit);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const ingestNews = async (req, res, next) => {
  try {
    const { symbol } = req.params;

    if (!symbol || symbol.trim().length === 0) {
      const error = new Error('Company symbol is required');
      error.statusCode = 400;
      error.code = 'INVALID_SYMBOL';
      return next(error);
    }

    const result = await newsService.ingestNewsForSymbol(symbol.trim());
    res.status(200).json({
      message: `News ingestion completed for ${symbol.toUpperCase()}`,
      result,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getNews,
  ingestNews,
};
