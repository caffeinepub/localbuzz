import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, RefreshCw, AlertCircle, CheckCircle, XCircle, Info } from 'lucide-react';
import { useLocationPermission } from '../hooks/useLocationPermission';
import { usePersistLastKnownLocation } from '../hooks/usePersistLastKnownLocation';

export default function LocationStatusCard() {
  const { status, coordinates, errorType, errorMessage, isLoading, requestPermission, refreshLocation } =
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
      case 'prompt':
        return (
          <Badge variant="secondary" className="gap-1">
            <Info className="h-3 w-3" />
            Ready to Enable
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

  const getDescriptionText = () => {
    if (status === 'granted') {
      return 'Your location is being tracked';
    }
    if (status === 'denied') {
      return 'Location permission is required for this feature';
    }
    return 'Grant location permission to use location features';
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
        <CardDescription>{getDescriptionText()}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Not requested or prompt state - show enable button */}
        {(status === 'not-requested' || status === 'prompt') && (
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

        {/* Denied state - show guidance and retry */}
        {status === 'denied' && (
          <div className="space-y-3">
            <div className="rounded-lg bg-destructive/10 p-4 space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="space-y-2 flex-1">
                  <p className="text-sm font-medium text-destructive">
                    Location Access Denied
                  </p>
                  <p className="text-sm text-destructive/90">
                    To enable location access:
                  </p>
                  <ol className="text-sm text-destructive/90 list-decimal list-inside space-y-1 ml-2">
                    <li>Click the lock icon in your browser's address bar</li>
                    <li>Find "Location" in the permissions list</li>
                    <li>Change the setting to "Allow"</li>
                    <li>Click the button below to try again</li>
                  </ol>
                </div>
              </div>
            </div>
            <Button
              onClick={requestPermission}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Trying Again...
                </>
              ) : (
                <>
                  <MapPin className="mr-2 h-4 w-4" />
                  Try Again
                </>
              )}
            </Button>
          </div>
        )}

        {/* Error messages for timeout and unavailable (not permission denied) */}
        {errorType && errorType !== 'permission-denied' && errorMessage && (
          <div className="space-y-3">
            <div className="rounded-lg bg-warning/10 border border-warning/20 p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                <div className="space-y-1 flex-1">
                  <p className="text-sm font-medium text-warning">
                    {errorType === 'timeout' && 'Location Request Timed Out'}
                    {errorType === 'position-unavailable' && 'Location Unavailable'}
                    {errorType === 'unsupported' && 'Location Not Supported'}
                  </p>
                  <p className="text-sm text-muted-foreground">{errorMessage}</p>
                </div>
              </div>
            </div>
            <Button
              onClick={requestPermission}
              disabled={isLoading}
              variant="outline"
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry
                </>
              )}
            </Button>
          </div>
        )}

        {/* Granted state - show coordinates and refresh */}
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
