import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { Shop } from '../backend';
import { ExternalBlob } from '../backend';

export function useGetCallerShop() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const query = useQuery<Shop | null>({
    queryKey: ['callerShop'],
    queryFn: async () => {
      if (!actor || !identity) throw new Error('Actor or identity not available');
      // Get the caller's shop by passing their principal
      const principal = identity.getPrincipal();
      return actor.getShop(principal);
    },
    enabled: !!actor && !!identity && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && !!identity && query.isFetched,
  };
}

export function useRegisterShop() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      category,
      address,
      latitude,
      longitude,
      image,
    }: {
      name: string;
      category: string;
      address: string;
      latitude: number;
      longitude: number;
      image: ExternalBlob;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.registerShop(name, category, address, latitude, longitude, image);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerShop'] });
    },
    onError: (error: any) => {
      console.error('Failed to register shop:', error);
      throw new Error(error.message || 'Failed to register shop. Please try again.');
    },
  });
}

export function useUpdateShop() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      category,
      address,
      latitude,
      longitude,
      image,
    }: {
      name: string;
      category: string;
      address: string;
      latitude: number;
      longitude: number;
      image: ExternalBlob;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateShop(name, category, address, latitude, longitude, image);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerShop'] });
    },
    onError: (error: any) => {
      console.error('Failed to update shop:', error);
      throw new Error(error.message || 'Failed to update shop. Please try again.');
    },
  });
}
