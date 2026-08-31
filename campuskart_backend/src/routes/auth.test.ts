import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { prisma } from '../lib/prisma.js';
import { createTestApp } from '../test/createApp.js';
import { storeVerificationCode } from '../services/verification.js';

const app = createTestApp();

describe('POST /api/v1/auth/signup', () => {
  beforeAll(async () => {
    await prisma.message.deleteMany();
    await prisma.offer.deleteMany();
    await prisma.conversationRead.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.bookmark.deleteMany();
    await prisma.listingImage.deleteMany();
    await prisma.listing.deleteMany();
    await prisma.listingView.deleteMany();
    await prisma.userBadge.deleteMany();
    await prisma.badge.deleteMany();
    await prisma.report.deleteMany();
    await prisma.rating.deleteMany();
    await prisma.wishlistItem.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.pickupSpot.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
    await prisma.institution.deleteMany();

    await prisma.institution.create({
      data: { id: 'inst-auth', name: 'Auth Test Inst', emailDomains: ['heritageit.edu.in'], departments: [] },
    });
  });

  it('should create a new user and return 201', async () => {
    const res = await request(app)
      .post('/api/v1/auth/signup')
      .send({ email: 'testsignup@heritageit.edu.in', fullName: 'Test User', password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body.userId).toBeDefined();
    expect(res.body.message).toContain('verify');
  });

  it('should reject duplicate email with 409', async () => {
    await request(app)
      .post('/api/v1/auth/signup')
      .send({ email: 'dup@heritageit.edu.in', fullName: 'Dup User', password: 'password123' });

    const res = await request(app)
      .post('/api/v1/auth/signup')
      .send({ email: 'dup@heritageit.edu.in', fullName: 'Dup User', password: 'password123' });

    expect(res.status).toBe(409);
  });

  it('should reject unsupported domain with 400', async () => {
    const res = await request(app)
      .post('/api/v1/auth/signup')
      .send({ email: 'test@gmail.com', fullName: 'Test User', password: 'password123' });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/v1/auth/login', () => {
  beforeAll(async () => {
    await request(app)
      .post('/api/v1/auth/signup')
      .send({ email: 'login@heritageit.edu.in', fullName: 'Login User', password: 'password123' });
  });

  it('should login and return tokens', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'login@heritageit.edu.in', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user.email).toBe('login@heritageit.edu.in');
  });

  it('should reject wrong password with 401', async () => {
    await request(app)
      .post('/api/v1/auth/signup')
      .send({ email: 'badpass@heritageit.edu.in', fullName: 'Bad User', password: 'password123' });

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'badpass@heritageit.edu.in', password: 'wrongpassword' });

    expect(res.status).toBe(401);
  });
});

describe('POST /api/v1/auth/verify-email', () => {
  beforeAll(async () => {
    await request(app)
      .post('/api/v1/auth/signup')
      .send({ email: 'verify@heritageit.edu.in', fullName: 'Verify User', password: 'password123' });
  });

  it('should verify email with correct code', async () => {
    const code = '123456';
    storeVerificationCode('verify@heritageit.edu.in', code);

    const res = await request(app)
      .post('/api/v1/auth/verify-email')
      .send({ email: 'verify@heritageit.edu.in', code });

    expect(res.status).toBe(200);
    expect(res.body.verified).toBe(true);
  });
});

describe('POST /api/v1/auth/refresh', () => {
  it('should return 401 without valid refresh token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/refresh');

    expect(res.status).toBe(401);
  });
});
