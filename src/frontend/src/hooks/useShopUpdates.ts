import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useGetShopsByOwner } from './useShop';
import type { ShopUpdate, Time } from '../backend';
import { ExternalBlob } from '../backend';

export function useGetAllShopUpdatesForShop() {
  const { actor, isFetching: actorFetching } = useActor();
  const { data: shops, isLoading: shopsLoading } = useGetShopsByOwner();

  const shopId = shops && shops.length > 0 ? shops[0].shopId : null;

  return useQuery<ShopUpdate[]>({
    queryKey: ['shopUpdates', shopId],
    queryFn: async () => {
      if (!actor || !shopId) return [];
      return actor.getAllShopUpdatesForShop(shopId);
    },
    enabled: !!actor && !actorFetching && !!shopId && !shopsLoading,
  });
}

export function useGetExpiredUpdatesForShop() {
  const { actor, isFetching: actorFetching } = useActor();
  const { data: shops, isLoading: shopsLoading } = useGetShopsByOwner();

  const shopId = shops && shops.length > 0 ? shops[0].shopId : null;

  return useQuery<ShopUpdate[]>({
    queryKey: ['shopUpdates', 'expired', shopId],
    queryFn: async () => {
      if (!actor || !shopId) return [];
      const expired = await actor.getExpiredUpdatesForShop(shopId);
      // Defensive client-side sort to ensure expiredAt descending with nulls last
      return expired.sort((a, b) => {
        if (a.expiredAt && b.expiredAt) {
          return Number(b.expiredAt - a.expiredAt);
        }
        if (!a.expiredAt && b.expiredAt) return 1;
        if (a.expiredAt && !b.expiredAt) return -1;
        return 0;
      });
    },
    enabled: !!actor && !actorFetching && !!shopId && !shopsLoading,
  });
}

export function useGetShopUpdate(updateId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ShopUpdate | null>({
    queryKey: ['shopUpdate', updateId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getShopUpdate(updateId);
    },
    enabled: !!actor && !actorFetching && !!updateId,
  });
}

export function useCreateShopUpdate() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { data: shops } = useGetShopsByOwner();

  return useMutation({
    mutationFn: async ({
      title,
      description,
      image,
      expiryDate,
    }: {
      title: string;
      description?: string;
      image?: ExternalBlob;
      expiryDate: Time;
    }) => {
      if (!actor) throw new Error('Actor not available');
      if (!shops || shops.length === 0) {
        throw new Error('No shop found. Please register a shop first.');
      }

      const shopId = shops[0].shopId;
      return actor.createShopUpdate(
        shopId,
        title,
        description ?? null,
        image ?? null,
        expiryDate
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopUpdates'] });
    },
  });
}

export function useUpdateShopUpdate() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      updateId,
      title,
      description,
      image,
      expiryDate,
    }: {
      updateId: string;
      title: string;
      description?: string;
      image?: ExternalBlob;
      expiryDate: Time;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateShopUpdate(
        updateId,
        title,
        description ?? null,
        image ?? null,
        expiryDate
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopUpdates'] });
    },
  });
}

export function useDeleteShopUpdate() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updateId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteShopUpdate(updateId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopUpdates'] });
    },
  });
}
