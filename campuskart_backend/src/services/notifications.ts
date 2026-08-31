import { prisma } from '../lib/prisma.js';
import { sendPushNotification } from './push.js';
import { emitToUser } from './socket.js';

export async function sendNotification(
  userId: string,
  type: string,
  payload: Record<string, unknown>
) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        payload: payload as unknown as object,
      },
    });

    // Emit real-time notification via Socket.IO
    emitToUser(userId, 'notification', { ...notification, payload });

    // Attempt push notification if user has FCM token
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { fcmToken: true },
    });

    if (user?.fcmToken) {
      const title = getNotificationTitle(type);
      const body = getNotificationBody(type, payload);
      sendPushNotification({
        token: user.fcmToken,
        title,
        body,
        data: { type, ...payload as Record<string, string> },
      }).catch(() => {});
    }

    return notification;
  } catch (err) {
    console.error('Send notification error:', err);
    return null;
  }
}

export async function sendBulkNotifications(
  userIds: string[],
  type: string,
  payload: Record<string, unknown>
) {
  try {
    const notifications = userIds.map(userId => ({
      userId,
      type,
      payload: payload as unknown as object,
    }));

    const result = await prisma.notification.createMany({
      data: notifications,
    });

    return result;
  } catch (err) {
    console.error('Send bulk notifications error:', err);
    return null;
  }
}

function getNotificationTitle(type: string): string {
  switch (type) {
    case 'new_offer': return 'New Offer Received';
    case 'new_message': return 'New Message';
    case 'offer_accepted': return 'Offer Accepted!';
    case 'offer_rejected': return 'Offer Declined';
    case 'listing_saved_price_drop': return 'Price Drop Alert';
    default: return 'CampusKart Notification';
  }
}

function getNotificationBody(type: string, _payload: Record<string, unknown>): string {
  switch (type) {
    case 'new_offer': return 'Someone made an offer on your listing';
    case 'new_message': return 'You have a new message';
    case 'offer_accepted': return 'Your offer was accepted!';
    case 'offer_rejected': return 'Your offer was declined';
    case 'listing_saved_price_drop': return 'A saved listing has a price drop';
    default: return 'Check CampusKart for updates';
  }
}
