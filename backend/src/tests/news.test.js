const request = require('supertest');
const app = require('../app');
const News = require('../models/News');
const newsService = require('../services/newsService');

jest.setTimeout(15000);

describe('Phase 4 — News Integration & Deduplication Tests', () => {
  let inMemoryNews = [];

  beforeEach(() => {
    inMemoryNews = [];
    jest.clearAllMocks();

    // Mock News.bulkWrite to test unique URL deduplication logic
    jest.spyOn(News, 'bulkWrite').mockImplementation(async (operations) => {
      let upsertedCount = 0;
      let matchedCount = 0;

      for (const op of operations) {
        const updateData = op.updateOne;
        const filterUrl = updateData.filter.url;
        const existing = inMemoryNews.find((n) => n.url === filterUrl);

        if (existing) {
          matchedCount++;
        } else {
          inMemoryNews.push({ ...updateData.update.$setOnInsert });
          upsertedCount++;
        }
      }

      return { upsertedCount, matchedCount };
    });

    // Mock News.countDocuments
    jest.spyOn(News, 'countDocuments').mockImplementation(async (filter) => {
      if (!filter || !filter.companySymbol) return inMemoryNews.length;
      return inMemoryNews.filter((n) => n.companySymbol === filter.companySymbol).length;
    });

    // Mock News.find with chainable sort, skip, and limit
    jest.spyOn(News, 'find').mockImplementation((filter) => {
      let matches = inMemoryNews;
      if (filter && filter.companySymbol) {
        matches = inMemoryNews.filter((n) => n.companySymbol === filter.companySymbol);
      }

      const chain = {
        sort: () => chain,
        skip: (skipNum) => {
          matches = matches.slice(skipNum);
          return chain;
        },
        limit: (limitNum) => {
          matches = matches.slice(0, limitNum);
          return Promise.resolve(matches);
        },
        then: (resolve) => resolve(matches),
      };

      return chain;
    });
  });

  describe('News Ingestion & Deduplication', () => {
    it('ingesting the same news batch twice produces ZERO duplicate documents', async () => {
      // First ingestion pass
      const firstRes = await newsService.ingestNewsForSymbol('AAPL');
      const firstCount = await News.countDocuments({ companySymbol: 'AAPL' });
      expect(firstRes.upsertedCount).toBeGreaterThan(0);
      expect(firstCount).toBe(firstRes.upsertedCount);

      // Second ingestion pass with identical batch
      const secondRes = await newsService.ingestNewsForSymbol('AAPL');
      const secondCount = await News.countDocuments({ companySymbol: 'AAPL' });

      // Count MUST remain identical (zero new documents added)
      expect(secondRes.upsertedCount).toBe(0);
      expect(secondRes.matchedCount).toBe(firstCount);
      expect(secondCount).toBe(firstCount);
    });

    it('POST /api/news/:symbol/ingest on-demand route triggers deduplicated ingestion', async () => {
      const res = await request(app).post('/api/news/MSFT/ingest');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('result');
      expect(res.body.result).toHaveProperty('symbol', 'MSFT');
    });
  });

  describe('GET /api/news/:symbol (Pagination & Unknown Symbols)', () => {
    beforeEach(async () => {
      await newsService.ingestNewsForSymbol('AAPL');
    });

    it('returns paginated news with correct page size and metadata', async () => {
      const res = await request(app).get('/api/news/AAPL?page=1&limit=3');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('news');
      expect(res.body).toHaveProperty('pagination');

      expect(Array.isArray(res.body.news)).toBe(true);
      expect(res.body.news.length).toBeLessThanOrEqual(3);
      expect(res.body.pagination).toEqual({
        page: 1,
        limit: 3,
        total: expect.any(Number),
        totalPages: expect.any(Number),
      });
    });

    it('returns an empty array [] for unknown symbols with zero news, NOT an error', async () => {
      const res = await request(app).get('/api/news/UNKNOWNXYZ');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('news');
      expect(Array.isArray(res.body.news)).toBe(true);
      expect(res.body.news.length).toBe(0);
      expect(res.body.pagination.total).toBe(0);
    });
  });
});
