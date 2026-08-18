const mongoose = require('mongoose');

const StockSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    sector: {
      type: String,
      default: 'Equities',
      trim: true,
    },
    industry: {
      type: String,
      default: 'Diversified',
      trim: true,
    },
    exchange: {
      type: String,
      default: 'NSE',
      uppercase: true,
      trim: true,
    },
    isin: {
      type: String,
      default: null,
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
    marketCapCategory: {
      type: String,
      default: 'Large Cap',
      enum: ['Large Cap', 'Mid Cap', 'Small Cap'],
    },
    price: {
      type: Number,
      default: null,
    },
    previousClose: {
      type: Number,
      default: null,
    },
    open: {
      type: Number,
      default: null,
    },
    dayHigh: {
      type: Number,
      default: null,
    },
    dayLow: {
      type: Number,
      default: null,
    },
    fiftyTwoWeekHigh: {
      type: Number,
      default: null,
    },
    fiftyTwoWeekLow: {
      type: Number,
      default: null,
    },
    volume: {
      type: Number,
      default: null,
    },
    marketCap: {
      type: Number,
      default: null,
    },
    peRatio: {
      type: Number,
      default: null,
    },
    pbRatio: {
      type: Number,
      default: null,
    },
    eps: {
      type: Number,
      default: null,
    },
    bookValue: {
      type: Number,
      default: null,
    },
    roe: {
      type: Number,
      default: null,
    },
    roce: {
      type: Number,
      default: null,
    },
    debtToEquity: {
      type: Number,
      default: null,
    },
    dividendYield: {
      type: Number,
      default: null,
    },
    deliveryPct: {
      type: Number,
      default: null,
    },
    isNSE: {
      type: Boolean,
      default: true,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound text index for fast multi-field search across symbol, companyName, sector, industry
StockSchema.index({
  symbol: 'text',
  companyName: 'text',
  sector: 'text',
  industry: 'text',
});

module.exports = mongoose.model('Stock', StockSchema);
