import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

const createWishlistSchema = z.object({
  keyword: z.string().min(1).max(200),
  categoryId: z.string().uuid().optional(),
});

// GET /wishlist
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const items = await prisma.wishlistItem.findMany({
      where: { userId: req.user!.id },
      include: { category: { select: { id: true, slug: true, label: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(items);
  } catch (err) {
    console.error('Get wishlist error:', err);
    return res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

// POST /wishlist
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const data = createWishlistSchema.parse(req.body);

    const item = await prisma.wishlistItem.create({
      data: {
        userId: req.user!.id,
        keyword: data.keyword,
        categoryId: data.categoryId,
      },
    });

    return res.status(201).json(item);
  } catch (err) {
    console.error('Create wishlist item error:', err);
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', details: err.errors });
    }
    return res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

// DELETE /wishlist/:id
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.wishlistItem.deleteMany({
      where: { id: String(req.params.id), userId: req.user!.id },
    });
    return res.status(204).send();
  } catch (err) {
    console.error('Delete wishlist item error:', err);
    return res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

export { router as wishlistRoutes };
