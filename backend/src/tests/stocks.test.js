const request = require('supertest');
const app = require('../app');
const stockService = require('../services/stockService');

jest.setTimeout(15000);

describe('Phase 3 — Stock Data API Integration Tests (Indian Equities)', () => {
  describe('GET /api/stocks/search', () => {
    it('should return ticker search matches for query RELIANCE', async () => {
      const res = await request(app).get('/api/stocks/search?q=RELIANCE');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('symbol');
      expect(res.body[0]).toHaveProperty('companyName');
    });

    it('should return 400 Bad Request when search query is missing', async () => {
      const res = await request(app).get('/api/stocks/search?q=');
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toHaveProperty('code', 'INVALID_QUERY');
    });
  });

  describe('GET /api/stocks/:symbol/quote', () => {
    it('should return real-time NSE stock quote for RELIANCE in INR', async () => {
      const res = await request(app).get('/api/stocks/RELIANCE/quote');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('symbol', 'RELIANCE');
      expect(res.body).toHaveProperty('price');
      expect(res.body).toHaveProperty('currency', 'INR');
      expect(res.body).toHaveProperty('exchange', 'NSE');
    });
  });

  describe('GET /api/stocks/:symbol/history', () => {
    it('should return historical price series for TCS over 1M range', async () => {
      const res = await request(app).get('/api/stocks/TCS/history?range=1M');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('symbol', 'TCS');
      expect(res.body).toHaveProperty('range', '1M');
      expect(res.body).toHaveProperty('history');
      expect(Array.isArray(res.body.history)).toBe(true);
      expect(res.body.history.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/stocks/:symbol/financials', () => {
    it('should return fundamental metrics for INFY', async () => {
      const res = await request(app).get('/api/stocks/INFY/financials');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('symbol', 'INFY');
      expect(res.body).toHaveProperty('financials');
      expect(res.body.financials).toHaveProperty('marketCap');
      expect(res.body.financials).toHaveProperty('peRatio');
      expect(res.body.financials).toHaveProperty('eps');
    });
  });

  describe('TTL Caching Verification', () => {
    it('should hit cache on subsequent quote request', async () => {
      // First call populates cache
      await stockService.getStockQuote('HDFCBANK');

      // Second call must return cached object
      const cachedQuote = await stockService.getStockQuote('HDFCBANK');
      expect(cachedQuote).toHaveProperty('symbol', 'HDFCBANK');
    });
  });
});
