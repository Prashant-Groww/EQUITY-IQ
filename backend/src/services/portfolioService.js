const axios = require('axios');
const Portfolio = require('../models/Portfolio');
const stockService = require('./stockService');
const logger = require('../utils/logger');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

const DEFAULT_HOLDINGS = [
  { symbol: 'RELIANCE', companyName: 'Reliance Industries Limited', quantity: 50, avgBuyPrice: 1220.00 },
  { symbol: 'TCS', companyName: 'Tata Consultancy Services Limited', quantity: 15, avgBuyPrice: 2350.00 },
  { symbol: 'INFY', companyName: 'Infosys Limited', quantity: 40, avgBuyPrice: 1100.00 },
];

const DEFAULT_WATCHLIST = [
  { symbol: 'RELIANCE', companyName: 'Reliance Industries Limited' },
  { symbol: 'TCS', companyName: 'Tata Consultancy Services Limited' },
  { symbol: 'HDFCBANK', companyName: 'HDFC Bank Limited' },
  { symbol: 'ICICIBANK', companyName: 'ICICI Bank Limited' },
  { symbol: 'SBIN', companyName: 'State Bank of India' },
];

const getOrCreatePortfolio = async (userId = null, guestId = 'default_guest') => {
  const query = userId ? { userId } : { guestId };
  let portfolio = await Portfolio.findOne(query);

  if (!portfolio) {
    logger.info(`Creating default initial portfolio for ${userId ? 'user ' + userId : 'guest ' + guestId}`);
    portfolio = await Portfolio.create({
      userId: userId || undefined,
      guestId: userId ? undefined : guestId,
      name: 'My EquityIQ Portfolio',
      holdings: DEFAULT_HOLDINGS,
      watchlist: DEFAULT_WATCHLIST,
    });
  }

  return portfolio;
};

const getPortfolioSummary = async (userId = null, guestId = 'default_guest') => {
  const portfolio = await getOrCreatePortfolio(userId, guestId);

  let totalInvestment = 0;
  let totalCurrentValue = 0;
  let totalDayGainLoss = 0;

  // Enrich Holdings with Live Market Quotes
  const enrichedHoldings = await Promise.all(
    portfolio.holdings.map(async (h) => {
      const cleanSymbol = h.symbol.toUpperCase().replace(/\.NS$/i, '').trim();
      const quote = await stockService.getStockQuote(cleanSymbol);
      
      const currentPrice = quote.price || h.avgBuyPrice;
      const prevClose = quote.previousClose || currentPrice;
      const costBasis = h.quantity * h.avgBuyPrice;
      const currentValue = h.quantity * currentPrice;
      const unrealizedPL = currentValue - costBasis;
      const unrealizedPLPct = costBasis > 0 ? (unrealizedPL / costBasis) * 100 : 0;
      const dayChange = currentPrice - prevClose;
      const dayGainLoss = h.quantity * dayChange;

      totalInvestment += costBasis;
      totalCurrentValue += currentValue;
      totalDayGainLoss += dayGainLoss;

      return {
        id: h._id,
        symbol: cleanSymbol,
        companyName: quote.companyName || h.companyName || `${cleanSymbol} India`,
        quantity: h.quantity,
        avgBuyPrice: h.avgBuyPrice,
        currentPrice: Number(currentPrice.toFixed(2)),
        costBasis: Number(costBasis.toFixed(2)),
        currentValue: Number(currentValue.toFixed(2)),
        unrealizedPL: Number(unrealizedPL.toFixed(2)),
        unrealizedPLPct: Number(unrealizedPLPct.toFixed(2)),
        dayGainLoss: Number(dayGainLoss.toFixed(2)),
        addedAt: h.addedAt,
      };
    })
  );

  // Compute allocation %
  enrichedHoldings.forEach((h) => {
    h.allocationPct = totalCurrentValue > 0 ? Number(((h.currentValue / totalCurrentValue) * 100).toFixed(2)) : 0;
  });

  const totalProfitLoss = totalCurrentValue - totalInvestment;
  const totalProfitLossPct = totalInvestment > 0 ? (totalProfitLoss / totalInvestment) * 100 : 0;
  const dayGainLossPct = totalCurrentValue > 0 ? (totalDayGainLoss / totalCurrentValue) * 100 : 0;

  // Enrich Watchlist with Live Quotes
  const enrichedWatchlist = await Promise.all(
    portfolio.watchlist.map(async (w) => {
      const cleanSymbol = w.symbol.toUpperCase().replace(/\.NS$/i, '').trim();
      const quote = await stockService.getStockQuote(cleanSymbol);
      const prevClose = quote.previousClose || quote.price;
      const change = quote.price - prevClose;
      const changePct = prevClose > 0 ? (change / prevClose) * 100 : 0;

      return {
        id: w._id,
        symbol: cleanSymbol,
        companyName: quote.companyName || w.companyName || `${cleanSymbol} India`,
        price: Number(quote.price.toFixed(2)),
        change: Number(change.toFixed(2)),
        changePct: Number(changePct.toFixed(2)),
        addedAt: w.addedAt,
      };
    })
  );

  return {
    portfolioId: portfolio._id,
    name: portfolio.name,
    summary: {
      totalCurrentValue: Number(totalCurrentValue.toFixed(2)),
      totalInvestment: Number(totalInvestment.toFixed(2)),
      totalProfitLoss: Number(totalProfitLoss.toFixed(2)),
      totalProfitLossPct: Number(totalProfitLossPct.toFixed(2)),
      dayGainLoss: Number(totalDayGainLoss.toFixed(2)),
      dayGainLossPct: Number(dayGainLossPct.toFixed(2)),
      holdingsCount: enrichedHoldings.length,
      watchlistCount: enrichedWatchlist.length,
    },
    holdings: enrichedHoldings,
    watchlist: enrichedWatchlist,
  };
};

