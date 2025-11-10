import React, { useState } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import axios from 'axios';

interface AnalysisResult {
  success: boolean;
  analysis_id: number;
  url: string;
  title: string;
  analysis: string;
  code_analysis?: string;
  evaluation: {
    overall_rating: number;
    credibility_score: number;
    quality_score: number;
    recency_score: number;
    sources_score: number;
    objectivity_score: number;
    summary: string;
    strengths: string[];
    weaknesses: string[];
    recommendation: string;
  };
  related_resources: Array<{
    title: string;
    url: string;
    type: string;
    description: string;
    relevance: string;
  }>;
  has_code: boolean;
  timestamp: string;
}

const AnalysisPage: React.FC = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!url.trim()) {
      setError('الرجاء إدخال رابط أولاً');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await axios.post('http://localhost:8000/api/analysis/analyze', {
        url: url.trim(),
        aiProvider: 'gemini'
      });

      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'حدث خطأ في التحليل');
    } finally {
      setLoading(false);
    }
  };

  const renderEvaluation = () => {
    if (!result?.evaluation) return null;

    const eval = result.evaluation;

    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ textAlign: 'right' }}>
            🎯 تقييم المصدر
          </Typography>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {eval.overall_rating}/5
                </Typography>
                <Typography variant="body2">⭐ التقييم العام</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  {eval.credibility_score}/5
                </Typography>
                <Typography variant="body2">📊 الموثوقية</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="info.main">
                  {eval.quality_score}/5
                </Typography>
                <Typography variant="body2">✅ الجودة</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main">
                  {eval.recency_score}/5
                </Typography>
                <Typography variant="body2">🕐 الحداثة</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="secondary.main">
                  {eval.sources_score}/5
                </Typography>
                <Typography variant="body2">📚 المصادر</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="error.main">
                  {eval.objectivity_score}/5
                </Typography>
                <Typography variant="body2">⚖️ الموضوعية</Typography>
              </Box>
            </Grid>
          </Grid>

          <Typography variant="body1" sx={{ mb: 2, textAlign: 'right' }}>
            <strong>📝 الملخص:</strong> {eval.summary}
          </Typography>

          {eval.strengths.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ textAlign: 'right' }}>
                💪 نقاط القوة:
              </Typography>
              {eval.strengths.map((strength: string, index: number) => (
                <Typography key={index} variant="body2" sx={{ textAlign: 'right' }}>
                  - {strength}
                </Typography>
              ))}
            </Box>
          )}

          {eval.weaknesses.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ textAlign: 'right' }}>
                ⚠️ نقاط الضعف:
              </Typography>
              {eval.weaknesses.map((weakness: string, index: number) => (
                <Typography key={index} variant="body2" sx={{ textAlign: 'right' }}>
                  - {weakness}
                </Typography>
              ))}
            </Box>
          )}

          <Alert severity="info" sx={{ textAlign: 'right' }}>
            <strong>💡 التوصية:</strong> {eval.recommendation}
          </Alert>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ textAlign: 'right' }}>
        🔗 أدخل الرابط المراد تحليله:
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="https://example.com/article"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          helperText="أدخل رابط المقال أو الصفحة التي تريد تحليلها"
          sx={{
            '& .MuiInputBase-input': {
              textAlign: 'left',
              direction: 'ltr'
            }
          }}
        />
        <Button
          variant="contained"
          size="large"
          onClick={handleAnalyze}
          disabled={loading}
          sx={{ minWidth: 200, fontSize: '18px', fontWeight: 'bold' }}
        >
          {loading ? <CircularProgress size={24} /> : '🚀 ابدأ التحليل'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, textAlign: 'right' }}>
          {error}
        </Alert>
      )}

      {result && (
        <Box>
          <Alert severity="success" sx={{ mb: 3, textAlign: 'right' }}>
            ✅ تم استخراج المحتوى بنجاح!
          </Alert>

          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" sx={{ textAlign: 'right' }}>
                📊 معلومات الصفحة
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ textAlign: 'right' }}>
              <Typography><strong>📌 العنوان:</strong> {result.title}</Typography>
              <Typography><strong>🔗 الرابط:</strong> {result.url}</Typography>
              {result.has_code && (
                <Typography><strong>💻 يحتوي على كود:</strong> نعم</Typography>
              )}
            </AccordionDetails>
          </Accordion>

          <Card sx={{ mb: 3, mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ textAlign: 'right' }}>
                📖 الشرح التفصيلي:
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', textAlign: 'right' }}>
                {result.analysis}
              </Typography>
            </CardContent>
          </Card>

          {renderEvaluation()}

          {result.related_resources.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ textAlign: 'right' }}>
                  📚 مراجع إضافية:
                </Typography>
                {result.related_resources.slice(0, 5).map((resource: RelatedResource, index: number) => (
                  <Accordion key={index}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography sx={{ textAlign: 'right' }}>
                        📖 {index + 1}. {resource.title}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ textAlign: 'right' }}>
                      <Typography><strong>🔗 الرابط:</strong> {resource.url}</Typography>
                      <Typography><strong>📂 النوع:</strong> {resource.type}</Typography>
                      <Typography><strong>📝 الوصف:</strong> {resource.description}</Typography>
                      <Typography><strong>💡 الأهمية:</strong> {resource.relevance}</Typography>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </CardContent>
            </Card>
          )}

          {result.code_analysis && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ textAlign: 'right' }}>
                  💻 تحليل الأكواد:
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', textAlign: 'right' }}>
                  {result.code_analysis}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>
      )}
    </Box>
  );
};

export default AnalysisPage;
