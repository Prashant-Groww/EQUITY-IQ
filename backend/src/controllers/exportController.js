const exportService = require('../services/exportService');
const logger = require('../utils/logger');

const exportResearchBrief = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    if (!symbol) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Symbol parameter is required',
        },
      });
    }

    const data = await exportService.generateEquityResearchBrief(symbol);
    res.status(200).json({ status: 'success', data });
  } catch (err) {
    logger.error({ err: err.message }, 'exportResearchBrief error');
    next(err);
  }
};

module.exports = {
  exportResearchBrief,
};
