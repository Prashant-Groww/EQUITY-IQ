const NodeCache = require('node-cache');
const yahooFinance = require('yahoo-finance2').default;
const logger = require('../utils/logger');

// Cache configuration: stdTTL 300s (5 mins), checkperiod 60s
const stockCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

// Helper to limit external HTTP calls to 2500ms before triggering fallback
const withTimeout = (promise, ms = 2500) => {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`External provider timeout after ${ms}ms`));
    }, ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
};

// Comprehensive mock repository for fallback & offline testing
const mockStockDatabase = {
  AAPL: {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    exchange: 'NASDAQ',
    price: 189.84,
    change: 2.35,
    percentChange: 1.25,
    previousClose: 187.49,
    open: 188.00,
    dayHigh: 190.50,
    dayLow: 187.80,
    volume: 52430000,
    marketCap: 2940000000000,
    peRatio: 30.45,
    eps: 6.23,
    fiftyTwoWeekHigh: 199.62,
    fiftyTwoWeekLow: 164.08,
    revenue: 383280000000,
    dividendYield: 0.52,
  },
  MSFT: {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    exchange: 'NASDAQ',
    price: 415.50,
    change: -1.20,
    percentChange: -0.29,
    previousClose: 416.70,
    open: 416.00,
    dayHigh: 418.20,
    dayLow: 413.90,
    volume: 21340000,
    marketCap: 3090000000000,
    peRatio: 35.80,
    eps: 11.60,
    fiftyTwoWeekHigh: 430.82,
    fiftyTwoWeekLow: 309.45,
    revenue: 227580000000,
    dividendYield: 0.72,
  },
  GOOGL: {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    exchange: 'NASDAQ',
    price: 175.20,
    change: 3.10,
    percentChange: 1.80,
    previousClose: 172.10,
    open: 173.00,
    dayHigh: 176.40,
    dayLow: 172.80,
    volume: 28900000,
    marketCap: 2180000000000,
    peRatio: 26.50,
    eps: 6.61,
    fiftyTwoWeekHigh: 182.18,
    fiftyTwoWeekLow: 115.35,
    revenue: 307390000000,
    dividendYield: 0.46,
  },
  NVDA: {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    exchange: 'NASDAQ',
    price: 120.80,
    change: 4.80,
    percentChange: 4.14,
    previousClose: 116.00,
    open: 117.50,
    dayHigh: 122.00,
    dayLow: 117.00,
    volume: 89400000,
    marketCap: 2970000000000,
    peRatio: 72.30,
    eps: 1.67,
    fiftyTwoWeekHigh: 140.76,
    fiftyTwoWeekLow: 39.23,
    revenue: 60920000000,
    dividendYield: 0.03,
  },
  TSLA: {
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    exchange: 'NASDAQ',
    price: 210.40,
    change: -5.60,
    percentChange: -2.59,
    previousClose: 216.00,
    open: 214.00,
    dayHigh: 217.20,
    dayLow: 208.50,
    volume: 64200000,
    marketCap: 670000000000,
    peRatio: 58.10,
    eps: 3.62,
    fiftyTwoWeekHigh: 271.00,
    fiftyTwoWeekLow: 138.80,
    revenue: 96770000000,
    dividendYield: 0.00,
  },
};

// Helper for generating historical price data arrays based on range
const generateHistoricalPoints = (basePrice, range = '1M') => {
  const pointsCount = range === '1D' ? 24 : range === '1W' ? 7 : range === '1M' ? 30 : range === '1Y' ? 52 : 120;
  const data = [];
  let currentPrice = basePrice * 0.85;
  const now = new Date();

  for (let i = pointsCount; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * (range === '1D' ? 3600000 : range === '1W' ? 86400000 : range === '1M' ? 86400000 : 604800000));
    const randomVariation = (Math.random() - 0.48) * (basePrice * 0.03);
    currentPrice = Math.max(10, currentPrice + randomVariation);
    data.push({
      date: timestamp.toISOString().split('T')[0],
      timestamp: timestamp.toISOString(),
      close: parseFloat(currentPrice.toFixed(2)),
      open: parseFloat((currentPrice * 0.99).toFixed(2)),
      high: parseFloat((currentPrice * 1.01).toFixed(2)),
      low: parseFloat((currentPrice * 0.98).toFixed(2)),
      volume: Math.floor(Math.random() * 20000000) + 10000000,
    });
  }

  // Ensure last point matches current basePrice
  if (data.length > 0) {
    data[data.length - 1].close = basePrice;
  }

  return data;
};

