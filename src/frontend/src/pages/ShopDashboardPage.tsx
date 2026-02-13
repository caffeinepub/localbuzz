import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Store, Plus, BarChart3, Package } from 'lucide-react';
import LocationStatusCard from '../components/LocationStatusCard';

export default function ShopDashboardPage() {
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

      {/* Location Card */}
      <LocationStatusCard />

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage your shop and products</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <Button className="w-full justify-start" size="lg" variant="outline">
            <Plus className="mr-2 h-5 w-5" />
            Add New Product
          </Button>
          <Button className="w-full justify-start" size="lg" variant="outline">
            <Package className="mr-2 h-5 w-5" />
            Manage Inventory
          </Button>
          <Button className="w-full justify-start" size="lg" variant="outline">
            <BarChart3 className="mr-2 h-5 w-5" />
            View Analytics
          </Button>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Products</CardDescription>
            <CardTitle className="text-3xl">0</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active Offers</CardDescription>
            <CardTitle className="text-3xl">0</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Customers Reached</CardDescription>
            <CardTitle className="text-3xl">0</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Coming Soon */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            More features are on the way to help you grow your business
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Product catalog management</li>
            <li>• Customer engagement tools</li>
            <li>• Analytics and insights</li>
            <li>• Promotional campaigns</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
