const request = require('supertest');
const app = require('../app');

jest.setTimeout(15000);

describe('Phase 6 — ML Risk & Quantitative Analytics Endpoint Tests', () => {
  describe('GET /api/stocks/:symbol/risk', () => {
    it('should return quantitative risk metrics and ML volatility classification for RELIANCE', async () => {
      const res = await request(app).get('/api/stocks/RELIANCE/risk');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('symbol', 'RELIANCE');
      expect(res.body).toHaveProperty('risk_score');
      expect(res.body).toHaveProperty('risk_tier');
      expect(res.body).toHaveProperty('metrics');
      expect(res.body.metrics).toHaveProperty('volatility_20d');
      expect(res.body.metrics).toHaveProperty('var_95');
      expect(res.body.metrics).toHaveProperty('beta');
      expect(res.body.metrics).toHaveProperty('sharpe_ratio');
      expect(res.body.metrics).toHaveProperty('rsi');
      expect(res.body.metrics).toHaveProperty('macd_histogram');
    });
  });

  describe('POST /api/ml/risk', () => {
    it('should return 400 Bad Request when prices or symbol are missing in body', async () => {
      const res = await request(app).post('/api/ml/risk').send({});
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toHaveProperty('code', 'INVALID_BODY');
    });
  });
});
