import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Store, Plus, Edit, Calendar, Loader2 } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useGetShopsByOwner, useSetShopOpenStatus } from '../hooks/useShop';
import { useGetAllShopUpdatesForShop, useGetExpiredUpdatesForShop } from '../hooks/useShopUpdates';
import ShopOpenClosedToggle from '../components/ShopOpenClosedToggle';
import { isActive, formatTime } from '../utils/time';

export default function ShopDashboardPage() {
  const navigate = useNavigate();
  const { data: shops, isLoading: shopLoading } = useGetShopsByOwner();
  const shop = shops && shops.length > 0 ? shops[0] : null;
  const { data: updates, isLoading: updatesLoading } = useGetAllShopUpdatesForShop();
  const { data: expiredUpdates, isLoading: expiredLoading } = useGetExpiredUpdatesForShop();
  const setShopOpenStatus = useSetShopOpenStatus();

  const handleRegisterShop = () => {
    navigate({ to: '/shop-registration' });
  };

  const handlePostUpdate = () => {
    navigate({ to: '/shop-post-update' });
  };

  const handleToggleShopStatus = async (isOpen: boolean) => {
    if (!shop) return;
    
    try {
      await setShopOpenStatus.mutateAsync({ shopId: shop.shopId, isOpen });
    } catch (error: any) {
      console.error('Failed to update shop status:', error);
    }
  };

  const hasShop = !shopLoading && !!shop;

  // Filter active updates using client-side isActive check
  const activeUpdates = updates?.filter((update) => isActive(update.expiryDate)) || [];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
          <Store className="h-10 w-10 text-primary" />
          Shop Dashboard
        </h1>
        <p className="text-lg text-muted-foreground">Manage your business and reach local customers</p>
      </div>

      {/* Shop Registration CTA or Edit Button */}
      {!shopLoading && !shop && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Store className="h-5 w-5 text-primary" />
              Get Started
            </CardTitle>
            <CardDescription className="text-base">
              Register your shop to start reaching customers in your area
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleRegisterShop} className="w-full" size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Register Your Shop
            </Button>
          </CardContent>
        </Card>
      )}

      {shop && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Store className="h-6 w-6 text-primary" />
                  {shop.shopName}
                </CardTitle>
                <CardDescription className="text-base">{shop.category}</CardDescription>
              </div>
              <Button onClick={handleRegisterShop} variant="outline" size="sm">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Post Update Button */}
      <Card>
        <CardContent className="pt-6">
          <Button
            onClick={handlePostUpdate}
            className="w-full"
            size="lg"
            disabled={!hasShop}
          >
            <Plus className="mr-2 h-5 w-5" />
            Post Update
          </Button>
          {!hasShop && !shopLoading && (
            <p className="text-sm text-muted-foreground text-center mt-3">
              Register your shop to post updates
            </p>
          )}
        </CardContent>
      </Card>

      {/* Open/Closed Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Shop Status</CardTitle>
          <CardDescription className="text-base">Let customers know if you're open or closed</CardDescription>
        </CardHeader>
        <CardContent>
          <ShopOpenClosedToggle
            isOpen={shop?.isOpen ?? false}
            onChange={handleToggleShopStatus}
            disabled={!hasShop || setShopOpenStatus.isPending}
          />
          {!hasShop && !shopLoading && (
            <p className="text-sm text-muted-foreground text-center mt-3">
              Register your shop to update status
            </p>
          )}
        </CardContent>
      </Card>

      {/* My Active Posts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">My Active Posts</CardTitle>
          <CardDescription className="text-base">Updates currently visible to customers</CardDescription>
        </CardHeader>
        <CardContent>
          {updatesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : activeUpdates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-base">No active posts yet</p>
              <p className="text-sm mt-2">Click "Post Update" to create your first post</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeUpdates.map((update, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border bg-white hover:shadow-sm transition-shadow"
                >
                  <div className="flex gap-3">
                    {update.image && (
                      <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-muted">
                        <img
                          src={update.image.getDirectURL()}
                          alt={update.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base text-foreground truncate">{update.title}</h3>
                      {update.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {update.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>Expires: {formatTime(update.expiryDate)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expired Updates */}
      {expiredLoading ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Expired Updates</CardTitle>
            <CardDescription className="text-base">Past updates no longer visible to customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </CardContent>
        </Card>
      ) : expiredUpdates && expiredUpdates.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Expired Updates</CardTitle>
            <CardDescription className="text-base">Past updates no longer visible to customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expiredUpdates.map((update, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border bg-muted/30 opacity-60"
                >
                  <div className="flex gap-3">
                    {update.image && (
                      <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-muted">
                        <img
                          src={update.image.getDirectURL()}
                          alt={update.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base text-foreground truncate">{update.title}</h3>
                      {update.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {update.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>
                          Expired: {update.expiredAt ? formatTime(update.expiredAt) : formatTime(update.expiryDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
