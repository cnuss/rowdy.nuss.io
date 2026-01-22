import { describe, expect, it } from '@jest/globals';
import request from 'supertest';
import { createApp } from '../src/app';

describe('integration tests', () => {
  describe('root', () => {
    it('should return 200', async () => {
      expect.assertions(1);

      const app = createApp(),
        response = await request(app).get('/');

      expect(response.status).toBe(200);
    });
  });
});
