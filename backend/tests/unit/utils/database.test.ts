import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from '../../../src/utils/database';

describe('Database Utils', () => {
  afterEach(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });

  describe('connectDatabase', () => {
    it('should connect to database successfully', async () => {
      const result = await connectDatabase('mongodb://localhost:27017/test');
      expect(result).toBe(true);
      expect(mongoose.connection.readyState).toBe(1);
    });

    it('should handle connection errors', async () => {
      await expect(connectDatabase('invalid-connection-string')).rejects.toThrow();
    });

    it('should not reconnect if already connected', async () => {
      await connectDatabase('mongodb://localhost:27017/test');
      const spy = jest.spyOn(mongoose, 'connect');
      
      await connectDatabase('mongodb://localhost:27017/test');
      expect(spy).not.toHaveBeenCalled();
      
      spy.mockRestore();
    });
  });

  describe('disconnectDatabase', () => {
    it('should disconnect from database', async () => {
      await connectDatabase('mongodb://localhost:27017/test');
      await disconnectDatabase();
      expect(mongoose.connection.readyState).toBe(0);
    });

    it('should handle disconnect when not connected', async () => {
      await expect(disconnectDatabase()).resolves.not.toThrow();
    });
  });
});