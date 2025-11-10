import { analyzeWithGroq } from '../../../src/utils/groqHelper';
import { mockGroqResponse } from '../../mocks/aiProviders';

jest.mock('groq-sdk');

describe('Groq Helper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('analyzeWithGroq', () => {
    it('should analyze content successfully', async () => {
      const mockCreate = jest.fn().mockResolvedValue(mockGroqResponse);
      
      const mockGroq = {
        chat: {
          completions: {
            create: mockCreate
          }
        }
      };

      jest.doMock('groq-sdk', () => ({
        Groq: jest.fn().mockImplementation(() => mockGroq)
      }));

      const result = await analyzeWithGroq('test content');
      
      expect(result).toBeDefined();
      expect(mockCreate).toHaveBeenCalled();
    });

    it('should handle API errors', async () => {
      const mockGroq = {
        chat: {
          completions: {
            create: jest.fn().mockRejectedValue(new Error('API Error'))
          }
        }
      };

      jest.doMock('groq-sdk', () => ({
        Groq: jest.fn().mockImplementation(() => mockGroq)
      }));

      await expect(analyzeWithGroq('test content')).rejects.toThrow();
    });

    it('should handle rate limiting', async () => {
      const mockGroq = {
        chat: {
          completions: {
            create: jest.fn().mockRejectedValue({ status: 429 })
          }
        }
      };

      jest.doMock('groq-sdk', () => ({
        Groq: jest.fn().mockImplementation(() => mockGroq)
      }));

      await expect(analyzeWithGroq('test content')).rejects.toThrow();
    });

    it('should validate input parameters', async () => {
      await expect(analyzeWithGroq('')).rejects.toThrow();
      await expect(analyzeWithGroq(null as any)).rejects.toThrow();
    });
  });
});