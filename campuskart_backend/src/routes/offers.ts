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

      await tx.message.create({
        data: {
          conversationId,
          senderId: req.user!.id,
          type: 'offer',
          offerId: offer.id,
        },
      });

      await tx.conversation.update({
        where: { id: conversationId },
        data: {
          lastMessagePreview: `₹${data.amount} offer`,
          lastMessageAt: new Date(),
        },
      });

      return offer;
    });

    const otherUserId = conversation.buyerId === req.user!.id ? conversation.sellerId : conversation.buyerId;
    await sendNotification(otherUserId, 'new_offer', { offerId: result.id, conversationId });

    // Emit real-time event
    emitToConversation(conversationId, 'offer_update', { offer: result, action: 'created' });

    return res.status(201).json(result);
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
      const updated = await prisma.$transaction(async (tx) => {
        const accepted = await tx.offer.update({
          where: { id: offerId },
          data: { status: 'accepted' },
        });

        await tx.message.create({
          data: {
            conversationId: offer.conversationId,
            senderId: req.user!.id,
            type: 'system',
            text: `Offer of ₹${offer.amount} accepted!`,
          },
        });

        return accepted;
      });

      await sendNotification(offer.proposedById, 'offer_accepted', { offerId: offer.id, conversationId: offer.conversationId });
      emitToConversation(offer.conversationId, 'offer_update', { offer: updated, action: 'accepted' });
      return res.json(updated);
    }

    if (data.action === 'reject') {
      const updated = await prisma.$transaction(async (tx) => {
        const rejected = await tx.offer.update({
          where: { id: offerId },
          data: { status: 'rejected' },
        });

        await tx.message.create({
          data: {
            conversationId: offer.conversationId,
            senderId: req.user!.id,
            type: 'system',
            text: `Offer of ₹${offer.amount} rejected.`,
          },
        });

        return rejected;
      });

      await sendNotification(offer.proposedById, 'offer_rejected', { offerId: offer.id, conversationId: offer.conversationId });
      emitToConversation(offer.conversationId, 'offer_update', { offer: updated, action: 'rejected' });
      return res.json(updated);
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

        await tx.message.create({
          data: {
            conversationId: offer.conversationId,
            senderId: req.user!.id,
            type: 'offer',
            offerId: counter.id,
          },
        });

        await tx.conversation.update({
          where: { id: offer.conversationId },
          data: {
            lastMessagePreview: `Counter offer: ₹${data.amount}`,
            lastMessageAt: new Date(),
          },
        });

        return counter;
      });

      await sendNotification(offer.proposedById, 'new_offer', { offerId: result.id, conversationId: offer.conversationId });
      emitToConversation(offer.conversationId, 'offer_update', { offer: result, action: 'countered' });
      return res.json(result);
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
