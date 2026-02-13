import { useEffect, useRef } from 'react';
import type { FeedItemWithDistance } from './useCustomerHomeFeed';
import {
  getNotificationOptIn,
  getNotificationsEnabledAt,
  getNotifiedUpdateIds,
  addNotifiedUpdateId,
  canNotifyShop,
  incrementShopDailyCount,
} from '../utils/notificationStorage';

const MAX_NOTIFICATIONS_PER_SHOP_PER_DAY = 3;

/**
 * Hook that observes the Customer Home Feed items and triggers browser notifications
 * for newly observable updates (after notifications were enabled).
 * Enforces per-shop daily rate limits and prevents duplicate notifications.
 */
export function useShopUpdateNotifications(
  feedItems: FeedItemWithDistance[] | undefined,
  permissionGranted: boolean
) {
  const previousItemsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Only proceed if user has opted in and permission is granted
    const optedIn = getNotificationOptIn();
    if (!optedIn || !permissionGranted || !feedItems) {
      return;
    }

    const enabledAt = getNotificationsEnabledAt();
    if (!enabledAt) {
      return;
    }

    const notifiedIds = getNotifiedUpdateIds();
    const currentItemIds = new Set(feedItems.map((item) => item.updateId));

    // Find new items that weren't in the previous render
    const newItems = feedItems.filter((item) => {
      // Skip if already notified
      if (notifiedIds.has(item.updateId)) {
        return false;
      }

      // Skip if was in previous render (not newly observed)
      if (previousItemsRef.current.has(item.updateId)) {
        return false;
      }

      // Only notify for updates created after notifications were enabled
      const updateTimestamp = Number(item.timestamp) / 1_000_000; // Convert nanoseconds to milliseconds
      if (updateTimestamp <= enabledAt) {
        return false;
      }

      return true;
    });

    // Trigger notifications for new items (respecting rate limits)
    newItems.forEach((item) => {
      const shopIdStr = item.shopId.toString();

      // Check rate limit
      if (!canNotifyShop(shopIdStr, MAX_NOTIFICATIONS_PER_SHOP_PER_DAY)) {
        console.log(`Rate limit reached for shop ${shopIdStr}, skipping notification`);
        return;
      }

      // Show notification
      try {
        const notificationTitle = `${item.shopName} — ${item.title}`;
        const notification = new Notification(notificationTitle, {
          body: item.description || 'New update available',
          icon: '/favicon.ico',
          tag: item.updateId, // Prevents duplicate notifications with same tag
        });

        // Mark as notified and increment counter
        addNotifiedUpdateId(item.updateId);
        incrementShopDailyCount(shopIdStr);

        // Auto-close after 5 seconds
        setTimeout(() => notification.close(), 5000);
      } catch (error) {
        console.error('Failed to show notification:', error);
      }
    });

    // Update previous items set
    previousItemsRef.current = currentItemIds;
  }, [feedItems, permissionGranted]);
}
