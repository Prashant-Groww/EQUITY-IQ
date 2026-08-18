const axios = require('axios');
const logger = require('../utils/logger');

const AXIOS_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json',
};

/**
 * Format raw ticker symbol to standard NSE format (e.g. 'TCS' -> 'TCS.NS')
 */
const formatNSESymbol = (inputSymbol) => {
  if (!inputSymbol) return { cleanSymbol: '', nseSymbol: '' };
  const cleanSymbol = inputSymbol.toUpperCase().replace(/\.NS$|\.BO$/i, '').trim();
  return { cleanSymbol, nseSymbol: `${cleanSymbol}.NS` };
};

/**
 * Sleep helper for rate limiting and backoff delays
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetch latest daily market data for a given NSE stock symbol.
 * Strict symbol isolation: never returns fallback or mock data of another company.
 */
const fetchLatestMarketData = async (symbolInput, retries = 2, delayMs = 300) => {
  const { cleanSymbol, nseSymbol } = formatNSESymbol(symbolInput);
  if (!cleanSymbol) {
    throw new Error('Invalid symbol provided');
  }

  let attempt = 0;
  let lastError = null;

  while (attempt <= retries) {
    try {
      if (attempt > 0) {
        const backoff = delayMs * Math.pow(2, attempt);
        logger.info(`[RETRY ATTEMPT ${attempt}] Retrying ${cleanSymbol} after ${backoff}ms backoff...`);
        await sleep(backoff);
      }

      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(nseSymbol)}?interval=1d&range=5d`;
      const res = await axios.get(url, { headers: AXIOS_HEADERS, timeout: 3500 });

      if (!res.data || !res.data.chart || !res.data.chart.result || !res.data.chart.result[0]) {
        throw new Error(`Yahoo Finance returned empty chart response for ${cleanSymbol}`);
      }

      const result = res.data.chart.result[0];
      const meta = result.meta || {};
      const quote = result.indicators?.quote?.[0] || {};
      const timestamps = result.timestamp || [];

      // Validate regularMarketPrice or latest valid close price
      let close = meta.regularMarketPrice;
      let previousClose = meta.chartPreviousClose || meta.previousClose;
      let open = meta.regularMarketDayOpen;
      let high = meta.regularMarketDayHigh;
      let low = meta.regularMarketDayLow;
      let volume = meta.regularMarketVolume;
      let marketTimeTs = meta.regularMarketTime;

      // Fallback to latest candle values if meta regularMarket fields are missing
      if (close == null && quotesCount(quote.close) > 0) {
        const validCloses = quote.close.filter((c) => c != null && !isNaN(c));
        if (validCloses.length > 0) {
          close = validCloses[validCloses.length - 1];
        }
      }

      if (previousClose == null && quote.close && quote.close.length > 1) {
        const validCloses = quote.close.filter((c) => c != null && !isNaN(c));
        if (validCloses.length > 1) {
          previousClose = validCloses[validCloses.length - 2];
        }
      }

      if (open == null && quotesCount(quote.open) > 0) {
        const validOpens = quote.open.filter((o) => o != null && !isNaN(o));
        open = validOpens[validOpens.length - 1];
      }

      if (high == null && quotesCount(quote.high) > 0) {
        const validHighs = quote.high.filter((h) => h != null && !isNaN(h));
        high = Math.max(...validHighs);
      }

      if (low == null && quotesCount(quote.low) > 0) {
        const validLows = quote.low.filter((l) => l != null && !isNaN(l));
        low = Math.min(...validLows);
      }

      if (volume == null && quotesCount(quote.volume) > 0) {
        const validVolumes = quote.volume.filter((v) => v != null && !isNaN(v));
        volume = validVolumes[validVolumes.length - 1];
      }

      if (close == null) {
        throw new Error(`No valid closing price found for ${cleanSymbol}`);
      }

      close = Number(Number(close).toFixed(2));
      previousClose = previousClose != null ? Number(Number(previousClose).toFixed(2)) : close;
      open = open != null ? Number(Number(open).toFixed(2)) : close;
      high = high != null ? Number(Number(high).toFixed(2)) : Math.max(close, open);
      low = low != null ? Number(Number(low).toFixed(2)) : Math.min(close, open);
      volume = volume != null ? Number(volume) : 0;

      const change = Number((close - previousClose).toFixed(2));
      const changePercent = previousClose > 0 ? Number(((change / previousClose) * 100).toFixed(2)) : 0;

      // Extract market date in YYYY-MM-DD
      const dateObj = marketTimeTs ? new Date(marketTimeTs * 1000) : new Date();
      const dateStr = dateObj.toISOString().split('T')[0];

      return {
        symbol: cleanSymbol,
        exchange: 'NSE',
        date: dateStr,
        open,
        high,
        low,
        close,
        previousClose,
        change,
        changePercent,
        volume,
        dataSource: 'Yahoo Finance NSE',
        isTradingDay: true,
        updatedAt: new Date(),
      };
    } catch (err) {
      lastError = err;
      attempt++;
      if (attempt > retries) {
        break;
      }
    }
  }

  logger.warn({ err: lastError?.message }, `Market data fetch failed for ${cleanSymbol}`);
  throw new Error(`Failed to fetch market data for ${cleanSymbol}: ${lastError?.message || 'Unknown error'}`);
};

const quotesCount = (arr) => (Array.isArray(arr) ? arr.filter((x) => x != null && !isNaN(x)).length : 0);

module.exports = {
  formatNSESymbol,
  fetchLatestMarketData,
  sleep,
};
