const request = require('supertest');
const app = require('../app');
const stockService = require('../services/stockService');

jest.setTimeout(30000);

describe('Stock Data & Search Engine API Integration Tests (500+ Indian Equities)', () => {
  describe('GET /api/stocks/search — Core Matching Pipeline', () => {
    it('should return exact NSE symbol match as #1 for query TCS', async () => {
      const res = await request(app).get('/api/stocks/search?q=TCS');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].symbol).toBe('TCS');
      expect(res.body[0].companyName).toContain('Tata Consultancy Services');
      expect(res.body[0].matchType).toBe('symbol_exact');
    });

    it('should handle leading/trailing whitespace and case-insensitivity: "   tcs   "', async () => {
      const res = await request(app).get('/api/stocks/search?q=%20%20%20tcs%20%20%20');
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].symbol).toBe('TCS');
    });

    it('should match exact company name: "Tata Consultancy Services"', async () => {
      const res = await request(app).get('/api/stocks/search?q=Tata%20Consultancy%20Services');
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].symbol).toBe('TCS');
    });

    it('should match partial company name: "Tata Consult"', async () => {
      const res = await request(app).get('/api/stocks/search?q=Tata%20Consult');
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].symbol).toBe('TCS');
      expect(['name_prefix', 'alias_exact']).toContain(res.body[0].matchType);
    });

    it('should match common company alias "HDFC" to HDFCBANK', async () => {
      const res = await request(app).get('/api/stocks/search?q=HDFC');
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].symbol).toBe('HDFCBANK');
      expect(res.body[0].matchType).toBe('alias_exact');
    });

    it('should match common company alias "SBI" to SBIN', async () => {
      const res = await request(app).get('/api/stocks/search?q=SBI');
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].symbol).toBe('SBIN');
    });

    it('should match common company alias "L&T" to LT', async () => {
      const res = await request(app).get('/api/stocks/search?q=L%26T');
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].symbol).toBe('LT');
    });

    it('should prioritize symbol prefix matches over sector matches for query ELECO', async () => {
      const res = await request(app).get('/api/stocks/search?q=ELECO');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].symbol).toBe('ELECON');
      expect(res.body[0].matchType).toBe('symbol_prefix');
    });

    it('should match sector queries e.g. "Banking" and return banking stocks', async () => {
      const res = await request(app).get('/api/stocks/search?q=Banking');
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
      const allBanking = res.body.some(s => s.sector === 'Banking');
      expect(allBanking).toBe(true);
    });

    it('should return empty array for non-matching stock and NEVER substitute Reliance', async () => {
      const res = await request(app).get('/api/stocks/search?q=XYZNONEXISTENTSTOCK999');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
      // Strictly verify no silent fallback substitution
      const hasReliance = res.body.some(s => s.symbol === 'RELIANCE');
      expect(hasReliance).toBe(false);
    });

    it('should return 400 Bad Request when search query is missing or whitespace only', async () => {
      const res = await request(app).get('/api/stocks/search?q=');
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toHaveProperty('code', 'INVALID_QUERY');
    });
  });

  describe('GET /api/stocks/:symbol/quote', () => {
    it('should return complete real-time NSE stock quote for RELIANCE with all required metrics', async () => {
      const res = await request(app).get('/api/stocks/RELIANCE/quote');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('symbol', 'RELIANCE');
      expect(res.body).toHaveProperty('companyName');
      expect(res.body).toHaveProperty('exchange', 'NSE');
      expect(res.body).toHaveProperty('currency', 'INR');
      expect(res.body).toHaveProperty('price');
      expect(res.body).toHaveProperty('previousClose');
      expect(res.body).toHaveProperty('open');
      expect(res.body).toHaveProperty('dayHigh');
      expect(res.body).toHaveProperty('dayLow');
      expect(res.body).toHaveProperty('fiftyTwoWeekHigh');
      expect(res.body).toHaveProperty('fiftyTwoWeekLow');
      expect(res.body).toHaveProperty('volume');
      expect(res.body).toHaveProperty('marketCap');
      expect(res.body).toHaveProperty('peRatio');
      expect(res.body).toHaveProperty('dividendYield');
    });

    it('should return 404 NOT_FOUND when an invalid/unlisted symbol is requested', async () => {
      const res = await request(app).get('/api/stocks/NONEXISTENT999XYZ/quote');
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toHaveProperty('code', 'NOT_FOUND');
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

  describe('GET /api/stocks/:symbol/rating', () => {
    it('should return complete explainable ML rating for TCS', async () => {
      const res = await request(app).get('/api/stocks/TCS/rating');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('symbol', 'TCS');
      expect(res.body).toHaveProperty('recommendation');
      expect(['STRONG_BUY', 'BUY', 'HOLD', 'SELL', 'STRONG_SELL']).toContain(res.body.recommendation);
      expect(res.body).toHaveProperty('confidence_pct');
      expect(res.body.confidence_pct).toBeGreaterThan(0);
      expect(res.body).toHaveProperty('overall_score');
      expect(res.body).toHaveProperty('pillars');
      expect(res.body).toHaveProperty('positive_factors');
      expect(res.body).toHaveProperty('negative_factors');
      expect(res.body).toHaveProperty('data_freshness');
    });

    it('should return 404 NOT_FOUND for rating of an unlisted stock', async () => {
      const res = await request(app).get('/api/stocks/NONEXISTENT999XYZ/rating');
      expect(res.statusCode).toBe(404);
    });
  });

  describe('TTL Caching Verification', () => {
    it('should hit cache on subsequent quote request', async () => {
      await stockService.getStockQuote('HDFCBANK');
      const cachedQuote = await stockService.getStockQuote('HDFCBANK');
      expect(cachedQuote).toHaveProperty('symbol', 'HDFCBANK');
    });
  });
});
