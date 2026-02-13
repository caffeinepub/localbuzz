import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Loader2, Phone, Lock } from 'lucide-react';
import { normalizeIndianPhoneNumber, formatPhoneNumberForDisplay } from '@/utils/phoneNumber';

type OtpStep = 'phone' | 'otp';

interface OtpLoginCardProps {
  onSuccess: (phoneNumber: string) => void;
}

export default function OtpLoginCard({ onSuccess }: OtpLoginCardProps) {
  const [step, setStep] = useState<OtpStep>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [normalizedPhone, setNormalizedPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequestOtp = async () => {
    setError(null);

    // Validate and normalize the phone number
    const validation = normalizeIndianPhoneNumber(phoneNumber);
    
    if (!validation.isValid) {
      setError(validation.error || 'Invalid phone number');
      return;
    }

    setIsLoading(true);

    // Store the normalized phone number
    setNormalizedPhone(validation.normalized!);

    // Simulate OTP request (in real app, this would call backend)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsLoading(false);
    setStep('otp');
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setError('Please enter a 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Simulate OTP verification (in real app, this would call backend)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // For demo purposes, accept any 6-digit OTP
    setIsLoading(false);
    
    // Pass the normalized phone number to the success handler
    onSuccess(normalizedPhone);
  };

  const handleBack = () => {
    setStep('phone');
    setOtp('');
    setError(null);
  };

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          {step === 'phone' ? 'Welcome to LocalBuzz' : 'Verify OTP'}
        </CardTitle>
        <CardDescription className="text-center">
          {step === 'phone'
            ? 'Enter your Indian mobile number to get started'
            : `We sent a code to ${formatPhoneNumberForDisplay(normalizedPhone)}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === 'phone' ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                  +91
                </div>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="98765 43210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={isLoading}
                  className="text-base pl-12"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Enter your 10-digit Indian mobile number
              </p>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              onClick={handleRequestOtp}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send OTP'
              )}
            </Button>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="otp" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Enter 6-digit code
              </Label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={setOtp}
                  disabled={isLoading}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
            <div className="space-y-2">
              <Button
                onClick={handleVerifyOtp}
                disabled={isLoading || otp.length !== 6}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify & Continue'
                )}
              </Button>
              <Button
                onClick={handleBack}
                disabled={isLoading}
                variant="ghost"
                className="w-full"
              >
                Back
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
