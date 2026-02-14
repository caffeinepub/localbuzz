import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { Shop, GeoPoint } from '../backend';
import { ExternalBlob } from '../backend';

export function useGetShopsByOwner() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Shop[]>({
    queryKey: ['shops', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getShopsByOwner(identity.getPrincipal());
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useGetShopById(shopId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Shop | null>({
    queryKey: ['shop', shopId],
    queryFn: async () => {
      if (!actor || !shopId) return null;
      return actor.getShopById(shopId);
    },
    enabled: !!actor && !actorFetching && !!shopId,
  });
}

export function useRegisterShop() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      shopName,
      category,
      address,
      location,
      shopImage,
    }: {
      shopName: string;
      category: string;
      address: string;
      location: GeoPoint;
      shopImage: ExternalBlob;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.registerShop(shopName, category, address, location, shopImage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shops'] });
    },
  });
}

export function useUpdateShop() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      shopId,
      shopName,
      category,
      address,
      location,
      shopImage,
    }: {
      shopId: string;
      shopName: string;
      category: string;
      address: string;
      location: GeoPoint;
      shopImage: ExternalBlob;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateShop(shopId, shopName, category, address, location, shopImage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shops'] });
    },
  });
}

export function useSetShopOpenStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ shopId, isOpen }: { shopId: string; isOpen: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setShopOpenStatus(shopId, isOpen);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shops'] });
    },
  });
}
