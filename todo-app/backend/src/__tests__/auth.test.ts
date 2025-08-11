import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../index';
import User from '../models/User';

let mongoServer: MongoMemoryServer;

// Setup MongoDB Memory Server before tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

// Clean up after tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Clear database between tests
beforeEach(async () => {
  await User.deleteMany({});
});

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('_id');
      expect(response.body.user).toHaveProperty('name', userData.name);
      expect(response.body.user).toHaveProperty('email', userData.email);
    });

    it('should not allow duplicate emails', async () => {
      // Create a user first
      const userData = {
        name: 'Test User',
        email: 'duplicate@example.com',
        password: 'password123',
      };

      await request(app).post('/api/auth/register').send(userData);

      // Try to create a second user with the same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'User already exists');
    });

    it('should validate user input', async () => {
      // Missing name
      const response1 = await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(response1.status).toBe(400);

      // Invalid email
      const response2 = await request(app).post('/api/auth/register').send({
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123',
      });
      expect(response2.status).toBe(400);

      // Short password
      const response3 = await request(app).post('/api/auth/register').send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'short',
      });
      expect(response3.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user before each login test
      await request(app).post('/api/auth/register').send({
        name: 'Login Test User',
        email: 'login@example.com',
        password: 'password123',
      });
    });

    it('should login an existing user', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'login@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('name', 'Login Test User');
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'login@example.com',
        password: 'wrongpassword',
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Invalid credentials');
    });
  });

  describe('GET /api/auth/me', () => {
    let token: string;

    beforeEach(async () => {
      // Create a test user and get token
      const response = await request(app).post('/api/auth/register').send({
        name: 'Profile User',
        email: 'profile@example.com',
        password: 'password123',
      });
      token = response.body.token;
    });

    it('should get current user profile', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('name', 'Profile User');
      expect(response.body.user).toHaveProperty('email', 'profile@example.com');
    });

    it('should reject unauthorized requests', async () => {
      const response = await request(app).get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Not authorized, no token');
    });

    it('should reject invalid tokens', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalidtoken');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Not authorized, token failed');
    });
  });
});