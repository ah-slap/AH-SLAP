import request from 'supertest';
import app from '../src/app';
import { pool } from '../src/db';

describe('GET /api/health', () => {
  afterAll(async () => {
    await pool.end();
  });

  it('returns 200 and connected status when PostgreSQL is reachable', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok', db: 'connected' });
  });
});
