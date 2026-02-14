import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Heart, MapPin, Loader2, X } from 'lucide-react';
import { useGetCustomerFavorites, useUnfavoriteShop } from '../hooks/useCustomerFavorites';

export default function CustomerProfilePage() {
  const { data: favorites, isLoading, error } = useGetCustomerFavorites();
  const unfavoriteMutation = useUnfavoriteShop();

  const handleRemoveFavorite = async (shopId: string) => {
    try {
      await unfavoriteMutation.mutateAsync(shopId);
    } catch (error: any) {
      console.error('Failed to remove favorite:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
          <User className="h-10 w-10 text-primary" />
          My Profile
        </h1>
        <p className="text-lg text-muted-foreground">Manage your preferences and favorite shops</p>
      </div>

      {/* Favorite Shops Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Heart className="h-5 w-5 text-primary" />
            Favorite Shops
          </CardTitle>
          <CardDescription className="text-base">
            Shops you've marked as favorites. You'll receive notifications when they post updates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">
              <p className="text-base">Failed to load favorites. Please try again.</p>
            </div>
          ) : !favorites || favorites.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Heart className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="font-medium text-lg">No favorite shops yet</p>
              <p className="text-base mt-2">
                Tap the heart icon on shop updates to add them to your favorites
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {favorites.map((shop) => (
                <div
                  key={shop.shopId}
                  className="p-4 rounded-lg border bg-white hover:shadow-sm transition-shadow"
                >
                  <div className="flex gap-3">
                    {/* Shop Image */}
                    <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-muted">
                      <img
                        src={shop.shopImage.getDirectURL()}
                        alt={shop.shopName}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Shop Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base text-foreground truncate">
                            {shop.shopName}
                          </h3>
                          <p className="text-sm text-muted-foreground">{shop.category}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFavorite(shop.shopId)}
                          disabled={unfavoriteMutation.isPending}
                          className="flex-shrink-0 h-9 w-9 p-0"
                        >
                          {unfavoriteMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <div className="flex items-start gap-1 mt-2 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{shop.address}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
