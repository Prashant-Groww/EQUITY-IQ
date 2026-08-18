const mongoose = require('mongoose');

const MarketUpdateStatusSchema = new mongoose.Schema(
  {
    lastRunAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['RUNNING', 'SUCCESS', 'PARTIAL_SUCCESS', 'FAILED'],
      default: 'RUNNING',
    },
    totalStocks: {
      type: Number,
      default: 0,
    },
    successfulUpdates: {
      type: Number,
      default: 0,
    },
    failedUpdates: {
      type: Number,
      default: 0,
    },
    dataSource: {
      type: String,
      default: 'Yahoo Finance NSE',
    },
    errors: [
      {
        symbol: String,
        error: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('MarketUpdateStatus', MarketUpdateStatusSchema);
