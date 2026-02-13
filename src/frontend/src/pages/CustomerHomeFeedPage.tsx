import { useState } from 'react';
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

export default function CustomerHomeFeedPage() {
  const [selectedCategory, setSelectedCategory] = useState<ShopCategory | null>(null);
  const [notificationOptIn, setNotificationOptInState] = useState(getNotificationOptIn());
  
  const { status, coordinates, isLoading: locationLoading } = useLocationPermission();
  const { data: feedItems, isLoading: feedLoading, isFetched } = useCustomerHomeFeed(coordinates, selectedCategory);
  const { status: notificationStatus, isSupported: notificationSupported, requestPermission } = useNotificationPermission();

  const showFeed = status === 'granted' && coordinates;
  const isLoadingFeed = locationLoading || feedLoading;

  // Wire up notification hook
  useShopUpdateNotifications(feedItems, notificationStatus === 'granted');

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
      await requestPermission();
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

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <ShoppingBag className="h-8 w-8 text-primary" />
          Discover Local
        </h1>
        <p className="text-muted-foreground">Find amazing deals from businesses near you</p>
      </div>

      {/* Location Card */}
      <LocationStatusCard />

      {/* Notifications Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <NotificationIcon className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>{notificationInfo.message}</CardDescription>
        </CardHeader>
        <CardContent>
          {notificationSupported && notificationStatus !== 'denied' && (
            <Button
              onClick={handleEnableNotifications}
              variant={notificationOptIn && notificationStatus === 'granted' ? 'outline' : 'default'}
              className="w-full"
            >
              {notificationStatus === 'granted' && notificationOptIn ? (
                <>
                  <BellOff className="mr-2 h-4 w-4" />
                  Disable Notifications
                </>
              ) : (
                <>
                  <Bell className="mr-2 h-4 w-4" />
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
          <h2 className="text-lg font-semibold">Filter by Category</h2>
          {selectedCategory && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearCategory}
              className="h-8 px-2 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
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
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
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
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Nearby Updates
          {selectedCategory && (
            <span className="text-sm font-normal text-muted-foreground">
              ({selectedCategory})
            </span>
          )}
        </h2>

        {/* Loading State */}
        {isLoadingFeed && (
          <Card className="bg-muted/50">
            <CardHeader>
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
              <CardDescription className="text-center">
                {locationLoading ? 'Getting your location...' : 'Loading nearby updates...'}
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* No Location Permission */}
        {!showFeed && !isLoadingFeed && (
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle>Location Required</CardTitle>
              <CardDescription>
                Enable location access above to discover updates from local businesses within 3 km
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Feed Items */}
        {showFeed && !isLoadingFeed && isFetched && (
          <>
            {feedItems && feedItems.length > 0 ? (
              <div className="space-y-4">
                {feedItems.map((update) => (
                  <ShopUpdatePostCard key={update.updateId} update={update} />
                ))}
              </div>
            ) : (
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle>No Nearby Updates</CardTitle>
                  <CardDescription>
                    {selectedCategory
                      ? `There are no active ${selectedCategory} updates from shops within 3 km of your location. Try a different category or check back later!`
                      : 'There are no active updates from shops within 3 km of your location. Check back later!'}
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Coming Soon */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            Exciting features to enhance your shopping experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Browse local shop catalogs</li>
            <li>• Exclusive deals and offers</li>
            <li>• Save your favorite shops</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
