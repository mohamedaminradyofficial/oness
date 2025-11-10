import { Request, Response, NextFunction } from 'express';
import { logger, logError } from '../utils/logger';

// واجهة خطأ مخصص
export interface CustomError extends Error {
  statusCode?: number;
  isOperational?: boolean;
  code?: string;
}

// فئة خطأ مخصص للتطبيق
export class AppError extends Error implements CustomError {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// معالج الأخطاء الرئيسي
export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = { ...err };
  error.message = err.message;

  // تسجيل الخطأ
  logError(error, req, res);

  // خطأ Mongoose: خطأ في التحقق من صحة البيانات
  if (err.name === 'ValidationError') {
    const messages = Object.values((err as any).errors).map((val: any) => val.message);
    error = new AppError(`خطأ في التحقق من صحة البيانات: ${messages.join('. ')}`, 400, 'VALIDATION_ERROR');
  }

  // خطأ Mongoose: خطأ في التحويل (ObjectId غير صحيح)
  if (err.name === 'CastError') {
    error = new AppError('معرف غير صحيح', 400, 'CAST_ERROR');
  }

  // خطأ Mongoose: مفتاح مكرر
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue)[0];
    error = new AppError(`القيمة مكررة للحقل: ${field}`, 400, 'DUPLICATE_ERROR');
  }

  // خطأ JWT
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('رمز الوصول غير صحيح', 401, 'JWT_ERROR');
  }

  // خطأ JWT منتهي الصلاحية
  if (err.name === 'TokenExpiredError') {
    error = new AppError('انتهت صلاحية رمز الوصول', 401, 'TOKEN_EXPIRED');
  }

  // إرسال رد الخطأ
  const statusCode = error.statusCode || 500;
  const message = error.message || 'خطأ داخلي في الخادم';

  // في وضع التطوير، أظهر تفاصيل الخطأ
  if (process.env.NODE_ENV === 'development') {
    res.status(statusCode).json({
      success: false,
      error: {
        message,
        code: error.code,
        stack: error.stack,
        ...(error.code && { code: error.code }),
      },
    });
  } else {
    // في وضع الإنتاج، لا تظهر تفاصيل الخطأ
    res.status(statusCode).json({
      success: false,
      error: {
        message: statusCode === 500 ? 'خطأ داخلي في الخادم' : message,
        ...(error.code && { code: error.code }),
      },
    });
  }
};

// معالج للطلبات غير الموجودة (404)
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new AppError(`المسار غير موجود: ${req.originalUrl}`, 404, 'NOT_FOUND');
  next(error);
};

// معالج للأخطاء غير المتزامنة
export const asyncErrorHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// دالة لإنشاء خطأ مخصص
export const createError = (message: string, statusCode: number = 500, code?: string): AppError => {
  return new AppError(message, statusCode, code);
};
