import { Router, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /campuses/me/leaderboard
router.get('/me/leaderboard', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { type } = req.query;
    const campusId = req.user!.campusId;

    if (type === 'most_helpful') {
      const users = await prisma.user.findMany({
        where: { campusId, status: 'active' },
        select: { id: true, fullName: true, avatarUrl: true, ratingAverage: true, ratingCount: true },
        orderBy: { ratingAverage: 'desc' },
        take: 10,
      });
      return res.json(users);
    }

    // Default: top_sellers
    const users = await prisma.user.findMany({
      where: { campusId, status: 'active' },
      select: {
        id: true,
        fullName: true,
        avatarUrl: true,
        _count: { select: { listings: { where: { status: 'sold' } } } },
      },
      orderBy: { listings: { _count: 'desc' } },
      take: 10,
    });

    return res.json(users);
  } catch (err) {
    console.error('Get leaderboard error:', err);
    return res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

// GET /campuses/me/trends
router.get('/me/trends', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const campusId = req.user!.campusId;
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const trends = await prisma.listing.groupBy({
      by: ['categoryTopId'],
      where: { campusId, createdAt: { gte: sevenDaysAgo } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    return res.json(trends);
  } catch (err) {
    console.error('Get trends error:', err);
    return res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

// GET /campuses/me/heatmap
router.get('/me/heatmap', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const campusId = req.user!.campusId;

    const heatmap = await prisma.listing.groupBy({
      by: ['pickupSpotId'],
      where: { campusId, status: 'sold', pickupSpotId: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    return res.json(heatmap);
  } catch (err) {
    console.error('Get heatmap error:', err);
    return res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

export { router as leaderboardRoutes };
