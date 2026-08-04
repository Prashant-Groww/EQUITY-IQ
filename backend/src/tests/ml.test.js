const request = require('supertest');
const app = require('../app');

describe('Phase 5 — ML Sentiment Integration Tests', () => {
  describe('POST /api/ml/sentiment', () => {
    it('should return sentiment label, confidence, and probabilities for sample text', async () => {
      const res = await request(app)
        .post('/api/ml/sentiment')
        .send({ text: 'Apple reported strong revenue growth and record profits this quarter.' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('label');
      expect(res.body).toHaveProperty('confidence');
      expect(res.body).toHaveProperty('probabilities');
      expect(['positive', 'negative', 'neutral']).toContain(res.body.label);
      expect(res.body.confidence).toBeGreaterThanOrEqual(0.0);
    });

    it('should return 400 Bad Request when text parameter is missing', async () => {
      const res = await request(app)
        .post('/api/ml/sentiment')
        .send({ text: '' });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toHaveProperty('code', 'INVALID_TEXT');
    });
  });
});
