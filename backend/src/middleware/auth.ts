import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

// توسيع interface Request لإضافة user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

// توليد JWT token
export const generateToken = (payload: { id: string; email: string; role: string }): string => {
  const secret = process.env.JWT_SECRET || 'default-secret-key';
  return jwt.sign(payload, secret, { expiresIn: '7d' });
};

// التحقق من JWT token
export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    logger.warn('Access attempt without token', {
      ip: req.ip,
      path: req.path,
      method: req.method
    });
    res.status(401).json({
      success: false,
      error: {
        message: 'رمز الوصول مطلوب',
        code: 'TOKEN_REQUIRED'
      }
    });
    return;
  }

  const secret = process.env.JWT_SECRET || 'default-secret-key';

  jwt.verify(token, secret, (err: any, decoded: any) => {
    if (err) {
      logger.warn('Invalid token attempt', {
        ip: req.ip,
        path: req.path,
        error: err.message
      });

      let message = 'رمز الوصول غير صحيح';
      let code = 'INVALID_TOKEN';

      if (err.name === 'TokenExpiredError') {
        message = 'انتهت صلاحية رمز الوصول';
        code = 'TOKEN_EXPIRED';
      }

      res.status(401).json({
        success: false,
        error: { message, code }
      });
      return;
    }

    // إضافة بيانات المستخدم إلى الطلب
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };

    next();
  });
};

// التحقق من الدور (Role-based access)
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { message: 'مصادقة مطلوبة', code: 'AUTH_REQUIRED' }
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      logger.warn('Access denied - insufficient permissions', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: roles,
        path: req.path
      });

      res.status(403).json({
        success: false,
        error: {
          message: 'صلاحيات غير كافية',
          code: 'INSUFFICIENT_PERMISSIONS'
        }
      });
      return;
    }

    next();
  };
};

// التحقق من الملكية (مثل: المستخدم يمكنه تعديل تحليلاته فقط)
export const requireOwnership = (resourceOwnerId: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { message: 'مصادقة مطلوبة', code: 'AUTH_REQUIRED' }
      });
      return;
    }

    if (req.user.id !== resourceOwnerId && req.user.role !== 'admin') {
      logger.warn('Access denied - ownership violation', {
        userId: req.user.id,
        resourceOwnerId,
        path: req.path
      });

      res.status(403).json({
        success: false,
        error: {
          message: 'لا تمتلك صلاحية الوصول لهذا المورد',
          code: 'OWNERSHIP_VIOLATION'
        }
      });
      return;
    }

    next();
  };
};

// تسجيل الخروج (في JWT لا نحتاج لشيء خاص، لكن يمكن إضافة للـ blacklist)
export const logout = (req: Request, res: Response): void => {
  // في التطبيقات البسيطة، يمكن للعميل فقط حذف الـ token
  // في التطبيقات المتقدمة، يمكن إضافة الـ token للـ blacklist

  logger.info('User logged out', {
    userId: req.user?.id,
    ip: req.ip
  });

  res.json({
    success: true,
    message: 'تم تسجيل الخروج بنجاح'
  });
};
