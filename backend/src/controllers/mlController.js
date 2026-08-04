const axios = require('axios');
const logger = require('../utils/logger');

const predictSentiment = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      const error = new Error('Text parameter is required for sentiment prediction');
      error.statusCode = 400;
      error.code = 'INVALID_TEXT';
      return next(error);
    }

    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';

    try {
      const response = await axios.post(`${aiServiceUrl}/predict/sentiment`, {
        text: text.trim(),
      }, { timeout: 5000 });

      return res.status(200).json(response.data);
    } catch (apiErr) {
      logger.warn({ err: apiErr.message }, 'FastAPI service unavailable for sentiment, using fallback calculation');

      // Node fallback calculation if FastAPI internal service is down
      const lower = text.toLowerCase();
      const posWords = ['profit', 'growth', 'increased', 'record', 'strong', 'surged', 'improved', 'up', 'high'];
      const negWords = ['loss', 'fell', 'decline', 'shrank', 'dropped', 'weak', 'cut', 'down', 'low'];

      const posHits = posWords.filter((w) => lower.includes(w)).length;
      const negHits = negWords.filter((w) => lower.includes(w)).length;

      let label = 'neutral';
      let confidence = 0.70;
      if (posHits > negHits) {
        label = 'positive';
        confidence = 0.85;
      } else if (negHits > posHits) {
        label = 'negative';
        confidence = 0.85;
      }

      return res.status(200).json({
        label,
        confidence,
        probabilities: {
          positive: label === 'positive' ? 0.85 : 0.08,
          neutral: label === 'neutral' ? 0.84 : 0.07,
          negative: label === 'negative' ? 0.85 : 0.08,
        },
      });
    }
  } catch (err) {
    next(err);
  }
};

module.exports = {
  predictSentiment,
};
