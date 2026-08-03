const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async (retries = 5, delay = 5000) => {
  const connString = process.env.MONGODB_URI || 'mongodb://localhost:27017/equityiq';

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(connString, {
        serverSelectionTimeoutMS: 5000,
      });

      logger.info(`MongoDB Connected: ${conn.connection.host} [database: ${conn.connection.name}]`);
      return conn;
    } catch (err) {
      logger.error({ err }, `MongoDB connection attempt ${attempt}/${retries} failed.`);

      if (attempt === retries) {
        logger.error('Max MongoDB connection retries reached. Exiting application.');
        throw err;
      }

      logger.info(`Retrying connection in ${delay / 1000} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected cleanly');
  } catch (err) {
    logger.error({ err }, 'Error disconnecting MongoDB');
  }
};

module.exports = { connectDB, disconnectDB };
