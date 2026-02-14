import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, MapPin, Search, Filter, Loader2, X, Bell, BellOff } from 'lucide-react';
import LocationStatusCard from '../components/LocationStatusCard';
import ShopUpdatePostCard from '../components/ShopUpdatePostCard';
import { useLocationPermission } from '../hooks/useLocationPermission';
import { useCustomerHomeFeed } from '../hooks/useCustomerHomeFeed';
import { SHOP_CATEGORIES, type ShopCategory } from '../constants/shopCategories';
import { useNotificationPermission } from '../hooks/useNotificationPermission';
import { useShopUpdateNotifications } from '../hooks/useShopUpdateNotifications';
import { getNotificationOptIn, setNotificationOptIn } from '../utils/notificationStorage';
import { useGetCustomerFavorites, useFavoriteShop, useUnfavoriteShop } from '../hooks/useCustomerFavorites';

export default function CustomerHomeFeedPage() {
  const [selectedCategory, setSelectedCategory] = useState<ShopCategory | null>(null);
  const [notificationOptIn, setNotificationOptInState] = useState(getNotificationOptIn());
  const [hasAttemptedAutoRequest, setHasAttemptedAutoRequest] = useState(false);
  
  const locationPermission = useLocationPermission();
  const { status, coordinates, isLoading: locationLoading, requestPermission } = locationPermission;
  
  const { data: feedItems, isLoading: feedLoading, isFetched } = useCustomerHomeFeed(coordinates, selectedCategory);
  const { status: notificationStatus, isSupported: notificationSupported, requestPermission: requestNotificationPermission } = useNotificationPermission();
  const { data: favorites } = useGetCustomerFavorites();
  const favoriteMutation = useFavoriteShop();
  const unfavoriteMutation = useUnfavoriteShop();

  const showFeed = status === 'granted' && coordinates;
  const isLoadingFeed = locationLoading || feedLoading;

  // Auto-request location permission on mount when not yet requested
  useEffect(() => {
    if (!hasAttemptedAutoRequest && (status === 'not-requested' || status === 'prompt') && !coordinates) {
      setHasAttemptedAutoRequest(true);
      requestPermission();
    }
  }, [status, coordinates, hasAttemptedAutoRequest, requestPermission]);

  // Wire up notification hook with backend queue consumer
  useShopUpdateNotifications(notificationStatus === 'granted' && notificationOptIn);

  const handleCategoryClick = (category: ShopCategory) => {
    setSelectedCategory(selectedCategory === category ? null : category);
  };

  const handleClearCategory = () => {
    setSelectedCategory(null);
  };

  const handleEnableNotifications = async () => {
    if (notificationStatus === 'granted') {
      // Already granted, just toggle opt-in
      const newOptIn = !notificationOptIn;
      setNotificationOptIn(newOptIn);
      setNotificationOptInState(newOptIn);
    } else {
      // Request permission
      await requestNotificationPermission();
      // After requesting, check if permission was granted
      // The hook will update notificationStatus, so we enable opt-in
      // The next render will reflect the new permission state
      setNotificationOptIn(true);
      setNotificationOptInState(true);
    }
  };

  const getNotificationStatusMessage = () => {
    if (!notificationSupported) {
      return {
        message: 'Notifications are not supported on this device or browser.',
        variant: 'secondary' as const,
        icon: BellOff,
      };
    }

    if (notificationStatus === 'denied') {
      return {
        message: 'Notifications are blocked. Enable them in your browser settings to receive updates.',
        variant: 'secondary' as const,
        icon: BellOff,
      };
    }

    if (notificationStatus === 'granted' && notificationOptIn) {
      return {
        message: 'Notifications are enabled. You\'ll be notified of new updates from nearby shops.',
        variant: 'default' as const,
        icon: Bell,
      };
    }

    return {
      message: 'Enable notifications to get alerts when shops near you post new updates.',
      variant: 'secondary' as const,
      icon: BellOff,
    };
  };

  const notificationInfo = getNotificationStatusMessage();
  const NotificationIcon = notificationInfo.icon;

  // Helper to check if a shop is favorited
  const isShopFavorited = (shopId: string): boolean => {
    if (!favorites) return false;
    return favorites.some((shop) => shop.shopId === shopId);
  };

  // Helper to toggle favorite
  const handleToggleFavorite = async (shopId: string, currentlyFavorited: boolean) => {
    try {
      if (currentlyFavorited) {
        await unfavoriteMutation.mutateAsync(shopId);
      } else {
        await favoriteMutation.mutateAsync(shopId);
      }
    } catch (error: any) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
          <ShoppingBag className="h-10 w-10 text-primary" />
          Discover Local
        </h1>
        <p className="text-lg text-muted-foreground">Find amazing deals from businesses near you</p>
      </div>

      {/* Location Card */}
      <LocationStatusCard
        status={locationPermission.status}
        coordinates={locationPermission.coordinates}
        errorType={locationPermission.errorType}
        errorMessage={locationPermission.errorMessage}
        isLoading={locationPermission.isLoading}
        requestPermission={locationPermission.requestPermission}
        refreshLocation={locationPermission.refreshLocation}
      />

      {/* Notifications Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <NotificationIcon className="h-5 w-5 text-primary" />
            Notifications
          </CardTitle>
          <CardDescription className="text-base">{notificationInfo.message}</CardDescription>
        </CardHeader>
        <CardContent>
          {notificationSupported && notificationStatus !== 'denied' && (
            <Button
              onClick={handleEnableNotifications}
              variant={notificationOptIn && notificationStatus === 'granted' ? 'outline' : 'default'}
              className="w-full"
              size="lg"
            >
              {notificationStatus === 'granted' && notificationOptIn ? (
                <>
                  <BellOff className="mr-2 h-5 w-5" />
                  Disable Notifications
                </>
              ) : (
                <>
                  <Bell className="mr-2 h-5 w-5" />
                  Enable Notifications
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Button className="flex-1 justify-start" variant="outline" size="lg">
              <Search className="mr-2 h-5 w-5" />
              Search shops...
            </Button>
            <Button variant="outline" size="lg">
              <Filter className="h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Category Filter */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Filter by Category</h2>
          {selectedCategory && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearCategory}
              className="h-9 px-3 text-sm"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {SHOP_CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category;
            return (
              <Badge
                key={category}
                variant={isSelected ? 'default' : 'secondary'}
                className={`px-4 py-2 text-sm cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-primary text-white hover:bg-primary/90'
                    : 'hover:bg-secondary/80'
                }`}
                onClick={() => handleCategoryClick(category)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCategoryClick(category);
                  }
                }}
              >
                {category}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Nearby Updates Feed */}
      <div>
        <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
          <MapPin className="h-6 w-6 text-primary" />
          Nearby Updates
          {selectedCategory && (
            <span className="text-base font-normal text-muted-foreground">
              ({selectedCategory})
            </span>
          )}
        </h2>

        {/* Loading State */}
        {isLoadingFeed && (
          <Card className="bg-muted/30">
            <CardHeader>
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
              <CardDescription className="text-center text-base">
                {locationLoading ? 'Getting your location...' : 'Loading nearby updates...'}
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* No Location Permission */}
        {!showFeed && !isLoadingFeed && (
          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="text-lg">Location Required</CardTitle>
              <CardDescription className="text-base">
                Enable location access above to discover updates from local businesses within 3 km
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Feed Items */}
        {showFeed && !isLoadingFeed && (
          <div className="space-y-4">
            {feedItems && feedItems.length > 0 ? (
              feedItems.map((item) => (
                <ShopUpdatePostCard
                  key={item.updateId}
                  item={item}
                  distance={item.distance}
                  isFavorited={isShopFavorited(item.shopId)}
                  onToggleFavorite={handleToggleFavorite}
                  showFavoriteButton={true}
                />
              ))
            ) : (
              <Card className="bg-muted/30">
                <CardHeader>
                  <CardTitle className="text-lg">No active offers nearby.</CardTitle>
                </CardHeader>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
