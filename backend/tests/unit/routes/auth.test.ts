import request from 'supertest';
import express from 'express';
import User from '../../src/models/User';
import authRoutes from '../../src/routes/auth';
import { errorHandler } from '../../src/middleware/errorHandler';

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  app.use(errorHandler);
  return app;
};

describe('Auth Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = createTestApp();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'TestPass123!',
        firstName: 'John',
        lastName: 'Doe'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('تم التسجيل بنجاح');
      expect(response.body.data.user).toMatchObject({
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        fullName: 'John Doe',
        role: 'user'
      });
      expect(response.body.data.token).toBeDefined();
      expect(typeof response.body.data.token).toBe('string');
    });

    it('should hash password before storing', async () => {
      const password = 'TestPass123!';

      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'hashuser@example.com',
          password,
          firstName: 'Hash',
          lastName: 'User'
        })
        .expect(201);

      const user = await User.findOne({ email: 'hashuser@example.com' }).select('+password');
      expect(user?.password).not.toBe(password);
      expect(user?.password.length).toBeGreaterThan(0);
    });

    it('should return 409 for duplicate email', async () => {
      // Register first user
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'TestPass123!',
          firstName: 'First',
          lastName: 'User'
        })
        .expect(201);

      // Try to register with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'DifferentPass123!',
          firstName: 'Second',
          lastName: 'User'
        })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('EMAIL_EXISTS');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details).toBeDefined();
    });

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'TestPass123!',
          firstName: 'John',
          lastName: 'Doe'
        })
        .expect(400);

      expect(response.body.error.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ msg: expect.stringContaining('البريد الإلكتروني غير صحيح') })
        ])
      );
    });

    it('should validate password strength', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'weak',
          firstName: 'John',
          lastName: 'Doe'
        })
        .expect(400);

      expect(response.body.error.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ msg: expect.stringContaining('كلمة المرور يجب أن تكون') })
        ])
      );
    });

    it('should validate password requirements', async () => {
      const weakPasswords = ['nouppercase123!', 'NOLOWERCASE123!', 'NoNumbers!', 'NoSpecial123'];

      for (const password of weakPasswords) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            email: `test${password}@example.com`,
            password,
            firstName: 'John',
            lastName: 'Doe'
          })
          .expect(400);

        expect(response.body.error.details).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ msg: expect.stringContaining('كلمة المرور يجب أن تحتوي') })
          ])
        );
      }
    });

    it('should validate name lengths', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'nametest@example.com',
          password: 'TestPass123!',
          firstName: 'A',
          lastName: 'B'
        })
        .expect(400);

      expect(response.body.error.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ msg: expect.stringContaining('الاسم الأول يجب أن يكون') }),
          expect.objectContaining({ msg: expect.stringContaining('اسم العائلة يجب أن يكون') })
        ])
      );
    });

    it('should trim and normalize input', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: '  TRIMMED@EXAMPLE.COM  ',
          password: 'TestPass123!',
          firstName: '  John  ',
          lastName: '  Doe  '
        })
        .expect(201);

      expect(response.body.data.user.email).toBe('trimmed@example.com');
      expect(response.body.data.user.firstName).toBe('John');
      expect(response.body.data.user.lastName).toBe('Doe');
    });

    it('should set timestamps', async () => {
      const beforeRegister = new Date();

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'timestamp@example.com',
          password: 'TestPass123!',
          firstName: 'Time',
          lastName: 'Stamp'
        })
        .expect(201);

      const user = await User.findById(response.body.data.user.id);
      expect(user?.createdAt).toBeDefined();
      expect(user?.updatedAt).toBeDefined();
      expect(user?.createdAt.getTime()).toBeGreaterThanOrEqual(beforeRegister.getTime());
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create test user
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'loginuser@example.com',
          password: 'LoginPass123!',
          firstName: 'Login',
          lastName: 'User'
        });
    });

    it('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'loginuser@example.com',
          password: 'LoginPass123!'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('تم تسجيل الدخول بنجاح');
      expect(response.body.data.user).toMatchObject({
        email: 'loginuser@example.com',
        firstName: 'Login',
        lastName: 'User',
        fullName: 'Login User',
        role: 'user'
      });
      expect(response.body.data.token).toBeDefined();
    });

    it('should update lastLogin timestamp', async () => {
      const beforeLogin = new Date();

      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'loginuser@example.com',
          password: 'LoginPass123!'
        })
        .expect(200);

      const user = await User.findOne({ email: 'loginuser@example.com' });
      expect(user?.lastLogin).toBeDefined();
      expect(user?.lastLogin.getTime()).toBeGreaterThanOrEqual(beforeLogin.getTime());
    });

    it('should return 401 for non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'SomePass123!'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('should return 401 for wrong password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'loginuser@example.com',
          password: 'WrongPass123!'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: 'TestPass123!'
        })
        .expect(400);

      expect(response.body.error.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ msg: expect.stringContaining('البريد الإلكتروني غير صحيح') })
        ])
      );
    });

    it('should handle case insensitive email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'LOGINUSER@EXAMPLE.COM',
          password: 'LoginPass123!'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/auth/me', () => {
    let user: any;
    let token: string;

    beforeEach(async () => {
      // Register and login to get token
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'meuser@example.com',
          password: 'MePass123!',
          firstName: 'Me',
          lastName: 'User'
        });

      user = registerResponse.body.data.user;
      token = registerResponse.body.data.token;
    });

    it('should return current user profile', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toMatchObject({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        role: user.role,
        createdAt: expect.any(String)
      });
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('TOKEN_REQUIRED');
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_TOKEN');
    });
  });

  describe('POST /api/auth/logout', () => {
    let token: string;

    beforeEach(async () => {
      // Get token
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'logoutuser@example.com',
          password: 'LogoutPass123!',
          firstName: 'Logout',
          lastName: 'User'
        });

      token = registerResponse.body.data.token;
    });

    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('تم تسجيل الخروج بنجاح');
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('AUTH_REQUIRED');
    });
  });

  describe('Authentication Integration', () => {
    it('should maintain session across requests', async () => {
      // Register
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'session@example.com',
          password: 'SessionPass123!',
          firstName: 'Session',
          lastName: 'User'
        });

      const token = registerResponse.body.data.token;
      const userId = registerResponse.body.data.user.id;

      // Check profile
      const profileResponse = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(profileResponse.body.data.user.id).toBe(userId);

      // Logout
      await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Profile should still work (JWT stateless)
      const profileAfterLogout = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(profileAfterLogout.body.data.user.id).toBe(userId);
    });

    it('should handle multiple concurrent users', async () => {
      // Register multiple users
      const users = [];
      const tokens = [];

      for (let i = 0; i < 3; i++) {
        const registerResponse = await request(app)
          .post('/api/auth/register')
          .send({
            email: `multi${i}@example.com`,
            password: 'MultiPass123!',
            firstName: `Multi${i}`,
            lastName: 'User'
          });

        users.push(registerResponse.body.data.user);
        tokens.push(registerResponse.body.data.token);
      }

      // All users should be able to access their profiles simultaneously
      const promises = tokens.map((token, index) =>
        request(app)
          .get('/api/auth/me')
          .set('Authorization', `Bearer ${token}`)
          .expect(200)
          .then(response => ({
            userId: response.body.data.user.id,
            expectedId: users[index].id
          }))
      );

      const results = await Promise.all(promises);

      results.forEach(result => {
        expect(result.userId).toBe(result.expectedId);
      });
    });
  });
});
