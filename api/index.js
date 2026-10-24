const app = require('../backend/src/app');
const connectDB = require('../backend/src/config/db');

let isDbConnected = false;

module.exports = async (req, res) => {
  // Lazily connect to MongoDB Atlas if MONGO_URI is configured
  if (!isDbConnected && process.env.MONGO_URI) {
    try {
      await connectDB();
      isDbConnected = true;
    } catch (err) {
      console.warn('[VERCEL SERVERLESS] MongoDB connection warning:', err.message);
    }
  }

  return app(req, res);
};
