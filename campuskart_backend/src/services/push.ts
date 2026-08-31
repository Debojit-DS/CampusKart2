const FCM_SERVER_KEY = process.env.FCM_SERVER_KEY;

interface PushNotification {
  token: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

export async function sendPushNotification(notification: PushNotification): Promise<boolean> {
  if (!FCM_SERVER_KEY) {
    console.log(`[PUSH] Would send to ${notification.token}: ${notification.title} - ${notification.body}`);
    return true;
  }

  try {
    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Authorization': `key=${FCM_SERVER_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: notification.token,
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: notification.data,
      }),
    });

    const result = (await response.json()) as { success?: number };
    return result.success === 1;
  } catch (err) {
    console.error('Push notification error:', err);
    return false;
  }
}

export async function sendBulkPushNotifications(
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<void> {
  for (const token of tokens) {
    await sendPushNotification({ token, title, body, data });
  }
}
