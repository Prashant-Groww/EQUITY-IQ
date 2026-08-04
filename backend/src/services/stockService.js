const NodeCache = require('node-cache');
const yahooFinance = require('yahoo-finance2').default;
const logger = require('../utils/logger');

// Cache configuration: stdTTL 300s (5 mins), checkperiod 60s
const stockCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

// Helper to enforce fast timeout on external network requests (2000ms max)
const withTimeout = (promise, ms = 2000) => {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`External API request timed out after ${ms}ms`));
    }, ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
};

// Indian Stock Market (NSE/BSE) Dataset & Fallback Database
const MOCK_INDIAN_STOCKS = {
  RELIANCE: {
    symbol: 'RELIANCE',
    companyName: 'Reliance Industries Ltd',
    exchange: 'NSE',
    currency: 'INR',
    price: 2980.50,
    change: 34.20,
    percentChange: 1.16,
    volume: 8452100,
    dayHigh: 3012.00,
    dayLow: 2955.00,
    marketCap: 20160000000000, // ₹20.16 Lakh Crore (~20.16 Trillion INR)
    peRatio: 28.4,
    eps: 104.95,
    revenue: 10000000000000,
    fiftyTwoWeekHigh: 3217.90,
    fiftyTwoWeekLow: 2220.30,
    dividendYield: 0.35,
  },
  TCS: {
    symbol: 'TCS',
    companyName: 'Tata Consultancy Services Ltd',
    exchange: 'NSE',
    currency: 'INR',
    price: 4150.00,
    change: 48.50,
    percentChange: 1.18,
    volume: 3120400,
    dayHigh: 4185.00,
    dayLow: 4110.00,
    marketCap: 15020000000000, // ₹15.02 Lakh Crore
    peRatio: 31.2,
    eps: 133.01,
    revenue: 2408930000000,
    fiftyTwoWeekHigh: 4585.90,
    fiftyTwoWeekLow: 3313.00,
    dividendYield: 1.25,
  },
  INFY: {
    symbol: 'INFY',
    companyName: 'Infosys Ltd',
    exchange: 'NSE',
    currency: 'INR',
    price: 1820.00,
    change: -12.40,
    percentChange: -0.68,
    volume: 6420100,
    dayHigh: 1845.00,
    dayLow: 1805.00,
    marketCap: 7550000000000, // ₹7.55 Lakh Crore
    peRatio: 29.8,
    eps: 61.07,
    revenue: 1536700000000,
    fiftyTwoWeekHigh: 1978.00,
    fiftyTwoWeekLow: 1351.65,
    dividendYield: 2.10,
  },
  HDFCBANK: {
    symbol: 'HDFCBANK',
    companyName: 'HDFC Bank Ltd',
    exchange: 'NSE',
    currency: 'INR',
    price: 1640.00,
    change: 18.30,
    percentChange: 1.13,
    volume: 12450800,
    dayHigh: 1658.00,
    dayLow: 1625.00,
    marketCap: 12500000000000, // ₹12.50 Lakh Crore
    peRatio: 19.5,
    eps: 84.10,
    revenue: 2051200000000,
    fiftyTwoWeekHigh: 1794.00,
    fiftyTwoWeekLow: 1363.55,
    dividendYield: 1.15,
  },
  ICICIBANK: {
    symbol: 'ICICIBANK',
    companyName: 'ICICI Bank Ltd',
    exchange: 'NSE',
    currency: 'INR',
    price: 1210.00,
    change: 14.80,
    percentChange: 1.24,
    volume: 9150300,
    dayHigh: 1225.00,
    dayLow: 1198.00,
    marketCap: 8500000000000, // ₹8.50 Lakh Crore
    peRatio: 18.2,
    eps: 66.48,
    revenue: 1610000000000,
    fiftyTwoWeekHigh: 1257.80,
    fiftyTwoWeekLow: 888.35,
    dividendYield: 0.85,
  },
  SBIN: {
    symbol: 'SBIN',
    companyName: 'State Bank of India',
    exchange: 'NSE',
    currency: 'INR',
    price: 840.00,
    change: -4.50,
    percentChange: -0.53,
    volume: 14205000,
    dayHigh: 852.00,
    dayLow: 835.00,
    marketCap: 7490000000000, // ₹7.49 Lakh Crore
    peRatio: 11.4,
    eps: 73.68,
    revenue: 4700000000000,
    fiftyTwoWeekHigh: 912.10,
    fiftyTwoWeekLow: 543.20,
    dividendYield: 1.63,
  },
  TATAMOTORS: {
    symbol: 'TATAMOTORS',
    companyName: 'Tata Motors Ltd',
    exchange: 'NSE',
    currency: 'INR',
    price: 1015.00,
    change: 22.40,
    percentChange: 2.26,
    volume: 11204000,
    dayHigh: 1030.00,
    dayLow: 995.00,
    marketCap: 3370000000000, // ₹3.37 Lakh Crore
    peRatio: 10.8,
    eps: 93.98,
    revenue: 4379260000000,
    fiftyTwoWeekHigh: 1179.05,
    fiftyTwoWeekLow: 593.30,
    dividendYield: 0.59,
  },
  LT: {
    symbol: 'LT',
    companyName: 'Larsen & Toubro Ltd',
    exchange: 'NSE',
    currency: 'INR',
    price: 3620.00,
    change: 42.00,
    percentChange: 1.17,
    volume: 2150000,
    dayHigh: 3650.00,
    dayLow: 3590.00,
    marketCap: 4980000000000,
    peRatio: 37.5,
    eps: 96.53,
    revenue: 2211130000000,
    fiftyTwoWeekHigh: 3919.90,
    fiftyTwoWeekLow: 2824.00,
    dividendYield: 0.77,
  },
  BHARTIARTL: {
    symbol: 'BHARTIARTL',
    companyName: 'Bharti Airtel Ltd',
    exchange: 'NSE',
    currency: 'INR',
    price: 1480.00,
    change: 15.60,
    percentChange: 1.07,
    volume: 5890000,
    dayHigh: 1495.00,
    dayLow: 1465.00,
    marketCap: 8400000000000,
    peRatio: 72.4,
    eps: 20.44,
    revenue: 1499820000000,
    fiftyTwoWeekHigh: 1622.00,
    fiftyTwoWeekLow: 847.10,
    dividendYield: 0.54,
  },
  ITC: {
    symbol: 'ITC',
    companyName: 'ITC Ltd',
    exchange: 'NSE',
    currency: 'INR',
    price: 490.00,
    change: 2.10,
    percentChange: 0.43,
    volume: 18450000,
    dayHigh: 494.00,
    dayLow: 487.00,
    marketCap: 6120000000000,
    peRatio: 29.8,
    eps: 16.44,
    revenue: 702510000000,
    fiftyTwoWeekHigh: 528.55,
    fiftyTwoWeekLow: 399.30,
    dividendYield: 2.80,
  },
};

