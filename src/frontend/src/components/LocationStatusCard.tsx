import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Loader2, AlertCircle, CheckCircle, MapPinOff } from 'lucide-react';
import type { LocationPermissionStatus, Coordinates, GeolocationErrorType } from '../hooks/useLocationPermission';

interface LocationStatusCardProps {
  status: LocationPermissionStatus;
  coordinates: Coordinates | null;
  errorType: GeolocationErrorType;
  errorMessage: string | null;
  isLoading: boolean;
  requestPermission: () => Promise<void>;
  refreshLocation: () => Promise<void>;
}

export default function LocationStatusCard({
  status,
  coordinates,
  errorType,
  errorMessage,
  isLoading,
  requestPermission,
  refreshLocation,
}: LocationStatusCardProps) {
  // Not requested yet
  if (status === 'prompt') {
    return (
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5 text-primary" />
            Location Access
          </CardTitle>
          <CardDescription className="text-base">
            Enable location to discover nearby shops and updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={requestPermission}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Requesting...
              </>
            ) : (
              <>
                <MapPin className="mr-2 h-5 w-5" />
                Enable Location
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Permission denied
  if (status === 'denied') {
    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPinOff className="h-5 w-5 text-destructive" />
            Location Blocked
          </CardTitle>
          <CardDescription className="text-base">
            Location access is blocked. To enable it:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Open your browser settings</li>
            <li>Find Site Settings or Permissions</li>
            <li>Allow location access for this site</li>
            <li>Refresh the page</li>
          </ol>
        </CardContent>
      </Card>
    );
  }

  // Permission granted
  if (status === 'granted') {
    return (
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CheckCircle className="h-5 w-5 text-primary" />
            Location Enabled
          </CardTitle>
          <CardDescription className="text-base">
            {coordinates
              ? `Latitude: ${coordinates.latitude.toFixed(4)}, Longitude: ${coordinates.longitude.toFixed(4)}`
              : 'Getting your location...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={refreshLocation}
            disabled={isLoading}
            variant="outline"
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <MapPin className="mr-2 h-5 w-5" />
                Refresh Location
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (errorMessage) {
    const isTimeout = errorType === 'timeout';
    const isUnavailable = errorType === 'position-unavailable';

    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Location Error
          </CardTitle>
          <CardDescription className="text-base">{errorMessage}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={isTimeout || isUnavailable ? refreshLocation : requestPermission}
            disabled={isLoading}
            variant="outline"
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Retrying...
              </>
            ) : (
              'Try Again'
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return null;
}
