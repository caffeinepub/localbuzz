import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useOtpSession } from './hooks/useOtpSession';
import LoginPage from './pages/LoginPage';
import RoleSelectionPage from './pages/RoleSelectionPage';
import ShopDashboardPage from './pages/ShopDashboardPage';
import CustomerHomeFeedPage from './pages/CustomerHomeFeedPage';
import CustomerProfilePage from './pages/CustomerProfilePage';
import ShopRegistrationPage from './pages/ShopRegistrationPage';
import ShopPostUpdatePage from './pages/ShopPostUpdatePage';
import ShopUpdateDetailPage from './pages/ShopUpdateDetailPage';
import MobileAppShell from './components/MobileAppShell';
import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { identity } = useInternetIdentity();
  const { isOtpVerified } = useOtpSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!identity || !isOtpVerified) {
      navigate({ to: '/' });
    }
  }, [identity, isOtpVerified, navigate]);

  if (!identity || !isOtpVerified) {
    return null;
  }

  return <>{children}</>;
}

// Root layout component
function RootLayout() {
  const { identity } = useInternetIdentity();
  const { isOtpVerified } = useOtpSession();
  const isAuthenticated = identity && isOtpVerified;

  // For authenticated routes, use the shell (which now includes back button)
  if (isAuthenticated && window.location.pathname !== '/') {
    return <MobileAppShell />;
  }

  // For login page, render outlet directly (no back button on login)
  return <Outlet />;
}

// Root route with layout
const rootRoute = createRootRoute({
  component: RootLayout,
});

// Define routes
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LoginPage,
});

const roleSelectionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/role-selection',
  component: () => (
    <ProtectedRoute>
      <RoleSelectionPage />
    </ProtectedRoute>
  ),
});

const shopDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/shop-dashboard',
  component: () => (
    <ProtectedRoute>
      <ShopDashboardPage />
    </ProtectedRoute>
  ),
});

const shopRegistrationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/shop-registration',
  component: () => (
    <ProtectedRoute>
      <ShopRegistrationPage />
    </ProtectedRoute>
  ),
});

const shopPostUpdateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/shop-post-update',
  component: () => (
    <ProtectedRoute>
      <ShopPostUpdatePage />
    </ProtectedRoute>
  ),
});

const customerHomeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/customer-home',
  component: () => (
    <ProtectedRoute>
      <CustomerHomeFeedPage />
    </ProtectedRoute>
  ),
});

const customerProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/customer-profile',
  component: () => (
    <ProtectedRoute>
      <CustomerProfilePage />
    </ProtectedRoute>
  ),
});

const shopUpdateDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/shop-update/$updateId',
  component: () => (
    <ProtectedRoute>
      <ShopUpdateDetailPage />
    </ProtectedRoute>
  ),
});

// Create route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  roleSelectionRoute,
  shopDashboardRoute,
  shopRegistrationRoute,
  shopPostUpdateRoute,
  customerHomeRoute,
  customerProfileRoute,
  shopUpdateDetailRoute,
]);

// Create router
const router = createRouter({ routeTree });

// Register router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
