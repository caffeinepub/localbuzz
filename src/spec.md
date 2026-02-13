# Specification

## Summary
**Goal:** Update the Shop Dashboard UI to a simple, mobile-first layout with a Post Update button, an Open/Closed toggle, and clearly separated Active/Expired posts sections, while preserving the existing shop registration/edit entrypoints.

**Planned changes:**
- Update `/shop-dashboard` to include a visible primary button labeled "Post Update".
- Add an "Open"/"Closed" toggle control with clear English state labels.
- Add two vertically stacked sections: "My Active Posts" and "Expired Posts".
- Preserve existing register/edit shop entrypoints: show a register CTA (to `/shop-registration`) when no shop exists, and an edit action (to `/shop-registration`) when a shop exists, without hiding the new required dashboard controls.
- Implement simple English empty states for both posts sections when there are no items, without adding backend APIs or persistence.

**User-visible outcome:** On `/shop-dashboard`, users see a simple, easy-to-scan dashboard with a Post Update button, an Open/Closed toggle, and Active/Expired posts sections with empty states; users can also register a new shop or navigate to edit their shop via `/shop-registration` depending on whether a shop record exists.
