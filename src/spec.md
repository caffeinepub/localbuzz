# Specification

## Summary
**Goal:** Let shop owners create, persist, and view expiring “Shop Updates” posts (optionally with an image) from the Shop Dashboard.

**Planned changes:**
- Add a backend `ShopUpdates` record type and in-canister storage for posts containing: shopId, title, optional description, optional image, expiryDate, createdAt timestamp, and shopLocation (lat/long).
- Implement authenticated backend APIs to create a ShopUpdate (fails if caller has no registered shop; always uses the shop’s stored lat/long) and to fetch the caller’s updates with active vs expired distinction based on expiryDate.
- Add a protected “Post Update” page with a form: Title (required, short), optional Description, optional Image upload with preview, and Expiry selection (Today / 2 Days / Custom Date with date picker).
- Wire the form to backend create API via React Query mutation with loading/disabled submit, English success/error messages, navigation back to the dashboard (or form reset) on success, and cache invalidation so new posts appear.
- Update the Shop Dashboard to fetch real ShopUpdates and render “My Active Posts” and “Expired Posts” lists showing at least Title and Expiry Date (plus thumbnail when an image exists), keeping existing English empty states and the current “Post Update” disabled behavior when no shop exists.
- Ensure expiry selection is converted consistently to a backend timestamp: Today (not in the past), 2 Days (~48 hours from now), Custom Date (required when selected).

**User-visible outcome:** A shop owner can post a new update with an optional image and expiry setting, then see their active and expired posts on the Shop Dashboard, with new posts appearing immediately after submission.
