import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Store, ShoppingBag, Loader2, ArrowRight } from 'lucide-react';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useQueries';
import { useOtpSession } from '../hooks/useOtpSession';
import { UserRole } from '../backend';

type RoleType = 'shop' | 'customer';

export default function RoleSelectionPage() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<RoleType | null>(null);
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const saveProfileMutation = useSaveCallerUserProfile();
  const { phoneNumber } = useOtpSession();

  // Redirect if user already has a role
  useEffect(() => {
    if (userProfile && isFetched) {
      // User already has a profile, redirect to appropriate page
      if (userProfile.role === UserRole.user) {
        // For now, default to customer home if role is just 'user'
        // In a real app, you'd have a more specific role field
        navigate({ to: '/customer-home' });
      }
    }
  }, [userProfile, isFetched, navigate]);

  const handleRoleSelect = async (role: RoleType) => {
    setSelectedRole(role);

    if (!phoneNumber) {
      console.error('Phone number not found');
      return;
    }

    try {
      // Save profile with role
      await saveProfileMutation.mutateAsync({
        phoneNumber,
        role: UserRole.user, // Backend uses UserRole enum
      });

      // Navigate based on selection
      if (role === 'shop') {
        navigate({ to: '/shop-dashboard' });
      } else {
        navigate({ to: '/customer-home' });
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      setSelectedRole(null);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 py-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Choose Your Role</h1>
        <p className="text-muted-foreground">How would you like to use LocalBuzz?</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Shop Owner Card */}
        <Card
          className={`cursor-pointer transition-all hover:shadow-lg ${
            selectedRole === 'shop' ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => !saveProfileMutation.isPending && handleRoleSelect('shop')}
        >
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-primary/10 p-6">
                <Store className="h-12 w-12 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Shop Owner</CardTitle>
            <CardDescription>Manage your business and reach local customers</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground mb-4">
              <li className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-primary" />
                Create and manage your shop
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-primary" />
                Post updates and offers
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-primary" />
                Connect with customers
              </li>
            </ul>
            <Button
              className="w-full"
              size="lg"
              disabled={saveProfileMutation.isPending}
              onClick={(e) => {
                e.stopPropagation();
                handleRoleSelect('shop');
              }}
            >
              {saveProfileMutation.isPending && selectedRole === 'shop' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting up...
                </>
              ) : (
                'Continue as Shop Owner'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Customer Card */}
        <Card
          className={`cursor-pointer transition-all hover:shadow-lg ${
            selectedRole === 'customer' ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => !saveProfileMutation.isPending && handleRoleSelect('customer')}
        >
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-accent/10 p-6">
                <ShoppingBag className="h-12 w-12 text-accent-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl">Customer</CardTitle>
            <CardDescription>Discover and support local businesses</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground mb-4">
              <li className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-accent-foreground" />
                Browse local shops
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-accent-foreground" />
                Get exclusive deals
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-accent-foreground" />
                Stay updated on offers
              </li>
            </ul>
            <Button
              className="w-full"
              size="lg"
              variant="secondary"
              disabled={saveProfileMutation.isPending}
              onClick={(e) => {
                e.stopPropagation();
                handleRoleSelect('customer');
              }}
            >
              {saveProfileMutation.isPending && selectedRole === 'customer' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting up...
                </>
              ) : (
                'Continue as Customer'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
