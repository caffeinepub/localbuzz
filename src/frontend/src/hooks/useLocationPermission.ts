import { useState, useEffect, useCallback } from 'react';

export type LocationPermissionStatus = 'not-requested' | 'denied' | 'granted';

export interface Coordinates {
  latitude: number;
  longitude: number;
  timestamp: number;
}

export function useLocationPermission() {
  const [status, setStatus] = useState<LocationPermissionStatus>('not-requested');
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const requestPermission = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setStatus('denied');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      setCoordinates({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        timestamp: position.timestamp,
      });
      setStatus('granted');
    } catch (err: any) {
      if (err.code === 1) {
        setStatus('denied');
        setError('Location permission denied');
      } else if (err.code === 2) {
        setStatus('denied');
        setError('Location unavailable');
      } else if (err.code === 3) {
        setStatus('denied');
        setError('Location request timed out');
      } else {
        setStatus('denied');
        setError('Failed to get location');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshLocation = useCallback(async () => {
    if (status !== 'granted') return;
    await requestPermission();
  }, [status, requestPermission]);

  return {
    status,
    coordinates,
    error,
    isLoading,
    requestPermission,
    refreshLocation,
  };
}
