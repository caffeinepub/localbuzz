import { useState, useEffect, useCallback } from 'react';

export type LocationPermissionStatus = 'not-requested' | 'prompt' | 'denied' | 'granted';

export interface Coordinates {
  latitude: number;
  longitude: number;
  timestamp: number;
}

export type GeolocationErrorType = 
  | 'permission-denied'
  | 'position-unavailable'
  | 'timeout'
  | 'unsupported'
  | null;

export function useLocationPermission() {
  const [status, setStatus] = useState<LocationPermissionStatus>('not-requested');
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [errorType, setErrorType] = useState<GeolocationErrorType>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check initial permission state using Permissions API
  const checkPermissionState = useCallback(async () => {
    if (!navigator.geolocation) {
      setStatus('denied');
      setErrorType('unsupported');
      setErrorMessage('Geolocation is not supported by your browser');
      return;
    }

    // Try to use Permissions API if available
    if ('permissions' in navigator) {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
        
        // Set initial state based on permission
        if (result.state === 'granted') {
          setStatus('granted');
          // Automatically fetch coordinates if already granted
          fetchCoordinates();
        } else if (result.state === 'denied') {
          setStatus('denied');
          setErrorType('permission-denied');
          setErrorMessage('Location permission has been denied. Please enable it in your browser settings.');
        } else if (result.state === 'prompt') {
          setStatus('prompt');
        }

        // Listen for permission changes
        result.addEventListener('change', () => {
          if (result.state === 'granted') {
            setStatus('granted');
            setErrorType(null);
            setErrorMessage(null);
            fetchCoordinates();
          } else if (result.state === 'denied') {
            setStatus('denied');
            setErrorType('permission-denied');
            setErrorMessage('Location permission has been denied. Please enable it in your browser settings.');
            setCoordinates(null);
          } else if (result.state === 'prompt') {
            setStatus('prompt');
            setErrorType(null);
            setErrorMessage(null);
          }
        });
      } catch (err) {
        // Permissions API not fully supported, fall back to not-requested
        setStatus('not-requested');
      }
    } else {
      // No Permissions API, default to not-requested
      setStatus('not-requested');
    }
  }, []);

  // Fetch coordinates from geolocation API
  const fetchCoordinates = useCallback(async () => {
    if (!navigator.geolocation) {
      setErrorType('unsupported');
      setErrorMessage('Geolocation is not supported by your browser');
      setStatus('denied');
      return;
    }

    setIsLoading(true);
    setErrorType(null);
    setErrorMessage(null);

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
      setErrorType(null);
      setErrorMessage(null);
    } catch (err: any) {
      // Classify error types properly
      if (err.code === 1) {
        // PERMISSION_DENIED
        setStatus('denied');
        setErrorType('permission-denied');
        setErrorMessage('Location permission was denied. Please enable location access in your browser settings and try again.');
      } else if (err.code === 2) {
        // POSITION_UNAVAILABLE
        setErrorType('position-unavailable');
        setErrorMessage('Your location is currently unavailable. Please check your device settings and try again.');
        // Don't change status to denied for unavailable position
      } else if (err.code === 3) {
        // TIMEOUT
        setErrorType('timeout');
        setErrorMessage('Location request timed out. Please try again.');
        // Don't change status to denied for timeout
      } else {
        setErrorType('unsupported');
        setErrorMessage('Failed to get your location. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Request permission (can be called from any state)
  const requestPermission = useCallback(async () => {
    await fetchCoordinates();
  }, [fetchCoordinates]);

  // Refresh location (works when granted)
  const refreshLocation = useCallback(async () => {
    if (status !== 'granted') return;
    await fetchCoordinates();
  }, [status, fetchCoordinates]);

  // Check permission state on mount
  useEffect(() => {
    checkPermissionState();
  }, [checkPermissionState]);

  return {
    status,
    coordinates,
    errorType,
    errorMessage,
    isLoading,
    requestPermission,
    refreshLocation,
  };
}
