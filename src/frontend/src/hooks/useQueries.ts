import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, Location, UserRole, Notification, NotificationId } from '../backend';

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
    mutationFn: async ({ 
      name, 
      phoneNumber, 
      role 
    }: { 
      name?: string | null; 
      phoneNumber: string; 
      role: UserRole 
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(name ?? null, phoneNumber, role);
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

export function useGetPendingNotifications() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Notification[]>({
    queryKey: ['pendingNotifications'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getPendingNotifications();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 30000, // Poll every 30 seconds
  });
}

export function useAcknowledgeNotifications() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationIds: NotificationId[]) => {
      if (!actor) throw new Error('Actor not available');
      return actor.acknowledgeNotifications(notificationIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingNotifications'] });
    },
  });
}
