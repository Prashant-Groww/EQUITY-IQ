const axios = require('axios');
const NodeCache = require('node-cache');
const logger = require('../utils/logger');

// Cache indices for 60 seconds
const indicesCache = new NodeCache({ stdTTL: 60, checkperiod: 30 });

const AXIOS_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json',
};

const INDICES_CONFIG = [
  { name: 'NIFTY 50', symbol: '^NSEI', fallbackPrice: 23350.00 },
  { name: 'SENSEX', symbol: '^BSESN', fallbackPrice: 74300.00 },
  { name: 'NIFTY BANK', symbol: '^NSEBANK', fallbackPrice: 56350.00 },
  { name: 'NIFTY IT', symbol: '^CNXIT', fallbackPrice: 28850.00 },
  { name: 'NIFTY MIDCAP 100', symbol: 'NIFTY_MIDCAP_100.NS', fallbackPrice: 62200.00 },
];

const formatINRNumber = (val) => {
  if (val == null || isNaN(val)) return '0.00';
  return Number(val).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const fetchSingleIndex = async (indexItem) => {
  const { name, symbol } = indexItem;
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;

  try {
    const res = await axios.get(url, { headers: AXIOS_HEADERS, timeout: 10000 });
    if (res.data && res.data.chart && res.data.chart.result && res.data.chart.result[0]) {
      const meta = res.data.chart.result[0].meta;
      const price = meta.regularMarketPrice;
      const previousClose = meta.chartPreviousClose || meta.previousClose;

      if (price != null) {
        const change = previousClose != null ? price - previousClose : 0;
        const percent = previousClose != null && previousClose > 0 ? (change / previousClose) * 100 : 0;
        const isUp = change >= 0;

        return {
          name,
          symbol,
          value: formatINRNumber(price),
          rawValue: price,
          change: `${isUp ? '+' : ''}${formatINRNumber(change)}`,
          rawChange: change,
          percent: `${isUp ? '+' : ''}${percent.toFixed(2)}%`,
          rawPercent: percent,
          isUp,
          lastUpdated: new Date(meta.regularMarketTime ? meta.regularMarketTime * 1000 : Date.now()).toISOString(),
          isLive: true,
        };
      }
    }
  } catch (err) {
    logger.warn({ symbol, err: err.message }, `Direct fetch for index ${name} failed`);
  }

  // Fallback to latest known cached or safe value if external network drops
  return {
    name,
    symbol,
    value: formatINRNumber(indexItem.fallbackPrice),
    rawValue: indexItem.fallbackPrice,
    change: '+0.00',
    rawChange: 0,
    percent: '+0.00%',
    rawPercent: 0,
    isUp: true,
    lastUpdated: new Date().toISOString(),
    isLive: false,
  };
};

const getMarketIndices = async () => {
  const cacheKey = 'market_indices_live';
  const cached = indicesCache.get(cacheKey);
  if (cached) {
    logger.info('[CACHE HIT] market_indices_live');
    return cached;
  }

  const results = await Promise.all(INDICES_CONFIG.map((item) => fetchSingleIndex(item)));
  indicesCache.set(cacheKey, results, 60);
  return results;
};

module.exports = {
  getMarketIndices,
};
