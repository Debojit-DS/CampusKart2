import { Router, Response } from 'express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireVerified, AuthRequest } from '../middleware/auth.js';
import { moderateText } from '../services/moderation.js';
import { analyzeListingImage } from '../services/aiVision.js';

const router = Router();

const createListingSchema = z.object({
  type: z.enum(['item', 'wanted']).default('item'),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  price: z.number().min(0),
  currency: z.string().default('INR'),
  isNegotiable: z.boolean().default(true),
  condition: z.enum(['new', 'like_new', 'good', 'fair', 'used']).nullable().optional(),
  categoryTopId: z.string().nullable().optional(),
  categorySubId: z.string().nullable().optional(),
  pickupSpotId: z.string().nullable().optional(),
  pickupLocation: z.string().optional(),
  imageUrls: z.array(z.string().url()).optional(),
  isUrgent: z.boolean().default(false),
  exchangeOnly: z.boolean().default(false),
  exchangeFor: z.string().nullable().optional(),
});

function qstr(param: unknown): string | undefined {
  if (typeof param === 'string') return param;
  if (Array.isArray(param) && typeof param[0] === 'string') return param[0];
  return undefined;
}

// GET /listings - campus-scoped feed with filters
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const category = qstr(req.query.category);
    const search = qstr(req.query.search);
    const sort = qstr(req.query.sort);
    const condition = qstr(req.query.condition);
    const minPrice = qstr(req.query.minPrice);
    const maxPrice = qstr(req.query.maxPrice);
    const cursor = qstr(req.query.cursor);
    const status = qstr(req.query.status);
    const sellerId = qstr(req.query.sellerId);
    const campusId = req.user!.campusId;

    const take = 20;
    const where: Prisma.ListingWhereInput = {
      campusId,
      status: status || 'active',
    };

    if (sellerId) {
      where.sellerId = sellerId;
    }

    if (category && category !== 'all') {
      where.OR = [
        { categoryTop: { slug: category } },
        { categorySub: { slug: category } },
      ];
    }

    if (search && search.trim()) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { pickupLocation: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (condition) {
      where.condition = condition;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price = { ...where.price, gte: Number(minPrice) };
      if (maxPrice) where.price = { ...where.price, lte: Number(maxPrice) };
    }

    let orderBy: Prisma.ListingOrderByWithRelationInput = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    else if (sort === 'price_desc') orderBy = { price: 'desc' };

    const listings = await prisma.listing.findMany({
      where,
      take: take + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy,
      include: {
        seller: { select: { id: true, fullName: true, avatarUrl: true, ratingAverage: true } },
        images: { orderBy: { sortOrder: 'asc' } },
        categoryTop: { select: { slug: true, label: true } },
        categorySub: { select: { slug: true, label: true } },
        _count: { select: { bookmarks: true } },
      },
    });

    const hasMore = listings.length > take;
    const data = hasMore ? listings.slice(0, take) : listings;
    const nextCursor = hasMore ? data[data.length - 1].id : null;

    return res.json({ data, nextCursor, hasMore });
  } catch (err) {
    console.error('Get listings error:', err);
    return res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

// GET /listings/bookmarks - get user's bookmarked listings
router.get('/bookmarks', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: req.user!.id },
      include: {
        listing: {
          include: {
            seller: { select: { id: true, fullName: true, avatarUrl: true, ratingAverage: true } },
            images: { orderBy: { sortOrder: 'asc' } },
            categoryTop: { select: { slug: true, label: true } },
            categorySub: { select: { slug: true, label: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(bookmarks.map(b => b.listing));
  } catch (err) {
    console.error('Get bookmarks error:', err);
    return res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

// GET /listings/mine
router.get('/mine', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const listings = await prisma.listing.findMany({
      where: {
        sellerId: req.user!.id,
        campusId: req.user!.campusId,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        categoryTop: { select: { slug: true, label: true } },
        categorySub: { select: { slug: true, label: true } },
      },
    });
    return res.json(listings);
  } catch (err) {
    console.error('Get my listings error:', err);
    return res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

// GET /listings/:id
router.get('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: String(req.params.id) },
      include: {
        seller: {
          select: {
            id: true, fullName: true, avatarUrl: true, department: true,
            yearOfStudy: true, ratingAverage: true, ratingCount: true,
            joinedAt: true, isVerified: true,
          },
        },
        images: { orderBy: { sortOrder: 'asc' } },
        categoryTop: { select: { id: true, slug: true, label: true } },
        categorySub: { select: { id: true, slug: true, label: true } },
        pickupSpot: { select: { id: true, label: true } },
        _count: { select: { bookmarks: true } },
      },
    });

    if (!listing || listing.campusId !== req.user!.campusId || listing.status === 'removed') {
      return res.status(404).json({ error: 'NOT_FOUND' });
    }

    prisma.listing.update({
      where: { id: listing.id },
      data: { viewCount: { increment: 1 } },
    }).catch(() => {});

    const bookmark = await prisma.bookmark.findUnique({
      where: { userId_listingId: { userId: req.user!.id, listingId: listing.id } },
    });

    return res.json({ ...listing, isBookmarked: !!bookmark });
  } catch (err) {
    console.error('Get listing error:', err);
    return res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

// GET /listings/:id/similar
router.get('/:id/similar', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const current = await prisma.listing.findUnique({
      where: { id: String(req.params.id) },
      select: { categoryTopId: true, campusId: true },
    });

    if (!current || current.campusId !== req.user!.campusId) {
      return res.json([]);
    }

    const similar = await prisma.listing.findMany({
      where: {
        campusId: req.user!.campusId,
        status: 'active',
        id: { not: String(req.params.id) },
        categoryTopId: current.categoryTopId,
      },
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        seller: { select: { id: true, fullName: true, avatarUrl: true } },
      },
    });

    return res.json(similar);
  } catch (err) {
    console.error('Get similar listings error:', err);
    return res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

// POST /listings/analyze-image
router.post('/analyze-image', requireAuth, requireVerified, async (req: AuthRequest, res: Response) => {
  try {
    const body = z.object({ imageUrl: z.string().url() }).parse(req.body);

    const result = await analyzeListingImage(body.imageUrl);
    return res.json(result);
  } catch (err) {
    console.error('Analyze image error:', err);
    return res.status(422).json({ error: 'ANALYSIS_FAILED', message: 'Could not analyze this image. Please fill the form manually.' });
  }
});

// POST /listings
router.post('/', requireAuth, requireVerified, async (req: AuthRequest, res: Response) => {
  try {
    const data = createListingSchema.parse(req.body);

    const moderation = moderateText(`${data.title} ${data.description}`);
    if (!moderation.isClean) {
      return res.status(400).json({ error: 'CONTENT_FLAGGED', details: moderation.flags });
    }

    const pickupSpot = data.pickupSpotId
      ? await prisma.pickupSpot.findUnique({ where: { id: data.pickupSpotId }, select: { label: true } })
      : null;

    const listing = await prisma.listing.create({
      data: {
        type: data.type,
        title: data.title,
        description: data.description,
        price: data.price,
        currency: data.currency,
        isNegotiable: data.isNegotiable,
        condition: data.condition,
        categoryTopId: data.categoryTopId,
        categorySubId: data.categorySubId,
        pickupLocation: pickupSpot?.label || data.pickupLocation || 'TBD',
        pickupSpotId: data.pickupSpotId,
        sellerId: req.user!.id,
        campusId: req.user!.campusId,
        isUrgent: data.isUrgent,
        exchangeOnly: data.exchangeOnly,
        exchangeFor: data.exchangeFor,
        images: data.imageUrls
          ? { create: data.imageUrls.map((url, i) => ({ url, sortOrder: i })) }
          : undefined,
      },
      include: {
        images: true,
        seller: { select: { id: true, fullName: true, avatarUrl: true } },
      },
    });

    return res.status(201).json(listing);
  } catch (err) {
    console.error('Create listing error:', err);
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', details: err.errors });
    }
    return res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

// PATCH /listings/:id
router.patch('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.listing.findUnique({
      where: { id: String(req.params.id) },
      select: { sellerId: true, campusId: true },
    });

    if (!existing || existing.campusId !== req.user!.campusId) {
      return res.status(404).json({ error: 'NOT_FOUND' });
    }

    if (existing.sellerId !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'FORBIDDEN' });
    }

    const { status, ...updates } = req.body;

    const listing = await prisma.listing.update({
      where: { id: String(req.params.id) },
      data: { ...updates, ...(status && { status }) },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        seller: { select: { id: true, fullName: true, avatarUrl: true } },
      },
    });

    if (status === 'sold') {
      await prisma.offer.updateMany({
        where: { listingId: String(req.params.id), status: 'pending' },
        data: { status: 'rejected' },
      });
    }

    return res.json(listing);
  } catch (err) {
    console.error('Update listing error:', err);
    return res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

// DELETE /listings/:id
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.listing.findUnique({
      where: { id: String(req.params.id) },
      select: { sellerId: true, campusId: true },
    });

    if (!existing || existing.campusId !== req.user!.campusId) {
      return res.status(404).json({ error: 'NOT_FOUND' });
    }

    if (existing.sellerId !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'FORBIDDEN' });
    }

    await prisma.listing.update({
      where: { id: String(req.params.id) },
      data: { status: 'removed' },
    });

    return res.status(204).send();
  } catch (err) {
    console.error('Delete listing error:', err);
    return res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

// POST /listings/:id/bookmark
router.post('/:id/bookmark', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: String(req.params.id) },
      select: { campusId: true },
    });

    if (!listing || listing.campusId !== req.user!.campusId) {
      return res.status(404).json({ error: 'NOT_FOUND' });
    }

    const existing = await prisma.bookmark.findUnique({
      where: { userId_listingId: { userId: req.user!.id, listingId: String(req.params.id) } },
    });

    if (existing) {
      await prisma.bookmark.delete({
        where: { userId_listingId: { userId: req.user!.id, listingId: String(req.params.id) } },
      });
      return res.json({ bookmarked: false });
    }

    await prisma.bookmark.create({
      data: { userId: req.user!.id, listingId: String(req.params.id) },
    });

    return res.json({ bookmarked: true });
  } catch (err) {
    console.error('Toggle bookmark error:', err);
    return res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

// DELETE /listings/:id/bookmark
router.delete('/:id/bookmark', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.bookmark.delete({
      where: { userId_listingId: { userId: req.user!.id, listingId: String(req.params.id) } },
    });
    return res.json({ bookmarked: false });
  } catch {
    return res.status(404).json({ error: 'NOT_FOUND' });
  }
});

export { router as listingRoutes };
