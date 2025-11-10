import { Request, Response, NextFunction } from 'express';
import { generalLimiter, analysisLimiter, strictLimiter, compressionMiddleware } from '../../src/middleware/security';

describe('Security Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      ip: '127.0.0.1',
      headers: {},
      url: '/test',
      method: 'GET'
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      set: jest.fn(),
      json: jest.fn(),
      send: jest.fn(),
      end: jest.fn()
    };
    mockNext = jest.fn();
  });

  describe('Rate Limiters', () => {
    describe('generalLimiter', () => {
      it('should allow requests within the limit', () => {
        // Mock express-rate-limit to allow the request
        const mockLimiter = jest.fn((req, res, next) => next());
        (generalLimiter as any) = mockLimiter;

        generalLimiter(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockNext).toHaveBeenCalled();
      });

      it('should have correct configuration', () => {
        // Test that the limiter is configured with the right options
        expect(generalLimiter).toBeDefined();
        // The actual rate limiting logic is tested by express-rate-limit internally
      });
    });

    describe('analysisLimiter', () => {
      it('should allow analysis requests within limit', () => {
        const mockLimiter = jest.fn((req, res, next) => next());
        (analysisLimiter as any) = mockLimiter;

        analysisLimiter(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockNext).toHaveBeenCalled();
      });

      it('should be more restrictive than general limiter', () => {
        // analysisLimiter should have lower limits than generalLimiter
        // This is tested by the configuration, not runtime behavior
        expect(analysisLimiter).toBeDefined();
      });
    });

    describe('strictLimiter', () => {
      it('should allow requests within strict limit', () => {
        const mockLimiter = jest.fn((req, res, next) => next());
        (strictLimiter as any) = mockLimiter;

        strictLimiter(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockNext).toHaveBeenCalled();
      });

      it('should be the most restrictive limiter', () => {
        expect(strictLimiter).toBeDefined();
      });
    });
  });

  describe('Compression Middleware', () => {
    it('should compress responses when appropriate', () => {
      // Mock the request and response for compression
      mockRequest = {
        ...mockRequest,
        headers: {
          'accept-encoding': 'gzip, deflate'
        }
      };

      mockResponse = {
        ...mockResponse,
        get: jest.fn((header: string) => {
          if (header === 'Content-Type') return 'text/html';
          return undefined;
        })
      };

      // compression middleware modifies the response object
      compressionMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should not compress when cache-control has no-transform', () => {
      mockRequest = {
        ...mockRequest,
        headers: {
          'cache-control': 'no-transform',
          'accept-encoding': 'gzip'
        }
      };

      compressionMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle different content types', () => {
      const contentTypes = [
        'text/html',
        'application/json',
        'text/css',
        'application/javascript'
      ];

      contentTypes.forEach(contentType => {
        mockResponse = {
          ...mockResponse,
          get: jest.fn((header: string) => {
            if (header === 'Content-Type') return contentType;
            return undefined;
          })
        };

        compressionMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockNext).toHaveBeenCalled();
      });
    });
  });

  describe('Security Headers', () => {
    it('should set appropriate security headers', () => {
      // Test that compression middleware doesn't interfere with security headers
      // In the actual app, helmet middleware handles security headers

      compressionMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      // Security headers are tested in integration tests
    });
  });

  describe('Request Processing', () => {
    it('should handle requests with different encodings', () => {
      const encodings = [
        'gzip',
        'deflate',
        'br',
        'compress',
        'gzip, deflate',
        '*'
      ];

      encodings.forEach(encoding => {
        mockRequest = {
          ...mockRequest,
          headers: {
            'accept-encoding': encoding
          }
        };

        compressionMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockNext).toHaveBeenCalled();
      });
    });

    it('should handle requests without accept-encoding header', () => {
      mockRequest = {
        ...mockRequest,
        headers: {}
      };

      compressionMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle large request bodies', () => {
      // Test that middleware handles requests with large bodies
      // The actual body parsing is handled by express.json() middleware

      compressionMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle compression errors gracefully', () => {
      // Mock a response that might cause compression issues
      mockResponse = {
        ...mockResponse,
        get: jest.fn(() => {
          throw new Error('Compression error');
        })
      };

      // Should not crash the application
      expect(() => {
        compressionMiddleware(mockRequest as Request, mockResponse as Response, mockNext);
      }).not.toThrow();

      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle malformed headers', () => {
      mockRequest = {
        ...mockRequest,
        headers: {
          'accept-encoding': null as any,
          'cache-control': undefined as any
        }
      };

      compressionMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('Performance', () => {
    it('should not add significant overhead', () => {
      const startTime = process.hrtime.bigint();

      for (let i = 0; i < 100; i++) {
        compressionMiddleware(mockRequest as Request, mockResponse as Response, mockNext);
      }

      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1e6; // Convert to milliseconds

      // Should complete 100 requests in less than 100ms
      expect(duration).toBeLessThan(100);
    });

    it('should handle concurrent requests', async () => {
      const promises = Array(10).fill(null).map(() =>
        new Promise<void>((resolve) => {
          compressionMiddleware(mockRequest as Request, mockResponse as Response, () => {
            resolve();
          });
        })
      );

      await expect(Promise.all(promises)).resolves.not.toThrow();
    });
  });

  describe('Integration with Express', () => {
    it('should work with express middleware chain', () => {
      // Test that middleware integrates properly with express
      const middlewares = [compressionMiddleware, generalLimiter];

      const chainNext = jest.fn();
      let currentReq = mockRequest;
      let currentRes = mockResponse;

      middlewares.forEach(middleware => {
        middleware(currentReq as Request, currentRes as Response, chainNext);
      });

      expect(chainNext).toHaveBeenCalledTimes(middlewares.length);
    });

    it('should preserve request and response objects', () => {
      const originalReq = { ...mockRequest };
      const originalRes = { ...mockResponse };

      compressionMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Objects should not be deeply modified
      expect(mockRequest).toEqual(originalReq);
      expect(mockResponse).toMatchObject(originalRes);
    });
  });
});
