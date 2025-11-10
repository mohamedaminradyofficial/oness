import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import analysisRoutes from './routes/analysis';
import sharingRoutes from './routes/sharing';
import exportRoutes from './routes/export';
import videoRoutes from './routes/video';
import imageRoutes from './routes/image';
import cacheRoutes from './routes/cache';
import authRoutes from './routes/auth';
import { logger, logRequest, logStartup, logShutdown, logDatabase } from './utils/logger';
import { initDb } from './utils/database';
import { generalLimiter, analysisLimiter, compressionMiddleware } from './middleware/security';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
    },
  },
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(compressionMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api/', generalLimiter);
app.use('/api/analysis/analyze', analysisLimiter);

// إضافة logging middleware
app.use(logRequest);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/sharing', sharingRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/video', videoRoutes);
app.use('/api/image', imageRoutes);
app.use('/api/cache', cacheRoutes);

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

// إنشاء مجلد logs إذا لم يكن موجوداً
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const logsDir = join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// إعداد قاعدة البيانات
initDb().then((success) => {
  if (success) {
    logDatabase('connected', { database: 'MongoDB' });
  } else {
    logDatabase('error', { message: 'Failed to connect to database' });
  }
}).catch((error) => {
  logDatabase('error', { error: error.message });
});

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  logStartup(PORT, process.env.NODE_ENV || 'development');
});

// إيقاف التطبيق بشكل صحيح
process.on('SIGTERM', () => {
  logShutdown('SIGTERM');
  process.exit(0);
});

process.on('SIGINT', () => {
  logShutdown('SIGINT');
  process.exit(0);
});

// معالجة الأخطاء غير المتوقعة
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
  process.exit(1);
});

export default app;
