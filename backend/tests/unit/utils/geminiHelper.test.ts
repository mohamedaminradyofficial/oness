import { analyzeWithGemini } from '../../../src/utils/geminiHelper';
import { mockGeminiResponse } from '../../mocks/aiProviders';

jest.mock('@google/generative-ai');

describe('Gemini Helper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('analyzeWithGemini', () => {
    it('should analyze content successfully', async () => {
      const mockGenerateContent = jest.fn().mockResolvedValue({
        response: {
          text: () => JSON.stringify(mockGeminiResponse)
        }
      });

      const mockModel = {
        generateContent: mockGenerateContent
      };

      jest.doMock('@google/generative-ai', () => ({
        GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
          getGenerativeModel: () => mockModel
        }))
      }));

      const result = await analyzeWithGemini('test content');
      
      expect(result).toBeDefined();
      expect(mockGenerateContent).toHaveBeenCalled();
    });

    it('should handle API errors', async () => {
      const mockModel = {
        generateContent: jest.fn().mockRejectedValue(new Error('API Error'))
      };

      jest.doMock('@google/generative-ai', () => ({
        GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
          getGenerativeModel: () => mockModel
        }))
      }));

      await expect(analyzeWithGemini('test content')).rejects.toThrow();
    });

    it('should handle empty content', async () => {
      await expect(analyzeWithGemini('')).rejects.toThrow();
    });

    it('should handle long content', async () => {
      const longContent = 'a'.repeat(10000);
      const mockModel = {
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () => JSON.stringify(mockGeminiResponse)
          }
        })
      };

      jest.doMock('@google/generative-ai', () => ({
        GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
          getGenerativeModel: () => mockModel
        }))
      }));

      const result = await analyzeWithGemini(longContent);
      expect(result).toBeDefined();
    });
  });
});