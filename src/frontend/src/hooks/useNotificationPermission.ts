import { useState, useEffect } from 'react';

export type NotificationPermissionStatus = 'unsupported' | 'default' | 'granted' | 'denied';

export interface UseNotificationPermissionResult {
  status: NotificationPermissionStatus;
  isSupported: boolean;
  requestPermission: () => Promise<void>;
}

/**
 * Hook to detect Notification API support and track browser notification permission state.
 * Provides an action to request permission via the browser prompt.
 */
export function useNotificationPermission(): UseNotificationPermissionResult {
  const [status, setStatus] = useState<NotificationPermissionStatus>(() => {
    if (!('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission as NotificationPermissionStatus;
  });

  const isSupported = 'Notification' in window;

  useEffect(() => {
    if (!isSupported) return;

    // Update status if permission changes externally
    const checkPermission = () => {
      setStatus(Notification.permission as NotificationPermissionStatus);
    };

    // Check periodically (some browsers don't fire events on permission change)
    const interval = setInterval(checkPermission, 1000);

    return () => clearInterval(interval);
  }, [isSupported]);

  const requestPermission = async () => {
    if (!isSupported) {
      console.warn('Notifications are not supported in this browser');
      return;
    }

    if (Notification.permission === 'granted') {
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setStatus(permission as NotificationPermissionStatus);
    } catch (error) {
      console.error('Failed to request notification permission:', error);
    }
  };

  return {
    status,
    isSupported,
    requestPermission,
  };
}
