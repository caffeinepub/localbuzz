import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, MapPin, Search, Filter } from 'lucide-react';
import LocationStatusCard from '../components/LocationStatusCard';

export default function CustomerHomeFeedPage() {
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

      {/* Categories */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Browse Categories</h2>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="px-4 py-2 text-sm cursor-pointer hover:bg-secondary/80">
            Food & Dining
          </Badge>
          <Badge variant="secondary" className="px-4 py-2 text-sm cursor-pointer hover:bg-secondary/80">
            Retail
          </Badge>
          <Badge variant="secondary" className="px-4 py-2 text-sm cursor-pointer hover:bg-secondary/80">
            Services
          </Badge>
          <Badge variant="secondary" className="px-4 py-2 text-sm cursor-pointer hover:bg-secondary/80">
            Health & Beauty
          </Badge>
          <Badge variant="secondary" className="px-4 py-2 text-sm cursor-pointer hover:bg-secondary/80">
            Entertainment
          </Badge>
        </div>
      </div>

      {/* Nearby Shops Placeholder */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Shops Near You
        </h2>
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle>No shops found</CardTitle>
            <CardDescription>
              Enable location access to discover local businesses around you
            </CardDescription>
          </CardHeader>
        </Card>
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
            <li>• Real-time notifications</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
