const request = require('supertest');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env variables
dotenv.config();

// Import the Express app, not the server
const app = require('../app');  // We'll create this file separately

describe('Auth API', () => {
  let testUserEmail = `test${Date.now()}@example.com`;
  let token;

  // Connect to test database before tests
  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/self-improvement-app-test';
    
    try {
      await mongoose.connect(mongoUri);
      console.log('Connected to test database');
    } catch (err) {
      console.error('Error connecting to test database:', err.message);
    }
  });

  // Test user registration
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: testUserEmail,
        password: 'password123'
      });
    
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('accessToken');  // Changed from 'token' to 'accessToken'
    expect(res.body).toHaveProperty('refreshToken'); // Added check for refreshToken
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('id');
    expect(res.body.user.email).toEqual(testUserEmail);
  });

  // Test user login
  it('should login the user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUserEmail,
        password: 'password123'
      });
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('accessToken');
    token = res.body.accessToken;
  });

  // Test get current user profile
  it('should get current user profile', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.statusCode).toEqual(200);
    expect(res.body.data).toHaveProperty('email');
    expect(res.body.data.email).toEqual(testUserEmail);
  });

  // Test unauthorized access
  it('should reject unauthorized access', async () => {
    const res = await request(app)
      .get('/api/auth/me');
    
    expect(res.statusCode).toEqual(401);
  });

  // Clear test data and close connections after tests
  afterAll(async () => {
    // Delete test user 
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.db.collection('users').deleteMany({ email: testUserEmail });
      await mongoose.connection.close();
      console.log('Test database connection closed');
    }
  });
});