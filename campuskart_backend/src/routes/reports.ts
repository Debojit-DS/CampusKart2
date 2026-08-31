import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireVerified, AuthRequest } from '../middleware/auth.js';

const router = Router();

const createReportSchema = z.object({
  listingId: z.string().uuid().optional(),
  reportedUserId: z.string().uuid().optional(),
  reason: z.enum(['spam', 'fake_item', 'wrong_price', 'inappropriate', 'scam', 'duplicate', 'other']),
  details: z.string().max(1000).optional(),
});

// POST /reports
router.post('/', requireAuth, requireVerified, async (req: AuthRequest, res: Response) => {
  try {
    const data = createReportSchema.parse(req.body);

    if (!data.listingId && !data.reportedUserId) {
      return res.status(400).json({ error: 'MUST_REPORT_LISTING_OR_USER' });
    }

    const report = await prisma.report.create({
      data: {
        reporterId: req.user!.id,
        listingId: data.listingId,
        reportedUserId: data.reportedUserId,
        reason: data.reason,
        details: data.details,
      },
    });

    // Increment report count on reported user
    if (data.reportedUserId) {
      await prisma.user.update({
        where: { id: data.reportedUserId },
        data: { reportCount: { increment: 1 } },
      });
    }

    return res.status(201).json(report);
  } catch (err) {
    console.error('Create report error:', err);
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', details: err.errors });
    }
    return res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

export { router as reportRoutes };
