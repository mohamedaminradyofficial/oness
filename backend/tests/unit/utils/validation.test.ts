describe('Validation Utils', () => {
  describe('URL Validation', () => {
    const validateUrl = (url: string): boolean => {
      try {
        new URL(url);
        return url.startsWith('http://') || url.startsWith('https://');
      } catch {
        return false;
      }
    };

    it('should validate correct HTTP URLs', () => {
      const validUrls = [
        'http://example.com',
        'https://example.com',
        'https://www.example.com/path',
        'https://example.com:8080/path?query=value',
        'https://subdomain.example.com'
      ];

      validUrls.forEach(url => {
        expect(validateUrl(url)).toBe(true);
      });
    });

    it('should reject invalid URLs', () => {
      const invalidUrls = [
        'not-a-url',
        'ftp://example.com',
        'file:///path/to/file',
        'javascript:alert(1)',
        'data:text/html,<script>',
        '',
        null,
        undefined
      ];

      invalidUrls.forEach(url => {
        expect(validateUrl(url as string)).toBe(false);
      });
    });

    it('should handle edge cases', () => {
      expect(validateUrl('https://')).toBe(false);
      expect(validateUrl('https://.')).toBe(false);
      expect(validateUrl('https://localhost')).toBe(true);
      expect(validateUrl('https://127.0.0.1')).toBe(true);
    });
  });

  describe('Content Validation', () => {
    const validateContent = (content: string): { valid: boolean; errors: string[] } => {
      const errors: string[] = [];
      
      if (!content || content.trim().length === 0) {
        errors.push('Content is required');
      }
      
      if (content && content.length > 50000) {
        errors.push('Content too long');
      }
      
      if (content && content.length < 10) {
        errors.push('Content too short');
      }

      return { valid: errors.length === 0, errors };
    };

    it('should validate proper content', () => {
      const validContent = 'This is a valid content for analysis that meets all requirements.';
      const result = validateContent(validContent);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty content', () => {
      const result = validateContent('');
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Content is required');
    });

    it('should reject too long content', () => {
      const longContent = 'a'.repeat(50001);
      const result = validateContent(longContent);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Content too long');
    });

    it('should reject too short content', () => {
      const result = validateContent('short');
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Content too short');
    });
  });

  describe('Provider Validation', () => {
    const validateProvider = (provider: string): boolean => {
      const validProviders = ['gemini', 'groq'];
      return validProviders.includes(provider);
    };

    it('should validate supported providers', () => {
      expect(validateProvider('gemini')).toBe(true);
      expect(validateProvider('groq')).toBe(true);
    });

    it('should reject unsupported providers', () => {
      expect(validateProvider('openai')).toBe(false);
      expect(validateProvider('claude')).toBe(false);
      expect(validateProvider('')).toBe(false);
      expect(validateProvider('invalid')).toBe(false);
    });
  });

  describe('Analysis Result Validation', () => {
    const validateAnalysisResult = (result: any): boolean => {
      return (
        result &&
        typeof result === 'object' &&
        typeof result.analysis === 'object' &&
        typeof result.credibilityScore === 'number' &&
        result.credibilityScore >= 0 &&
        result.credibilityScore <= 1
      );
    };

    it('should validate proper analysis results', () => {
      const validResult = {
        analysis: { text: 'Analysis text', topics: ['topic1'] },
        credibilityScore: 0.85,
        url: 'https://example.com'
      };

      expect(validateAnalysisResult(validResult)).toBe(true);
    });

    it('should reject invalid analysis results', () => {
      const invalidResults = [
        null,
        undefined,
        {},
        { analysis: null },
        { analysis: {}, credibilityScore: -0.1 },
        { analysis: {}, credibilityScore: 1.1 },
        { analysis: {}, credibilityScore: 'invalid' }
      ];

      invalidResults.forEach(result => {
        expect(validateAnalysisResult(result)).toBe(false);
      });
    });
  });
});