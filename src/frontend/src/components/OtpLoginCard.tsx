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

  const handleBack = () => {
    setStep('phone');
    setOtp('');
    setError(null);
    setDemoOtpCode(null);
    setCopied(false);
  };

  const handleCopyOtp = () => {
    if (demoOtpCode) {
      navigator.clipboard.writeText(demoOtpCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isRequestingOtp = requestOtpMutation.isPending;
  const isVerifyingOtp = verifyOtpMutation.isPending;

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          {step === 'phone' ? 'Welcome to LocalBuzz' : 'Verify OTP'}
        </CardTitle>
        <CardDescription className="text-center">
          {step === 'phone'
            ? 'Enter your Indian mobile number to get started'
            : `Verify your phone number ${formatPhoneNumberForDisplay(normalizedPhone)}`}
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
                  disabled={isRequestingOtp}
                  className="text-base pl-12"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isRequestingOtp) {
                      handleRequestOtp();
                    }
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Enter your 10-digit Indian mobile number
              </p>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              onClick={handleRequestOtp}
              disabled={isRequestingOtp}
              className="w-full"
              size="lg"
            >
              {isRequestingOtp ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Requesting...
                </>
              ) : (
                'Request OTP'
              )}
            </Button>
          </>
        ) : (
          <>
            <div className="space-y-4">
              {/* Demo OTP Display */}
              {demoOtpCode && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
                  <p className="text-sm font-medium text-center">Your demo OTP code:</p>
                  <div className="flex items-center justify-center gap-2">
                    <code className="text-2xl font-bold tracking-wider text-primary">
                      {demoOtpCode}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleCopyOtp}
                      className="h-8 w-8"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    This is a demo. In production, you would receive this via SMS.
                  </p>
                </div>
              )}

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
                    disabled={isVerifyingOtp}
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
                <p className="text-xs text-muted-foreground text-center">
                  Code expires in 5 minutes
                </p>
              </div>
            </div>

            {error && <p className="text-sm text-destructive text-center">{error}</p>}

            <div className="space-y-2">
              <Button
                onClick={handleVerifyOtp}
                disabled={isVerifyingOtp || otp.length !== 6}
                className="w-full"
                size="lg"
              >
                {isVerifyingOtp ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify & Continue'
                )}
              </Button>

              <div className="flex gap-2">
                <Button
                  onClick={handleResendOtp}
                  disabled={isRequestingOtp || isVerifyingOtp}
                  variant="outline"
                  className="flex-1"
                >
                  {isRequestingOtp ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resending...
                    </>
                  ) : (
                    'Resend Code'
                  )}
                </Button>
                <Button
                  onClick={handleBack}
                  disabled={isRequestingOtp || isVerifyingOtp}
                  variant="ghost"
                  className="flex-1"
                >
                  Back
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
