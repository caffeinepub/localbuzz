import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Shop } from '../backend';

/**
 * React Query hooks for customer favorites operations:
 * - Query caller's favorite shops list
 * - Mutation to favorite a shop
 * - Mutation to unfavorite a shop
 * All hooks properly invalidate caches and expose loading states for UI.
 */

export function useGetCustomerFavorites() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Shop[]>({
    queryKey: ['customerFavorites'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCustomerFavorites();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function useFavoriteShop() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (shopId: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.favoriteShop(shopId);
    },
    onSuccess: () => {
      // Invalidate favorites list to refetch
      queryClient.invalidateQueries({ queryKey: ['customerFavorites'] });
    },
  });
}

export function useUnfavoriteShop() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (shopId: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.unfavoriteShop(shopId);
    },
    onSuccess: () => {
      // Invalidate favorites list to refetch
      queryClient.invalidateQueries({ queryKey: ['customerFavorites'] });
    },
  });
}

export function useIsShopFavorited(shopId: string | null) {
  const { data: favorites } = useGetCustomerFavorites();

  if (!shopId || !favorites) return false;

  return favorites.some((shop) => shop.shopId === shopId);
}
