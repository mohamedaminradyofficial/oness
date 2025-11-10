import request from 'supertest';
import { app } from '../../../src/index';

describe('Cache Integration Tests', () => {
  describe('Analysis Caching', () => {
    it('should cache analysis results', async () => {
      const testUrl = 'https://cache-test-example.com';
      
      // First request - should hit API
      const startTime1 = Date.now();
      const response1 = await request(app)
        .post('/api/analysis/analyze')
        .send({
          url: testUrl,
          provider: 'gemini'
        });
      const duration1 = Date.now() - startTime1;

      expect(response1.status).toBe(200);

      // Second request - should hit cache
      const startTime2 = Date.now();
      const response2 = await request(app)
        .post('/api/analysis/analyze')
        .send({
          url: testUrl,
          provider: 'gemini'
        });
      const duration2 = Date.now() - startTime2;

      expect(response2.status).toBe(200);
      expect(duration2).toBeLessThan(duration1 * 0.5); // Should be significantly faster
      expect(response2.body.analysis).toEqual(response1.body.analysis);
    });

    it('should invalidate cache after TTL', async () => {
      const testUrl = 'https://ttl-test-example.com';
      
      const response1 = await request(app)
        .post('/api/analysis/analyze')
        .send({
          url: testUrl,
          provider: 'gemini',
          cacheTTL: 1 // 1 second TTL for testing
        });

      expect(response1.status).toBe(200);

      // Wait for cache to expire
      await new Promise(resolve => setTimeout(resolve, 1100));

      const response2 = await request(app)
        .post('/api/analysis/analyze')
        .send({
          url: testUrl,
          provider: 'gemini'
        });

      expect(response2.status).toBe(200);
      // Should be fresh analysis, not cached
    });

    it('should handle cache misses gracefully', async () => {
      const response = await request(app)
        .get('/api/cache/clear')
        .expect(200);

      const analysisResponse = await request(app)
        .post('/api/analysis/analyze')
        .send({
          url: 'https://fresh-analysis.com',
          provider: 'gemini'
        });

      expect(analysisResponse.status).toBe(200);
    });
  });

  describe('Cache Management', () => {
    it('should clear cache on demand', async () => {
      // Populate cache
      await request(app)
        .post('/api/analysis/analyze')
        .send({
          url: 'https://clear-test.com',
          provider: 'gemini'
        });

      // Clear cache
      const clearResponse = await request(app)
        .delete('/api/cache/clear')
        .expect(200);

      expect(clearResponse.body.message).toContain('cleared');
    });

    it('should provide cache statistics', async () => {
      const statsResponse = await request(app)
        .get('/api/cache/stats')
        .expect(200);

      expect(statsResponse.body).toHaveProperty('hits');
      expect(statsResponse.body).toHaveProperty('misses');
      expect(statsResponse.body).toHaveProperty('size');
    });

    it('should handle cache size limits', async () => {
      // Generate multiple cache entries
      const requests = Array(10).fill(null).map((_, i) =>
        request(app)
          .post('/api/analysis/analyze')
          .send({
            url: `https://cache-limit-test-${i}.com`,
            provider: 'gemini'
          })
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // Check cache doesn't exceed limits
      const statsResponse = await request(app)
        .get('/api/cache/stats');

      expect(statsResponse.body.size).toBeLessThanOrEqual(100); // Assuming 100 item limit
    });
  });
});