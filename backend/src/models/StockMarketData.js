const mongoose = require('mongoose');

const StockMarketDataSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    exchange: {
      type: String,
      default: 'NSE',
      uppercase: true,
      trim: true,
    },
    date: {
      type: String, // Format: YYYY-MM-DD
      required: true,
      index: true,
    },
    open: {
      type: Number,
      default: null,
    },
    high: {
      type: Number,
      default: null,
    },
    low: {
      type: Number,
      default: null,
    },
    close: {
      type: Number,
      default: null,
    },
    previousClose: {
      type: Number,
      default: null,
    },
    change: {
      type: Number,
      default: null,
    },
    changePercent: {
      type: Number,
      default: null,
    },
    volume: {
      type: Number,
      default: null,
    },
    isTradingDay: {
      type: Boolean,
      default: true,
    },
    dataSource: {
      type: String,
      default: 'Yahoo Finance NSE',
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index on symbol + date for upsert idempotency and historical lookup
StockMarketDataSchema.index({ symbol: 1, date: -1 }, { unique: true });

module.exports = mongoose.model('StockMarketData', StockMarketDataSchema);
