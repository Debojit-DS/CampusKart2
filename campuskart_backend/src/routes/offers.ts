import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireVerified, AuthRequest } from '../middleware/auth.js';
import { sendNotification } from '../services/notifications.js';
import { emitToConversation } from '../services/socket.js';

const router = Router();

const createOfferSchema = z.object({
  amount: z.number().min(0),
  currency: z.string().default('INR'),
});

const respondOfferSchema = z.object({
  action: z.enum(['accept', 'reject', 'counter']),
  amount: z.number().min(0).optional(),
});

// POST /conversations/:conversationId/offers
router.post('/conversations/:conversationId/offers', requireAuth, requireVerified, async (req: AuthRequest, res: Response) => {
  try {
    const conversationId = String(req.params.conversationId);
    const data = createOfferSchema.parse(req.body);

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { listing: { select: { campusId: true, sellerId: true } } },
    });

    if (!conversation || conversation.listing.campusId !== req.user!.campusId) {
      return res.status(404).json({ error: 'NOT_FOUND' });
    }

    if (conversation.buyerId !== req.user!.id && conversation.sellerId !== req.user!.id) {
      return res.status(403).json({ error: 'FORBIDDEN' });
    }

    const result = await prisma.$transaction(async (tx) => {
      const offer = await tx.offer.create({
        data: {
          conversationId,
          listingId: conversation.listingId,
          proposedById: req.user!.id,
          amount: data.amount,
          currency: data.currency,
          status: 'pending',
        },
      });

      const message = await tx.message.create({
        data: {
          conversationId,
          senderId: req.user!.id,
          type: 'offer',
          offerId: offer.id,
        },
        include: {
          sender: { select: { id: true, fullName: true, avatarUrl: true } },
          offer: true,
        },
      });

      await tx.conversation.update({
        where: { id: conversationId },
        data: {
          lastMessagePreview: `₹${data.amount} offer`,
          lastMessageAt: new Date(),
        },
      });

      return { offer, message };
    });

    const otherUserId = conversation.buyerId === req.user!.id ? conversation.sellerId : conversation.buyerId;
    await sendNotification(otherUserId, 'new_offer', { offerId: result.offer.id, conversationId });

    // Emit real-time events
    emitToConversation(conversationId, 'new_message', result.message);
    emitToConversation(conversationId, 'offer_update', { offer: result.offer, action: 'created' });

    return res.status(201).json(result.offer);
  } catch (err) {
    console.error('Create offer error:', err);
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', details: err.errors });
    }
    return res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

// PATCH /offers/:id
router.patch('/:id', requireAuth, requireVerified, async (req: AuthRequest, res: Response) => {
  try {
    const data = respondOfferSchema.parse(req.body);
    const offerId = String(req.params.id);

    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      include: { conversation: { include: { listing: { select: { campusId: true } } } } },
    });

    if (!offer || offer.conversation.listing.campusId !== req.user!.campusId) {
      return res.status(404).json({ error: 'NOT_FOUND' });
    }

    if (offer.proposedById === req.user!.id) {
      return res.status(403).json({ error: 'CANNOT_ACT_ON_OWN_OFFER' });
    }

    if (offer.status !== 'pending') {
      return res.status(400).json({ error: 'OFFER_NOT_PENDING' });
    }

    if (data.action === 'accept') {
      const result = await prisma.$transaction(async (tx) => {
        const accepted = await tx.offer.update({
          where: { id: offerId },
          data: { status: 'accepted' },
        });

        const message = await tx.message.create({
          data: {
            conversationId: offer.conversationId,
            senderId: req.user!.id,
            type: 'system',
            text: `Offer of ₹${offer.amount} accepted!`,
          },
          include: {
            sender: { select: { id: true, fullName: true, avatarUrl: true } },
          },
        });

        return { accepted, message };
      });

      await sendNotification(offer.proposedById, 'offer_accepted', { offerId: offer.id, conversationId: offer.conversationId });
      emitToConversation(offer.conversationId, 'new_message', result.message);
      emitToConversation(offer.conversationId, 'offer_update', { offer: result.accepted, action: 'accepted' });
      return res.json(result.accepted);
    }

    if (data.action === 'reject') {
      const result = await prisma.$transaction(async (tx) => {
        const rejected = await tx.offer.update({
          where: { id: offerId },
          data: { status: 'rejected' },
        });

        const message = await tx.message.create({
          data: {
            conversationId: offer.conversationId,
            senderId: req.user!.id,
            type: 'system',
            text: `Offer of ₹${offer.amount} rejected.`,
          },
          include: {
            sender: { select: { id: true, fullName: true, avatarUrl: true } },
          },
        });

        return { rejected, message };
      });

      await sendNotification(offer.proposedById, 'offer_rejected', { offerId: offer.id, conversationId: offer.conversationId });
      emitToConversation(offer.conversationId, 'new_message', result.message);
      emitToConversation(offer.conversationId, 'offer_update', { offer: result.rejected, action: 'rejected' });
      return res.json(result.rejected);
    }

    if (data.action === 'counter') {
      if (!data.amount) {
        return res.status(400).json({ error: 'COUNTER_REQUIRES_AMOUNT' });
      }

      const counterAmount = data.amount;

      const result = await prisma.$transaction(async (tx) => {
        await tx.offer.update({
          where: { id: offerId },
          data: { status: 'countered' },
        });

        const counter = await tx.offer.create({
          data: {
            conversationId: offer.conversationId,
            listingId: offer.listingId,
            proposedById: req.user!.id,
            amount: counterAmount,
            currency: offer.currency,
            status: 'pending',
            parentOfferId: offer.id,
          },
        });

        const message = await tx.message.create({
          data: {
            conversationId: offer.conversationId,
            senderId: req.user!.id,
            type: 'offer',
            offerId: counter.id,
          },
          include: {
            sender: { select: { id: true, fullName: true, avatarUrl: true } },
            offer: true,
          },
        });

        await tx.conversation.update({
          where: { id: offer.conversationId },
          data: {
            lastMessagePreview: `Counter offer: ₹${data.amount}`,
            lastMessageAt: new Date(),
          },
        });

        return { counter, message };
      });

      await sendNotification(offer.proposedById, 'new_offer', { offerId: result.counter.id, conversationId: offer.conversationId });
      emitToConversation(offer.conversationId, 'new_message', result.message);
      emitToConversation(offer.conversationId, 'offer_update', { offer: result.counter, action: 'countered' });
      return res.json(result.counter);
    }
  } catch (err) {
    console.error('Respond to offer error:', err);
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', details: err.errors });
    }
    return res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

export { router as offerRoutes };
