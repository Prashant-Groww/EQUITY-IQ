const request = require('supertest');
const app = require('../app');
const stockService = require('../services/stockService');

jest.setTimeout(15000);

describe('Phase 3 — Stock Data Integration Tests', () => {
  beforeEach(() => {
    stockService.clearCache();
  });

  describe('GET /api/stocks/search', () => {
    it('should return matching stock search results for ticker query', async () => {
      const res = await request(app).get('/api/stocks/search?q=AAPL');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('results');
      expect(Array.isArray(res.body.results)).toBe(true);
      expect(res.body.results.length).toBeGreaterThan(0);
      expect(res.body.results[0]).toHaveProperty('symbol');
      expect(res.body.results[0]).toHaveProperty('name');
    });

    it('should return 400 Bad Request when query parameter q is missing', async () => {
      const res = await request(app).get('/api/stocks/search');
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toHaveProperty('code', 'INVALID_QUERY');
    });
  });

  describe('GET /api/stocks/:symbol/quote', () => {
    it('should return real-time stock quote metrics for valid symbol', async () => {
      const res = await request(app).get('/api/stocks/AAPL/quote');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('quote');
      const { quote } = res.body;
      expect(quote).toHaveProperty('symbol', 'AAPL');
      expect(quote).toHaveProperty('price');
      expect(quote).toHaveProperty('change');
      expect(quote).toHaveProperty('percentChange');
      expect(quote).toHaveProperty('volume');
      expect(quote).toHaveProperty('dayHigh');
      expect(quote).toHaveProperty('dayLow');
    });

    it('should serve quote from cache on subsequent request within TTL', async () => {
      // First request (Cache miss)
      await request(app).get('/api/stocks/MSFT/quote');

      // Second request (Cache hit)
      const res = await request(app).get('/api/stocks/MSFT/quote');
      expect(res.statusCode).toBe(200);
      expect(res.body.quote).toHaveProperty('symbol', 'MSFT');
    });
  });

  describe('GET /api/stocks/:symbol/history', () => {
    it('should return historical price points array for specified range', async () => {
      const res = await request(app).get('/api/stocks/AAPL/history?range=1M');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('symbol', 'AAPL');
      expect(res.body).toHaveProperty('range', '1M');
      expect(res.body).toHaveProperty('history');
      expect(Array.isArray(res.body.history)).toBe(true);
      expect(res.body.history.length).toBeGreaterThan(0);
      expect(res.body.history[0]).toHaveProperty('date');
      expect(res.body.history[0]).toHaveProperty('close');
    });
  });

  describe('GET /api/stocks/:symbol/financials', () => {
    it('should return key financial fundamentals for symbol', async () => {
      const res = await request(app).get('/api/stocks/AAPL/financials');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('financials');
      const { financials } = res.body;
      expect(financials).toHaveProperty('symbol', 'AAPL');
      expect(financials).toHaveProperty('marketCap');
      expect(financials).toHaveProperty('peRatio');
      expect(financials).toHaveProperty('eps');
      expect(financials).toHaveProperty('revenue');
      expect(financials).toHaveProperty('fiftyTwoWeekHigh');
      expect(financials).toHaveProperty('fiftyTwoWeekLow');
    });
  });
});
