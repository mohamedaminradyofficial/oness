describe('Logger Utils', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('Log Levels', () => {
    const createLogger = () => ({
      info: (message: string) => console.log(`[INFO] ${message}`),
      warn: (message: string) => console.log(`[WARN] ${message}`),
      error: (message: string) => console.log(`[ERROR] ${message}`),
      debug: (message: string) => console.log(`[DEBUG] ${message}`)
    });

    it('should log info messages', () => {
      const logger = createLogger();
      logger.info('Test info message');
      
      expect(consoleSpy).toHaveBeenCalledWith('[INFO] Test info message');
    });

    it('should log warning messages', () => {
      const logger = createLogger();
      logger.warn('Test warning message');
      
      expect(consoleSpy).toHaveBeenCalledWith('[WARN] Test warning message');
    });

    it('should log error messages', () => {
      const logger = createLogger();
      logger.error('Test error message');
      
      expect(consoleSpy).toHaveBeenCalledWith('[ERROR] Test error message');
    });

    it('should log debug messages', () => {
      const logger = createLogger();
      logger.debug('Test debug message');
      
      expect(consoleSpy).toHaveBeenCalledWith('[DEBUG] Test debug message');
    });
  });

  describe('Log Formatting', () => {
    const formatLogMessage = (level: string, message: string, metadata?: any) => {
      const timestamp = new Date().toISOString();
      const metaStr = metadata ? ` ${JSON.stringify(metadata)}` : '';
      return `${timestamp} [${level}] ${message}${metaStr}`;
    };

    it('should format messages with timestamp', () => {
      const message = formatLogMessage('INFO', 'Test message');
      
      expect(message).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z \[INFO\] Test message$/);
    });

    it('should include metadata in formatted message', () => {
      const metadata = { userId: '123', action: 'analyze' };
      const message = formatLogMessage('INFO', 'User action', metadata);
      
      expect(message).toContain('{"userId":"123","action":"analyze"}');
    });

    it('should handle empty metadata', () => {
      const message = formatLogMessage('INFO', 'Test message');
      
      expect(message).not.toContain('undefined');
      expect(message).not.toContain('null');
    });
  });

  describe('Error Logging', () => {
    const logError = (error: Error, context?: string) => {
      const errorInfo = {
        message: error.message,
        stack: error.stack,
        context: context || 'unknown'
      };
      console.log(`[ERROR] ${JSON.stringify(errorInfo)}`);
    };

    it('should log error with stack trace', () => {
      const error = new Error('Test error');
      logError(error, 'test-context');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR]')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Test error')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('test-context')
      );
    });

    it('should handle errors without context', () => {
      const error = new Error('Test error');
      logError(error);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('unknown')
      );
    });
  });

  describe('Performance Logging', () => {
    const logPerformance = (operation: string, duration: number) => {
      const level = duration > 1000 ? 'WARN' : 'INFO';
      console.log(`[${level}] Operation '${operation}' took ${duration}ms`);
    };

    it('should log fast operations as INFO', () => {
      logPerformance('fast-operation', 500);
      
      expect(consoleSpy).toHaveBeenCalledWith('[INFO] Operation \'fast-operation\' took 500ms');
    });

    it('should log slow operations as WARN', () => {
      logPerformance('slow-operation', 1500);
      
      expect(consoleSpy).toHaveBeenCalledWith('[WARN] Operation \'slow-operation\' took 1500ms');
    });
  });

  describe('Structured Logging', () => {
    const structuredLog = (level: string, message: string, fields: Record<string, any>) => {
      const logEntry = {
        timestamp: new Date().toISOString(),
        level,
        message,
        ...fields
      };
      console.log(JSON.stringify(logEntry));
    };

    it('should create structured log entries', () => {
      structuredLog('INFO', 'User login', { userId: '123', ip: '192.168.1.1' });
      
      const logCall = consoleSpy.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);
      
      expect(logEntry.level).toBe('INFO');
      expect(logEntry.message).toBe('User login');
      expect(logEntry.userId).toBe('123');
      expect(logEntry.ip).toBe('192.168.1.1');
      expect(logEntry.timestamp).toBeDefined();
    });

    it('should handle complex field values', () => {
      const complexFields = {
        user: { id: '123', name: 'Test User' },
        request: { method: 'POST', path: '/api/analyze' },
        response: { status: 200, duration: 1234 }
      };

      structuredLog('INFO', 'API request', complexFields);
      
      const logCall = consoleSpy.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);
      
      expect(logEntry.user.id).toBe('123');
      expect(logEntry.request.method).toBe('POST');
      expect(logEntry.response.status).toBe(200);
    });
  });
});