# Specification

## Summary
**Goal:** Default OTP login phone input to India (+91) and normalize/validate phone numbers to a +91 E.164-style format before continuing the login flow.

**Planned changes:**
- Update the OTP login phone number input UI to indicate India (+91) as the default country code (placeholder/prefix).
- Normalize 10-digit Indian mobile numbers entered without a country code into `+91XXXXXXXXXX` before calling `onSuccess(phoneNumber)` in `OtpLoginCard`.
- Add validation to reject non-India country codes (anything not starting with `+91`) with an English error message.
- Ensure the OTP step messaging (“We sent a code to …”) and OTP session storage (`useOtpSession.markOtpVerified(phone)`) use the normalized `+91...` number.

**User-visible outcome:** On the login screen, users see an India (+91) phone prompt; entering an Indian mobile number results in a normalized `+91...` value used consistently in the OTP flow, while non-India country codes are blocked with a clear English validation message.
