const alertService = require('../services/alertService');
const logger = require('../utils/logger');

const getUserIdAndGuest = (req) => {
  const userId = req.user ? req.user.id || req.user._id : null;
  const guestId = req.headers['x-guest-id'] || 'default_guest';
  return { userId, guestId };
};

const getAlerts = async (req, res, next) => {
  try {
    const { userId, guestId } = getUserIdAndGuest(req);
    const alerts = await alertService.evaluateAlerts(userId, guestId);
    res.status(200).json({ status: 'success', data: { alerts } });
  } catch (err) {
    logger.error({ err: err.message }, 'getAlerts error');
    next(err);
  }
};

const createAlert = async (req, res, next) => {
  try {
    const { userId, guestId } = getUserIdAndGuest(req);
    const { symbol, alertType, targetValue, companyName } = req.body;

    if (!symbol || !alertType || targetValue === undefined) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Symbol, alertType, and targetValue parameters are required',
        },
      });
    }

    const newAlert = await alertService.createAlert(userId, guestId, {
      symbol,
      alertType,
      targetValue,
      companyName,
    });

    const alerts = await alertService.getUserAlerts(userId, guestId);
    res.status(201).json({ status: 'success', data: { alert: newAlert, alerts } });
  } catch (err) {
    logger.error({ err: err.message }, 'createAlert error');
    next(err);
  }
};

const deleteAlert = async (req, res, next) => {
  try {
    const { userId, guestId } = getUserIdAndGuest(req);
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Alert ID parameter is required',
        },
      });
    }

    await alertService.deleteAlert(userId, guestId, id);
    const alerts = await alertService.getUserAlerts(userId, guestId);
    res.status(200).json({ status: 'success', data: { alerts } });
  } catch (err) {
    logger.error({ err: err.message }, 'deleteAlert error');
    next(err);
  }
};

module.exports = {
  getAlerts,
  createAlert,
  deleteAlert,
};
