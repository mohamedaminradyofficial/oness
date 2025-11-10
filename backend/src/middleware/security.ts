import rateLimit from 'express-rate-limit';
import compression from 'compression';

// Rate limiting لجميع الطلبات
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقائق
  max: 100, // حد أقصى 100 طلب لكل IP
  message: {
    error: 'تم تجاوز الحد المسموح من الطلبات. يرجى المحاولة لاحقاً.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting للتحليلات (أكثر تقييداً)
export const analysisLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // ساعة واحدة
  max: 50, // حد أقصى 50 تحليل لكل IP
  message: {
    error: 'تم تجاوز الحد المسموح من عمليات التحليل. يرجى المحاولة لاحقاً.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting للطلبات الحساسة
export const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // ساعة واحدة
  max: 10, // حد أقصى 10 طلبات لكل IP
  message: {
    error: 'تم تجاوز الحد المسموح من الطلبات الحساسة.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// إعداد الضغط
export const compressionMiddleware = compression({
  level: 6, // مستوى الضغط (1-9)
  threshold: 1024, // لا تضغط الملفات الأصغر من 1KB
  filter: (req, res) => {
    // لا تضغط إذا كان الطلب يحتوي على header no-transform
    if (req.headers['cache-control']?.includes('no-transform')) {
      return false;
    }
    return compression.filter(req, res);
  },
});
