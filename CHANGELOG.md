# Changelog

## v0.1.0 — unreleased
- Initial release: hotkey-activated paste stack (⇧⌘C), sequential ⌘V paste,
  reverse direction, per-item delete, Accessibility-free fallback mode.
- Panel visibility is independent of the stack: hide the panel and keep
  stacking/pasting; menu-bar icon shows a live item-count badge.
- Clear-all button; compact borderless panel (260×300, no title bar);
  auto-scroll to the top when new items land there.
- ⇧⌥C toggles panel visibility; panel is resizable; per-row delete button
  (click no longer removes items in fallback mode); drag rows to reorder;
  dismissible permission banner.
- Live Accessibility re-detection (granting/losing the permission mid-session
  switches modes automatically) with a persistent warning icon in fallback
  mode; whole rows are draggable (removed the tap gesture that blocked
  drags); explicit per-row copy button in fallback mode; "T" icon for text
  items; JPEG clipboard images recognized.
