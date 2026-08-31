import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma.js';
import { createTestApp } from '../test/createApp.js';

const app = createTestApp();

let buyerAuth: string;
let sellerAuth: string;
let listingId: string;
let conversationId: string;

describe('Conversations API', () => {
  beforeAll(async () => {
    await prisma.message.deleteMany().catch(() => {});
    await prisma.offer.deleteMany().catch(() => {});
    await prisma.conversationRead.deleteMany().catch(() => {});
    await prisma.conversation.deleteMany().catch(() => {});
    await prisma.bookmark.deleteMany().catch(() => {});
    await prisma.listingImage.deleteMany().catch(() => {});
    await prisma.listing.deleteMany().catch(() => {});
    await prisma.listingView.deleteMany().catch(() => {});
    await prisma.userBadge.deleteMany().catch(() => {});
    await prisma.badge.deleteMany().catch(() => {});
    await prisma.report.deleteMany().catch(() => {});
    await prisma.rating.deleteMany().catch(() => {});
    await prisma.wishlistItem.deleteMany().catch(() => {});
    await prisma.notification.deleteMany().catch(() => {});
    await prisma.pickupSpot.deleteMany().catch(() => {});
    await prisma.category.deleteMany().catch(() => {});
    await prisma.user.deleteMany().catch(() => {});
    await prisma.institution.deleteMany().catch(() => {});

    const campusId = 'inst-conv-' + Date.now();
    await prisma.institution.create({
      data: { id: campusId, name: 'Test Inst', emailDomains: ['heritageit.edu.in'], departments: [] },
    });

    const hash = await bcrypt.hash('password123', 12);

    const buyerEmail = 'buyer-' + Date.now() + '@heritageit.edu.in';
    const sellerEmail = 'seller-' + Date.now() + '@heritageit.edu.in';

    await prisma.user.create({
      data: { email: buyerEmail, fullName: 'Buyer', passwordHash: hash, campusId, isVerified: true },
    });
    await prisma.user.create({
      data: { email: sellerEmail, fullName: 'Seller', passwordHash: hash, campusId, isVerified: true },
    });

    const buyerLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: buyerEmail, password: 'password123' });
    buyerAuth = `Bearer ${buyerLogin.body.accessToken}`;

    const sellerLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: sellerEmail, password: 'password123' });
    sellerAuth = `Bearer ${sellerLogin.body.accessToken}`;

    const listing = await request(app)
      .post('/api/v1/listings')
      .set('Authorization', sellerAuth)
      .send({ title: 'Chat Item', description: 'Test', price: 100, type: 'item', pickupLocation: 'Library' });

    listingId = listing.body.id;
  });

  it('POST /api/v1/conversations should create a conversation', async () => {
    const res = await request(app)
      .post('/api/v1/conversations')
      .set('Authorization', buyerAuth)
      .send({ listingId });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    conversationId = res.body.id;
  });

  it('GET /api/v1/conversations should return conversations', async () => {
    const res = await request(app)
      .get('/api/v1/conversations')
      .set('Authorization', buyerAuth);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/v1/conversations/:id/messages should send a message', async () => {
    const res = await request(app)
      .post(`/api/v1/conversations/${conversationId}/messages`)
      .set('Authorization', buyerAuth)
      .send({ type: 'text', text: 'Hello seller' });

    expect(res.status).toBe(201);
    expect(res.body.text).toBe('Hello seller');
  });

  it('GET /api/v1/conversations/:id should return conversation with messages', async () => {
    const res = await request(app)
      .get(`/api/v1/conversations/${conversationId}`)
      .set('Authorization', buyerAuth);

    expect(res.status).toBe(200);
    expect(res.body.conversation).toBeDefined();
    expect(res.body.messages.length).toBeGreaterThan(0);
  });
});
