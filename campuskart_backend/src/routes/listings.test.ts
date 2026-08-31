import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma.js';
import { createTestApp } from '../test/createApp.js';

const app = createTestApp();

let authHeader: string;

describe('Listings API', () => {
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
      data: { id: 'inst-listings', name: 'Test Inst', emailDomains: ['heritageit.edu.in'], departments: [] },
    });

    const hash = await bcrypt.hash('password123', 12);
    await prisma.user.create({
      data: { email: 'listing@heritageit.edu.in', fullName: 'Listing User', passwordHash: hash, campusId: 'inst-listings', isVerified: true },
    });

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'listing@heritageit.edu.in', password: 'password123' });

    authHeader = `Bearer ${loginRes.body.accessToken}`;
  });

  it('GET /api/v1/listings should return listings', async () => {
    const res = await request(app)
      .get('/api/v1/listings')
      .set('Authorization', authHeader);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /api/v1/listings should create a listing', async () => {
    const res = await request(app)
      .post('/api/v1/listings')
      .set('Authorization', authHeader)
      .send({
        title: 'Test Item',
        description: 'Test description',
        price: 100,
        type: 'item',
        condition: 'good',
        pickupLocation: 'Library',
      });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Test Item');
  });

  it('GET /api/v1/listings/:id should return the listing', async () => {
    const listing = await request(app)
      .post('/api/v1/listings')
      .set('Authorization', authHeader)
      .send({ title: 'Get Item', description: 'Test', price: 100, type: 'item', pickupLocation: 'Library' });

    const res = await request(app)
      .get(`/api/v1/listings/${listing.body.id}`)
      .set('Authorization', authHeader);

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Get Item');
  });

  it('PATCH /api/v1/listings/:id should update the listing', async () => {
    const listing = await request(app)
      .post('/api/v1/listings')
      .set('Authorization', authHeader)
      .send({ title: 'Patch Item', description: 'Test', price: 100, type: 'item', pickupLocation: 'Library' });

    const res = await request(app)
      .patch(`/api/v1/listings/${listing.body.id}`)
      .set('Authorization', authHeader)
      .send({ status: 'sold' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('sold');
  });

  it('DELETE /api/v1/listings/:id should soft-delete the listing', async () => {
    const listing = await request(app)
      .post('/api/v1/listings')
      .set('Authorization', authHeader)
      .send({ title: 'Delete Item', description: 'Test', price: 100, type: 'item', pickupLocation: 'Library' });

    const res = await request(app)
      .delete(`/api/v1/listings/${listing.body.id}`)
      .set('Authorization', authHeader);

    expect(res.status).toBe(204);
  });
});
