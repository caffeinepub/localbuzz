import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useAppBackNavigation } from '../hooks/useAppBackNavigation';

interface AppBackButtonProps {
  className?: string;
  variant?: 'default' | 'ghost' | 'outline' | 'secondary' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

/**
 * Reusable, accessible Back button component that performs safe in-app navigation.
 * Uses the app back-navigation hook with fallback logic.
 */
export default function AppBackButton({ 
  className, 
  variant = 'ghost', 
  size = 'icon' 
}: AppBackButtonProps) {
  const { goBack } = useAppBackNavigation();

  return (
    <Button
      variant={variant}
      size={size}
      onClick={goBack}
      className={className}
      aria-label="Back"
    >
      <ArrowLeft className="h-5 w-5" />
    </Button>
  );
}
