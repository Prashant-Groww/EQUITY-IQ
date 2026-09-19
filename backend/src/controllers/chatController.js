const stockService = require('../services/stockService');
const geminiService = require('../services/geminiService');
const logger = require('../utils/logger');

const chatWithCopilot = async (req, res, next) => {
  try {
    const { symbol, message, history, apiKey } = req.body;

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

    // Fetch genuine market quote and financials to inject context
    let quote = null;
    let financials = null;
    try {
      quote = await stockService.getStockQuote(cleanSym).catch(() => null);
    } catch (e) {
      logger.warn({ err: e.message }, 'Failed to fetch quote for chat context');
    }

    try {
      const finData = await stockService.getStockFinancials(cleanSym).catch(() => null);
      financials = finData?.financials || null;
    } catch (e) {
      logger.warn({ err: e.message }, 'Failed to fetch financials for chat context');
    }

    const userApiKey = req.headers['x-gemini-api-key'] || apiKey;

    // Generate response using Google Gemini 2.5 Flash
    const aiResult = await geminiService.generateGeminiReply({
      symbol: cleanSym,
      message: message.trim(),
      history: history || [],
      quote,
      financials,
      userApiKey,
    });

    return res.status(200).json({
      symbol: cleanSym,
      reply: aiResult.reply,
      suggested_followups: aiResult.suggested_followups,
      intent_detected: 'EQUITY_RESEARCH_ANALYSIS',
      confidence_score: 0.98,
      isGemini: aiResult.isGemini,
      model: aiResult.model,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  chatWithCopilot,
};
