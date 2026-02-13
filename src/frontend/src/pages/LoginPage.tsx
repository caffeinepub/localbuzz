import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useOtpSession } from '../hooks/useOtpSession';
import OtpLoginCard from '../components/OtpLoginCard';
import { Button } from '@/components/ui/button';
import { MapPin, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, identity, isLoggingIn, isInitializing } = useInternetIdentity();
  const { markOtpVerified, isOtpVerified } = useOtpSession();

  // Redirect if already authenticated
  useEffect(() => {
    if (identity && isOtpVerified) {
      navigate({ to: '/role-selection' });
    }
  }, [identity, isOtpVerified, navigate]);

  const handleOtpSuccess = async (phoneNumber: string) => {
    // phoneNumber is already normalized to +91XXXXXXXXXX format
    // Ensure user is authenticated with Internet Identity before proceeding
    if (!identity) {
      try {
        await login();
      } catch (error) {
        console.error('Login error:', error);
        return;
      }
    }
    
    // Mark OTP as verified with the normalized phone number
    markOtpVerified(phoneNumber);
    
    // Navigate to role selection
    navigate({ to: '/role-selection' });
  };

  const handleInternetIdentityLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Title */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="rounded-full bg-primary p-4 shadow-lg">
              <MapPin className="h-12 w-12 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground">LocalBuzz</h1>
          <p className="text-muted-foreground">Connect with local businesses</p>
        </div>

        {/* Authentication Flow */}
        {!identity ? (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                First, authenticate with Internet Identity
              </p>
              <Button
                onClick={handleInternetIdentityLogin}
                disabled={isLoggingIn}
                variant="default"
                className="w-full max-w-md"
                size="lg"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  'Login with Internet Identity'
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <OtpLoginCard onSuccess={handleOtpSuccess} />
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Built with ❤️ using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                window.location.hostname
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
          <p className="mt-1">© {new Date().getFullYear()} LocalBuzz</p>
        </div>
      </div>
    </div>
  );
}
