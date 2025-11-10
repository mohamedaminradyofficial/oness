import { extractContentFromUrl } from '../../../src/utils/webScraper';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('WebScraper Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('extractContentFromUrl', () => {
    it('should extract content from valid URL', async () => {
      mockedAxios.get.mockResolvedValue({
        data: '<html><head><title>Test</title></head><body><p>Content</p></body></html>',
        status: 200
      });

      const result = await extractContentFromUrl('https://example.com');
      
      expect(result).toBeDefined();
      expect(result.title).toBeTruthy();
      expect(result.content).toBeTruthy();
    });

    it('should handle invalid URLs', async () => {
      await expect(extractContentFromUrl('invalid-url')).rejects.toThrow();
    });

    it('should handle network errors', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'));
      
      await expect(extractContentFromUrl('https://example.com')).rejects.toThrow();
    });

    it('should handle empty content', async () => {
      mockedAxios.get.mockResolvedValue({
        data: '<html></html>',
        status: 200
      });

      const result = await extractContentFromUrl('https://example.com');
      expect(result.content).toBe('');
    });

    it('should extract meta information', async () => {
      mockedAxios.get.mockResolvedValue({
        data: `<html>
          <head>
            <title>Test Title</title>
            <meta name="author" content="Test Author">
            <meta name="description" content="Test Description">
          </head>
          <body><p>Content</p></body>
        </html>`,
        status: 200
      });

      const result = await extractContentFromUrl('https://example.com');
      expect(result.title).toBe('Test Title');
    });
  });
});