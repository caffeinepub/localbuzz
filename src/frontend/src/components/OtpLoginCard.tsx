import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Loader2, Phone, Lock, Copy, Check } from 'lucide-react';
import { normalizeIndianPhoneNumber, formatPhoneNumberForDisplay } from '@/utils/phoneNumber';
import { useRequestOtp, useVerifyOtp } from '@/hooks/useOtpChallenge';

type OtpStep = 'phone' | 'otp';

interface OtpLoginCardProps {
  onSuccess: (phoneNumber: string) => void;
}

export default function OtpLoginCard({ onSuccess }: OtpLoginCardProps) {
  const [step, setStep] = useState<OtpStep>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [normalizedPhone, setNormalizedPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [demoOtpCode, setDemoOtpCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const requestOtpMutation = useRequestOtp();
  const verifyOtpMutation = useVerifyOtp();

  const handleRequestOtp = async () => {
    setError(null);

    // Validate and normalize the phone number
    const validation = normalizeIndianPhoneNumber(phoneNumber);
    
    if (!validation.isValid) {
      setError(validation.error || 'Invalid phone number');
      return;
    }

    const normalized = validation.normalized!;
    setNormalizedPhone(normalized);

    try {
      const result = await requestOtpMutation.mutateAsync(normalized);
      setDemoOtpCode(result.otpCode);
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Failed to request OTP. Please try again.');
    }
  };

  const handleResendOtp = async () => {
    setError(null);
    setOtp('');
    setCopied(false);

    try {
      const result = await requestOtpMutation.mutateAsync(normalizedPhone);
      setDemoOtpCode(result.otpCode);
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP. Please try again.');
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setError('Please enter a 6-digit OTP');
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError('OTP must contain only numbers');
      return;
    }

    setError(null);

    try {
      await verifyOtpMutation.mutateAsync({
        phoneNumber: normalizedPhone,
        code: otp,
      });
      
      // Only call onSuccess after backend verification succeeds
      onSuccess(normalizedPhone);
    } catch (err: any) {
      // Parse backend error messages
      const errorMessage = err.message || 'Verification failed';
      
      if (errorMessage.includes('expired')) {
        setError('OTP has expired. Please request a new one.');
      } else if (errorMessage.includes('Incorrect')) {
        setError('Incorrect OTP code. Please try again.');
      } else if (errorMessage.includes('not found')) {
        setError('OTP not found. Please request a new one.');
      } else {
        setError(errorMessage);
      }
    }
  };

  const handleCopyOtp = async () => {
    if (demoOtpCode) {
      try {
        await navigator.clipboard.writeText(demoOtpCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy OTP:', err);
      }
    }
  };

  const isLoading = requestOtpMutation.isPending || verifyOtpMutation.isPending;

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          {step === 'phone' ? (
            <>
              <Phone className="h-6 w-6 text-primary" />
              Phone Verification
            </>
          ) : (
            <>
              <Lock className="h-6 w-6 text-primary" />
              Enter OTP
            </>
          )}
        </CardTitle>
        <CardDescription className="text-base">
          {step === 'phone'
            ? 'Enter your phone number to receive a verification code'
            : `We sent a code to ${formatPhoneNumberForDisplay(normalizedPhone)}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === 'phone' ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-base">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="10-digit mobile number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={isLoading}
                className="text-base h-12"
              />
              <p className="text-sm text-muted-foreground">
                Enter your 10-digit Indian mobile number
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <Button
              onClick={handleRequestOtp}
              disabled={isLoading || !phoneNumber.trim()}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send OTP'
              )}
            </Button>
          </>
        ) : (
          <>
            {demoOtpCode && (
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-primary">Demo OTP Code:</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyOtp}
                    className="h-8 px-2"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-2xl font-bold text-primary tracking-wider">{demoOtpCode}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="otp" className="text-base">Verification Code</Label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={setOtp}
                  disabled={isLoading}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} className="h-14 w-12 text-lg" />
                    <InputOTPSlot index={1} className="h-14 w-12 text-lg" />
                    <InputOTPSlot index={2} className="h-14 w-12 text-lg" />
                    <InputOTPSlot index={3} className="h-14 w-12 text-lg" />
                    <InputOTPSlot index={4} className="h-14 w-12 text-lg" />
                    <InputOTPSlot index={5} className="h-14 w-12 text-lg" />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <Button
              onClick={handleVerifyOtp}
              disabled={isLoading || otp.length !== 6}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify OTP'
              )}
            </Button>

            <Button
              variant="ghost"
              onClick={handleResendOtp}
              disabled={isLoading}
              className="w-full"
            >
              Resend OTP
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
