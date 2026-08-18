const Stock = require('../models/Stock');
const StockMarketData = require('../models/StockMarketData');
const MarketUpdateStatus = require('../models/MarketUpdateStatus');
const { fetchLatestMarketData, sleep } = require('./marketDataFetcher');
const { INDIAN_STOCKS_UNIVERSE } = require('../data/indianStocksUniverse');
const logger = require('../utils/logger');

/**
 * Seed Stock Master collection if empty using the 500+ Indian Stocks Universe.
 * Ensures stock master list is initialized without deleting or recreating existing documents.
 */
const seedStockMasterIfEmpty = async () => {
  try {
    const count = await Stock.countDocuments();
    if (count === 0) {
      logger.info('Initializing Stock Master collection with 500+ NSE stock universe...');
      const docs = INDIAN_STOCKS_UNIVERSE.map((item) => {
        const cleanSymbol = item.symbol.toUpperCase().replace(/\.NS$|\.BO$/i, '').trim();
        return {
          symbol: cleanSymbol,
          companyName: item.companyName || `${cleanSymbol} Limited`,
          exchange: 'NSE',
          sector: item.sector || 'Equities',
          industry: item.industry || 'Diversified',
          marketCapCategory: item.marketCapCategory || 'Large Cap',
          isin: item.isin || null,
          active: true,
          price: item.price || null,
          previousClose: item.previousClose || null,
          open: item.open || null,
          dayHigh: item.dayHigh || null,
          dayLow: item.dayLow || null,
          volume: item.volume || null,
          marketCap: item.marketCap || null,
          peRatio: item.peRatio || null,
          pbRatio: item.pbRatio || null,
          eps: item.eps || null,
          roe: item.roe || null,
          roce: item.roce || null,
          debtToEquity: item.debtToEquity || null,
          dividendYield: item.dividendYield || null,
          deliveryPct: item.deliveryPct || null,
          lastUpdated: new Date(),
        };
      });

      await Stock.insertMany(docs, { ordered: false });
      logger.info(`Stock Master initialized with ${docs.length} stocks.`);
    }
  } catch (err) {
    logger.error({ err: err.message }, 'Error seeding Stock Master collection');
  }
};

/**
 * Execute full daily market data update for all active NSE stocks in MongoDB.
 * Rate-limited in controlled batches to respect provider rate limits.
 * Uses UPSERT to guarantee zero duplicate daily records.
 */
const runDailyMarketDataUpdate = async () => {
  logger.info('==================================================');
  logger.info('EQUITYIQ MARKET DATA UPDATE JOB STARTED');
  logger.info(`Timestamp: ${new Date().toISOString()}`);
  logger.info('==================================================');

  // Ensure stock master exists
  await seedStockMasterIfEmpty();

  // Find all active stocks
  const activeStocks = await Stock.find({ active: true }).lean();
  const totalStocks = activeStocks.length;

  // Create status tracking record
  const updateStatusDoc = await MarketUpdateStatus.create({
    lastRunAt: new Date(),
    status: 'RUNNING',
    totalStocks,
    successfulUpdates: 0,
    failedUpdates: 0,
    dataSource: 'Yahoo Finance NSE',
    errors: [],
  });

  let successfulUpdates = 0;
  let failedUpdates = 0;
  const errors = [];

  const BATCH_SIZE = 10;
  const BATCH_DELAY_MS = 250;

  for (let i = 0; i < totalStocks; i += BATCH_SIZE) {
    const batch = activeStocks.slice(i, i + BATCH_SIZE);

    await Promise.all(
      batch.map(async (stock) => {
        try {
          // 1. Fetch live market data for this exact symbol
          const marketData = await fetchLatestMarketData(stock.symbol);

          // 2. Upsert into StockMarketData collection (symbol + date unique index)
          await StockMarketData.updateOne(
            { symbol: marketData.symbol, date: marketData.date },
            { $set: marketData },
            { upsert: true }
          );

          // 3. Update cached latest price summary in Stock Master
          await Stock.updateOne(
            { symbol: stock.symbol },
            {
              $set: {
                price: marketData.close,
                previousClose: marketData.previousClose,
                open: marketData.open,
                dayHigh: marketData.high,
                dayLow: marketData.low,
                volume: marketData.volume,
                lastUpdated: marketData.updatedAt,
              },
            }
          );

          successfulUpdates++;
        } catch (err) {
          failedUpdates++;
          const errorMsg = err.message || 'Unknown market data fetch error';
          logger.warn(`Failed to update ${stock.symbol}: ${errorMsg}`);
          errors.push({ symbol: stock.symbol, error: errorMsg });
        }
      })
    );

    // Rate-limiting delay between batches
    if (i + BATCH_SIZE < totalStocks) {
      await sleep(BATCH_DELAY_MS);
    }
  }

  // Determine final status
  let finalStatus = 'SUCCESS';
  if (failedUpdates > 0 && successfulUpdates > 0) {
    finalStatus = 'PARTIAL_SUCCESS';
  } else if (failedUpdates > 0 && successfulUpdates === 0) {
    finalStatus = 'FAILED';
  }

  const completedAt = new Date();

  // Save finalized status
  updateStatusDoc.completedAt = completedAt;
  updateStatusDoc.successfulUpdates = successfulUpdates;
  updateStatusDoc.failedUpdates = failedUpdates;
  updateStatusDoc.status = finalStatus;
  updateStatusDoc.errors = errors;
  await updateStatusDoc.save();

  logger.info('==================================================');
  logger.info('EQUITYIQ MARKET DATA UPDATE JOB COMPLETED');
  logger.info(`Status: ${finalStatus}`);
  logger.info(`Total Stocks: ${totalStocks}`);
  logger.info(`Updated: ${successfulUpdates}`);
  logger.info(`Failed: ${failedUpdates}`);
  logger.info(`Completed At: ${completedAt.toISOString()}`);
  logger.info('==================================================');

  return {
    jobId: updateStatusDoc._id,
    lastRunAt: updateStatusDoc.lastRunAt,
    completedAt,
    status: finalStatus,
    totalStocks,
    successfulUpdates,
    failedUpdates,
    dataSource: 'Yahoo Finance NSE',
    errors,
  };
};

module.exports = {
  seedStockMasterIfEmpty,
  runDailyMarketDataUpdate,
};
