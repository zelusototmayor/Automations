/**
 * Push Notification Service
 * Sends push notifications via Expo Push API
 */

import { prisma } from './database';

// Expo Push API endpoint
const EXPO_PUSH_API_URL = 'https://exp.host/--/api/v2/push/send';

// Types for push notifications
interface ExpoPushMessage {
  to: string;
  title?: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: 'default' | null;
  badge?: number;
  channelId?: string;
  priority?: 'default' | 'normal' | 'high';
  ttl?: number;
}

interface ExpoPushTicket {
  id?: string;
  status: 'ok' | 'error';
  message?: string;
  details?: {
    error?: 'DeviceNotRegistered' | 'InvalidCredentials' | 'MessageTooBig' | 'MessageRateExceeded';
  };
}

interface ExpoPushReceipt {
  status: 'ok' | 'error';
  message?: string;
  details?: {
    error?: 'DeviceNotRegistered' | 'InvalidCredentials' | 'MessageTooBig' | 'MessageRateExceeded';
  };
}

export interface NotificationPayload {
  title: string;
  body: string;
  data?: {
    agentId?: string;
    conversationId?: string;
    type?: 'reminder' | 'commitment' | 'insight' | 'general';
    [key: string]: unknown;
  };
}

/**
 * Send a push notification to a single user
 */
export async function sendPushNotification(
  userId: string,
  payload: NotificationPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get user's push token
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { pushToken: true },
    });

    if (!user?.pushToken) {
      return { success: false, error: 'No push token registered' };
    }

    const message: ExpoPushMessage = {
      to: user.pushToken,
      title: payload.title,
      body: payload.body,
      data: payload.data,
      sound: 'default',
      priority: 'high',
    };

    const response = await fetch(EXPO_PUSH_API_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Expo Push API error:', errorText);
      return { success: false, error: 'Push API request failed' };
    }

    const result = await response.json() as { data: ExpoPushTicket };
    const ticket = result.data;

    if (ticket.status === 'error') {
      // Handle invalid token
      if (ticket.details?.error === 'DeviceNotRegistered') {
        // Remove invalid token from database
        await prisma.user.update({
          where: { id: userId },
          data: { pushToken: null, pushTokenUpdatedAt: null },
        });
        return { success: false, error: 'Device not registered' };
      }
      return { success: false, error: ticket.message || 'Push notification failed' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending push notification:', error);
    return { success: false, error: 'Internal error' };
  }
}

/**
 * Send push notifications to multiple users (batch)
 */
export async function sendBatchPushNotifications(
  userIds: string[],
  payload: NotificationPayload
): Promise<{ sent: number; failed: number; errors: string[] }> {
  const results = { sent: 0, failed: 0, errors: [] as string[] };

  // Get all users' push tokens
  const users = await prisma.user.findMany({
    where: {
      id: { in: userIds },
      pushToken: { not: null },
    },
    select: { id: true, pushToken: true },
  });

  if (users.length === 0) {
    return { sent: 0, failed: userIds.length, errors: ['No valid push tokens'] };
  }

  // Build batch messages
  const messages: ExpoPushMessage[] = users.map((user) => ({
    to: user.pushToken!,
    title: payload.title,
    body: payload.body,
    data: payload.data,
    sound: 'default',
    priority: 'high',
  }));

  // Expo recommends batches of max 100 messages
  const BATCH_SIZE = 100;
  const batches: ExpoPushMessage[][] = [];
  for (let i = 0; i < messages.length; i += BATCH_SIZE) {
    batches.push(messages.slice(i, i + BATCH_SIZE));
  }

  // Send each batch
  for (const batch of batches) {
    try {
      const response = await fetch(EXPO_PUSH_API_URL, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(batch),
      });

      if (!response.ok) {
        results.failed += batch.length;
        results.errors.push('Batch request failed');
        continue;
      }

      const result = await response.json() as { data: ExpoPushTicket[] };
      const tickets = result.data;

      // Process tickets
      const invalidTokens: string[] = [];
      for (let i = 0; i < tickets.length; i++) {
        const ticket = tickets[i];
        if (ticket.status === 'ok') {
          results.sent++;
        } else {
          results.failed++;
          if (ticket.details?.error === 'DeviceNotRegistered') {
            invalidTokens.push(batch[i].to);
          }
        }
      }

      // Clean up invalid tokens
      if (invalidTokens.length > 0) {
        await prisma.user.updateMany({
          where: { pushToken: { in: invalidTokens } },
          data: { pushToken: null, pushTokenUpdatedAt: null },
        });
      }
    } catch (error) {
      results.failed += batch.length;
      results.errors.push(`Batch error: ${error}`);
    }
  }

  return results;
}

/**
 * Check if a push token is valid Expo format
 */
export function isValidExpoPushToken(token: string): boolean {
  return token.startsWith('ExponentPushToken[') && token.endsWith(']');
}

/**
 * Send a reminder notification about a coaching commitment
 */
export async function sendCommitmentReminder(
  userId: string,
  commitment: string,
  agentId: string,
  conversationId?: string
): Promise<{ success: boolean; error?: string }> {
  return sendPushNotification(userId, {
    title: 'Time to check in!',
    body: commitment.length > 100 ? commitment.substring(0, 97) + '...' : commitment,
    data: {
      type: 'commitment',
      agentId,
      conversationId,
    },
  });
}

/**
 * Send a general coaching nudge
 */
export async function sendCoachingNudge(
  userId: string,
  agentName: string,
  agentId: string,
  conversationId?: string
): Promise<{ success: boolean; error?: string }> {
  const nudgeMessages = [
    `${agentName} is here to help when you're ready`,
    `Ready to continue your journey with ${agentName}?`,
    `${agentName} has some thoughts to share`,
    `Time for a quick check-in with ${agentName}?`,
  ];

  const randomMessage = nudgeMessages[Math.floor(Math.random() * nudgeMessages.length)];

  return sendPushNotification(userId, {
    title: 'Your Coach',
    body: randomMessage,
    data: {
      type: 'reminder',
      agentId,
      conversationId,
    },
  });
}
