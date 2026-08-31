import { Router, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

function qstr(param: unknown): string | undefined {
  if (typeof param === 'string') return param;
  if (Array.isArray(param) && typeof param[0] === 'string') return param[0];
  return undefined;
}

// GET /notifications
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const cursor = qstr(req.query.cursor);
    const take = 20;

    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.id },
      take: take + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
    });

    const hasMore = notifications.length > take;
    const data = hasMore ? notifications.slice(0, take) : notifications;
    const nextCursor = hasMore ? data[data.length - 1].id : null;

    return res.json({ data, nextCursor, hasMore });
  } catch (err) {
    console.error('Get notifications error:', err);
    return res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

// GET /notifications/unread-count
router.get('/unread-count', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const count = await prisma.notification.count({
      where: { userId: req.user!.id, isRead: false },
    });
    return res.json({ count });
  } catch (err) {
    console.error('Get unread count error:', err);
    return res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

// PATCH /notifications/:id/read
router.patch('/:id/read', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.notification.updateMany({
      where: { id: String(req.params.id), userId: req.user!.id },
      data: { isRead: true },
    });
    return res.json({ success: true });
  } catch (err) {
    console.error('Mark notification read error:', err);
    return res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

// PATCH /notifications/read-all
router.patch('/read-all', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.id, isRead: false },
      data: { isRead: true },
    });
    return res.json({ success: true });
  } catch (err) {
    console.error('Mark all read error:', err);
    return res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

export { router as notificationRoutes };
