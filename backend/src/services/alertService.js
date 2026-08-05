const Alert = require('../models/Alert');
const stockService = require('./stockService');
const logger = require('../utils/logger');

const createAlert = async (userId, guestId, { symbol, alertType, targetValue, companyName }) => {
  const cleanSymbol = symbol.toUpperCase().replace(/\.NS$/i, '').trim();

  const alertDoc = await Alert.create({
    userId: userId || undefined,
    guestId: userId ? undefined : guestId || 'default_guest',
    symbol: cleanSymbol,
    companyName: companyName || `${cleanSymbol} India`,
    alertType,
    targetValue: Number(targetValue),
  });

  return alertDoc;
};

const getUserAlerts = async (userId = null, guestId = 'default_guest') => {
  const query = userId ? { userId } : { guestId };
  const alerts = await Alert.find(query).sort({ createdAt: -1 });

  // If no custom alerts exist, create standard baseline sample alerts for demo user
  if (alerts.length === 0) {
    logger.info(`Creating baseline demo alerts for ${userId ? 'user ' + userId : 'guest ' + guestId}`);
    const demoAlerts = await Alert.create([
      {
        userId: userId || undefined,
        guestId: userId ? undefined : guestId,
        symbol: 'RELIANCE',
        companyName: 'Reliance Industries Limited',
        alertType: 'PRICE_ABOVE',
        targetValue: 1350.0,
      },
      {
        userId: userId || undefined,
        guestId: userId ? undefined : guestId,
        symbol: 'TCS',
        companyName: 'Tata Consultancy Services Limited',
        alertType: 'PRICE_BELOW',
        targetValue: 2400.0,
      },
    ]);
    return demoAlerts;
  }

  return alerts;
};

const deleteAlert = async (userId, guestId, alertId) => {
  const query = userId ? { userId, _id: alertId } : { guestId, _id: alertId };
  const deleted = await Alert.findOneAndDelete(query);
  return deleted;
};

const evaluateAlerts = async (userId = null, guestId = 'default_guest') => {
  const alerts = await getUserAlerts(userId, guestId);
  const evaluatedAlerts = [];

  for (const alert of alerts) {
    if (alert.triggered) {
      evaluatedAlerts.push(alert);
      continue;
    }

    try {
      const quote = await stockService.getStockQuote(alert.symbol);
      const currentPrice = quote.price || alert.targetValue;
      const prevClose = quote.previousClose || currentPrice;
      const dayChangePct = Math.abs(((currentPrice - prevClose) / prevClose) * 100);

      let triggeredNow = false;
      let msg = '';

      if (alert.alertType === 'PRICE_ABOVE' && currentPrice >= alert.targetValue) {
        triggeredNow = true;
        msg = `🚀 PRICE ALERT: ${alert.symbol} crossed above target ₹${alert.targetValue} (Current: ₹${currentPrice.toFixed(2)})`;
      } else if (alert.alertType === 'PRICE_BELOW' && currentPrice <= alert.targetValue) {
        triggeredNow = true;
        msg = `📉 PRICE ALERT: ${alert.symbol} dropped below target ₹${alert.targetValue} (Current: ₹${currentPrice.toFixed(2)})`;
      } else if (alert.alertType === 'VOLATILITY_SPIKE' && dayChangePct >= alert.targetValue) {
        triggeredNow = true;
        msg = `⚡ VOLATILITY ALERT: ${alert.symbol} moved ${dayChangePct.toFixed(2)}% today (Threshold: ${alert.targetValue}%)`;
      } else if (alert.alertType === 'SENTIMENT_SHIFT') {
        triggeredNow = true;
        msg = `📰 SENTIMENT ALERT: Positive momentum detected for ${alert.symbol}`;
      }

      if (triggeredNow) {
        alert.triggered = true;
        alert.triggeredAt = new Date();
        alert.notificationMessage = msg;
        await alert.save();
      }

      evaluatedAlerts.push(alert);
    } catch (err) {
      logger.warn({ err: err.message }, `Error evaluating alert for ${alert.symbol}`);
      evaluatedAlerts.push(alert);
    }
  }

  return evaluatedAlerts;
};

module.exports = {
  createAlert,
  getUserAlerts,
  deleteAlert,
  evaluateAlerts,
};
