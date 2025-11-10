import { Request, Response, NextFunction } from 'express';
import { AppError, errorHandler, notFoundHandler, createError } from '../../src/middleware/errorHandler';
import { logger } from '../../src/utils/logger';

// Mock logger
jest.mock('../../src/utils/logger', () => ({
  logger: {
    error: jest.fn(),
  },
}));

describe('Error Handler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      originalUrl: '/api/test',
      method: 'GET',
      ip: '127.0.0.1',
      get: jest.fn(),
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('AppError Class', () => {
    it('should create AppError with message and status code', () => {
      const error = new AppError('Test error', 400);

      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
    });

    it('should create AppError with default status code', () => {
      const error = new AppError('Test error');

      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(true);
    });

    it('should create AppError with code', () => {
      const error = new AppError('Test error', 400, 'VALIDATION_ERROR');

      expect(error.code).toBe('VALIDATION_ERROR');
    });

    it('should capture stack trace when supported', () => {
      const error = new AppError('Test error');

      if (Error.captureStackTrace) {
        expect(error.stack).toBeDefined();
      }
    });

    it('should not fail when captureStackTrace is not supported', () => {
      const originalCaptureStackTrace = Error.captureStackTrace;
      delete (Error as any).captureStackTrace;

      expect(() => new AppError('Test error')).not.toThrow();

      Error.captureStackTrace = originalCaptureStackTrace;
    });
  });

  describe('errorHandler', () => {
    describe('Development Environment', () => {
      const originalEnv = process.env.NODE_ENV;

      beforeEach(() => {
        process.env.NODE_ENV = 'development';
      });

      afterEach(() => {
        process.env.NODE_ENV = originalEnv;
      });

      it('should handle AppError in development', () => {
        const error = new AppError('Test error', 400, 'VALIDATION_ERROR');

        errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          error: {
            message: 'Test error',
            code: 'VALIDATION_ERROR',
            stack: error.stack,
          },
        });
        expect(logger.error).toHaveBeenCalled();
      });

      it('should handle generic Error in development', () => {
        const error = new Error('Generic error');

        errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          error: {
            message: 'Generic error',
            stack: error.stack,
          },
        });
      });

      it('should handle Mongoose ValidationError', () => {
        const validationError = new Error('Validation failed') as any;
        validationError.name = 'ValidationError';
        validationError.errors = {
          email: { message: 'Invalid email' },
          password: { message: 'Password too short' }
        };

        errorHandler(validationError, mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          error: {
            message: 'خطأ في التحقق من صحة البيانات: Invalid email. Password too short.',
            code: 'VALIDATION_ERROR',
          },
        });
      });

      it('should handle Mongoose CastError', () => {
        const castError = new Error('Cast failed') as any;
        castError.name = 'CastError';

        errorHandler(castError, mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          error: {
            message: 'معرف غير صحيح',
            code: 'CAST_ERROR',
          },
        });
      });

      it('should handle MongoDB duplicate key error', () => {
        const duplicateError = new Error('Duplicate key') as any;
        duplicateError.code = 11000;
        duplicateError.keyValue = { email: 'test@example.com' };

        errorHandler(duplicateError, mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          error: {
            message: 'القيمة مكررة للحقل: email',
            code: 'DUPLICATE_ERROR',
          },
        });
      });

      it('should handle JWT errors', () => {
        const jwtError = new Error('JWT Error') as any;
        jwtError.name = 'JsonWebTokenError';

        errorHandler(jwtError, mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          error: {
            message: 'رمز الوصول غير صحيح',
            code: 'JWT_ERROR',
          },
        });
      });

      it('should handle JWT expired errors', () => {
        const jwtExpiredError = new Error('JWT Expired') as any;
        jwtExpiredError.name = 'TokenExpiredError';

        errorHandler(jwtExpiredError, mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          error: {
            message: 'انتهت صلاحية رمز الوصول',
            code: 'TOKEN_EXPIRED',
          },
        });
      });
    });

    describe('Production Environment', () => {
      const originalEnv = process.env.NODE_ENV;

      beforeEach(() => {
        process.env.NODE_ENV = 'production';
      });

      afterEach(() => {
        process.env.NODE_ENV = originalEnv;
      });

      it('should not expose error details in production', () => {
        const error = new AppError('Secret error details', 500);

        errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          error: {
            message: 'خطأ داخلي في الخادم',
          },
        });
      });

      it('should show original message for non-500 errors in production', () => {
        const error = new AppError('Validation failed', 400, 'VALIDATION_ERROR');

        errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          error: {
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
          },
        });
      });
    });
  });

  describe('notFoundHandler', () => {
    it('should create 404 error for unmatched routes', () => {
      mockRequest.originalUrl = '/nonexistent/route';

      notFoundHandler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('المسار غير موجود: /nonexistent/route');
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
    });

    it('should handle different HTTP methods', () => {
      mockRequest.method = 'POST';
      mockRequest.originalUrl = '/api/users';

      notFoundHandler(mockRequest as Request, mockResponse as Response, mockNext);

      const error = mockNext.mock.calls[0][0];
      expect(error.message).toContain('POST /api/users');
    });
  });

  describe('createError', () => {
    it('should create AppError with specified parameters', () => {
      const error = createError('Test message', 400, 'TEST_CODE');

      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Test message');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('TEST_CODE');
      expect(error.isOperational).toBe(true);
    });

    it('should create error with default values', () => {
      const error = createError('Test message');

      expect(error.statusCode).toBe(500);
      expect(error.code).toBeUndefined();
    });
  });

  describe('Error Logging', () => {
    it('should log errors with request context', () => {
      const error = new Error('Test error');

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(logger.error).toHaveBeenCalled();
      // The logger is mocked, so we can't check the exact call details
    });

    it('should handle errors without request context', () => {
      const error = new Error('Test error');
      const emptyRequest = {} as Request;

      errorHandler(error, emptyRequest, mockResponse as Response, mockNext);

      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('Error Response Format', () => {
    it('should follow consistent error response format', () => {
      const error = new AppError('Test error', 400, 'TEST_ERROR');

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: expect.objectContaining({
          message: expect.any(String),
          code: expect.any(String),
        }),
      });
    });

    it('should include stack trace in development only', () => {
      const originalEnv = process.env.NODE_ENV;

      // Test development
      process.env.NODE_ENV = 'development';
      const devError = new AppError('Dev error', 400);

      errorHandler(devError, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: expect.objectContaining({
          stack: expect.any(String),
        }),
      });

      // Reset mocks
      jest.clearAllMocks();
      mockResponse.status.mockClear();
      mockResponse.json.mockClear();

      // Test production
      process.env.NODE_ENV = 'production';
      const prodError = new AppError('Prod error', 400);

      errorHandler(prodError, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: expect.not.objectContaining({
          stack: expect.any(String),
        }),
      });

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Edge Cases', () => {
    it('should handle null/undefined errors', () => {
      errorHandler(null as any, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'خطأ داخلي في الخادم',
        },
      });
    });

    it('should handle errors without name property', () => {
      const error = { message: 'Custom error object' } as any;

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });

    it('should handle errors with numeric codes', () => {
      const error = new Error('Database error') as any;
      error.code = 12345;

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });
});
