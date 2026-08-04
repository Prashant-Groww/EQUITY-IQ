const request = require('supertest');
const app = require('../app');
const Report = require('../models/Report');

jest.setTimeout(15000);

describe('Phase 7 — Report Processing & Document Extraction Integration Tests', () => {
  beforeEach(async () => {
    jest.spyOn(Report.prototype, 'save').mockImplementation(function () {
      this._id = 'mock_report_id_123';
      return Promise.resolve(this);
    });

    jest.spyOn(Report, 'find').mockImplementation((filter) => {
      const mockDoc = {
        _id: 'mock_report_id_123',
        title: 'RELIANCE Q4 Annual Report',
        companySymbol: filter.companySymbol,
        fileName: 'reliance_q4.txt',
        extractedText: 'Reliance Industries net profit rose by 18% to Rs 18,951 crore.',
        executiveSummary: 'Executive summary generated for RELIANCE.',
        extractedMetrics: {
          revenue_growth: '14.5% YoY',
          net_profit: '₹18,951 Cr',
          operating_margin: '18.2%',
          debt_to_equity: '0.38x',
        },
        growthDrivers: ['Core market expansion.'],
        keyRisks: ['Input commodity costs.'],
        createdAt: new Date(),
      };

      const chain = {
        sort: () => chain,
        limit: () => Promise.resolve([mockDoc]),
      };
      return chain;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('POST /api/reports/upload', () => {
    it('should upload report text and return structured executive summary and metrics', async () => {
      const res = await request(app)
        .post('/api/reports/upload')
        .send({
          symbol: 'RELIANCE',
          title: 'RELIANCE Q4 Annual Report',
          textContent: 'Reliance Industries net profit rose by 18% to Rs 18,951 crore. Revenue grew to Rs 100,000 crore.',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('report');
      expect(res.body.report).toHaveProperty('companySymbol', 'RELIANCE');
      expect(res.body.report).toHaveProperty('executiveSummary');
      expect(res.body.report).toHaveProperty('extractedMetrics');
    });

    it('should return 400 Bad Request if stock symbol is missing', async () => {
      const res = await request(app).post('/api/reports/upload').send({ textContent: 'Sample text' });
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toHaveProperty('code', 'INVALID_SYMBOL');
    });
  });

  describe('GET /api/reports/:symbol', () => {
    it('should return reports list for RELIANCE', async () => {
      const res = await request(app).get('/api/reports/RELIANCE');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('symbol', 'RELIANCE');
      expect(res.body).toHaveProperty('reports');
      expect(Array.isArray(res.body.reports)).toBe(true);
    });
  });
});
