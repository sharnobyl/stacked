# Stacked — Design Spec

**Date:** 2026-07-07
**Status:** Approved
**License:** MIT (open source, public GitHub repo)

## What

Stacked is an open-source macOS menu-bar app that clones the "Paste Stack" feature
of Paste (https://pasteapp.io/help/using-paste-stack): a temporary, ad-hoc pinboard
for sequential copy-and-paste across applications.

## Core behavior (v1 scope — exact mimic)

1. **Activate/deactivate:** Global hotkey **Shift-Cmd-C** toggles the stack.
   Activating shows a floating panel and starts capturing copies. Deactivating
   hides the panel and clears the stack (it is intentionally ephemeral).
2. **Capture:** While active, every item copied in any app is appended to the
   stack in copy order and appears in the panel immediately.
3. **Sequential paste:** While active, pressing **Cmd-V** in any app pastes the
   next stack item (from the top by default). The pasted item is removed from
   the stack. Repeated Cmd-V walks through the stack.
4. **Reverse:** An arrows button in the panel reverses paste direction
   (top-to-bottom ⇄ bottom-to-top).
5. **Delete:** Individual items can be removed via right-click context menu
   ("Delete") or a swipe-left gesture on the row.
6. **Empty stack:** Cmd-V with an empty/inactive stack behaves as a normal paste.

Out of scope for v1: clipboard history, persistence across launches, search,
sync, iOS, Windows/Linux, rules/filters.

## Platform & stack

- macOS 13+ (Ventura), Apple Silicon + Intel (universal binary).
- Swift 5.9+, SwiftUI panel content inside an AppKit shell (`NSPanel`,
  `NSStatusItem`). Menu-bar-only app (`LSUIElement = true`, no Dock icon).
- Built with Swift Package Manager. No `.xcodeproj` committed; a script
  (`Scripts/bundle.sh`) wraps the SPM binary + `Info.plist` + icon into
  `Stacked.app`. CI runs `swift build` + `swift test` on macOS runners.
- No third-party dependencies. Global hotkey via Carbon `RegisterEventHotKey`;
  event tap via `CGEvent.tapCreate`.

## Architecture

```
HotkeyManager ──toggle──▶ AppController ──show/hide──▶ StackPanel (NSPanel + SwiftUI)
                              │  ▲
        ClipboardMonitor ──push│  │pop/remove/reverse
                              ▼  │
                           StackStore ◀──consume── PasteInterceptor (CGEvent tap)
```

### StackStore (pure model, fully unit-tested)
- Ordered list of `StackItem` (id, capture date, representations, preview).
- `push(_:)`, `popNext()`, `remove(id:)`, `reverse()`, `clear()`, `isEmpty`,
  published changes for SwiftUI.
- Direction flag decides whether `popNext()` takes from the head or tail.
- `StackItem.representations`: `[NSPasteboard.PasteboardType: Data]` — captures
  all types present on the pasteboard (plain text, RTF, HTML, PNG/TIFF,
  file URLs, plus unknown types verbatim) so pasting is lossless.

### ClipboardMonitor
- Polls `NSPasteboard.general.changeCount` on a 0.2 s timer while the stack is
  active (macOS has no pasteboard-change notification API).
- On change: snapshots all pasteboard item representations into a `StackItem`
  and pushes to the store.
- Self-write suppression: when the app itself writes to the pasteboard (during
  a stack paste), it adds a private marker type
  (`com.stacked.self-write`) and the monitor skips marked changes.

### PasteInterceptor
- CGEvent tap (`.cgSessionEventTap`, key-down) active only while the stack is
  active and non-empty; otherwise the tap is disabled to stay out of the way.
- On Cmd-V (keycode 9 with Command, without Option/Control/Fn): writes the next
  item's representations to the general pasteboard (with self-write marker),
  lets the original key event pass through so the frontmost app performs the
  paste, then removes the item from the stack.
- Requires the Accessibility permission (`AXIsProcessTrusted`). Tap
  re-enable handling for `tapDisabledByTimeout`.

### Fallback mode (no Accessibility permission)
- App remains functional: clicking an item in the panel copies it to the
  pasteboard and removes it from the stack (user pastes manually); the panel
  shows a banner explaining that granting Accessibility in
  System Settings → Privacy & Security enables the automatic Cmd-V flow, with
  a button that opens that pane and deep-links via
  `AXIsProcessTrustedWithOptions` prompt.

### HotkeyManager
- Registers Shift-Cmd-C globally via Carbon `RegisterEventHotKey` (works
  without Accessibility permission). Fires the toggle on key-down.

### StackPanel (UI)
- Non-activating floating `NSPanel` (`.nonactivatingPanel`, floating level,
  visible on all Spaces) so it never steals focus from the app being pasted
  into. Positioned near the top-right of the active screen; draggable.
- SwiftUI content: header (title, item count, reverse-direction button, close
  button), scrollable list of items (text preview / image thumbnail / file
  name, ordered so the **next item to paste is visually first**), row context
  menu with Delete, swipe-to-delete, empty-state hint
  ("Copy things to add them to the stack").
- Menu-bar `NSStatusItem`: icon indicates active/inactive; menu with
  Toggle Stack, About, Quit.

## Error handling

- **Permission denied / revoked mid-session:** interceptor disables cleanly;
  UI switches to fallback banner. Re-checked on each activation.
- **Unknown pasteboard types:** stored and re-written verbatim.
- **Oversized items:** items > 50 MB total are skipped with a brief panel note
  (protects memory; matches "ad hoc pinboard" spirit).
- **Tap timeout (`tapDisabledByTimeout`):** re-enable automatically.
- **Empty stack Cmd-V:** event passes through unmodified.

## Testing

- **Unit (XCTest, run in CI):** StackStore ordering/reverse/pop/remove/clear;
  StackItem round-trip through a private `NSPasteboard` instance; monitor
  self-write suppression logic (injected pasteboard).
- **Manual QA checklist (docs/QA.md):** end-to-end hotkey → copy ×3 → Cmd-V ×3
  across TextEdit/Notes, reverse direction, delete via menu and swipe,
  permission-denied fallback, empty-stack passthrough.

## Repo & distribution

- Public GitHub repo `stacked` (MIT). README (features, demo GIF placeholder,
  install, permissions explanation, build-from-source), CONTRIBUTING.md,
  CHANGELOG.md.
- GitHub Actions: `ci.yml` (build + test on push/PR, macOS runner) and
  `release.yml` (tag → build universal binary → bundle `Stacked.app` → zip →
  GitHub Release). Unsigned/un-notarized initially; README documents
  right-click-open / `xattr -d com.apple.quarantine`. Homebrew cask later.

## Decisions log

- Platform: macOS-native Swift (user choice), exact-mimic scope (user choice),
  public repo under user's GitHub account (user choice), name **Stacked**
  (user choice), hybrid paste interception with graceful fallback (approved).
- Ephemeral by design: deactivating clears the stack; nothing written to disk.
