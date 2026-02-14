import { useEffect, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetPendingNotifications, useAcknowledgeNotifications } from './useQueries';
import { useGetShopById } from './useShop';
import type { Notification } from '../backend';
import {
  getNotificationOptIn,
  getNotificationsEnabledAt,
  addNotifiedNotificationId,
  getNotifiedNotificationIds,
} from '../utils/notificationStorage';

/**
 * Hook that consumes backend-queued notifications, displays browser notifications,
 * and acknowledges them to prevent duplicates. Supports deep-linking to update detail.
 */
export function useShopUpdateNotifications(permissionGranted: boolean) {
  const navigate = useNavigate();
  const { data: pendingNotifications } = useGetPendingNotifications();
  const acknowledgeMutation = useAcknowledgeNotifications();
  const displayedInSessionRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Only proceed if user has opted in and permission is granted
    const optedIn = getNotificationOptIn();
    if (!optedIn || !permissionGranted) {
      return;
    }

    const enabledAt = getNotificationsEnabledAt();
    if (!enabledAt) {
      return;
    }

    if (!pendingNotifications || pendingNotifications.length === 0) {
      return;
    }

    const notifiedIds = getNotifiedNotificationIds();
    const toAcknowledge: string[] = [];

    // Process each pending notification
    pendingNotifications.forEach((notification) => {
      // Skip if already notified (persistent storage)
      if (notifiedIds.has(notification.id)) {
        return;
      }

      // Skip if already displayed in this session (transient dedupe)
      if (displayedInSessionRef.current.has(notification.id)) {
        return;
      }

      // Mark as displayed in session immediately
      displayedInSessionRef.current.add(notification.id);

      // Show browser notification
      showNotification(notification, navigate);

      // Mark as notified in persistent storage
      addNotifiedNotificationId(notification.id);

      // Queue for acknowledgment
      toAcknowledge.push(notification.id);
    });

    // Acknowledge displayed notifications
    if (toAcknowledge.length > 0) {
      acknowledgeMutation.mutate(toAcknowledge);
    }
  }, [pendingNotifications, permissionGranted, acknowledgeMutation, navigate]);
}

function showNotification(notification: Notification, navigate: any) {
  try {
    // Fetch shop name for the notification title
    // Since we can't use hooks here, we'll use the shopId directly
    // The backend should include shop name in the notification payload in the future
    // For now, we'll use a generic title format
    const notificationTitle = `New Update`;
    const notificationBody = `Check out the latest update from a shop near you!`;

    const browserNotification = new Notification(notificationTitle, {
      body: notificationBody,
      icon: '/favicon.ico',
      tag: notification.shopUpdateId,
      data: {
        updateId: notification.shopUpdateId,
      },
    });

    // Handle notification click - navigate to detail page
    browserNotification.onclick = () => {
      browserNotification.close();
      navigate({ to: `/shop-update/${notification.shopUpdateId}` });
      window.focus();
    };

    // Auto-close after 8 seconds
    setTimeout(() => browserNotification.close(), 8000);
  } catch (error) {
    console.error('Failed to show notification:', error);
  }
}
