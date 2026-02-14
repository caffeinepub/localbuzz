# Specification

## Summary
**Goal:** Automatically mark ShopUpdates as expired when their expiryDate passes, and ensure customer-facing feeds only return active, unexpired updates.

**Planned changes:**
- Add an optional `expiredAt` field to the ShopUpdate backend data model (null when not expired) and maintain backward compatibility for previously stored records.
- Implement a backend scheduled process that runs every 10 minutes to find active ShopUpdates with `expiryDate <= current canister time`, set `isActive = false`, and set `expiredAt` to the expiration run timestamp (without deleting records).
- Update backend feed/query APIs used by the customer home feed to return only ShopUpdates where `isActive == true` and `expiryDate > current canister time`.

**User-visible outcome:** Expired ShopUpdates automatically disappear from the Customer Home Feed without any frontend changes, while expired records remain stored and are marked with an expiration timestamp.
