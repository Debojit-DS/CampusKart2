import { Router, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /categories - full tree
router.get('/', async (_req: AuthRequest, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      where: { parentId: null },
      include: {
        children: {
          select: { id: true, slug: true, label: true },
          orderBy: { label: 'asc' },
        },
      },
      orderBy: { label: 'asc' },
    });

    return res.json(categories);
  } catch (err) {
    console.error('Get categories error:', err);
    return res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

export { router as categoryRoutes };
