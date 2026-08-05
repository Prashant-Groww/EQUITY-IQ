const request = require('supertest');
const app = require('../app');
const stockService = require('../services/stockService');

jest.setTimeout(15000);

describe('Phase 11 — Equity Research Brief Export Integration Tests', () => {
  beforeEach(() => {
    jest.spyOn(stockService, 'getStockQuote').mockImplementation(async (symbol) => {
      return {
        symbol: symbol.toUpperCase(),
        companyName: 'Reliance Industries Limited',
        price: 1296.3,
        previousClose: 1304.0,
        exchange: 'NSE',
        currency: 'INR',
        marketCap: 17530000000000,
        peRatio: 24.8,
      };
    });

    jest.spyOn(stockService, 'getStockFinancials').mockImplementation(async (symbol) => {
      return {
        symbol: symbol.toUpperCase(),
        financials: {
          marketCap: 17530000000000,
          peRatio: 24.8,
          eps: 52.27,
          revenue: 10000000000000,
        },
      };
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET /api/export/brief/:symbol', () => {
    it('should generate multi-section research report brief for RELIANCE', async () => {
      const res = await request(app).get('/api/export/brief/RELIANCE');

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('symbol', 'RELIANCE');
      expect(res.body.data).toHaveProperty('quote');
      expect(res.body.data).toHaveProperty('brief');
      expect(res.body.data.brief).toHaveProperty('executive_summary');
      expect(res.body.data.brief).toHaveProperty('recommendation');
      expect(res.body.data).toHaveProperty('markdown');
      expect(res.body.data.markdown).toContain('RELIANCE');
    });
  });
});
