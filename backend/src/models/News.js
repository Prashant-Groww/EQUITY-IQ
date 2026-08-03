const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    source: {
      type: String,
      required: [true, 'Source is required'],
      trim: true,
    },
    url: {
      type: String,
      required: [true, 'URL is required'],
      unique: true,
      trim: true,
      index: true,
    },
    publishedAt: {
      type: Date,
      required: [true, 'Published date is required'],
      default: Date.now,
      index: true,
    },
    companySymbol: {
      type: String,
      required: [true, 'Company symbol is required'],
      uppercase: true,
      trim: true,
      index: true,
    },
    summary: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Compound index for fast queries by symbol and publication date
newsSchema.index({ companySymbol: 1, publishedAt: -1 });

const News = mongoose.model('News', newsSchema);

module.exports = News;
