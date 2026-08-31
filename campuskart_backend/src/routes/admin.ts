import { Router, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireAdmin, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth, requireAdmin);

function qstr(param: unknown): string | undefined {
  if (typeof param === 'string') return param;
  if (Array.isArray(param) && typeof param[0] === 'string') return param[0];
  return undefined;
}

// GET /admin/users
router.get('/users', async (req: AuthRequest, res: Response) => {
  try {
    const status = qstr(req.query.status);
    const search = qstr(req.query.search);
    const sort = qstr(req.query.sort);

    const where: Record<string, unknown> = { campusId: req.user!.campusId };
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    let orderBy: Record<string, string> = { joinedAt: 'desc' };
    if (sort === 'reports') orderBy = { reportCount: 'desc' };
    else if (sort === 'rating') orderBy = { ratingAverage: 'desc' };

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true, fullName: true, email: true, isVerified: true,
        status: true, reportCount: true, ratingAverage: true,
        joinedAt: true, _count: { select: { listings: true } },
      },
      orderBy,
    });

    return res.json(users);
  } catch (err) {
    console.error('Admin get users error:', err);
    return res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

// PATCH /admin/users/:id
router.patch('/users/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;

    if (!['active', 'suspended', 'banned'].includes(status)) {
      return res.status(400).json({ error: 'INVALID_STATUS' });
    }

    const user = await prisma.user.update({
      where: { id: String(req.params.id) },
      data: { status },
      select: { id: true, fullName: true, status: true },
    });

    await prisma.moderationAction.create({
      data: {
        adminId: req.user!.id,
        action: status === 'banned' ? 'ban_user' : 'warn_user',
        targetType: 'user',
        targetId: String(req.params.id),
        reason: req.body.reason,
      },
    });

    return res.json(user);
  } catch (err) {
    console.error('Admin update user error:', err);
    return res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

// GET /admin/listings
router.get('/listings', async (req: AuthRequest, res: Response) => {
  try {
    const status = qstr(req.query.status);
    const reported = qstr(req.query.reported);

    const where: Record<string, unknown> = { campusId: req.user!.campusId };
    if (status) where.status = status;
    if (reported === 'true') {
      where.reports = { some: { status: 'open' } };
    }

    const listings = await prisma.listing.findMany({
      where,
      include: {
        seller: { select: { id: true, fullName: true } },
        _count: { select: { reports: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(listings);
  } catch (err) {
    console.error('Admin get listings error:', err);
    return res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

// PATCH /admin/listings/:id
router.patch('/listings/:id', async (req: AuthRequest, res: Response) => {
  try {
    const listing = await prisma.listing.update({
      where: { id: String(req.params.id) },
      data: { status: 'removed' },
    });

    await prisma.moderationAction.create({
      data: {
        adminId: req.user!.id,
        action: 'remove_listing',
        targetType: 'listing',
        targetId: String(req.params.id),
        reason: req.body.reason,
      },
    });

    return res.json(listing);
  } catch (err) {
    console.error('Admin remove listing error:', err);
    return res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

// GET /admin/reports
router.get('/reports', async (req: AuthRequest, res: Response) => {
  try {
    const status = qstr(req.query.status);

    const reports = await prisma.report.findMany({
      where: status ? { status } : {},
      include: {
        reporter: { select: { id: true, fullName: true } },
        listing: { select: { id: true, title: true } },
        reportedUser: { select: { id: true, fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(reports);
  } catch (err) {
    console.error('Admin get reports error:', err);
    return res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

// PATCH /admin/reports/:id
router.patch('/reports/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;

    if (!['resolved', 'dismissed'].includes(status)) {
      return res.status(400).json({ error: 'INVALID_STATUS' });
    }

    const report = await prisma.report.update({
      where: { id: String(req.params.id) },
      data: {
        status,
        resolvedById: req.user!.id,
        resolvedAt: new Date(),
      },
    });

    await prisma.moderationAction.create({
      data: {
        adminId: req.user!.id,
        action: 'resolve_report',
        targetType: 'report',
        targetId: String(req.params.id),
        reason: req.body.resolutionNote,
      },
    });

    return res.json(report);
  } catch (err) {
    console.error('Admin resolve report error:', err);
    return res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

// GET /admin/analytics
router.get('/analytics', async (req: AuthRequest, res: Response) => {
  try {
    const campusId = req.user!.campusId;

    const [
      totalUsers,
      activeListings,
      soldListings,
      recentSignups7d,
      recentSignups30d,
      topCategories,
      mostActiveUsers,
    ] = await Promise.all([
      prisma.user.count({ where: { campusId } }),
      prisma.listing.count({ where: { campusId, status: 'active' } }),
      prisma.listing.count({ where: { campusId, status: 'sold' } }),
      prisma.user.count({ where: { campusId, joinedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
      prisma.user.count({ where: { campusId, joinedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } }),
      prisma.listing.groupBy({
        by: ['categoryTopId'],
        where: { campusId, status: 'active' },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5,
      }),
      prisma.user.findMany({
        where: { campusId },
        select: { id: true, fullName: true, _count: { select: { listings: true, messages: true } } },
        orderBy: { listings: { _count: 'desc' } },
        take: 5,
      }),
    ]);

    return res.json({
      totalUsers, activeListings, soldListings,
      recentSignups7d, recentSignups30d,
      topCategories, mostActiveUsers,
    });
  } catch (err) {
    console.error('Admin analytics error:', err);
    return res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

export { router as adminRoutes };
