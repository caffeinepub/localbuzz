import { useParams, useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, MapPin, Calendar, Store, ArrowLeft, AlertCircle } from 'lucide-react';
import { useGetShopUpdate } from '../hooks/useShopUpdates';
import { useGetShopById } from '../hooks/useShop';

export default function ShopUpdateDetailPage() {
  const { updateId } = useParams({ from: '/shop-update/$updateId' });
  const navigate = useNavigate();

  const { data: shopUpdate, isLoading: updateLoading, error: updateError } = useGetShopUpdate(updateId);
  const { data: shop, isLoading: shopLoading } = useGetShopById(shopUpdate?.shopId || '');

  const isLoading = updateLoading || shopLoading;
  const hasError = updateError || (!updateLoading && !shopUpdate);

  const isActive = shopUpdate?.isActive && shopUpdate.expiryDate > BigInt(Date.now() * 1_000_000);
  const expiryDate = shopUpdate ? new Date(Number(shopUpdate.expiryDate) / 1_000_000) : null;

  const handleBack = () => {
    navigate({ to: '/customer-home' });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={handleBack} className="mb-4">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Feed
        </Button>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
            <CardDescription className="text-center text-base">
              Loading update details...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (hasError || !shopUpdate) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={handleBack} className="mb-4">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Feed
        </Button>
        <Card className="border-destructive">
          <CardHeader>
            <div className="flex items-center justify-center py-8">
              <AlertCircle className="h-12 w-12 text-destructive" />
            </div>
            <CardTitle className="text-center text-destructive">Update Not Found</CardTitle>
            <CardDescription className="text-center text-base">
              The update you're looking for could not be found or may have been removed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleBack} className="w-full" size="lg">
              Return to Feed
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={handleBack} className="mb-4">
        <ArrowLeft className="mr-2 h-5 w-5" />
        Back to Feed
      </Button>

      {/* Status Badge */}
      <div className="flex justify-center">
        <Badge
          variant={isActive ? 'default' : 'secondary'}
          className={`px-4 py-2 text-sm ${
            isActive ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
          }`}
        >
          {isActive ? 'Active' : 'Expired'}
        </Badge>
      </div>

      {/* Update Image */}
      {shopUpdate.image && (
        <Card className="overflow-hidden">
          <img
            src={shopUpdate.image.getDirectURL()}
            alt={shopUpdate.title}
            className="w-full h-64 object-cover"
          />
        </Card>
      )}

      {/* Update Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{shopUpdate.title}</CardTitle>
          {shopUpdate.description && (
            <CardDescription className="text-base mt-2 whitespace-pre-wrap">
              {shopUpdate.description}
            </CardDescription>
          )}
        </CardHeader>
      </Card>

      {/* Shop Information */}
      {shop && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" />
              Shop Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Shop Name</p>
              <p className="text-base font-medium">{shop.shopName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Category</p>
              <Badge variant="secondary" className="mt-1">
                {shop.category}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="text-base">{shop.address}</p>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="text-sm font-mono">
                  {shop.location.latitude.toFixed(6)}, {shop.location.longitude.toFixed(6)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expiry Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Expiry Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <p className="text-sm text-muted-foreground">Expires On</p>
            <p className="text-base font-medium">
              {expiryDate ? expiryDate.toLocaleString('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short',
              }) : 'Unknown'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