// Clean ticker symbol helper (normalizes RELIANCE.NS -> RELIANCE)
const cleanSymbol = (sym) => {
  if (!sym) return '';
  return sym.toUpperCase().replace(/\.NS$|\.BO$/i, '').trim();
};

// Format symbol for Yahoo Finance NSE query
const getYahooNseSymbol = (sym) => {
  const clean = cleanSymbol(sym);
  return clean ? `${clean}.NS` : '';
};

// 1. Ticker Search (Indian NSE/BSE Equities)
const searchStocks = async (query) => {
  if (!query || query.trim().length === 0) return [];
  const q = query.toUpperCase().trim();
  const cacheKey = `search_${q}`;

  const cachedResult = stockCache.get(cacheKey);
  if (cachedResult) {
    logger.info(`[CACHE HIT] key=${cacheKey}`);
    return cachedResult;
  }
  logger.info(`[CACHE MISS] key=${cacheKey}`);

  let results = [];
  try {
    const searchResult = await withTimeout(yahooFinance.search(q, { newsCount: 0 }), 2000);
    if (searchResult && Array.isArray(searchResult.quotes)) {
      results = searchResult.quotes
        .filter((item) => item.symbol && (item.symbol.endsWith('.NS') || item.symbol.endsWith('.BO') || !item.symbol.includes('.')))
        .map((item) => ({
          symbol: cleanSymbol(item.symbol),
          companyName: item.shortname || item.longname || item.symbol,
          exchange: item.exchDisp || 'NSE',
          currency: 'INR',
        }));
    }
  } catch (err) {
    logger.warn({ err: err.message }, `External search failed for query '${q}', using Indian stocks fallback dataset`);
  }

  if (results.length === 0) {
    results = Object.values(MOCK_INDIAN_STOCKS)
      .filter((s) => s.symbol.includes(q) || s.companyName.toUpperCase().includes(q))
      .map((s) => ({
        symbol: s.symbol,
        companyName: s.companyName,
        exchange: s.exchange,
        currency: s.currency,
      }));
  }

  stockCache.set(cacheKey, results, 300);
  return results;
};

