import React, { useState, useEffect } from 'react';
import {
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import axios from 'axios';

interface AnalysisRecord {
  id: number;
  url: string;
  title: string;
  overallRating?: number;
  createdAt: string;
}

const HistoryPage: React.FC = () => {
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const fetchAnalyses = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/analysis');
      setAnalyses(response.data.analyses);
    } catch (err: any) {
      setError('فشل في تحميل السجل');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://localhost:8000/api/analysis/${id}`);
      setAnalyses(analyses.filter((a: AnalysisRecord) => a.id !== id));
    } catch (err) {
      setError('فشل في حذف التحليل');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (analyses.length === 0) {
    return (
      <Alert severity="info" sx={{ textAlign: 'right' }}>
        لا توجد تحليلات سابقة
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ textAlign: 'right' }}>
        📚 سجل التحليلات السابقة
      </Typography>

      <Alert severity="success" sx={{ mb: 3, textAlign: 'right' }}>
        ✅ تم العثور على {analyses.length} تحليل
      </Alert>

      {analyses.map((analysis: AnalysisRecord) => (
        <Card key={analysis.id} sx={{ mb: 2 }}>
          <CardContent>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <Box sx={{ textAlign: 'right', flex: 1 }}>
                    <Typography variant="h6">
                      🔗 {analysis.title || 'بدون عنوان'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(analysis.createdAt).toLocaleDateString('ar')}
                    </Typography>
                  </Box>
                  {analysis.overallRating && (
                    <Chip
                      label={`${analysis.overallRating}/5`}
                      color="primary"
                      size="small"
                    />
                  )}
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ textAlign: 'right' }}>
                <Typography><strong>🔗 الرابط:</strong> {analysis.url}</Typography>

                <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button variant="outlined" size="small">
                    📄 PDF
                  </Button>
                  <Button variant="outlined" size="small">
                    📝 Word
                  </Button>
                  <Button variant="outlined" size="small">
                    📋 Markdown
                  </Button>
                  <Button variant="outlined" size="small">
                    🔗 مشاركة
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    onClick={() => handleDelete(analysis.id)}
                  >
                    🗑️ حذف
                  </Button>
                </Box>
              </AccordionDetails>
            </Accordion>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default HistoryPage;
