const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      required: false,
    },
    guestId: {
      type: String,
      index: true,
      required: false,
    },
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    companyName: {
      type: String,
      default: 'Indian Ticker',
      trim: true,
    },
    alertType: {
      type: String,
      enum: ['PRICE_ABOVE', 'PRICE_BELOW', 'VOLATILITY_SPIKE', 'SENTIMENT_SHIFT'],
      required: true,
    },
    targetValue: {
      type: Number,
      required: true,
    },
    triggered: {
      type: Boolean,
      default: false,
    },
    triggeredAt: {
      type: Date,
      default: null,
    },
    notificationMessage: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Alert', alertSchema);
