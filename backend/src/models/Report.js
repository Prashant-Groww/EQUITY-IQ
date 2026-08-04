const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    companySymbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      default: 'txt',
    },
    extractedText: {
      type: String,
      required: true,
    },
    executiveSummary: {
      type: String,
      required: true,
    },
    extractedMetrics: {
      revenue_growth: { type: String, default: 'N/A' },
      net_profit: { type: String, default: 'N/A' },
      operating_margin: { type: String, default: 'N/A' },
      debt_to_equity: { type: String, default: 'N/A' },
    },
    growthDrivers: [
      {
        type: String,
      },
    ],
    keyRisks: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

reportSchema.index({ companySymbol: 1, createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);
