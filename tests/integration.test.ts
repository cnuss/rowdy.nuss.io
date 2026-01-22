import request from 'supertest';
import { createApp } from '../src/app';
import type { Express } from 'express';

describe('Integration Tests', () => {
  let app: Express;

  beforeEach(() => {
    app = createApp();
  });

  describe('GET / with Accept: text/x-shellscript', () => {
    it('should return 200', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(200);
    });
  });
});
