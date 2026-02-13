import { useState, useEffect, useCallback } from 'react';

const OTP_SESSION_KEY = 'localbuzz_otp_verified';
const PHONE_NUMBER_KEY = 'localbuzz_phone_number';

export function useOtpSession() {
  const [isOtpVerified, setIsOtpVerified] = useState<boolean>(() => {
    try {
      return localStorage.getItem(OTP_SESSION_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [phoneNumber, setPhoneNumberState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(PHONE_NUMBER_KEY);
    } catch {
      return null;
    }
  });

  const markOtpVerified = useCallback((phone: string) => {
    try {
      localStorage.setItem(OTP_SESSION_KEY, 'true');
      localStorage.setItem(PHONE_NUMBER_KEY, phone);
      setIsOtpVerified(true);
      setPhoneNumberState(phone);
    } catch (error) {
      console.error('Failed to store OTP session:', error);
    }
  }, []);

  const clearOtpSession = useCallback(() => {
    try {
      localStorage.removeItem(OTP_SESSION_KEY);
      localStorage.removeItem(PHONE_NUMBER_KEY);
      setIsOtpVerified(false);
      setPhoneNumberState(null);
    } catch (error) {
      console.error('Failed to clear OTP session:', error);
    }
  }, []);

  return {
    isOtpVerified,
    phoneNumber,
    markOtpVerified,
    clearOtpSession,
  };
}
