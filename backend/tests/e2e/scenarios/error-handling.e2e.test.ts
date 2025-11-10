import puppeteer, { Browser, Page } from 'puppeteer';

describe('Error Handling E2E Tests', () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
  });

  describe('Network Error Scenarios', () => {
    it('should handle offline mode gracefully', async () => {
      await page.setOfflineMode(true);
      await page.goto('http://localhost:3000');

      // Should show offline message
      await page.waitForSelector('[data-testid="offline-indicator"]', { timeout: 5000 });
      const offlineText = await page.$eval('[data-testid="offline-indicator"]', el => el.textContent);
      expect(offlineText).toContain('غير متصل');

      await page.setOfflineMode(false);
    });

    it('should retry failed requests', async () => {
      await page.goto('http://localhost:3000');
      
      // Simulate network failure during analysis
      await page.setRequestInterception(true);
      let requestCount = 0;
      
      page.on('request', (request) => {
        if (request.url().includes('/api/analysis/analyze')) {
          requestCount++;
          if (requestCount <= 2) {
            request.abort();
          } else {
            request.continue();
          }
        } else {
          request.continue();
        }
      });

      await page.type('[data-testid="url-input"]', 'https://example.com');
      await page.click('[data-testid="analyze-button"]');

      // Should eventually succeed after retries
      await page.waitForSelector('[data-testid="analysis-results"]', { timeout: 30000 });
      expect(requestCount).toBeGreaterThan(1);
    });

    it('should show timeout errors appropriately', async () => {
      await page.goto('http://localhost:3000');
      
      // Mock slow response
      await page.setRequestInterception(true);
      page.on('request', (request) => {
        if (request.url().includes('/api/analysis/analyze')) {
          // Don't respond to simulate timeout
          return;
        }
        request.continue();
      });

      await page.type('[data-testid="url-input"]', 'https://slow-site.com');
      await page.click('[data-testid="analyze-button"]');

      await page.waitForSelector('[data-testid="timeout-error"]', { timeout: 35000 });
      const errorText = await page.$eval('[data-testid="timeout-error"]', el => el.textContent);
      expect(errorText).toContain('انتهت مهلة الاتصال');
    });
  });

  describe('User Input Error Scenarios', () => {
    it('should validate URL format in real-time', async () => {
      await page.goto('http://localhost:3000');
      
      await page.type('[data-testid="url-input"]', 'invalid-url');
      await page.waitForSelector('[data-testid="url-validation-error"]');
      
      const errorText = await page.$eval('[data-testid="url-validation-error"]', el => el.textContent);
      expect(errorText).toContain('رابط غير صحيح');
    });

    it('should handle empty form submission', async () => {
      await page.goto('http://localhost:3000');
      
      await page.click('[data-testid="analyze-button"]');
      await page.waitForSelector('[data-testid="required-field-error"]');
      
      const errorText = await page.$eval('[data-testid="required-field-error"]', el => el.textContent);
      expect(errorText).toContain('مطلوب');
    });

    it('should handle special characters in URLs', async () => {
      await page.goto('http://localhost:3000');
      
      const specialUrls = [
        'https://example.com/path with spaces',
        'https://example.com/path?query=value&other=test',
        'https://example.com/path#fragment'
      ];

      for (const url of specialUrls) {
        await page.evaluate(() => {
          const input = document.querySelector('[data-testid="url-input"]') as HTMLInputElement;
          if (input) input.value = '';
        });
        
        await page.type('[data-testid="url-input"]', url);
        await page.click('[data-testid="analyze-button"]');
        
        // Should either succeed or show appropriate error
        await Promise.race([
          page.waitForSelector('[data-testid="analysis-results"]', { timeout: 10000 }),
          page.waitForSelector('[data-testid="error-message"]', { timeout: 10000 })
        ]);
      }
    });
  });

  describe('API Error Scenarios', () => {
    it('should handle API rate limiting', async () => {
      await page.goto('http://localhost:3000');
      
      // Mock rate limit response
      await page.setRequestInterception(true);
      page.on('request', (request) => {
        if (request.url().includes('/api/analysis/analyze')) {
          request.respond({
            status: 429,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Rate limit exceeded' })
          });
        } else {
          request.continue();
        }
      });

      await page.type('[data-testid="url-input"]', 'https://example.com');
      await page.click('[data-testid="analyze-button"]');

      await page.waitForSelector('[data-testid="rate-limit-error"]');
      const errorText = await page.$eval('[data-testid="rate-limit-error"]', el => el.textContent);
      expect(errorText).toContain('تم تجاوز الحد المسموح');
    });

    it('should handle AI service errors', async () => {
      await page.goto('http://localhost:3000');
      
      // Mock AI service error
      await page.setRequestInterception(true);
      page.on('request', (request) => {
        if (request.url().includes('/api/analysis/analyze')) {
          request.respond({
            status: 503,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'AI service unavailable' })
          });
        } else {
          request.continue();
        }
      });

      await page.type('[data-testid="url-input"]', 'https://example.com');
      await page.click('[data-testid="analyze-button"]');

      await page.waitForSelector('[data-testid="service-error"]');
      const errorText = await page.$eval('[data-testid="service-error"]', el => el.textContent);
      expect(errorText).toContain('خدمة الذكاء الاصطناعي غير متاحة');
    });
  });

  describe('Recovery Scenarios', () => {
    it('should allow retry after error', async () => {
      await page.goto('http://localhost:3000');
      
      // First request fails
      await page.setRequestInterception(true);
      let firstRequest = true;
      
      page.on('request', (request) => {
        if (request.url().includes('/api/analysis/analyze')) {
          if (firstRequest) {
            firstRequest = false;
            request.respond({
              status: 500,
              contentType: 'application/json',
              body: JSON.stringify({ error: 'Internal server error' })
            });
          } else {
            request.respond({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({ 
                analysis: { text: 'تحليل ناجح' },
                credibility: { score: 0.8 }
              })
            });
          }
        } else {
          request.continue();
        }
      });

      await page.type('[data-testid="url-input"]', 'https://example.com');
      await page.click('[data-testid="analyze-button"]');

      // Wait for error
      await page.waitForSelector('[data-testid="error-message"]');
      
      // Click retry
      await page.click('[data-testid="retry-button"]');
      
      // Should succeed on retry
      await page.waitForSelector('[data-testid="analysis-results"]');
    });

    it('should preserve form data after error', async () => {
      await page.goto('http://localhost:3000');
      
      const testUrl = 'https://preserve-data-test.com';
      await page.type('[data-testid="url-input"]', testUrl);
      await page.select('[data-testid="provider-select"]', 'groq');
      
      // Mock error response
      await page.setRequestInterception(true);
      page.on('request', (request) => {
        if (request.url().includes('/api/analysis/analyze')) {
          request.respond({
            status: 400,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Bad request' })
          });
        } else {
          request.continue();
        }
      });

      await page.click('[data-testid="analyze-button"]');
      await page.waitForSelector('[data-testid="error-message"]');

      // Check that form data is preserved
      const urlValue = await page.$eval('[data-testid="url-input"]', el => (el as HTMLInputElement).value);
      const providerValue = await page.$eval('[data-testid="provider-select"]', el => (el as HTMLSelectElement).value);
      
      expect(urlValue).toBe(testUrl);
      expect(providerValue).toBe('groq');
    });
  });
});