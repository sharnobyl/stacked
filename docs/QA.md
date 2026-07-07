# Manual QA checklist

Run before every release. Needs a GUI session; grant Accessibility to
`build/Stacked.app` when testing the intercept flow (System Settings →
Privacy & Security → Accessibility). Re-grant after rebuilding if pastes
stop being intercepted.

## Core flow (Accessibility granted)
- [ ] Launch app → menu-bar icon appears, no Dock icon
- [ ] Shift-Cmd-C → panel appears top-right, icon becomes filled
- [ ] Copy "one", "two", "three" in TextEdit → items appear in panel in order,
      count shows 3, first row marked "Next · ⌘V"
- [ ] In Notes, press ⌘V three times → pastes one, two, three; each vanishes
      from the panel; empty state appears after the third
- [ ] Copy two items, click reverse arrows → order flips; ⌘V pastes the
      later copy first
- [ ] Right-click an item → Delete removes it
- [ ] Two-finger swipe left on an item → Delete button removes it
- [ ] Copy an image (screenshot to clipboard) → thumbnail row; ⌘V pastes it
- [ ] Copy a file in Finder → file-name row; ⌘V in Finder pastes the file
- [ ] ⌘V with empty stack while active → normal paste (last clipboard content)
- [ ] Cmd-Shift-V / Cmd-Option-V → NOT intercepted (app-specific paste runs)
- [ ] Shift-Cmd-C again → panel hides, stack clears, icon back to outline
- [ ] Panel never steals focus while copying/pasting in other apps

## Fallback flow (Accessibility NOT granted)
- [ ] Activate → yellow banner explains permission; "Open System Settings"
      opens the Accessibility pane
- [ ] Copy two items → they appear in the panel
- [ ] Click an item → it is removed and a manual ⌘V pastes it
- [ ] Copying still works normally system-wide

## Panel behavior
- [ ] X button hides the panel; copies are still captured and ⌘V still pastes
      from the stack
- [ ] Trash button empties the stack (count goes to 0, empty state shows)
- [ ] With direction reversed, each new copy appears at the TOP of the list
      and the list auto-scrolls so it is visible
- [ ] Panel has no title-bar dead space; compact rows

## Menu bar
- [ ] Toggle Stack menu item works; About shows panel; Quit exits
- [ ] Show Panel / Hide Panel menu item toggles the panel without
      deactivating the stack; disabled while the stack is inactive
- [ ] While active with N items, the menu-bar icon shows the count next to
      it (even when the panel is hidden); badge disappears at 0 / inactive
