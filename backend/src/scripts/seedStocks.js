require('dotenv').config();
const mongoose = require('mongoose');
const Stock = require('../models/Stock');
const { INDIAN_STOCKS_UNIVERSE } = require('../data/indianStocksUniverse');
const logger = require('../utils/logger');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/equityiq';

async function seedStockUniverse() {
  try {
    logger.info(`Connecting to MongoDB at ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI);
    logger.info('Connected to MongoDB.');

    let upsertCount = 0;
    for (const item of INDIAN_STOCKS_UNIVERSE) {
      const cleanSymbol = item.symbol.toUpperCase().replace(/\.NS$|\.BO$/i, '').trim();
      
      const stockDoc = {
        symbol: cleanSymbol,
        companyName: item.companyName,
        sector: item.sector || 'Equities',
        industry: item.industry || 'Diversified',
        marketCapCategory: item.marketCapCategory || 'Large Cap',
        price: item.price ?? null,
        previousClose: item.previousClose ?? null,
        open: item.open ?? null,
        dayHigh: item.dayHigh ?? null,
        dayLow: item.dayLow ?? null,
        fiftyTwoWeekHigh: item.fiftyTwoWeekHigh ?? null,
        fiftyTwoWeekLow: item.fiftyTwoWeekLow ?? null,
        volume: item.volume ?? null,
        marketCap: item.marketCap ? item.marketCap * 10000000 : null, // Convert Cr to INR
        peRatio: item.peRatio ?? null,
        pbRatio: item.pbRatio ?? null,
        eps: item.eps ?? null,
        bookValue: item.pbRatio && item.price ? Number((item.price / Math.max(0.1, item.pbRatio)).toFixed(2)) : null,
        roe: item.roe ?? null,
        roce: item.roce ?? null,
        debtToEquity: item.debtToEquity ?? null,
        dividendYield: item.dividendYield ?? null,
        deliveryPct: item.deliveryPct ?? null,
        aliases: item.aliases || [],
        isNSE: true,
        lastUpdated: new Date(),
      };

      await Stock.findOneAndUpdate(
        { symbol: cleanSymbol },
        { $set: stockDoc },
        { upsert: true, new: true }
      );
      upsertCount++;
    }

    logger.info(`Successfully seeded/updated ${upsertCount} NSE stocks in MongoDB.`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    logger.error({ err: err.message }, 'Error seeding stock universe');
    process.exit(1);
  }
}

if (require.main === module) {
  seedStockUniverse();
}

module.exports = { seedStockUniverse };
