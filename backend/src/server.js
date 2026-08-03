require('dotenv').config();
const app = require('./app');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`EquityIQ Backend API listening on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  logger.error({ err }, 'Unhandled Promise Rejection');
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  logger.error({ err }, 'Uncaught Exception');
  process.exit(1);
});