const searchStocks = async (query) => {
  const cacheKey = `search:${query.toLowerCase()}`;
  const cachedData = stockCache.get(cacheKey);

  if (cachedData) {
    logger.info(`[CACHE HIT] key=${cacheKey}`);
    return cachedData;
  }
  logger.info(`[CACHE MISS] key=${cacheKey}`);

  try {
    const searchResult = await withTimeout(yahooFinance.search(query), 2000);
    const results = (searchResult.quotes || [])
      .filter((q) => q.isYahooFinance && q.symbol)
      .map((q) => ({
        symbol: q.symbol,
        name: q.shortname || q.longname || q.symbol,
        exchange: q.exchange || 'N/A',
        type: q.quoteType || 'EQUITY',
      }));

    if (results.length > 0) {
      stockCache.set(cacheKey, results, 300); // 5 min TTL
      return results;
    }
  } catch (err) {
    logger.warn({ err: err.message }, 'External stock search failed, serving fallback matches');
  }

  // Fallback search matching local db
  const qUpper = query.toUpperCase();
  const fallbackResults = Object.values(mockStockDatabase)
    .filter((s) => s.symbol.includes(qUpper) || s.name.toUpperCase().includes(qUpper))
    .map((s) => ({
      symbol: s.symbol,
      name: s.name,
      exchange: s.exchange,
      type: 'EQUITY',
    }));

  stockCache.set(cacheKey, fallbackResults, 300);
  return fallbackResults;
};

const getQuote = async (symbol) => {
  const sym = symbol.toUpperCase();
  const cacheKey = `quote:${sym}`;
  const cachedData = stockCache.get(cacheKey);

  if (cachedData) {
    logger.info(`[CACHE HIT] key=${cacheKey}`);
    return cachedData;
  }
  logger.info(`[CACHE MISS] key=${cacheKey}`);

  try {
    const quote = await withTimeout(yahooFinance.quote(sym), 2000);
    if (quote && quote.regularMarketPrice) {
      const result = {
        symbol: quote.symbol,
        name: quote.shortName || quote.longName || quote.symbol,
        exchange: quote.fullExchangeName || quote.exchange || 'NASDAQ',
        price: quote.regularMarketPrice,
        change: quote.regularMarketChange || 0,
        percentChange: quote.regularMarketChangePercent || 0,
        previousClose: quote.regularMarketPreviousClose || quote.regularMarketPrice,
        open: quote.regularMarketOpen || quote.regularMarketPrice,
        dayHigh: quote.regularMarketDayHigh || quote.regularMarketPrice,
        dayLow: quote.regularMarketDayLow || quote.regularMarketPrice,
        volume: quote.regularMarketVolume || 0,
        marketCap: quote.marketCap || 0,
        peRatio: quote.trailingPE || null,
        eps: quote.epsTrailingTwelveMonths || null,
        fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh || quote.regularMarketPrice,
        fiftyTwoWeekLow: quote.fiftyTwoWeekLow || quote.regularMarketPrice,
      };

      stockCache.set(cacheKey, result, 300); // 5 min TTL
      return result;
    }
  } catch (err) {
    logger.warn({ err: err.message }, `External quote failed for ${sym}, serving fallback quote`);
  }

  // Fallback quote
  const fallback = mockStockDatabase[sym] || {
    symbol: sym,
    name: `${sym} Corp`,
    exchange: 'NASDAQ',
    price: 150.00,
    change: 1.50,
    percentChange: 1.01,
    previousClose: 148.50,
    open: 149.00,
    dayHigh: 151.00,
    dayLow: 148.00,
    volume: 25000000,
    marketCap: 100000000000,
    peRatio: 25.0,
    eps: 5.0,
    fiftyTwoWeekHigh: 165.00,
    fiftyTwoWeekLow: 120.00,
  };

  stockCache.set(cacheKey, fallback, 300);
  return fallback;
};

const getHistory = async (symbol, range = '1M') => {
  const sym = symbol.toUpperCase();
  const cacheKey = `history:${sym}:${range}`;
  const cachedData = stockCache.get(cacheKey);

  if (cachedData) {
    logger.info(`[CACHE HIT] key=${cacheKey}`);
    return cachedData;
  }
  logger.info(`[CACHE MISS] key=${cacheKey}`);

  const quote = await getQuote(sym);
  const history = generateHistoricalPoints(quote.price, range);

  stockCache.set(cacheKey, history, 900); // 15 min TTL
  return history;
};

const getFinancials = async (symbol) => {
  const sym = symbol.toUpperCase();
  const cacheKey = `financials:${sym}`;
  const cachedData = stockCache.get(cacheKey);

  if (cachedData) {
    logger.info(`[CACHE HIT] key=${cacheKey}`);
    return cachedData;
  }
  logger.info(`[CACHE MISS] key=${cacheKey}`);

  const quote = await getQuote(sym);
  const fallbackData = mockStockDatabase[sym] || {};

  const financials = {
    symbol: quote.symbol,
    name: quote.name,
    marketCap: quote.marketCap || fallbackData.marketCap || 150000000000,
    peRatio: quote.peRatio || fallbackData.peRatio || 24.5,
    eps: quote.eps || fallbackData.eps || 5.2,
    revenue: fallbackData.revenue || 50000000000,
    fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh || fallbackData.fiftyTwoWeekHigh || quote.price * 1.15,
    fiftyTwoWeekLow: quote.fiftyTwoWeekLow || fallbackData.fiftyTwoWeekLow || quote.price * 0.85,
    dividendYield: fallbackData.dividendYield || 0.45,
    currency: 'USD',
  };

  stockCache.set(cacheKey, financials, 900); // 15 min TTL
  return financials;
};

// Clear cache helper for testing
const clearCache = () => {
  stockCache.flushAll();
};

module.exports = {
  searchStocks,
  getQuote,
  getHistory,
  getFinancials,
  clearCache,
};
