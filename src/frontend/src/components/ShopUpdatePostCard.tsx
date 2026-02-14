import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Heart, Calendar } from 'lucide-react';
import { formatTime, isActive } from '../utils/time';
import { formatDistance } from '../utils/geo';
import type { FeedShopUpdate } from '../backend';

interface ShopUpdatePostCardProps {
  item: FeedShopUpdate;
  distance?: number;
  isFavorited?: boolean;
  onToggleFavorite?: (shopId: string, currentlyFavorited: boolean) => void;
  showFavoriteButton?: boolean;
}

export default function ShopUpdatePostCard({
  item,
  distance,
  isFavorited = false,
  onToggleFavorite,
  showFavoriteButton = false,
}: ShopUpdatePostCardProps) {
  const active = isActive(item.expiryDate);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(item.shopId, isFavorited);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6 space-y-4">
        {/* Header: Shop Name and Favorite Button */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-semibold text-foreground truncate">{item.shopName}</h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge variant="secondary" className="text-sm">
                {item.shopCategory}
              </Badge>
              {distance !== undefined && (
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {formatDistance(distance)}
                </span>
              )}
            </div>
          </div>
          {showFavoriteButton && onToggleFavorite && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFavoriteClick}
              className="shrink-0"
              aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart
                className={`h-5 w-5 ${
                  isFavorited ? 'fill-primary text-primary' : 'text-muted-foreground'
                }`}
              />
            </Button>
          )}
        </div>

        {/* Update Title */}
        <div>
          <h4 className="text-lg font-medium text-foreground">{item.title}</h4>
          {item.description && (
            <p className="text-base text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
          )}
        </div>

        {/* Image */}
        {item.image && (
          <div className="rounded-lg overflow-hidden">
            <img
              src={item.image.getDirectURL()}
              alt={item.title}
              className="w-full h-48 object-cover"
            />
          </div>
        )}

        {/* Footer: Expiry Status */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {active ? `Expires ${formatTime(item.expiryDate)}` : 'Expired'}
            </span>
          </div>
          {!active && (
            <Badge variant="secondary" className="text-xs">
              Expired
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
