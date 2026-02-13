import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Store, Plus, Edit, Calendar, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useGetCallerShop } from '../hooks/useShop';
import { useGetShopUpdates } from '../hooks/useShopUpdates';
import ShopOpenClosedToggle from '../components/ShopOpenClosedToggle';
import { isActive, formatTime } from '../utils/time';

export default function ShopDashboardPage() {
  const navigate = useNavigate();
  const { data: shop, isLoading: shopLoading } = useGetCallerShop();
  const { data: updates, isLoading: updatesLoading } = useGetShopUpdates();
  const [isShopOpen, setIsShopOpen] = useState(true);

  const handleRegisterShop = () => {
    navigate({ to: '/shop-registration' });
  };

  const handlePostUpdate = () => {
    navigate({ to: '/shop-post-update' });
  };

  const hasShop = !shopLoading && !!shop;

  // Split updates into active and expired
  const activeUpdates = updates?.filter((update) => isActive(update.expiryDate)) || [];
  const expiredUpdates = updates?.filter((update) => !isActive(update.expiryDate)) || [];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Store className="h-8 w-8 text-primary" />
          Shop Dashboard
        </h1>
        <p className="text-muted-foreground">Manage your business and reach local customers</p>
      </div>

      {/* Shop Registration CTA or Edit Button */}
      {!shopLoading && !shop && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" />
              Get Started
            </CardTitle>
            <CardDescription>
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
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5 text-primary" />
                  {shop.name}
                </CardTitle>
                <CardDescription>{shop.category}</CardDescription>
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
            <p className="text-xs text-muted-foreground text-center mt-2">
              Register your shop to post updates
            </p>
          )}
        </CardContent>
      </Card>

      {/* Open/Closed Toggle */}
      <Card>
        <CardHeader>
          <CardTitle>Shop Status</CardTitle>
          <CardDescription>Let customers know if you're open or closed</CardDescription>
        </CardHeader>
        <CardContent>
          <ShopOpenClosedToggle
            isOpen={isShopOpen}
            onChange={setIsShopOpen}
            disabled={!hasShop}
          />
          {!hasShop && !shopLoading && (
            <p className="text-xs text-muted-foreground text-center mt-2">
              Register your shop to update status
            </p>
          )}
        </CardContent>
      </Card>

      {/* My Active Posts */}
      <Card>
        <CardHeader>
          <CardTitle>My Active Posts</CardTitle>
          <CardDescription>Updates currently visible to customers</CardDescription>
        </CardHeader>
        <CardContent>
          {updatesLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Loading updates...</p>
            </div>
          ) : activeUpdates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No active posts yet</p>
              <p className="text-sm mt-1">Click "Post Update" to create your first post</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeUpdates.map((update, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                >
                  <div className="flex gap-3">
                    {update.image && (
                      <div className="flex-shrink-0 w-20 h-20 rounded-md overflow-hidden bg-muted">
                        <img
                          src={update.image.getDirectURL()}
                          alt={update.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{update.title}</h3>
                      {update.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {update.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Expires: {formatTime(update.expiryDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expired Posts */}
      <Card>
        <CardHeader>
          <CardTitle>Expired Posts</CardTitle>
          <CardDescription>Past updates no longer visible to customers</CardDescription>
        </CardHeader>
        <CardContent>
          {updatesLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Loading updates...</p>
            </div>
          ) : expiredUpdates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No expired posts</p>
            </div>
          ) : (
            <div className="space-y-3">
              {expiredUpdates.map((update, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border bg-muted/30 opacity-75"
                >
                  <div className="flex gap-3">
                    {update.image && (
                      <div className="flex-shrink-0 w-20 h-20 rounded-md overflow-hidden bg-muted">
                        <img
                          src={update.image.getDirectURL()}
                          alt={update.title}
                          className="w-full h-full object-cover grayscale"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{update.title}</h3>
                      {update.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {update.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Expired: {formatTime(update.expiryDate)}
                        </span>
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
