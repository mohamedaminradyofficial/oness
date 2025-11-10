import puppeteer, { Browser, Page } from 'puppeteer';
import request from 'supertest';
import { app } from '../../../src/index';

describe('Complete Analysis E2E Tests', () => {
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

  describe('User Journey: Complete Analysis Flow', () => {
    it('should complete full user analysis journey', async () => {
      // Step 1: Navigate to application
      await page.goto('http://localhost:3000');
      await page.waitForSelector('[data-testid="url-input"]');

      // Step 2: Enter URL for analysis
      await page.type('[data-testid="url-input"]', 'https://example.com');
      await page.select('[data-testid="provider-select"]', 'gemini');

      // Step 3: Submit analysis
      await page.click('[data-testid="analyze-button"]');
      await page.waitForSelector('[data-testid="analysis-results"]', { timeout: 30000 });

      // Step 4: Verify results are displayed
      const resultsText = await page.$eval('[data-testid="analysis-results"]', el => el.textContent);
      expect(resultsText).toBeTruthy();

      // Step 5: Check credibility score
      const credibilityScore = await page.$eval('[data-testid="credibility-score"]', el => el.textContent);
      expect(credibilityScore).toMatch(/\d+(\.\d+)?/);

      // Step 6: Navigate to history
      await page.click('[data-testid="history-tab"]');
      await page.waitForSelector('[data-testid="history-list"]');

      // Step 7: Verify analysis appears in history
      const historyItems = await page.$$('[data-testid="history-item"]');
      expect(historyItems.length).toBeGreaterThan(0);
    });

    it('should handle error scenarios gracefully', async () => {
      await page.goto('http://localhost:3000');
      
      // Test invalid URL
      await page.type('[data-testid="url-input"]', 'invalid-url');
      await page.click('[data-testid="analyze-button"]');
      
      await page.waitForSelector('[data-testid="error-message"]');
      const errorText = await page.$eval('[data-testid="error-message"]', el => el.textContent);
      expect(errorText).toContain('URL');
    });

    it('should support different AI providers', async () => {
      await page.goto('http://localhost:3000');
      
      // Test Groq provider
      await page.type('[data-testid="url-input"]', 'https://example.com');
      await page.select('[data-testid="provider-select"]', 'groq');
      await page.click('[data-testid="analyze-button"]');
      
      await page.waitForSelector('[data-testid="analysis-results"]', { timeout: 30000 });
      const results = await page.$eval('[data-testid="analysis-results"]', el => el.textContent);
      expect(results).toBeTruthy();
    });
  });

  describe('Performance E2E Tests', () => {
    it('should load application within acceptable time', async () => {
      const startTime = Date.now();
      await page.goto('http://localhost:3000');
      await page.waitForSelector('[data-testid="main-container"]');
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(5000); // 5 seconds max
    });

    it('should handle multiple concurrent users', async () => {
      const pages = await Promise.all(
        Array(3).fill(null).map(() => browser.newPage())
      );

      const analysisPromises = pages.map(async (userPage) => {
        await userPage.goto('http://localhost:3000');
        await userPage.type('[data-testid="url-input"]', 'https://example.com');
        await userPage.click('[data-testid="analyze-button"]');
        return userPage.waitForSelector('[data-testid="analysis-results"]', { timeout: 30000 });
      });

      await Promise.all(analysisPromises);
      
      // Cleanup
      await Promise.all(pages.map(p => p.close()));
    });
  });

  describe('Accessibility E2E Tests', () => {
    it('should be keyboard navigable', async () => {
      await page.goto('http://localhost:3000');
      
      // Tab through interface
      await page.keyboard.press('Tab'); // URL input
      await page.keyboard.press('Tab'); // Provider select
      await page.keyboard.press('Tab'); // Analyze button
      
      const focusedElement = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
      expect(focusedElement).toBe('analyze-button');
    });

    it('should have proper ARIA labels', async () => {
      await page.goto('http://localhost:3000');
      
      const urlInput = await page.$('[data-testid="url-input"]');
      const ariaLabel = await urlInput?.evaluate(el => el.getAttribute('aria-label'));
      expect(ariaLabel).toBeTruthy();
    });
  });
});