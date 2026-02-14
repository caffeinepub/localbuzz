import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { FeedShopUpdate } from '../backend';
import { calculateDistance } from '../utils/geo';
import { isActive } from '../utils/time';
import type { Coordinates } from './useLocationPermission';
import type { ShopCategory } from '../constants/shopCategories';

export interface FeedItemWithDistance extends FeedShopUpdate {
  distance: number;
}

export function useCustomerHomeFeed(coordinates: Coordinates | null, category?: ShopCategory | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<FeedItemWithDistance[]>({
    queryKey: ['customerHomeFeed', coordinates?.latitude, coordinates?.longitude, category],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      if (!coordinates) return [];

      // Call backend with coordinates - backend filters to active, unexpired, within 3km
      const feedUpdates = await actor.getCustomerHomeFeed(coordinates.latitude, coordinates.longitude);

      // Safety filter: Remove any expired items (expiryDate <= current time)
      // This ensures expired posts never appear even if scheduled job runs slightly later
      const activeUpdates = feedUpdates.filter((update) => isActive(update.expiryDate));

      // Compute distance client-side for display
      const updatesWithDistance = activeUpdates.map((update) => {
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
      });

      // Apply client-side sorting: distance ascending, then createdAt descending
      updatesWithDistance.sort((a, b) => {
        if (a.distance !== b.distance) {
          return a.distance - b.distance;
        }
        // For equal distances, sort by createdAt descending (newest first)
        return Number(b.createdAt - a.createdAt);
      });

      // Filter by category if selected (client-side, after sorting)
      const categoryFiltered = category
        ? updatesWithDistance.filter((update) => update.shopCategory === category)
        : updatesWithDistance;

      return categoryFiltered;
    },
    enabled: !!actor && !actorFetching && !!coordinates,
    retry: false,
  });
}
