import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, Location, UserRole } from '../backend';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ phoneNumber, role }: { phoneNumber: string; role: UserRole }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(phoneNumber, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useSetLastKnownLocation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (location: Location) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setLastKnownLocation(location);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['lastKnownLocation'] });
    },
  });
}

export function useGetLastKnownLocation() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Location | null>({
    queryKey: ['lastKnownLocation'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getLastKnownLocation();
    },
    enabled: !!actor && !actorFetching,
  });
}
