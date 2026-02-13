import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { FeedShopUpdate } from '../backend';
import { calculateDistance } from '../utils/geo';
import type { Coordinates } from './useLocationPermission';
import type { ShopCategory } from '../constants/shopCategories';

export interface FeedItemWithDistance extends FeedShopUpdate {
  distance: number;
}

const RADIUS_KM = 3.0;

export function useCustomerHomeFeed(coordinates: Coordinates | null, category?: ShopCategory | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<FeedItemWithDistance[]>({
    queryKey: ['customerHomeFeed', coordinates?.latitude, coordinates?.longitude, category],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      if (!coordinates) return [];

      const allUpdates = await actor.getCustomerHomeFeed();

      // Filter by category if selected
      const categoryFiltered = category
        ? allUpdates.filter((update) => update.shopCategory === category)
        : allUpdates;

      // Filter to within 3 km and add distance
      const nearbyUpdates = categoryFiltered
        .map((update) => {
          const distance = calculateDistance(
            coordinates.latitude,
            coordinates.longitude,
            update.shopLocation.latitude,
            update.shopLocation.longitude
          );

          return {
            ...update,
            distance,
          };
        })
        .filter((update) => update.distance <= RADIUS_KM);

      // Sort by timestamp descending (newest first), then by distance ascending (closest first)
      nearbyUpdates.sort((a, b) => {
        const timeDiff = Number(b.timestamp - a.timestamp);
        if (timeDiff !== 0) return timeDiff;
        return a.distance - b.distance;
      });

      return nearbyUpdates;
    },
    enabled: !!actor && !actorFetching && !!coordinates,
    retry: false,
  });
}
