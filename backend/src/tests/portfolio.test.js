const request = require('supertest');
const app = require('../app');
const stockService = require('../services/stockService');
const Portfolio = require('../models/Portfolio');

jest.setTimeout(15000);

describe('Phase 10 — Portfolio & Watchlist Management Integration Tests', () => {
  let mockPortfolioDoc;

  beforeEach(() => {
    mockPortfolioDoc = {
      _id: 'mock_portfolio_123',
      guestId: 'test_guest_10',
      name: 'My EquityIQ Portfolio',
      holdings: [
        { _id: 'h1', symbol: 'RELIANCE', companyName: 'Reliance Industries Limited', quantity: 50, avgBuyPrice: 1220.0, addedAt: new Date() },
        { _id: 'h2', symbol: 'TCS', companyName: 'Tata Consultancy Services Limited', quantity: 15, avgBuyPrice: 2350.0, addedAt: new Date() },
        { _id: 'h3', symbol: 'INFY', companyName: 'Infosys Limited', quantity: 40, avgBuyPrice: 1100.0, addedAt: new Date() },
      ],
      watchlist: [
        { _id: 'w1', symbol: 'RELIANCE', companyName: 'Reliance Industries Limited', addedAt: new Date() },
        { _id: 'w2', symbol: 'TCS', companyName: 'Tata Consultancy Services Limited', addedAt: new Date() },
      ],
      save: jest.fn().mockImplementation(function () {
        return Promise.resolve(this);
      }),
    };

    jest.spyOn(Portfolio, 'findOne').mockImplementation(() => Promise.resolve(mockPortfolioDoc));
    jest.spyOn(Portfolio, 'create').mockImplementation(() => Promise.resolve(mockPortfolioDoc));

    jest.spyOn(stockService, 'getStockQuote').mockImplementation(async (symbol) => {
      const s = symbol.toUpperCase();
      return {
        symbol: s,
        companyName: `${s} Enterprise Ltd`,
        price: 1500.0,
        previousClose: 1480.0,
        fiftyTwoWeekHigh: 1800.0,
        fiftyTwoWeekLow: 1200.0,
        marketCap: 2000000000000,
      };
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET /api/portfolio', () => {
    it('should retrieve default portfolio summary with holdings, valuation, and watchlist', async () => {
      const res = await request(app)
        .get('/api/portfolio')
        .set('x-guest-id', 'test_guest_10');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('status', 'success');
      expect(res.body.data).toHaveProperty('summary');
      expect(res.body.data.summary).toHaveProperty('totalCurrentValue');
      expect(res.body.data.summary).toHaveProperty('totalInvestment');
      expect(res.body.data.summary).toHaveProperty('totalProfitLoss');
      expect(Array.isArray(res.body.data.holdings)).toBe(true);
      expect(Array.isArray(res.body.data.watchlist)).toBe(true);
    });
  });

  describe('POST /api/portfolio/holdings', () => {
    it('should add a new holding position to portfolio', async () => {
      const res = await request(app)
        .post('/api/portfolio/holdings')
        .set('x-guest-id', 'test_guest_10')
        .send({
          symbol: 'TATAMOTORS',
          companyName: 'Tata Motors Limited',
          quantity: 25,
          avgBuyPrice: 980.0,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      const holdings = res.body.data.holdings;
      const added = holdings.find((h) => h.symbol === 'TATAMOTORS');
      expect(added).toBeDefined();
      expect(added.quantity).toBe(25);
    });

    it('should return 400 when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/portfolio/holdings')
        .set('x-guest-id', 'test_guest_10')
        .send({ symbol: 'TATAMOTORS' });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
    });
  });

  describe('DELETE /api/portfolio/holdings/:symbol', () => {
    it('should remove a holding position from portfolio', async () => {
      const res = await request(app)
        .delete('/api/portfolio/holdings/INFY')
        .set('x-guest-id', 'test_guest_10');

      expect(res.statusCode).toBe(200);
      const holdings = res.body.data.holdings;
      const removed = holdings.find((h) => h.symbol === 'INFY');
      expect(removed).toBeUndefined();
    });
  });

  describe('POST /api/portfolio/watchlist', () => {
    it('should toggle symbol on watchlist', async () => {
      const res = await request(app)
        .post('/api/portfolio/watchlist')
        .set('x-guest-id', 'test_guest_10')
        .send({ symbol: 'AXISBANK', companyName: 'Axis Bank Limited' });

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.symbol).toBe('AXISBANK');
      expect(typeof res.body.data.isWatchlisted).toBe('boolean');
    });
  });

  describe('POST /api/portfolio/optimize', () => {
    it('should return AI portfolio health check & rebalancing analysis', async () => {
      const res = await request(app)
        .post('/api/portfolio/optimize')
        .set('x-guest-id', 'test_guest_10');

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('diversification_score');
      expect(res.body.data).toHaveProperty('portfolio_beta');
      expect(res.body.data).toHaveProperty('recommendations');
    });
  });
});
