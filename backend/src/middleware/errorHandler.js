const logger = require('../utils/logger');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';
  const code = err.code || (statusCode === 500 ? 'INTERNAL_SERVER_ERROR' : 'BAD_REQUEST');
  const details = err.details || null;

  logger.error({
    err,
    req: {
      method: req.method,
      url: req.url,
      ip: req.ip,
    },
  }, `API Error: ${message}`);

  res.status(statusCode).json({
    error: {
      code,
      message,
      details,
    },
  });
};

module.exports = errorHandler;
