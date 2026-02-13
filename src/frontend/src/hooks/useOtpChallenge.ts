import { useMutation } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useRequestOtp() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (phoneNumber: string) => {
      if (!actor) throw new Error('Actor not available');
      const otpCode = await actor.getOtpChallenge(phoneNumber);
      return { otpCode, phoneNumber };
    },
  });
}

export function useVerifyOtp() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ phoneNumber, code }: { phoneNumber: string; code: string }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.verifyOtpToken(phoneNumber, code);
    },
  });
}
