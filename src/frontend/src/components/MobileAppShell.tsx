import { Outlet, useNavigate, useLocation } from '@tanstack/react-router';
import { MapPin, Store, Home, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useOtpSession } from '../hooks/useOtpSession';
import { useQueryClient } from '@tanstack/react-query';
import AppBackButton from './AppBackButton';

const ROLE_CHOICE_KEY = 'localbuzz_role_choice';

export default function MobileAppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { clear } = useInternetIdentity();
  const { clearOtpSession } = useOtpSession();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await clear();
    clearOtpSession();
    queryClient.clear();
    
    // Clear persisted role choice on logout
    try {
      localStorage.removeItem(ROLE_CHOICE_KEY);
    } catch {
      // Ignore localStorage errors
    }
    
    navigate({ to: '/' });
  };

  const isShopDashboard = location.pathname === '/shop-dashboard';
  const isCustomerHome = location.pathname === '/customer-home';
  const isRoleSelection = location.pathname === '/role-selection';

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <AppBackButton className="text-muted-foreground hover:text-foreground" />
            <MapPin className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">LocalBuzz</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Logout"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container max-w-2xl mx-auto px-4 py-6">
          <Outlet />
        </div>
      </main>

      {/* Bottom Navigation - Only show on dashboard/home pages */}
      {!isRoleSelection && (
        <nav className="sticky bottom-0 z-50 w-full border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div className="container flex h-16 items-center justify-around px-4">
            <Button
              variant={isShopDashboard ? 'default' : 'ghost'}
              size="sm"
              onClick={() => navigate({ to: '/shop-dashboard' })}
              className="flex flex-col items-center gap-1 h-auto py-2 px-4"
            >
              <Store className="h-5 w-5" />
              <span className="text-xs">Shop</span>
            </Button>
            <Button
              variant={isCustomerHome ? 'default' : 'ghost'}
              size="sm"
              onClick={() => navigate({ to: '/customer-home' })}
              className="flex flex-col items-center gap-1 h-auto py-2 px-4"
            >
              <Home className="h-5 w-5" />
              <span className="text-xs">Customer</span>
            </Button>
          </div>
        </nav>
      )}
    </div>
  );
}
