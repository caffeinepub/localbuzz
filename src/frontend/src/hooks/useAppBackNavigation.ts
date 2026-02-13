import { useNavigate, useRouter } from '@tanstack/react-router';
import { useInternetIdentity } from './useInternetIdentity';
import { useOtpSession } from './useOtpSession';

/**
 * Hook for safe in-app back navigation with fallback logic.
 * Navigates to previous route when history exists, otherwise falls back
 * to appropriate default route based on auth state.
 */
export function useAppBackNavigation() {
  const navigate = useNavigate();
  const router = useRouter();
  const { identity } = useInternetIdentity();
  const { isOtpVerified } = useOtpSession();

  const isAuthenticated = identity && isOtpVerified;

  const goBack = () => {
    // Check if we have meaningful history
    const canGoBack = window.history.length > 1;

    if (canGoBack) {
      // Try to go back in history
      window.history.back();
    } else {
      // Fallback: navigate to appropriate default route
      if (isAuthenticated) {
        navigate({ to: '/role-selection' });
      } else {
        navigate({ to: '/' });
      }
    }
  };

  return { goBack, canGoBack: window.history.length > 1 };
}
