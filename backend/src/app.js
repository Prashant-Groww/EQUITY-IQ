const express = require('express');
const cors = require('cors');
const pinoHttp = require('pino-http');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'equityiq-backend',
    timestamp: new Date().toISOString(),
  });
});

// 404 Route Handler
app.use((req, res, next) => {
  const error = new Error(`Route Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  error.code = 'NOT_FOUND';
  next(error);
});

// Centralized Error Handler
app.use(errorHandler);

module.exports = app;
