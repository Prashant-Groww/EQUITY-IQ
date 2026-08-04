const request = require('supertest');
const app = require('../app');
const stockService = require('../services/stockService');
const News = require('../models/News');
const Report = require('../models/Report');

jest.setTimeout(15000);

describe('Phase 8 — RAG Semantic Retrieval & Knowledge Indexing Tests', () => {
  beforeEach(() => {
    jest.spyOn(stockService, 'getStockQuote').mockResolvedValue({
      symbol: 'RELIANCE',
      price: 1290.9,
      previousClose: 1285.0,
      fiftyTwoWeekHigh: 1608.0,
      fiftyTwoWeekLow: 1150.0,
      marketCap: 17530000000000,
    });

    jest.spyOn(News, 'find').mockImplementation(() => ({
      sort: () => ({
        limit: () => Promise.resolve([
          {
            _id: 'news_1',
            title: 'Reliance Industries Expansion',
            summary: 'Reliance expands retail footprint and digital services across India.',
            source: 'Economic Times',
            url: 'https://example.com/news1',
          },
        ]),
      }),
    }));

    jest.spyOn(Report, 'find').mockImplementation(() => ({
      sort: () => ({
        limit: () => Promise.resolve([
          {
            _id: 'report_1',
            title: 'RELIANCE Annual Filing Q4',
            executiveSummary: 'Net profit rose 18% to Rs 18,951 crore.',
            extractedMetrics: { operating_margin: '18.2%', net_profit: '₹18,951 Cr' },
          },
        ]),
      }),
    }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('POST /api/ml/rag-query', () => {
    it('should return semantic context retrieval and synthesized answer for RELIANCE query', async () => {
      const res = await request(app)
        .post('/api/ml/rag-query')
        .send({
          symbol: 'RELIANCE',
          query: 'What were the Q4 profit figures and retail revenue expansion?',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('symbol', 'RELIANCE');
      expect(res.body).toHaveProperty('query');
      expect(res.body).toHaveProperty('synthesized_answer');
      expect(res.body).toHaveProperty('retrieved_chunks');
      expect(Array.isArray(res.body.retrieved_chunks)).toBe(true);
      expect(res.body.retrieved_chunks.length).toBeGreaterThan(0);
      expect(res.body.retrieved_chunks[0]).toHaveProperty('relevance_score');
      expect(res.body.retrieved_chunks[0]).toHaveProperty('source_type');
    });

    it('should return 400 Bad Request when symbol or query is missing', async () => {
      const res = await request(app).post('/api/ml/rag-query').send({ symbol: 'RELIANCE' });
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toHaveProperty('code', 'INVALID_QUERY');
    });
  });
});
