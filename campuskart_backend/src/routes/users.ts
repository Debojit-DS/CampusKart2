import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

const updateProfileSchema = z.object({
  fullName: z.string().min(1).optional(),
  avatarUrl: z.string().url().optional(),
  department: z.string().optional(),
  yearOfStudy: z.number().min(1).max(6).optional(),
  fcmToken: z.string().optional(),
});

const createRatingSchema = z.object({
  stars: z.number().min(1).max(5),
  comment: z.string().max(500).optional(),
});

// GET /users/me - current user profile
router.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true, fullName: true, email: true, avatarUrl: true,
        isVerified: true, campusId: true, department: true,
        yearOfStudy: true, ratingAverage: true, ratingCount: true,
        joinedAt: true, role: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'NOT_FOUND' });
    }

    return res.json(user);
  } catch (err) {
    console.error('Get me error:', err);
    return res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

// GET /users/:id - public profile
router.get('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: String(req.params.id), campusId: req.user!.campusId },
      select: {
        id: true, fullName: true, avatarUrl: true, isVerified: true,
        department: true, yearOfStudy: true, joinedAt: true,
        ratingAverage: true, ratingCount: true,
        _count: { select: { listings: { where: { status: 'active' } } } },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'NOT_FOUND' });
    }

    const badges = await prisma.userBadge.findMany({
      where: { userId: String(req.params.id) },
      include: { badge: true },
    });

    return res.json({ ...user, badges: badges.map(ub => ub.badge) });
  } catch (err) {
    console.error('Get user error:', err);
    return res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

// PATCH /users/me
router.patch('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const data = updateProfileSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data,
      select: {
        id: true, fullName: true, email: true, avatarUrl: true,
        isVerified: true, campusId: true, department: true,
        yearOfStudy: true, ratingAverage: true, ratingCount: true,
      },
    });

    return res.json(user);
  } catch (err) {
    console.error('Update profile error:', err);
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', details: err.errors });
    }
    return res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

// GET /users/me/badges
router.get('/me/badges', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const badges = await prisma.userBadge.findMany({
      where: { userId: req.user!.id },
      include: { badge: true },
      orderBy: { awardedAt: 'desc' },
    });

    return res.json(badges.map(ub => ub.badge));
  } catch (err) {
    console.error('Get badges error:', err);
    return res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

// POST /listings/:id/ratings
router.post('/listings/:id/ratings', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const data = createRatingSchema.parse(req.body);

    const listing = await prisma.listing.findUnique({
      where: { id: String(req.params.id) },
      select: { sellerId: true, campusId: true, status: true },
    });

    if (!listing || listing.campusId !== req.user!.campusId) {
      return res.status(404).json({ error: 'NOT_FOUND' });
    }

    if (listing.status !== 'sold') {
      return res.status(400).json({ error: 'LISTING_NOT_SOLD' });
    }

    if (listing.sellerId === req.user!.id) {
      return res.status(400).json({ error: 'CANNOT_RATE_OWN_LISTING' });
    }

    const rating = await prisma.$transaction(async (tx) => {
      const created = await tx.rating.create({
        data: {
          listingId: String(req.params.id),
          raterId: req.user!.id,
          rateeId: listing.sellerId,
          stars: data.stars,
          comment: data.comment,
        },
      });

      const agg = await tx.rating.aggregate({
        where: { rateeId: listing.sellerId },
        _avg: { stars: true },
        _count: { stars: true },
      });

      await tx.user.update({
        where: { id: listing.sellerId },
        data: {
          ratingAverage: agg._avg.stars || 0,
          ratingCount: agg._count.stars,
        },
      });

      return created;
    });

    return res.status(201).json(rating);
  } catch (err) {
    console.error('Create rating error:', err);
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', details: err.errors });
    }
    return res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

export { router as userRoutes };
