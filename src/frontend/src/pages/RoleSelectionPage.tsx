import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Store, ShoppingBag, Loader2, ArrowRight, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useQueries';
import { useOtpSession } from '../hooks/useOtpSession';
import { UserRole } from '../backend';

type RoleType = 'shop' | 'customer';

const ROLE_CHOICE_KEY = 'localbuzz_role_choice';

export default function RoleSelectionPage() {
  const navigate = useNavigate();
  const [processingRole, setProcessingRole] = useState<RoleType | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const saveProfileMutation = useSaveCallerUserProfile();
  const { phoneNumber, clearOtpSession } = useOtpSession();

  // Only redirect if user has a previously persisted role choice
  useEffect(() => {
    if (userProfile && isFetched) {
      try {
        const persistedRole = localStorage.getItem(ROLE_CHOICE_KEY);
        if (persistedRole === 'shop') {
          navigate({ to: '/shop-dashboard' });
        } else if (persistedRole === 'customer') {
          navigate({ to: '/customer-home' });
        }
        // If no persisted role, stay on role selection page
      } catch {
        // If localStorage fails, stay on role selection page
      }
    }
  }, [userProfile, isFetched, navigate]);

  const handleRoleSelect = async (role: RoleType) => {
    // Guard against duplicate selections while processing
    if (processingRole !== null) {
      return;
    }

    // Clear any previous error
    setErrorMessage(null);
    setProcessingRole(role);

    // Check for missing OTP session
    if (!phoneNumber) {
      setErrorMessage('Your session expired. Please log in again.');
      setProcessingRole(null);
      // Clear session and navigate to login
      clearOtpSession();
      setTimeout(() => {
        navigate({ to: '/' });
      }, 2000);
      return;
    }

    // Determine navigation target
    const targetRoute = role === 'shop' ? '/shop-dashboard' : '/customer-home';

    try {
      // Attempt to save profile
      await saveProfileMutation.mutateAsync({
        phoneNumber,
        role: UserRole.user,
      });

      // Persist role choice for future auto-redirect
      try {
        localStorage.setItem(ROLE_CHOICE_KEY, role);
      } catch {
        // Ignore localStorage errors
      }

      // Navigate to target route
      navigate({ to: targetRoute });
    } catch (error) {
      // Show non-blocking warning but still navigate
      console.error('Failed to save profile:', error);
      setErrorMessage('Profile could not be saved, but you can continue. You may need to select your role again next time.');
      
      // Still persist role choice
      try {
        localStorage.setItem(ROLE_CHOICE_KEY, role);
      } catch {
        // Ignore localStorage errors
      }

      // Reset processing state and navigate anyway after a brief delay
      setProcessingRole(null);
      setTimeout(() => {
        navigate({ to: targetRoute });
      }, 1500);
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

      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {/* Shop Owner Card */}
        <Card
          className={`cursor-pointer transition-all hover:shadow-lg ${
            processingRole === 'shop' ? 'ring-2 ring-primary' : ''
          } ${processingRole !== null ? 'opacity-75' : ''}`}
          onClick={() => processingRole === null && handleRoleSelect('shop')}
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
              disabled={processingRole !== null}
              onClick={(e) => {
                e.stopPropagation();
                handleRoleSelect('shop');
              }}
            >
              {processingRole === 'shop' ? (
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
            processingRole === 'customer' ? 'ring-2 ring-primary' : ''
          } ${processingRole !== null ? 'opacity-75' : ''}`}
          onClick={() => processingRole === null && handleRoleSelect('customer')}
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
              disabled={processingRole !== null}
              onClick={(e) => {
                e.stopPropagation();
                handleRoleSelect('customer');
              }}
            >
              {processingRole === 'customer' ? (
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
