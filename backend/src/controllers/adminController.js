const { runDailyMarketDataUpdate } = require('../services/marketUpdateJob');
const MarketUpdateStatus = require('../models/MarketUpdateStatus');

/**
 * Manually trigger the daily Indian stock market price update job.
 */
const triggerMarketUpdate = async (req, res, next) => {
  try {
    const result = await runDailyMarketDataUpdate();
    res.status(200).json({
      message: 'Daily market data update job completed',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get history/status logs of market data update jobs.
 */
const getMarketUpdateStatus = async (req, res, next) => {
  try {
    const logs = await MarketUpdateStatus.find().sort({ lastRunAt: -1 }).limit(10).lean();
    res.status(200).json({
      totalRuns: logs.length,
      latestRun: logs[0] || null,
      history: logs,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  triggerMarketUpdate,
  getMarketUpdateStatus,
};