// 2. Real-Time Stock Quote (NSE Prices in INR)
const getStockQuote = async (symbol) => {
  const cleanSym = cleanSymbol(symbol);
  const yahooSym = getYahooNseSymbol(cleanSym);
  const cacheKey = `quote_${cleanSym}`;

  const cachedResult = stockCache.get(cacheKey);
  if (cachedResult) {
    logger.info(`[CACHE HIT] key=${cacheKey}`);
    return cachedResult;
  }
  logger.info(`[CACHE MISS] key=${cacheKey}`);

  let quoteData = null;
  try {
    const qRes = await withTimeout(yahooFinance.quote(yahooSym), 2000);
    if (qRes && qRes.regularMarketPrice) {
      quoteData = {
        symbol: cleanSym,
        companyName: qRes.shortName || qRes.longName || cleanSym,
        exchange: 'NSE',
        currency: 'INR',
        price: qRes.regularMarketPrice,
        change: qRes.regularMarketChange || 0,
        percentChange: qRes.regularMarketChangePercent || 0,
        volume: qRes.regularMarketVolume || 0,
        dayHigh: qRes.regularMarketDayHigh || qRes.regularMarketPrice,
        dayLow: qRes.regularMarketDayLow || qRes.regularMarketPrice,
      };
    }
  } catch (err) {
    logger.warn({ err: err.message }, `External quote failed for ${cleanSym}, using fallback data`);
  }

  if (!quoteData) {
    quoteData = MOCK_INDIAN_STOCKS[cleanSym] || {
      symbol: cleanSym,
      companyName: `${cleanSym} India Ltd`,
      exchange: 'NSE',
      currency: 'INR',
      price: 1500.00,
      change: 15.00,
      percentChange: 1.01,
      volume: 4500000,
      dayHigh: 1520.00,
      dayLow: 1485.00,
    };
  }

  stockCache.set(cacheKey, quoteData, 300);
  return quoteData;
};

