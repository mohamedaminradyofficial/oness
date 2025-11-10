import { evaluateSourceCredibility } from '../../../src/utils/sourceEvaluator';

describe('Source Evaluator', () => {
  describe('evaluateSourceCredibility', () => {
    it('should evaluate credible sources highly', async () => {
      const credibleSource = {
        url: 'https://bbc.com/news/article',
        domain: 'bbc.com',
        title: 'Breaking News Article',
        author: 'BBC News Team',
        publishDate: new Date().toISOString()
      };

      const result = await evaluateSourceCredibility(credibleSource);
      
      expect(result.score).toBeGreaterThan(0.7);
      expect(result.factors).toContain('trusted_domain');
    });

    it('should evaluate suspicious sources lowly', async () => {
      const suspiciousSource = {
        url: 'https://fake-news-site.com/article',
        domain: 'fake-news-site.com',
        title: 'SHOCKING TRUTH REVEALED!!!',
        author: 'Anonymous',
        publishDate: ''
      };

      const result = await evaluateSourceCredibility(suspiciousSource);
      
      expect(result.score).toBeLessThan(0.5);
      expect(result.factors).toContain('suspicious_title');
    });

    it('should handle missing information', async () => {
      const incompleteSource = {
        url: 'https://example.com',
        domain: 'example.com',
        title: '',
        author: '',
        publishDate: ''
      };

      const result = await evaluateSourceCredibility(incompleteSource);
      
      expect(result.score).toBeLessThan(0.6);
      expect(result.factors).toContain('missing_metadata');
    });

    it('should detect academic sources', async () => {
      const academicSource = {
        url: 'https://university.edu/research/paper',
        domain: 'university.edu',
        title: 'Research Paper on AI',
        author: 'Dr. John Smith',
        publishDate: new Date().toISOString()
      };

      const result = await evaluateSourceCredibility(academicSource);
      
      expect(result.score).toBeGreaterThan(0.8);
      expect(result.factors).toContain('academic_domain');
    });

    it('should handle government sources', async () => {
      const govSource = {
        url: 'https://government.gov/announcement',
        domain: 'government.gov',
        title: 'Official Government Statement',
        author: 'Government Press Office',
        publishDate: new Date().toISOString()
      };

      const result = await evaluateSourceCredibility(govSource);
      
      expect(result.score).toBeGreaterThan(0.8);
      expect(result.factors).toContain('government_domain');
    });
  });
});