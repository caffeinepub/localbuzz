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
    <div className="flex items-center gap-2 w-full">
      <Button
        type="button"
        variant={isOpen ? 'default' : 'outline'}
        className="flex-1"
        onClick={() => onChange(true)}
        disabled={disabled}
      >
        Open
      </Button>
      <Button
        type="button"
        variant={!isOpen ? 'default' : 'outline'}
        className="flex-1"
        onClick={() => onChange(false)}
        disabled={disabled}
      >
        Closed
      </Button>
    </div>
  );
}