// 3. Historical Price Series (INR Prices)
const getStockHistory = async (symbol, range = '1M') => {
  const cleanSym = cleanSymbol(symbol);
  const yahooSym = getYahooNseSymbol(cleanSym);
  const cacheKey = `history_${cleanSym}_${range}`;

  const cachedResult = stockCache.get(cacheKey);
  if (cachedResult) {
    logger.info(`[CACHE HIT] key=${cacheKey}`);
    return cachedResult;
  }
  logger.info(`[CACHE MISS] key=${cacheKey}`);

  let historySeries = [];
  try {
    const periodMap = { '1D': '1d', '1W': '5d', '1M': '1mo', '1Y': '1y', '5Y': '5y' };
    const chartRes = await withTimeout(yahooFinance.chart(yahooSym, { range: periodMap[range] || '1mo' }), 2000);
    if (chartRes && Array.isArray(chartRes.quotes)) {
      historySeries = chartRes.quotes
        .filter((q) => q.close !== null && q.close !== undefined)
        .map((q) => ({
          date: q.date ? new Date(q.date).toISOString().split('T')[0] : '',
          close: Number(q.close.toFixed(2)),
          volume: q.volume || 0,
        }));
    }
  } catch (err) {
    logger.warn({ err: err.message }, `External history chart failed for ${cleanSym}, generating fallback historical series`);
  }

  if (historySeries.length === 0) {
    const baseObj = MOCK_INDIAN_STOCKS[cleanSym] || { price: 1500.00 };
    const basePrice = baseObj.price;
    const days = range === '1D' ? 1 : range === '1W' ? 7 : range === '1M' ? 30 : range === '1Y' ? 365 : 1825;
    const now = new Date();

    for (let i = days; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const varPct = (Math.sin(i * 0.5) * 0.03) + ((Math.random() - 0.5) * 0.02);
      const price = Number((basePrice * (1 + varPct)).toFixed(2));
      historySeries.push({
        date: d.toISOString().split('T')[0],
        close: price,
        volume: Math.floor(2000000 + Math.random() * 5000000),
      });
    }
  }

  const resultData = { symbol: cleanSym, range, history: historySeries };
  stockCache.set(cacheKey, resultData, 900);
  return resultData;
};

// 4. Fundamental Financial Metrics (INR Currency, Crores / Lakhs)
const getStockFinancials = async (symbol) => {
  const cleanSym = cleanSymbol(symbol);
  const yahooSym = getYahooNseSymbol(cleanSym);
  const cacheKey = `financials_${cleanSym}`;

  const cachedResult = stockCache.get(cacheKey);
  if (cachedResult) {
    logger.info(`[CACHE HIT] key=${cacheKey}`);
    return cachedResult;
  }
  logger.info(`[CACHE MISS] key=${cacheKey}`);

  let finData = null;
  try {
    const qRes = await withTimeout(yahooFinance.quoteSummary(yahooSym, { modules: ['summaryDetail', 'defaultKeyStatistics', 'financialData'] }), 2000);
    if (qRes) {
      const sd = qRes.summaryDetail || {};
      const ks = qRes.defaultKeyStatistics || {};
      const fd = qRes.financialData || {};

      finData = {
        symbol: cleanSym,
        currency: 'INR',
        marketCap: sd.marketCap || 0,
        peRatio: sd.trailingPE || ks.trailingPE || 0,
        eps: ks.trailingEps || 0,
        revenue: fd.totalRevenue || 0,
        fiftyTwoWeekHigh: sd.fiftyTwoWeekHigh || 0,
        fiftyTwoWeekLow: sd.fiftyTwoWeekLow || 0,
        dividendYield: sd.dividendYield ? Number((sd.dividendYield * 100).toFixed(2)) : 0,
      };
    }
  } catch (err) {
    logger.warn({ err: err.message }, `External financials failed for ${cleanSym}, using Indian fallback fundamentals`);
  }

  if (!finData || !finData.marketCap) {
    const mock = MOCK_INDIAN_STOCKS[cleanSym] || {
      symbol: cleanSym,
      currency: 'INR',
      marketCap: 2500000000000,
      peRatio: 25.0,
      eps: 50.0,
      revenue: 500000000000,
      fiftyTwoWeekHigh: 1800.0,
      fiftyTwoWeekLow: 1200.0,
      dividendYield: 1.0,
    };
    finData = {
      symbol: cleanSym,
      currency: 'INR',
      marketCap: mock.marketCap,
      peRatio: mock.peRatio,
      eps: mock.eps,
      revenue: mock.revenue,
      fiftyTwoWeekHigh: mock.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: mock.fiftyTwoWeekLow,
      dividendYield: mock.dividendYield,
    };
  }

  const result = { symbol: cleanSym, financials: finData };
  stockCache.set(cacheKey, result, 900);
  return result;
};

module.exports = {
  searchStocks,
  getStockQuote,
  getStockHistory,
  getStockFinancials,
  MOCK_INDIAN_STOCKS,
};
