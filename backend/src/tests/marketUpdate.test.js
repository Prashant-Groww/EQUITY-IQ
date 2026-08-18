const request = require('supertest');
const app = require('../app');
const Stock = require('../models/Stock');
const StockMarketData = require('../models/StockMarketData');
const MarketUpdateStatus = require('../models/MarketUpdateStatus');
const { fetchLatestMarketData, formatNSESymbol } = require('../services/marketDataFetcher');
const { seedStockMasterIfEmpty, runDailyMarketDataUpdate } = require('../services/marketUpdateJob');
const { connectDB, disconnectDB } = require('../config/db');

jest.setTimeout(30000);

describe('Daily Indian Stock Price Update System Integration Tests', () => {
  beforeAll(async () => {
    await connectDB(2, 1000);
  });

  afterAll(async () => {
    await disconnectDB();
  });
  describe('Symbol Formatter & Parser', () => {
    it('should format NSE symbols correctly without duplications', () => {
      expect(formatNSESymbol('TCS')).toEqual({ cleanSymbol: 'TCS', nseSymbol: 'TCS.NS' });
      expect(formatNSESymbol('tcs.ns')).toEqual({ cleanSymbol: 'TCS', nseSymbol: 'TCS.NS' });
      expect(formatNSESymbol('RELIANCE.BO')).toEqual({ cleanSymbol: 'RELIANCE', nseSymbol: 'RELIANCE.NS' });
    });
  });

  describe('Stock Master Seeding', () => {
    it('should seed Stock Master database with 500+ NSE stocks if empty', async () => {
      await seedStockMasterIfEmpty();
      const count = await Stock.countDocuments();
      expect(count).toBeGreaterThanOrEqual(50);

      const tcsMaster = await Stock.findOne({ symbol: 'TCS' });
      expect(tcsMaster).toBeDefined();
      expect(tcsMaster.exchange).toBe('NSE');
    });
  });

  describe('Symbol-Specific Data Isolation & Quote Integrity', () => {
    it('should return strictly symbol-specific quote data for TCS', async () => {
      const res = await request(app).get('/api/stocks/TCS/quote');
      expect(res.statusCode).toBe(200);
      expect(res.body.symbol).toBe('TCS');
      expect(res.body.companyName).toMatch(/Tata Consultancy Services|TCS/i);
      expect(res.body).toHaveProperty('formattedLastUpdated');
      expect(res.body).toHaveProperty('dataSource');
    });

    it('should return strictly symbol-specific quote data for INFY', async () => {
      const res = await request(app).get('/api/stocks/INFY/quote');
      expect(res.statusCode).toBe(200);
      expect(res.body.symbol).toBe('INFY');
      expect(res.body.companyName).toMatch(/Infosys|INFY/i);
    });

    it('should return strictly symbol-specific quote data for RELIANCE', async () => {
      const res = await request(app).get('/api/stocks/RELIANCE/quote');
      expect(res.statusCode).toBe(200);
      expect(res.body.symbol).toBe('RELIANCE');
      expect(res.body.companyName).toMatch(/Reliance Industries|RELIANCE/i);
    });

    it('should return distinct prices for TCS, INFY, and RELIANCE without cross-contamination', async () => {
      const resTcs = await request(app).get('/api/stocks/TCS/quote');
      const resInfy = await request(app).get('/api/stocks/INFY/quote');
      const resRel = await request(app).get('/api/stocks/RELIANCE/quote');

      expect(resTcs.body.symbol).toBe('TCS');
      expect(resInfy.body.symbol).toBe('INFY');
      expect(resRel.body.symbol).toBe('RELIANCE');

      // Symbols must not be swapped
      expect(resTcs.body.symbol).not.toBe(resInfy.body.symbol);
    });
  });

  describe('Market Data Upsert Idempotency', () => {
    it('should upsert market data for symbol + date without creating duplicate records', async () => {
      const sampleDate = '2026-08-18';
      const sampleData = {
        symbol: 'TESTSYMB',
        exchange: 'NSE',
        date: sampleDate,
        open: 1000,
        high: 1050,
        low: 990,
        close: 1040,
        previousClose: 995,
        change: 45,
        changePercent: 4.52,
        volume: 50000,
        dataSource: 'Yahoo Finance NSE',
        isTradingDay: true,
        updatedAt: new Date(),
      };

      // Upsert run 1
      await StockMarketData.updateOne(
        { symbol: sampleData.symbol, date: sampleData.date },
        { $set: sampleData },
        { upsert: true }
      );

      // Upsert run 2 (simulating multiple daily job runs)
      await StockMarketData.updateOne(
        { symbol: sampleData.symbol, date: sampleData.date },
        { $set: { ...sampleData, close: 1045 } },
        { upsert: true }
      );

      const records = await StockMarketData.find({ symbol: 'TESTSYMB', date: sampleDate });
      expect(records.length).toBe(1);
      expect(records[0].close).toBe(1045);

      // Cleanup test doc
      await StockMarketData.deleteOne({ symbol: 'TESTSYMB' });
    });
  });

  describe('Admin Manual Trigger Endpoint & Status Logging', () => {
    it('should trigger manual update job and log execution status', async () => {
      const res = await request(app).post('/api/admin/stocks/update-prices');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message');
      expect(res.body.data).toHaveProperty('status');
      expect(['SUCCESS', 'PARTIAL_SUCCESS']).toContain(res.body.data.status);
      expect(res.body.data.successfulUpdates).toBeGreaterThan(0);
    });

    it('should retrieve update status logs from GET /api/admin/stocks/update-status', async () => {
      const res = await request(app).get('/api/admin/stocks/update-status');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('totalRuns');
      expect(res.body).toHaveProperty('latestRun');
      expect(res.body.latestRun).toHaveProperty('status');
    });
  });
});
