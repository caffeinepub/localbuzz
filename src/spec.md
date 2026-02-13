# Specification

## Summary
**Goal:** Make the Role Selection buttons reliably navigate to the correct destination and provide clear user feedback (loading, errors, and warnings) instead of appearing to do nothing.

**Planned changes:**
- Fix click/tap handlers on /role-selection so “Continue as Shop Owner” routes to `/shop-dashboard` and “Continue as Customer” routes to `/customer-home`.
- Add per-selection loading/disabled behavior to prevent duplicate taps while a selection is processing.
- Show user-visible English error messages when navigation or session prerequisites fail (no silent console-only failures).
- Add handling for missing OTP session phone number: show an “session expired/incomplete” message and route the user back to `/` to re-verify.
- Adjust profile-save behavior so save failures do not block navigation; still navigate and show a non-blocking warning that profile sync failed and can be retried later.
- Fix auto-redirect logic on /role-selection to only redirect when a previously selected role is unambiguous; otherwise keep the user on the Role Selection screen.

**User-visible outcome:** On the Role Selection page, tapping either role always triggers a visible loading state and then navigates to the correct screen; if the session is missing or a save fails, the user sees an English message and the app still behaves predictably (including routing back to login when needed).
