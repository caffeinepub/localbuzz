# Specification

## Summary
**Goal:** Make the “Search shops...” control on the Customer Home Feed functional so users can type to filter the displayed shop feed.

**Planned changes:**
- Replace the existing non-editable “Search shops...” control on `/customer-home` with a focusable text input that supports typing (desktop and mobile) while keeping the same general layout (search on left, filter button on right).
- Add accessible labeling and placeholder text for the search input (e.g., `aria-label="Search shops"` and placeholder “Search shops...”).
- Implement client-side, case-insensitive filtering of currently displayed feed cards based on the search query, preserving existing category/location filtering behavior.
- Add an in-field clear (X) control that appears only when the query is non-empty, clears the query, and returns focus to the input.
- Display an English empty-state message when no items match the current search query.

**User-visible outcome:** On the Customer Home Feed, users can tap/click into “Search shops...”, type to filter the feed immediately, clear the search with an in-field control, and see a clear message when there are no matches.
