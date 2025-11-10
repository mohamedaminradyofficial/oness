import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

// تعريف مستويات السجل المخصصة
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'info';
};

// تعريف الألوان للمستويات
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// تنسيق السجلات للكونسول
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// تنسيق السجلات للملفات
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

// تنسيق السجلات للأخطاء
const errorFileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

// نقل السجلات للملفات
const transports = [
  // سجل الأخطاء في ملف منفصل
  new DailyRotateFile({
    filename: path.join('logs', 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    format: errorFileFormat,
    maxSize: '20m',
    maxFiles: '14d',
  }),

  // سجل جميع العمليات
  new DailyRotateFile({
    filename: path.join('logs', 'combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    format: fileFormat,
    maxSize: '20m',
    maxFiles: '14d',
  }),

  // سجل الطلبات HTTP
  new DailyRotateFile({
    filename: path.join('logs', 'http-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'http',
    format: fileFormat,
    maxSize: '20m',
    maxFiles: '14d',
  }),
];

// إضافة سجل الكونسول في وضع التطوير
if (process.env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
    }),
  );
}

// إنشاء logger
export const logger = winston.createLogger({
  level: level(),
  levels,
  transports,
});

// دالة لتسجيل الطلبات HTTP
export const logRequest = (req: any, res: any, next: any) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, originalUrl } = req;
    const { statusCode } = res;

    logger.http(
      `${method} ${originalUrl} ${statusCode} - ${duration}ms - ${req.ip}`,
    );
  });

  next();
};

// دالة لتسجيل الأخطاء غير المتوقعة
export const logError = (error: Error, req?: any, res?: any) => {
  logger.error('Unexpected error occurred', {
    error: error.message,
    stack: error.stack,
    url: req?.originalUrl,
    method: req?.method,
    ip: req?.ip,
    userAgent: req?.get('User-Agent'),
  });
};

// دالة لتسجيل بدء تشغيل التطبيق
export const logStartup = (port: number, environment: string) => {
  logger.info('🚀 Server starting...', {
    port,
    environment,
    nodeVersion: process.version,
    platform: process.platform,
  });
};

// دالة لتسجيل إيقاف التطبيق
export const logShutdown = (signal: string) => {
  logger.info('🛑 Server shutting down...', { signal });
};

// دالة لتسجيل قاعدة البيانات
export const logDatabase = (status: 'connected' | 'disconnected' | 'error', details?: any) => {
  if (status === 'connected') {
    logger.info('📊 Database connected successfully', details);
  } else if (status === 'disconnected') {
    logger.warn('📊 Database disconnected', details);
  } else {
    logger.error('📊 Database connection error', details);
  }
};

export default logger;
