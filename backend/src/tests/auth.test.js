const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../app');
const User = require('../models/User');

describe('Phase 2 — Authentication Integration Tests', () => {
  let inMemoryUsers = [];

  beforeEach(() => {
    inMemoryUsers = [];
    jest.clearAllMocks();

    // Mock User.findOne
    jest.spyOn(User, 'findOne').mockImplementation(({ email }) => {
      const found = inMemoryUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
      const queryObj = {
        select: jest.fn().mockImplementation((_fields) => {
          return Promise.resolve(found ? mockUserModelInstance(found) : null);
        }),
        then: (resolve) => resolve(found ? mockUserModelInstance(found) : null),
      };
      return queryObj;
    });

    // Mock User.findById
    jest.spyOn(User, 'findById').mockImplementation((id) => {
      const found = inMemoryUsers.find((u) => u._id.toString() === id.toString());
      return Promise.resolve(found ? mockUserModelInstance(found) : null);
    });

    // Mock User constructor & prototype save
    jest.spyOn(User.prototype, 'save').mockImplementation(async function () {
      const existing = inMemoryUsers.find((u) => u.email.toLowerCase() === this.email.toLowerCase());
      if (existing) {
        const err = new Error('Duplicate Key Error');
        err.code = 11000;
        throw err;
      }
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(this.passwordHash || 'password', salt);
      const newUser = {
        _id: this._id || 'mock-user-id-' + Math.random().toString(36).substring(7),
        name: this.name,
        email: this.email.toLowerCase(),
        passwordHash,
        role: this.role || 'user',
        createdAt: new Date(),
      };
      inMemoryUsers.push(newUser);
      Object.assign(this, newUser);
      return this;
    });
  });

  const mockUserModelInstance = (userData) => {
    const instance = new User(userData);
    instance._id = userData._id;
    instance.passwordHash = userData.passwordHash;

    instance.comparePassword = async function (enteredPassword) {
      return await bcrypt.compare(enteredPassword, userData.passwordHash);
    };

    instance.toJSON = function () {
      const obj = { ...userData };
      delete obj.passwordHash;
      return obj;
    };

    return instance;
  };

  const testUser = {
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    password: 'Password123!',
  };

  describe('POST /api/auth/register', () => {
    it('should successfully register a new user and return user object + JWT token', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('name', testUser.name);
      expect(res.body.user).toHaveProperty('email', testUser.email);
      expect(res.body.user).not.toHaveProperty('passwordHash');
    });

    it('should reject registration if email is already registered', async () => {
      await request(app).post('/api/auth/register').send(testUser);

      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.statusCode).toBe(409);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toHaveProperty('code', 'DUPLICATE_EMAIL');
    });

    it('should reject registration with invalid email or weak password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'invalid-email-format',
          password: 'short',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send(testUser);
    });

    it('should successfully log in with correct credentials and return JWT token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe(testUser.email);
    });

    it('should reject login with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.error).toHaveProperty('code', 'INVALID_CREDENTIALS');
    });

    it('should reject login for non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testUser.password,
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.error).toHaveProperty('code', 'INVALID_CREDENTIALS');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user details when valid JWT is provided', async () => {
      const registerRes = await request(app).post('/api/auth/register').send(testUser);
      const token = registerRes.body.token;

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.user).toHaveProperty('email', testUser.email);
    });

    it('should return 401 UNAUTHORIZED when no token is provided', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.statusCode).toBe(401);
      expect(res.body.error).toHaveProperty('code', 'UNAUTHORIZED');
    });
  });

  describe('GET /api/users/profile (Protected Route)', () => {
    it('should return 401 UNAUTHORIZED for unauthenticated request', async () => {
      const res = await request(app).get('/api/users/profile');

      expect(res.statusCode).toBe(401);
      expect(res.body.error).toHaveProperty('code', 'UNAUTHORIZED');
    });

    it('should return 200 OK and user profile for authenticated request', async () => {
      const registerRes = await request(app).post('/api/auth/register').send(testUser);
      const token = registerRes.body.token;

      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('email', testUser.email);
      expect(res.body).toHaveProperty('message');
    });
  });
});
