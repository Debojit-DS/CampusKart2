import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireVerified, AuthRequest } from '../middleware/auth.js';
import { sendNotification } from '../services/notifications.js';
import { emitToConversation } from '../services/socket.js';
import { moderateText, containsContactInfo } from '../services/moderation.js';

const router = Router();

// GET /conversations
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ buyerId: userId }, { sellerId: userId }],
        listing: { campusId: req.user!.campusId },
      },
      orderBy: { lastMessageAt: 'desc' },
      include: {
        listing: { select: { id: true, title: true, images: { take: 1 } } },
        buyer: { select: { id: true, fullName: true, avatarUrl: true } },
        seller: { select: { id: true, fullName: true, avatarUrl: true } },
      },
    });

    const conversationIds = conversations.map(c => c.id);
    const reads = await prisma.conversationRead.findMany({
      where: { conversationId: { in: conversationIds }, userId },
    });
    const readMap = new Map(reads.map(r => [r.conversationId, r.lastReadAt]));

    const result = await Promise.all(
      conversations.map(async (conv) => {
        const lastReadAt = readMap.get(conv.id);
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            senderId: { not: userId },
            ...(lastReadAt ? { createdAt: { gt: lastReadAt } } : {}),
          },
        });

        return { ...conv, unreadCountForCurrentUser: unreadCount };
      })
    );

    return res.json(result);
  } catch (err) {
    console.error('Get conversations error:', err);
    return res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

// GET /conversations/:id
router.get('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: String(req.params.id) },
      include: {
        listing: {
          include: {
            images: { orderBy: { sortOrder: 'asc' } },
            seller: { select: { id: true, fullName: true, avatarUrl: true } },
          },
        },
        buyer: { select: { id: true, fullName: true, avatarUrl: true } },
        seller: { select: { id: true, fullName: true, avatarUrl: true } },
      },
    });

    if (!conversation || conversation.listing.campusId !== req.user!.campusId) {
      return res.status(404).json({ error: 'NOT_FOUND' });
    }

    if (conversation.buyerId !== req.user!.id && conversation.sellerId !== req.user!.id) {
      return res.status(403).json({ error: 'FORBIDDEN' });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId: String(req.params.id) },
      orderBy: { createdAt: 'asc' },
      include: {
        offer: true,
        sender: { select: { id: true, fullName: true, avatarUrl: true } },
      },
    });

    await prisma.conversationRead.upsert({
      where: { conversationId_userId: { conversationId: String(req.params.id), userId: req.user!.id } },
      create: { conversationId: String(req.params.id), userId: req.user!.id, lastReadAt: new Date() },
      update: { lastReadAt: new Date() },
    });

    return res.json({ conversation, messages });
  } catch (err) {
    console.error('Get conversation error:', err);
    return res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

// POST /conversations
router.post('/', requireAuth, requireVerified, async (req: AuthRequest, res: Response) => {
  try {
    const { listingId } = req.body;

    if (!listingId) {
      return res.status(400).json({ error: 'MISSING_FIELDS' });
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true, sellerId: true, campusId: true, title: true },
    });

    if (!listing || listing.campusId !== req.user!.campusId) {
      return res.status(404).json({ error: 'NOT_FOUND' });
    }

    if (listing.sellerId === req.user!.id) {
      return res.status(400).json({ error: 'CANNOT_MESSAGE_OWN_LISTING' });
    }

    const conversation = await prisma.conversation.upsert({
      where: { listingId_buyerId: { listingId, buyerId: req.user!.id } },
      create: { listingId, buyerId: req.user!.id, sellerId: listing.sellerId },
      update: {},
      include: {
        listing: { select: { id: true, title: true } },
        buyer: { select: { id: true, fullName: true, avatarUrl: true } },
        seller: { select: { id: true, fullName: true, avatarUrl: true } },
      },
    });

    return res.status(201).json(conversation);
  } catch (err) {
    console.error('Create conversation error:', err);
    return res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

// POST /conversations/:id/messages
const sendMessageSchema = z.object({
  type: z.enum(['text', 'image', 'location']).default('text'),
  text: z.string().optional(),
  imageUrl: z.string().url().optional(),
  locationLabel: z.string().optional(),
});

router.post('/:id/messages', requireAuth, requireVerified, async (req: AuthRequest, res: Response) => {
  try {
    const data = sendMessageSchema.parse(req.body);

    const conversation = await prisma.conversation.findUnique({
      where: { id: String(req.params.id) },
      select: { buyerId: true, sellerId: true, listingId: true, listing: { select: { campusId: true } } },
    });

    if (!conversation || conversation.listing.campusId !== req.user!.campusId) {
      return res.status(404).json({ error: 'NOT_FOUND' });
    }

    if (conversation.buyerId !== req.user!.id && conversation.sellerId !== req.user!.id) {
      return res.status(403).json({ error: 'FORBIDDEN' });
    }

    if (data.text) {
      const textModeration = moderateText(data.text);
      if (!textModeration.isClean) {
        return res.status(400).json({ error: 'CONTENT_FLAGGED', details: textModeration.flags });
      }
    }

    const message = await prisma.message.create({
      data: {
        conversationId: String(req.params.id),
        senderId: req.user!.id,
        type: data.type,
        text: data.text,
        imageUrl: data.imageUrl,
        locationLabel: data.locationLabel,
      },
      include: {
        sender: { select: { id: true, fullName: true, avatarUrl: true } },
        offer: true,
      },
    });

    const contactWarning = data.text && containsContactInfo(data.text)
      ? { contactWarning: 'Consider keeping contact in-app until you\'re comfortable' }
      : {};

    await prisma.conversation.update({
      where: { id: String(req.params.id) },
      data: {
        lastMessagePreview: data.text || (data.type === 'image' ? 'Sent an image' : data.type === 'location' ? 'Shared a location' : ''),
        lastMessageAt: new Date(),
      },
    });

    const otherUserId = conversation.buyerId === req.user!.id ? conversation.sellerId : conversation.buyerId;
    await sendNotification(otherUserId, 'new_message', { conversationId: String(req.params.id), messageId: message.id });

    // Emit real-time event to conversation room
    emitToConversation(String(req.params.id), 'new_message', message);

    return res.status(201).json({ ...message, ...contactWarning });
  } catch (err) {
    console.error('Send message error:', err);
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', details: err.errors });
    }
    return res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

// PATCH /conversations/:id/read
router.patch('/:id/read', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.conversationRead.upsert({
      where: { conversationId_userId: { conversationId: String(req.params.id), userId: req.user!.id } },
      create: { conversationId: String(req.params.id), userId: req.user!.id, lastReadAt: new Date() },
      update: { lastReadAt: new Date() },
    });

    return res.json({ success: true });
  } catch (err) {
    console.error('Mark read error:', err);
    return res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

export { router as conversationRoutes };
