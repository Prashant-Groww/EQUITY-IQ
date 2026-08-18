const express = require('express');
const adminController = require('../controllers/adminController');

const router = express.Router();

// Admin protection key middleware (allows dev bypass if ADMIN_API_KEY not set)
const requireAdminKey = (req, res, next) => {
  const adminKey = process.env.ADMIN_API_KEY;
  if (!adminKey || process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
    return next();
  }
  const reqKey = req.headers['x-admin-key'] || req.query.adminKey;
  if (reqKey !== adminKey) {
    const err = new Error('Unauthorized admin access');
    err.statusCode = 401;
    err.code = 'UNAUTHORIZED';
    return next(err);
  }
  next();
};

router.post('/stocks/update-prices', requireAdminKey, adminController.triggerMarketUpdate);
router.get('/stocks/update-status', requireAdminKey, adminController.getMarketUpdateStatus);

module.exports = router;
