import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../../src/index';

describe('Analysis API Integration Tests', () => {
  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.TEST_DATABASE_URL || 'mongodb://localhost:27017/test');
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('Full Analysis Workflow', () => {
    it('should complete full analysis workflow', async () => {
      // Step 1: Analyze content
      const analyzeResponse = await request(app)
        .post('/api/analysis/analyze')
        .send({
          url: 'https://example.com',
          provider: 'gemini'
        });

      expect(analyzeResponse.status).toBe(200);
      const analysisId = analyzeResponse.body.id;

      // Step 2: Retrieve analysis
      const getResponse = await request(app)
        .get(`/api/analysis/${analysisId}`);

      expect(getResponse.status).toBe(200);
      expect(getResponse.body.id).toBe(analysisId);

      // Step 3: Check in history
      const historyResponse = await request(app)
        .get('/api/analysis/history');

      expect(historyResponse.status).toBe(200);
      expect(historyResponse.body.some((item: any) => item.id === analysisId)).toBe(true);
    });

    it('should handle concurrent analysis requests', async () => {
      const requests = Array(5).fill(null).map(() =>
        request(app)
          .post('/api/analysis/analyze')
          .send({
            url: 'https://example.com',
            provider: 'gemini'
          })
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('analysis');
      });
    });

    it('should persist analysis results correctly', async () => {
      const testUrl = 'https://test-persistence.com';
      
      const response = await request(app)
        .post('/api/analysis/analyze')
        .send({
          url: testUrl,
          provider: 'gemini'
        });

      expect(response.status).toBe(200);
      
      // Verify persistence
      const retrieveResponse = await request(app)
        .get(`/api/analysis/${response.body.id}`);

      expect(retrieveResponse.status).toBe(200);
      expect(retrieveResponse.body.url).toBe(testUrl);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle database connection errors', async () => {
      // Temporarily close connection
      await mongoose.connection.close();

      const response = await request(app)
        .post('/api/analysis/analyze')
        .send({
          url: 'https://example.com',
          provider: 'gemini'
        });

      expect(response.status).toBe(500);
      
      // Reconnect
      await mongoose.connect(process.env.TEST_DATABASE_URL || 'mongodb://localhost:27017/test');
    });

    it('should handle AI service timeouts', async () => {
      const response = await request(app)
        .post('/api/analysis/analyze')
        .send({
          url: 'https://very-slow-website.com',
          provider: 'gemini',
          timeout: 1000
        });

      expect([200, 408, 500]).toContain(response.status);
    });
  });

  describe('Performance Integration', () => {
    it('should handle large content analysis', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .post('/api/analysis/analyze')
        .send({
          url: 'https://large-content-site.com',
          provider: 'gemini'
        });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(30000); // 30 seconds max
    });

    it('should cache repeated requests', async () => {
      const testUrl = 'https://cache-test.com';
      
      // First request
      const firstResponse = await request(app)
        .post('/api/analysis/analyze')
        .send({
          url: testUrl,
          provider: 'gemini'
        });

      // Second request (should be faster due to caching)
      const startTime = Date.now();
      const secondResponse = await request(app)
        .post('/api/analysis/analyze')
        .send({
          url: testUrl,
          provider: 'gemini'
        });
      const duration = Date.now() - startTime;

      expect(firstResponse.status).toBe(200);
      expect(secondResponse.status).toBe(200);
      expect(duration).toBeLessThan(5000); // Should be much faster
    });
  });
});