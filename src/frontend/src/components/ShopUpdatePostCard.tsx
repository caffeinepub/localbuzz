import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock } from 'lucide-react';
import type { FeedItemWithDistance } from '../hooks/useCustomerHomeFeed';
import { formatDistance } from '../utils/geo';
import { isActive, formatTime } from '../utils/time';

interface ShopUpdatePostCardProps {
  update: FeedItemWithDistance;
}

export default function ShopUpdatePostCard({ update }: ShopUpdatePostCardProps) {
  const active = isActive(update.expiryDate);
  const expiryStatus = active ? 'Active' : 'Expired';

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      {update.image && (
        <div className="aspect-video w-full overflow-hidden bg-muted">
          <img
            src={update.image.getDirectURL()}
            alt={update.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg line-clamp-2">{update.title}</CardTitle>
            <p className="text-sm font-medium text-muted-foreground mt-1">{update.shopName}</p>
          </div>
          <Badge variant={active ? 'default' : 'secondary'} className="flex-shrink-0">
            {expiryStatus}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {update.description && (
          <p className="text-sm text-muted-foreground line-clamp-3">{update.description}</p>
        )}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>{formatDistance(update.distance)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span className="text-xs">{formatTime(update.expiryDate)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
