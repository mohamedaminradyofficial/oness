import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User';
import { generateToken, authenticateToken } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = express.Router();

// Validation rules
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('البريد الإلكتروني غير صحيح'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('كلمة المرور يجب أن تحتوي على حرف كبير وصغير ورقم'),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('الاسم الأول يجب أن يكون بين 2-50 حرف'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('اسم العائلة يجب أن يكون بين 2-50 حرف')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('البريد الإلكتروني غير صحيح'),
  body('password')
    .notEmpty()
    .withMessage('كلمة المرور مطلوبة')
];

// POST /api/auth/register - تسجيل مستخدم جديد
router.post('/register', registerValidation, async (req, res) => {
  try {
    // التحقق من صحة البيانات
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'بيانات غير صحيحة',
          code: 'VALIDATION_ERROR',
          details: errors.array()
        }
      });
    }

    const { email, password, firstName, lastName } = req.body;

    // التحقق من وجود المستخدم
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: {
          message: 'البريد الإلكتروني مستخدم بالفعل',
          code: 'EMAIL_EXISTS'
        }
      });
    }

    // إنشاء المستخدم الجديد
    const user = new User({
      email,
      password,
      firstName,
      lastName
    });

    await user.save();

    // إنشاء token
    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role
    });

    logger.info('New user registered', {
      userId: user._id,
      email: user.email,
      ip: req.ip
    });

    res.status(201).json({
      success: true,
      message: 'تم التسجيل بنجاح',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.getFullName(),
          role: user.role
        },
        token
      }
    });

  } catch (error: any) {
    logger.error('Registration error', { error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      error: {
        message: 'حدث خطأ في التسجيل',
        code: 'REGISTRATION_ERROR'
      }
    });
  }
});

// POST /api/auth/login - تسجيل الدخول
router.post('/login', loginValidation, async (req, res) => {
  try {
    // التحقق من صحة البيانات
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'بيانات غير صحيحة',
          code: 'VALIDATION_ERROR',
          details: errors.array()
        }
      });
    }

    const { email, password } = req.body;

    // البحث عن المستخدم (مع تضمين كلمة المرور)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
          code: 'INVALID_CREDENTIALS'
        }
      });
    }

    // التحقق من كلمة المرور
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
          code: 'INVALID_CREDENTIALS'
        }
      });
    }

    // التحقق من حالة المستخدم
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'الحساب معطل',
          code: 'ACCOUNT_DISABLED'
        }
      });
    }

    // تحديث وقت آخر دخول
    user.lastLogin = new Date();
    await user.save();

    // إنشاء token
    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role
    });

    logger.info('User logged in', {
      userId: user._id,
      email: user.email,
      ip: req.ip
    });

    res.json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.getFullName(),
          role: user.role,
          lastLogin: user.lastLogin
        },
        token
      }
    });

  } catch (error: any) {
    logger.error('Login error', { error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      error: {
        message: 'حدث خطأ في تسجيل الدخول',
        code: 'LOGIN_ERROR'
      }
    });
  }
});

// GET /api/auth/me - الحصول على بيانات المستخدم الحالي
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'المستخدم غير موجود',
          code: 'USER_NOT_FOUND'
        }
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.getFullName(),
          role: user.role,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt
        }
      }
    });

  } catch (error: any) {
    logger.error('Get current user error', { error: error.message, userId: req.user!.id });
    res.status(500).json({
      success: false,
      error: {
        message: 'حدث خطأ في الحصول على بيانات المستخدم',
        code: 'GET_USER_ERROR'
      }
    });
  }
});

// POST /api/auth/logout - تسجيل الخروج
router.post('/logout', authenticateToken, (req, res) => {
  // JWT لا يحتاج لشيء خاص في الخادم
  // العميل مسؤول عن حذف الـ token
  res.json({
    success: true,
    message: 'تم تسجيل الخروج بنجاح'
  });
});

export default router;
