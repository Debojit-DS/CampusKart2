import { Router, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /institutions?emailDomain=
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { emailDomain } = req.query;

    if (emailDomain) {
      const domainStr = String(emailDomain);
      const institution = await prisma.institution.findFirst({
        where: {
          emailDomains: { has: domainStr.split('@')[1] || domainStr },
        },
      });
      return res.json(institution ? [institution] : []);
    }

    const institutions = await prisma.institution.findMany({
      where: { isActive: true },
      select: { id: true, name: true, emailDomains: true, departments: true },
    });

    return res.json(institutions);
  } catch (err) {
    console.error('Get institutions error:', err);
    return res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

// GET /institutions/:id/pickup-spots
router.get('/:id/pickup-spots', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const spots = await prisma.pickupSpot.findMany({
      where: { campusId: String(req.params.id), isActive: true },
      select: { id: true, label: true },
      orderBy: { label: 'asc' },
    });
    return res.json(spots);
  } catch (err) {
    console.error('Get pickup spots error:', err);
    return res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

// GET /institutions/:id/departments
router.get('/:id/departments', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const institution = await prisma.institution.findUnique({
      where: { id: String(req.params.id) },
      select: { departments: true },
    });

    if (!institution) {
      return res.status(404).json({ error: 'NOT_FOUND' });
    }

    return res.json(institution.departments);
  } catch (err) {
    console.error('Get departments error:', err);
    return res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

export { router as institutionRoutes };
