import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import analysisRoutes from './routes/analysis';
import sharingRoutes from './routes/sharing';
import exportRoutes from './routes/export';
import videoRoutes from './routes/video';
import imageRoutes from './routes/image';
import cacheRoutes from './routes/cache';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'الوكيل الذكي لتحليل المحتوى - API v2.0',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  const geminiAvailable = !!process.env.GEMINI_API_KEY;
  const groqAvailable = !!process.env.GROQ_API_KEY;

  res.json({
    status: 'healthy',
    services: {
      gemini_api: geminiAvailable ? 'available' : 'unavailable',
      groq_api: groqAvailable ? 'available' : 'unavailable',
      database: 'available', // TODO: implement proper database check
      cache: 'active' // TODO: implement cache stats
    }
  });
});

// Routes
app.use('/api/analysis', analysisRoutes);
app.use('/api/sharing', sharingRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/video', videoRoutes);
app.use('/api/image', imageRoutes);
app.use('/api/cache', cacheRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export default app;
