require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    if (process.env.NODE_ENV !== 'test') {
      await connectDB();
    }
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

    const shutdown = (signal) => {
      logger.info(`Received ${signal}. Shutting down HTTP server gracefully...`);
      server.close(() => {
        logger.info('HTTP server closed. Process terminating.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    logger.error({ err }, 'Failed to initialize server');
    process.exit(1);
  }
};

startServer();
