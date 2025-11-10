import mongoose from 'mongoose';

describe('Analysis Model', () => {
  const mockAnalysisData = {
    url: 'https://example.com',
    title: 'Test Article',
    content: 'Test content for analysis',
    analysis: {
      sentiment: 'neutral',
      topics: ['technology', 'testing'],
      summary: 'This is a test article'
    },
    credibilityScore: 0.85,
    provider: 'gemini',
    createdAt: new Date()
  };

  describe('Schema Validation', () => {
    it('should validate required fields', () => {
      const Analysis = mongoose.model('Analysis', new mongoose.Schema({
        url: { type: String, required: true },
        title: { type: String, required: true },
        content: { type: String, required: true },
        analysis: { type: Object, required: true },
        credibilityScore: { type: Number, required: true, min: 0, max: 1 },
        provider: { type: String, required: true, enum: ['gemini', 'groq'] }
      }));

      const analysis = new Analysis(mockAnalysisData);
      const validationError = analysis.validateSync();

      expect(validationError).toBeUndefined();
    });

    it('should reject invalid URL format', () => {
      const Analysis = mongoose.model('TestAnalysis1', new mongoose.Schema({
        url: { 
          type: String, 
          required: true,
          validate: {
            validator: (v: string) => /^https?:\/\/.+/.test(v),
            message: 'Invalid URL format'
          }
        }
      }));

      const analysis = new Analysis({ url: 'invalid-url' });
      const validationError = analysis.validateSync();

      expect(validationError).toBeDefined();
      expect(validationError?.errors.url).toBeDefined();
    });

    it('should reject credibility score out of range', () => {
      const Analysis = mongoose.model('TestAnalysis2', new mongoose.Schema({
        credibilityScore: { type: Number, required: true, min: 0, max: 1 }
      }));

      const analysis1 = new Analysis({ credibilityScore: -0.1 });
      const analysis2 = new Analysis({ credibilityScore: 1.1 });

      expect(analysis1.validateSync()?.errors.credibilityScore).toBeDefined();
      expect(analysis2.validateSync()?.errors.credibilityScore).toBeDefined();
    });

    it('should reject invalid provider', () => {
      const Analysis = mongoose.model('TestAnalysis3', new mongoose.Schema({
        provider: { type: String, required: true, enum: ['gemini', 'groq'] }
      }));

      const analysis = new Analysis({ provider: 'invalid-provider' });
      const validationError = analysis.validateSync();

      expect(validationError?.errors.provider).toBeDefined();
    });
  });

  describe('Model Methods', () => {
    it('should create analysis with default timestamps', () => {
      const Analysis = mongoose.model('TestAnalysis4', new mongoose.Schema({
        url: String,
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now }
      }));

      const analysis = new Analysis({ url: 'https://example.com' });

      expect(analysis.createdAt).toBeDefined();
      expect(analysis.updatedAt).toBeDefined();
    });

    it('should generate proper JSON representation', () => {
      const Analysis = mongoose.model('TestAnalysis5', new mongoose.Schema({
        url: String,
        title: String,
        analysis: Object
      }));

      const analysis = new Analysis(mockAnalysisData);
      const json = analysis.toJSON();

      expect(json.url).toBe(mockAnalysisData.url);
      expect(json.title).toBe(mockAnalysisData.title);
      expect(json.analysis).toEqual(mockAnalysisData.analysis);
    });
  });

  describe('Indexing', () => {
    it('should support text search index', () => {
      const schema = new mongoose.Schema({
        title: String,
        content: String
      });
      
      schema.index({ title: 'text', content: 'text' });
      
      const Analysis = mongoose.model('TestAnalysis6', schema);
      const indexes = Analysis.schema.indexes();

      expect(indexes.some(index => index[0].title === 'text')).toBe(true);
    });

    it('should support URL uniqueness', () => {
      const schema = new mongoose.Schema({
        url: { type: String, unique: true }
      });

      const Analysis = mongoose.model('TestAnalysis7', schema);
      const indexes = Analysis.schema.indexes();

      expect(indexes.some(index => index[0].url === 1)).toBe(true);
    });
  });
});