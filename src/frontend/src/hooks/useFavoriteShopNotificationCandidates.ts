import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { calculateDistance } from '../utils/geo';
import type { Coordinates } from './useLocationPermission';
import { useGetCustomerFavorites } from './useCustomerFavorites';
import type { FeedItemWithDistance } from './useCustomerHomeFeed';

/**
 * Fetch additional notification candidates from favorited shops
 * beyond the 3 km feed radius (up to 10 km for favorites).
 * Returns empty array if location is unavailable or no favorites exist.
 */

const FAVORITE_NOTIFICATION_RADIUS_KM = 10.0;
const FEED_RADIUS_KM = 3.0;

export function useFavoriteShopNotificationCandidates(
  coordinates: Coordinates | null,
  notificationsEnabled: boolean
) {
  const { actor, isFetching: actorFetching } = useActor();
  const { data: favorites } = useGetCustomerFavorites();

  return useQuery<FeedItemWithDistance[]>({
    queryKey: [
      'favoriteShopNotificationCandidates',
      coordinates?.latitude,
      coordinates?.longitude,
      favorites?.map((f) => f.shopId).join(','),
    ],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      if (!coordinates) return [];
      if (!favorites || favorites.length === 0) return [];

      // Call backend with coordinates - backend filters to active, unexpired, within 3km
      const feedUpdates = await actor.getCustomerHomeFeed(coordinates.latitude, coordinates.longitude);

      // Get favorite shop IDs
      const favoriteShopIds = new Set(favorites.map((shop) => shop.shopId));

      // Filter to favorite shops only, compute distance, filter to favorite radius but outside feed radius
      const favoriteCandidates = feedUpdates
        .filter((update) => favoriteShopIds.has(update.shopId))
        .map((update) => {
          const distance = calculateDistance(
            coordinates.latitude,
            coordinates.longitude,
            update.location.latitude,
            update.location.longitude
          );

          return {
            ...update,
            distance,
          };
        })
        .filter(
          (update) =>
            update.distance > FEED_RADIUS_KM && update.distance <= FAVORITE_NOTIFICATION_RADIUS_KM
        );

      return favoriteCandidates;
    },
    enabled: !!actor && !actorFetching && !!coordinates && notificationsEnabled && !!favorites,
    retry: false,
  });
}