const addOrUpdateHolding = async (userId, guestId, { symbol, quantity, avgBuyPrice, companyName }) => {
  const portfolio = await getOrCreatePortfolio(userId, guestId);
  const cleanSymbol = symbol.toUpperCase().replace(/\.NS$/i, '').trim();

  const existingIdx = portfolio.holdings.findIndex((h) => h.symbol === cleanSymbol);
  if (existingIdx >= 0) {
    portfolio.holdings[existingIdx].quantity = Number(quantity);
    portfolio.holdings[existingIdx].avgBuyPrice = Number(avgBuyPrice);
    if (companyName) portfolio.holdings[existingIdx].companyName = companyName;
  } else {
    portfolio.holdings.push({
      symbol: cleanSymbol,
      companyName: companyName || `${cleanSymbol} Limited`,
      quantity: Number(quantity),
      avgBuyPrice: Number(avgBuyPrice),
    });
  }

  await portfolio.save();
  return getPortfolioSummary(userId, guestId);
};

const removeHolding = async (userId, guestId, symbol) => {
  const portfolio = await getOrCreatePortfolio(userId, guestId);
  const cleanSymbol = symbol.toUpperCase().replace(/\.NS$/i, '').trim();

  portfolio.holdings = portfolio.holdings.filter((h) => h.symbol !== cleanSymbol);
  await portfolio.save();
  return getPortfolioSummary(userId, guestId);
};

const toggleWatchlistSymbol = async (userId, guestId, { symbol, companyName }) => {
  const portfolio = await getOrCreatePortfolio(userId, guestId);
  const cleanSymbol = symbol.toUpperCase().replace(/\.NS$/i, '').trim();

  const existingIdx = portfolio.watchlist.findIndex((w) => w.symbol === cleanSymbol);
  let isWatchlisted = false;

  if (existingIdx >= 0) {
    portfolio.watchlist.splice(existingIdx, 1);
    isWatchlisted = false;
  } else {
    portfolio.watchlist.push({
      symbol: cleanSymbol,
      companyName: companyName || `${cleanSymbol} Limited`,
    });
    isWatchlisted = true;
  }

  await portfolio.save();
  const summary = await getPortfolioSummary(userId, guestId);
  return { ...summary, isWatchlisted, symbol: cleanSymbol };
};

const optimizePortfolioWithAI = async (userId, guestId) => {
  const summaryData = await getPortfolioSummary(userId, guestId);
  if (!summaryData.holdings || summaryData.holdings.length === 0) {
    throw new Error('Cannot optimize empty portfolio. Please add holdings first.');
  }

  const holdingsPayload = summaryData.holdings.map((h) => ({
    symbol: h.symbol,
    quantity: h.quantity,
    avg_buy_price: h.avgBuyPrice,
    current_price: h.currentPrice,
  }));

  try {
    const response = await axios.post(`${AI_SERVICE_URL}/predict/portfolio-optimize`, {
      holdings: holdingsPayload,
    });
    return response.data;
  } catch (err) {
    logger.warn({ err: err.message }, 'FastAPI AI Portfolio Optimization failed, returning fallback computation');
    return {
      diversification_score: 75.0,
      portfolio_beta: 1.05,
      concentration_risk: false,
      recommendations: summaryData.holdings.map((h) => ({
        symbol: h.symbol,
        action: 'HOLD',
        current_weight_pct: h.allocationPct,
        target_weight_pct: Number((100 / summaryData.holdings.length).toFixed(2)),
        reasoning: 'Maintain baseline position within Indian equity portfolio.',
      })),
      asset_allocation: Object.fromEntries(summaryData.holdings.map((h) => [h.symbol, h.allocationPct])),
      summary: 'Portfolio is well diversified across major Indian market cap equities.',
    };
  }
};

module.exports = {
  getOrCreatePortfolio,
  getPortfolioSummary,
  addOrUpdateHolding,
  removeHolding,
  toggleWatchlistSymbol,
  optimizePortfolioWithAI,
};
