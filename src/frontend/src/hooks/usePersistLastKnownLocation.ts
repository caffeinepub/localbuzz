import { useEffect } from 'react';
import { useSetLastKnownLocation } from './useQueries';
import { useInternetIdentity } from './useInternetIdentity';
import type { Coordinates } from './useLocationPermission';

export function usePersistLastKnownLocation(coordinates: Coordinates | null) {
  const { identity } = useInternetIdentity();
  const setLocationMutation = useSetLastKnownLocation();

  useEffect(() => {
    if (!identity || !coordinates) return;

    // Convert timestamp to nanoseconds (BigInt)
    const location = {
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      timestamp: BigInt(coordinates.timestamp) * BigInt(1_000_000), // ms to ns
    };

    setLocationMutation.mutate(location);
  }, [coordinates, identity]);

  return {
    isPersisting: setLocationMutation.isPending,
    error: setLocationMutation.error,
  };
}
