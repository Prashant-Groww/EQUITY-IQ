const cron = require('node-cron');
const { runDailyMarketDataUpdate, seedStockMasterIfEmpty } = require('./marketUpdateJob');
const logger = require('../utils/logger');

let cronTask = null;

/**
 * Initialize the Daily Indian Stock Price Update Scheduler.
 * Runs once every trading day after market close in Asia/Kolkata timezone.
 */
const initScheduler = async () => {
  const cronSchedule = process.env.MARKET_UPDATE_CRON || '30 16 * * 1-5';
  const timezone = 'Asia/Kolkata';

  // Ensure stock master is seeded on backend startup
  await seedStockMasterIfEmpty();

  if (process.env.NODE_ENV === 'test') {
    logger.info('Scheduler disabled in test environment.');
    return;
  }

  try {
    cronTask = cron.schedule(
      cronSchedule,
      async () => {
        logger.info(`[CRON TRIGGERED] Executing daily market data update (${cronSchedule})...`);
        try {
          await runDailyMarketDataUpdate();
        } catch (err) {
          logger.error({ err: err.message }, 'Scheduled daily market data update job crashed');
        }
      },
      {
        scheduled: true,
        timezone,
      }
    );

    logger.info(`Daily Stock Price Update Scheduler initialized (Schedule: '${cronSchedule}', Timezone: ${timezone})`);
  } catch (err) {
    logger.error({ err: err.message }, 'Failed to initialize daily market data update scheduler');
  }
};

const stopScheduler = () => {
  if (cronTask) {
    cronTask.stop();
    logger.info('Market data update scheduler stopped.');
  }
};

module.exports = {
  initScheduler,
  stopScheduler,
};
