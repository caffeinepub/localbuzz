import { Button } from '@/components/ui/button';

interface ShopOpenClosedToggleProps {
  isOpen: boolean;
  onChange: (isOpen: boolean) => void;
  disabled?: boolean;
}

export default function ShopOpenClosedToggle({
  isOpen,
  onChange,
  disabled = false,
}: ShopOpenClosedToggleProps) {
  return (
    <div className="flex items-center gap-3 w-full">
      <Button
        type="button"
        variant={isOpen ? 'default' : 'outline'}
        className="flex-1 h-12 text-base font-medium"
        onClick={() => onChange(true)}
        disabled={disabled}
      >
        Open
      </Button>
      <Button
        type="button"
        variant={!isOpen ? 'default' : 'outline'}
        className="flex-1 h-12 text-base font-medium"
        onClick={() => onChange(false)}
        disabled={disabled}
      >
        Closed
      </Button>
    </div>
  );
}
