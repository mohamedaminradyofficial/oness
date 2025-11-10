import request from 'supertest';
import express from 'express';
import { analysisRouter } from '../../../src/routes/analysis';
import { mockWebContent } from '../../mocks/aiProviders';

const app = express();
app.use(express.json());
app.use('/api/analysis', analysisRouter);

jest.mock('../../../src/utils/webScraper');
jest.mock('../../../src/utils/geminiHelper');
jest.mock('../../../src/utils/sourceEvaluator');

describe('Analysis Routes', () => {
  describe('POST /api/analysis/analyze', () => {
    it('should analyze URL successfully', async () => {
      const response = await request(app)
        .post('/api/analysis/analyze')
        .send({
          url: 'https://example.com',
          provider: 'gemini'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('analysis');
      expect(response.body).toHaveProperty('credibility');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/analysis/analyze')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle invalid URLs', async () => {
      const response = await request(app)
        .post('/api/analysis/analyze')
        .send({
          url: 'invalid-url',
          provider: 'gemini'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('URL');
    });

    it('should handle unsupported providers', async () => {
      const response = await request(app)
        .post('/api/analysis/analyze')
        .send({
          url: 'https://example.com',
          provider: 'unsupported'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('provider');
    });

    it('should handle analysis errors gracefully', async () => {
      jest.doMock('../../../src/utils/webScraper', () => ({
        extractContentFromUrl: jest.fn().mockRejectedValue(new Error('Scraping failed'))
      }));

      const response = await request(app)
        .post('/api/analysis/analyze')
        .send({
          url: 'https://example.com',
          provider: 'gemini'
        });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/analysis/history', () => {
    it('should return analysis history', async () => {
      const response = await request(app)
        .get('/api/analysis/history');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/analysis/history?page=1&limit=10');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
    });
  });

  describe('GET /api/analysis/:id', () => {
    it('should return specific analysis', async () => {
      const analysisId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .get(`/api/analysis/${analysisId}`);

      expect([200, 404]).toContain(response.status);
    });

    it('should validate ObjectId format', async () => {
      const response = await request(app)
        .get('/api/analysis/invalid-id');

      expect(response.status).toBe(400);
    });
  });
});