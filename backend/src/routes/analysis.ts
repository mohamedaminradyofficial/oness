import express from 'express';
import { extractContentFromUrl, isValidUrl } from '../utils/webScraper';
import { analyzeContentWithGemini } from '../utils/geminiHelper';
import { analyzeContentWithGroq } from '../utils/groqHelper';
import { evaluateSourceCredibility } from '../utils/sourceEvaluator';
import { findRelatedResources } from '../utils/sourceEvaluator';
import { detectAndAnalyzeCode } from '../utils/geminiHelper';
import { detectAndAnalyzeCodeGroq } from '../utils/groqHelper';
import { saveAnalysis, getAnalysisById, getRecentAnalyses, deleteAnalysis } from '../utils/database';

const router = express.Router();

// POST /api/analysis/analyze
router.post('/analyze', async (req, res) => {
  try {
    const { url, aiProvider = 'gemini', analyzeImages = false, analyzeVideo = false } = req.body;

    if (!url || !isValidUrl(url)) {
      return res.status(400).json({ error: 'رابط غير صالح' });
    }

    // Extract content
    const contentData = await extractContentFromUrl(url);

    const useGemini = aiProvider.toLowerCase() === 'gemini';

    // Analyze content
    const analysisText = useGemini
      ? await analyzeContentWithGemini(contentData.mainContent, url)
      : await analyzeContentWithGroq(contentData.mainContent, url);

    // Evaluate source
    const evaluationData = await evaluateSourceCredibility(url, contentData.mainContent, useGemini);

    // Find related resources
    const resourcesData = await findRelatedResources(contentData.mainContent.slice(0, 1000), url, useGemini);

    // Analyze code if present
    let codeAnalysisText = null;
    if (contentData.hasCode) {
      const codeContent = contentData.codeBlocks.join('\n\n');
      codeAnalysisText = useGemini
        ? await detectAndAnalyzeCode(codeContent)
        : await detectAndAnalyzeCodeGroq(codeContent);
    }

    // TODO: Handle image and video analysis

    // Save to database
    const analysisId = await saveAnalysis({
      url,
      title: contentData.title,
      contentPreview: contentData.mainContent,
      analysisResult: analysisText,
      codeAnalysis: codeAnalysisText,
      overallRating: evaluationData.overallRating,
      credibilityScore: evaluationData.credibilityScore,
      qualityScore: evaluationData.qualityScore,
      evaluationSummary: evaluationData.summary,
      relatedResources: JSON.stringify(resourcesData),
      aiProvider
    });

    res.json({
      success: true,
      analysisId,
      url,
      title: contentData.title,
      analysis: analysisText,
      codeAnalysis: codeAnalysisText,
      evaluation: evaluationData,
      relatedResources: resourcesData,
      hasCode: contentData.hasCode,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: `فشل التحليل: ${error.message}` });
  }
});

// GET /api/analysis/:id
router.get('/:id', async (req, res) => {
  try {
    const analysisId = parseInt(req.params.id);
    const analysis = await getAnalysisById(analysisId);

    if (!analysis) {
      return res.status(404).json({ error: 'التحليل غير موجود' });
    }

    res.json({
      id: analysis.id,
      url: analysis.url,
      title: analysis.title,
      analysis: analysis.analysisResult,
      codeAnalysis: analysis.codeAnalysis,
      overallRating: analysis.overallRating,
      credibilityScore: analysis.credibilityScore,
      qualityScore: analysis.qualityScore,
      evaluationSummary: analysis.evaluationSummary,
      aiProvider: analysis.aiProvider,
      createdAt: analysis.createdAt.toISOString()
    });

  } catch (error) {
    console.error('Get analysis error:', error);
    res.status(500).json({ error: 'فشل في الحصول على التحليل' });
  }
});

// GET /api/analysis
router.get('/', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const analyses = await getRecentAnalyses(limit);

    res.json({
      total: analyses.length,
      analyses: analyses.map(a => ({
        id: a.id,
        url: a.url,
        title: a.title,
        overallRating: a.overallRating,
        createdAt: a.createdAt.toISOString()
      }))
    });

  } catch (error) {
    console.error('List analyses error:', error);
    res.status(500).json({ error: 'فشل في الحصول على قائمة التحليلات' });
  }
});

// DELETE /api/analysis/:id
router.delete('/:id', async (req, res) => {
  try {
    const analysisId = parseInt(req.params.id);
    const success = await deleteAnalysis(analysisId);

    if (!success) {
      return res.status(404).json({ error: 'التحليل غير موجود' });
    }

    res.json({ success: true, message: 'تم حذف التحليل' });

  } catch (error) {
    console.error('Delete analysis error:', error);
    res.status(500).json({ error: 'فشل في حذف التحليل' });
  }
});

export default router;
