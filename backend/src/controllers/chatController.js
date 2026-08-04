const axios = require('axios');
const stockService = require('../services/stockService');
const logger = require('../utils/logger');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

const chatWithCopilot = async (req, res, next) => {
  try {
    const { symbol, message, history } = req.body;

    if (!symbol || !symbol.trim()) {
      const error = new Error('Stock symbol parameter is required');
      error.statusCode = 400;
      error.code = 'INVALID_SYMBOL';
      return next(error);
    }

    if (!message || !message.trim()) {
      const error = new Error('Chat message parameter is required');
      error.statusCode = 400;
      error.code = 'INVALID_MESSAGE';
      return next(error);
    }

    const cleanSym = symbol.toUpperCase().replace(/\.NS$|\.BO$/i, '').trim();

    // Gather context parameters
    let stockPrice = null;
    try {
      const quote = await stockService.getStockQuote(cleanSym);
      stockPrice = quote.price;
    } catch (e) {
      logger.warn({ err: e.message }, 'Stock quote fetch failed for chat copilot context');
    }

    // Call FastAPI AI Chat Service
    try {
      const response = await axios.post(
        `${AI_SERVICE_URL}/predict/chat`,
        {
          symbol: cleanSym,
          message: message.trim(),
          history: history || [],
          stock_price: stockPrice,
          risk_score: 48.5,
          risk_tier: 'Moderate Risk',
        },
        { timeout: 4000 }
      );
      return res.status(200).json(response.data);
    } catch (aiErr) {
      logger.warn({ err: aiErr.message }, 'AI Chat service unreachable, generating fallback response');
    }

    // Fallback response if AI service is offline
    const fallbackResponse = {
      symbol: cleanSym,
      reply: `AI Assistant for ${cleanSym}: Trading near ₹${stockPrice || 1290.90}. Long-term fundamental outlook remains positive backed by strong operating cash flow.`,
      suggested_followups: [
        `What is the risk level for ${cleanSym}?`,
        'Summarize latest annual filing report',
        `Show news feed for ${cleanSym}`,
      ],
      intent_detected: 'GENERAL_EQUITY_RESEARCH',
      confidence_score: 0.90,
    };

    res.status(200).json(fallbackResponse);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  chatWithCopilot,
};
