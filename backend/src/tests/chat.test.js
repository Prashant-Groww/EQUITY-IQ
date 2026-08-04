const request = require('supertest');
const app = require('../app');
const stockService = require('../services/stockService');

jest.setTimeout(15000);

describe('Phase 9 — AI Chat Copilot Integration Tests', () => {
  beforeEach(() => {
    jest.spyOn(stockService, 'getStockQuote').mockResolvedValue({
      symbol: 'RELIANCE',
      price: 1290.9,
      previousClose: 1285.0,
      fiftyTwoWeekHigh: 1608.0,
      fiftyTwoWeekLow: 1150.0,
      marketCap: 17530000000000,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('POST /api/ml/chat', () => {
    it('should return conversational AI assistant response for RELIANCE query', async () => {
      const res = await request(app)
        .post('/api/ml/chat')
        .send({
          symbol: 'RELIANCE',
          message: 'Should I buy RELIANCE stock at current levels?',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('symbol', 'RELIANCE');
      expect(res.body).toHaveProperty('reply');
      expect(res.body).toHaveProperty('suggested_followups');
      expect(Array.isArray(res.body.suggested_followups)).toBe(true);
      expect(res.body).toHaveProperty('intent_detected');
    });

    it('should return 400 Bad Request when message parameter is missing', async () => {
      const res = await request(app).post('/api/ml/chat').send({ symbol: 'RELIANCE' });
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toHaveProperty('code', 'INVALID_MESSAGE');
    });
  });
});
