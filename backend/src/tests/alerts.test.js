const request = require('supertest');
const app = require('../app');
const Alert = require('../models/Alert');
const stockService = require('../services/stockService');

jest.setTimeout(15000);

describe('Phase 11 — Alerting & Rule Monitoring Integration Tests', () => {
  let mockAlertDoc;

  beforeEach(() => {
    mockAlertDoc = {
      _id: 'mock_alert_123',
      guestId: 'test_guest_11',
      symbol: 'RELIANCE',
      companyName: 'Reliance Industries Limited',
      alertType: 'PRICE_ABOVE',
      targetValue: 1300.0,
      triggered: false,
      save: jest.fn().mockImplementation(function () {
        return Promise.resolve(this);
      }),
    };

    jest.spyOn(Alert, 'find').mockImplementation(() => {
      const chain = {
        sort: () => Promise.resolve([mockAlertDoc]),
      };
      return chain;
    });

    jest.spyOn(Alert, 'create').mockImplementation((data) => {
      if (Array.isArray(data)) return Promise.resolve(data.map((d) => ({ ...d, save: jest.fn() })));
      return Promise.resolve({ ...data, _id: 'new_mock_id', save: jest.fn() });
    });

    jest.spyOn(Alert, 'findOneAndDelete').mockImplementation(() => Promise.resolve(mockAlertDoc));

    jest.spyOn(stockService, 'getStockQuote').mockImplementation(async (symbol) => {
      return {
        symbol: symbol.toUpperCase(),
        companyName: `${symbol} Ltd`,
        price: 1355.0, // Triggers PRICE_ABOVE 1300 rule!
        previousClose: 1300.0,
      };
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET /api/alerts', () => {
    it('should retrieve active alerts and evaluate triggered rule conditions', async () => {
      const res = await request(app)
        .get('/api/alerts')
        .set('x-guest-id', 'test_guest_11');

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data.alerts)).toBe(true);
      expect(res.body.data.alerts[0].triggered).toBe(true);
      expect(res.body.data.alerts[0].notificationMessage).toContain('PRICE ALERT');
    });
  });

  describe('POST /api/alerts', () => {
    it('should create a new price threshold alert', async () => {
      const res = await request(app)
        .post('/api/alerts')
        .set('x-guest-id', 'test_guest_11')
        .send({
          symbol: 'TCS',
          companyName: 'Tata Consultancy Services Limited',
          alertType: 'PRICE_BELOW',
          targetValue: 2400.0,
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('alert');
      expect(res.body.data.alert.symbol).toBe('TCS');
    });

    it('should return 400 when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/alerts')
        .set('x-guest-id', 'test_guest_11')
        .send({ symbol: 'TCS' });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
    });
  });

  describe('DELETE /api/alerts/:id', () => {
    it('should delete an alert rule', async () => {
      const res = await request(app)
        .delete('/api/alerts/mock_alert_123')
        .set('x-guest-id', 'test_guest_11');

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
    });
  });
});
