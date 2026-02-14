/**
 * LocalStorage utilities for managing notification state, including:
 * - User opt-in status
 * - Timestamp when notifications were enabled (baseline for new updates)
 * - Set of notified notification IDs (prevent duplicates)
 * - Per-shop-per-day notification counters (rate limiting - legacy, now handled by backend)
 */

const STORAGE_KEYS = {
  OPT_IN: 'localbuzz_notifications_opt_in',
  ENABLED_AT: 'localbuzz_notifications_enabled_at',
  NOTIFIED_IDS: 'localbuzz_notified_update_ids',
  NOTIFIED_NOTIFICATION_IDS: 'localbuzz_notified_notification_ids',
  SHOP_DAILY_COUNTS: 'localbuzz_shop_daily_counts',
} as const;

// User opt-in state
export function getNotificationOptIn(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEYS.OPT_IN) === 'true';
  } catch {
    return false;
  }
}

export function setNotificationOptIn(enabled: boolean): void {
  try {
    if (enabled) {
      localStorage.setItem(STORAGE_KEYS.OPT_IN, 'true');
      // Set baseline timestamp when first enabled
      if (!getNotificationsEnabledAt()) {
        setNotificationsEnabledAt(Date.now());
      }
    } else {
      localStorage.removeItem(STORAGE_KEYS.OPT_IN);
    }
  } catch (error) {
    console.error('Failed to set notification opt-in:', error);
  }
}

// Baseline timestamp (when notifications were enabled)
export function getNotificationsEnabledAt(): number | null {
  try {
    const value = localStorage.getItem(STORAGE_KEYS.ENABLED_AT);
    return value ? parseInt(value, 10) : null;
  } catch {
    return null;
  }
}

export function setNotificationsEnabledAt(timestamp: number): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ENABLED_AT, timestamp.toString());
  } catch (error) {
    console.error('Failed to set notifications enabled timestamp:', error);
  }
}

// Notified update IDs (prevent duplicates - legacy)
export function getNotifiedUpdateIds(): Set<string> {
  try {
    const value = localStorage.getItem(STORAGE_KEYS.NOTIFIED_IDS);
    return value ? new Set(JSON.parse(value)) : new Set();
  } catch {
    return new Set();
  }
}

export function addNotifiedUpdateId(updateId: string): void {
  try {
    const ids = getNotifiedUpdateIds();
    ids.add(updateId);
    localStorage.setItem(STORAGE_KEYS.NOTIFIED_IDS, JSON.stringify([...ids]));
  } catch (error) {
    console.error('Failed to add notified update ID:', error);
  }
}

// Notified notification IDs (prevent duplicates by backend notification id)
export function getNotifiedNotificationIds(): Set<string> {
  try {
    const value = localStorage.getItem(STORAGE_KEYS.NOTIFIED_NOTIFICATION_IDS);
    return value ? new Set(JSON.parse(value)) : new Set();
  } catch {
    return new Set();
  }
}

export function addNotifiedNotificationId(notificationId: string): void {
  try {
    const ids = getNotifiedNotificationIds();
    ids.add(notificationId);
    // Keep only the last 1000 notification IDs to prevent unbounded growth
    const idsArray = [...ids];
    const trimmedIds = idsArray.slice(-1000);
    localStorage.setItem(STORAGE_KEYS.NOTIFIED_NOTIFICATION_IDS, JSON.stringify(trimmedIds));
  } catch (error) {
    console.error('Failed to add notified notification ID:', error);
  }
}

// Per-shop-per-day counters (rate limiting - legacy, now handled by backend)
interface ShopDailyCounts {
  [key: string]: number; // key format: "shopId_YYYY-MM-DD"
}

function getTodayKey(shopId: string): string {
  const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format
  return `${shopId}_${today}`;
}

export function getShopDailyCount(shopId: string): number {
  try {
    const value = localStorage.getItem(STORAGE_KEYS.SHOP_DAILY_COUNTS);
    const counts: ShopDailyCounts = value ? JSON.parse(value) : {};
    const key = getTodayKey(shopId);
    return counts[key] || 0;
  } catch {
    return 0;
  }
}

export function incrementShopDailyCount(shopId: string): void {
  try {
    const value = localStorage.getItem(STORAGE_KEYS.SHOP_DAILY_COUNTS);
    const counts: ShopDailyCounts = value ? JSON.parse(value) : {};
    const key = getTodayKey(shopId);
    
    // Clean up old entries (keep only today's data)
    const today = new Date().toLocaleDateString('en-CA');
    const cleanedCounts: ShopDailyCounts = {};
    Object.keys(counts).forEach((k) => {
      if (k.endsWith(today)) {
        cleanedCounts[k] = counts[k];
      }
    });
    
    // Increment today's count
    cleanedCounts[key] = (cleanedCounts[key] || 0) + 1;
    
    localStorage.setItem(STORAGE_KEYS.SHOP_DAILY_COUNTS, JSON.stringify(cleanedCounts));
  } catch (error) {
    console.error('Failed to increment shop daily count:', error);
  }
}

export function canNotifyShop(shopId: string, maxPerDay: number = 3): boolean {
  return getShopDailyCount(shopId) < maxPerDay;
}
