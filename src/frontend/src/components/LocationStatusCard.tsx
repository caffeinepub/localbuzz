import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, RefreshCw, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useLocationPermission } from '../hooks/useLocationPermission';
import { usePersistLastKnownLocation } from '../hooks/usePersistLastKnownLocation';

export default function LocationStatusCard() {
  const { status, coordinates, error, isLoading, requestPermission, refreshLocation } =
    useLocationPermission();
  const { isPersisting } = usePersistLastKnownLocation(coordinates);

  const getStatusBadge = () => {
    switch (status) {
      case 'granted':
        return (
          <Badge variant="default" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            Granted
          </Badge>
        );
      case 'denied':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Denied
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            Not Requested
          </Badge>
        );
    }
  };

  const formatCoordinate = (value: number, decimals: number = 6) => {
    return value.toFixed(decimals);
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Location Access
          </CardTitle>
          {getStatusBadge()}
        </div>
        <CardDescription>
          {status === 'not-requested' && 'Grant location permission to use location features'}
          {status === 'denied' && 'Location permission is required for this feature'}
          {status === 'granted' && 'Your location is being tracked'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === 'not-requested' && (
          <Button
            onClick={requestPermission}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Requesting...
              </>
            ) : (
              <>
                <MapPin className="mr-2 h-4 w-4" />
                Enable Location
              </>
            )}
          </Button>
        )}

        {status === 'denied' && error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {status === 'granted' && coordinates && (
          <div className="space-y-3">
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">Latitude</span>
                <span className="text-sm font-mono">{formatCoordinate(coordinates.latitude)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">Longitude</span>
                <span className="text-sm font-mono">{formatCoordinate(coordinates.longitude)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-border">
                <span className="text-xs text-muted-foreground">Last Updated</span>
                <span className="text-xs">{formatTimestamp(coordinates.timestamp)}</span>
              </div>
            </div>
            <Button
              onClick={refreshLocation}
              disabled={isLoading || isPersisting}
              variant="outline"
              className="w-full"
            >
              {isLoading || isPersisting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  {isPersisting ? 'Saving...' : 'Refreshing...'}
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Location
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
