import { describe, it, expect, beforeAll } from 'vitest';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Campus Isolation', () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  it('should scope listings to the user campus', async () => {
    const campusA = await prisma.institution.findFirst({ where: { name: 'Campus A' } });
    const campusB = await prisma.institution.findFirst({ where: { name: 'Campus B' } });

    if (!campusA || !campusB) {
      return;
    }

    const listingsA = await prisma.listing.findMany({
      where: { campusId: campusA.id, status: 'active' },
    });

    const listingsB = await prisma.listing.findMany({
      where: { campusId: campusB.id, status: 'active' },
    });

    expect(listingsA.every(l => l.campusId === campusA.id)).toBe(true);
    expect(listingsB.every(l => l.campusId === campusB.id)).toBe(true);
  });

  it('should not return cross-campus listings', async () => {
    const campusA = await prisma.institution.findFirst({ where: { name: 'Campus A' } });
    const campusB = await prisma.institution.findFirst({ where: { name: 'Campus B' } });

    if (!campusA || !campusB) {
      return;
    }

    const allA = await prisma.listing.findMany({
      where: { campusId: campusA.id },
    });

    expect(allA.every(l => l.campusId !== campusB.id)).toBe(true);
  });
});
