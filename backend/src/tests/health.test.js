const request = require('supertest');
const app = require('../app');

describe('Backend API Health Check', () => {
  it('GET /api/health should return 200 OK with service info', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('service', 'equityiq-backend');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('GET /api/nonexistent should return 404 NOT_FOUND error', async () => {
    const res = await request(app).get('/api/nonexistent');
    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toHaveProperty('code', 'NOT_FOUND');
  });
});
