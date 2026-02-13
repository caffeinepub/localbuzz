import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { ShopUpdate } from '../backend';
import { ExternalBlob } from '../backend';

export function useGetShopUpdates() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const query = useQuery<ShopUpdate[]>({
    queryKey: ['shopUpdates'],
    queryFn: async () => {
      if (!actor || !identity) throw new Error('Actor or identity not available');
      const principal = identity.getPrincipal();
      return actor.getAllShopUpdatesForShop(principal);
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

export function useCreateShopUpdate() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      description,
      image,
      expiryDate,
    }: {
      title: string;
      description: string | null;
      image: ExternalBlob | null;
      expiryDate: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      if (!identity) throw new Error('Identity not available');
      
      const shopId = identity.getPrincipal();
      return actor.createShopUpdate(shopId, title, description, image, expiryDate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopUpdates'] });
    },
    onError: (error: any) => {
      console.error('Failed to create shop update:', error);
      throw new Error(error.message || 'Failed to create update. Please try again.');
    },
  });
}
