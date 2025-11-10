import User, { IUser } from '../../src/models/User';
import mongoose from 'mongoose';

describe('User Model', () => {
  describe('User Creation', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'TestPass123!',
        firstName: 'John',
        lastName: 'Doe'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.email).toBe(userData.email.toLowerCase());
      expect(savedUser.firstName).toBe(userData.firstName);
      expect(savedUser.lastName).toBe(userData.lastName);
      expect(savedUser.role).toBe('user');
      expect(savedUser.isActive).toBe(true);
      expect(savedUser.createdAt).toBeDefined();
      expect(savedUser.updatedAt).toBeDefined();
    });

    it('should hash password before saving', async () => {
      const password = 'TestPass123!';
      const user = new User({
        email: 'test@example.com',
        password,
        firstName: 'John',
        lastName: 'Doe'
      });

      await user.save();

      // Password should be hashed, not plain text
      expect(user.password).not.toBe(password);
      expect(user.password).toHaveLength(60); // bcrypt hash length
    });

    it('should normalize email to lowercase', async () => {
      const user = new User({
        email: 'TEST@EXAMPLE.COM',
        password: 'TestPass123!',
        firstName: 'John',
        lastName: 'Doe'
      });

      await user.save();

      expect(user.email).toBe('test@example.com');
    });

    it('should set default role to user', async () => {
      const user = new User({
        email: 'test@example.com',
        password: 'TestPass123!',
        firstName: 'John',
        lastName: 'Doe'
      });

      await user.save();

      expect(user.role).toBe('user');
    });

    it('should set default isActive to true', async () => {
      const user = new User({
        email: 'test@example.com',
        password: 'TestPass123!',
        firstName: 'John',
        lastName: 'Doe'
      });

      await user.save();

      expect(user.isActive).toBe(true);
    });
  });

  describe('User Validation', () => {
    it('should fail validation for missing required fields', async () => {
      const user = new User({});

      let error;
      try {
        await user.validate();
      } catch (err: any) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.email).toBeDefined();
      expect(error.errors.password).toBeDefined();
      expect(error.errors.firstName).toBeDefined();
      expect(error.errors.lastName).toBeDefined();
    });

    it('should fail validation for invalid email format', async () => {
      const user = new User({
        email: 'invalid-email',
        password: 'TestPass123!',
        firstName: 'John',
        lastName: 'Doe'
      });

      let error;
      try {
        await user.validate();
      } catch (err: any) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.email).toBeDefined();
    });

    it('should fail validation for password too short', async () => {
      const user = new User({
        email: 'test@example.com',
        password: '123',
        firstName: 'John',
        lastName: 'Doe'
      });

      let error;
      try {
        await user.validate();
      } catch (err: any) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.password).toBeDefined();
    });

    it('should fail validation for names too short', async () => {
      const user = new User({
        email: 'test@example.com',
        password: 'TestPass123!',
        firstName: 'A',
        lastName: 'B'
      });

      let error;
      try {
        await user.validate();
      } catch (err: any) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.firstName).toBeDefined();
      expect(error.errors.lastName).toBeDefined();
    });

    it('should fail validation for names too long', async () => {
      const longName = 'A'.repeat(51);
      const user = new User({
        email: 'test@example.com',
        password: 'TestPass123!',
        firstName: longName,
        lastName: longName
      });

      let error;
      try {
        await user.validate();
      } catch (err: any) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.firstName).toBeDefined();
      expect(error.errors.lastName).toBeDefined();
    });

    it('should fail validation for duplicate email', async () => {
      // Create first user
      await new User({
        email: 'duplicate@example.com',
        password: 'TestPass123!',
        firstName: 'John',
        lastName: 'Doe'
      }).save();

      // Try to create second user with same email
      const duplicateUser = new User({
        email: 'duplicate@example.com',
        password: 'TestPass456!',
        firstName: 'Jane',
        lastName: 'Smith'
      });

      let error;
      try {
        await duplicateUser.save();
      } catch (err: any) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.code).toBe(11000); // MongoDB duplicate key error
    });
  });

  describe('Password Methods', () => {
    it('should compare password correctly', async () => {
      const password = 'TestPass123!';
      const user = new User({
        email: 'test@example.com',
        password,
        firstName: 'John',
        lastName: 'Doe'
      });

      await user.save();

      const isValid = await user.comparePassword(password);
      const isInvalid = await user.comparePassword('WrongPass123!');

      expect(isValid).toBe(true);
      expect(isInvalid).toBe(false);
    });
  });

  describe('Virtual Fields', () => {
    it('should return full name correctly', async () => {
      const user = new User({
        email: 'test@example.com',
        password: 'TestPass123!',
        firstName: 'John',
        lastName: 'Doe'
      });

      await user.save();

      expect(user.getFullName()).toBe('John Doe');
    });
  });

  describe('Timestamps', () => {
    it('should set createdAt and updatedAt timestamps', async () => {
      const beforeCreate = new Date();

      const user = new User({
        email: 'test@example.com',
        password: 'TestPass123!',
        firstName: 'John',
        lastName: 'Doe'
      });

      await user.save();

      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
      expect(user.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
      expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
    });

    it('should update updatedAt on save', async () => {
      const user = new User({
        email: 'test@example.com',
        password: 'TestPass123!',
        firstName: 'John',
        lastName: 'Doe'
      });

      await user.save();
      const firstUpdate = user.updatedAt;

      // Wait a bit and update
      await new Promise(resolve => setTimeout(resolve, 10));
      user.lastLogin = new Date();
      await user.save();

      expect(user.updatedAt.getTime()).toBeGreaterThan(firstUpdate.getTime());
    });
  });

  describe('User Queries', () => {
    beforeEach(async () => {
      // Create test users
      await User.create([
        {
          email: 'user1@example.com',
          password: 'TestPass123!',
          firstName: 'User',
          lastName: 'One'
        },
        {
          email: 'user2@example.com',
          password: 'TestPass123!',
          firstName: 'User',
          lastName: 'Two'
        },
        {
          email: 'admin@example.com',
          password: 'TestPass123!',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin'
        }
      ]);
    });

    it('should find user by email', async () => {
      const user = await User.findOne({ email: 'user1@example.com' });

      expect(user).toBeDefined();
      expect(user?.email).toBe('user1@example.com');
      expect(user?.firstName).toBe('User');
      expect(user?.lastName).toBe('One');
    });

    it('should exclude password by default', async () => {
      const user = await User.findOne({ email: 'user1@example.com' });

      expect(user).toBeDefined();
      expect(user?.password).toBeUndefined();
    });

    it('should include password when explicitly selected', async () => {
      const user = await User.findOne({ email: 'user1@example.com' }).select('+password');

      expect(user).toBeDefined();
      expect(user?.password).toBeDefined();
      expect(typeof user?.password).toBe('string');
      expect(user?.password.length).toBeGreaterThan(0);
    });

    it('should find users by role', async () => {
      const admins = await User.find({ role: 'admin' });
      const users = await User.find({ role: 'user' });

      expect(admins).toHaveLength(1);
      expect(users).toHaveLength(2);
    });

    it('should sort users by creation date', async () => {
      const users = await User.find().sort({ createdAt: -1 });

      expect(users).toHaveLength(3);
      expect(users[0].createdAt.getTime()).toBeGreaterThanOrEqual(users[1].createdAt.getTime());
      expect(users[1].createdAt.getTime()).toBeGreaterThanOrEqual(users[2].createdAt.getTime());
    });
  });
});
