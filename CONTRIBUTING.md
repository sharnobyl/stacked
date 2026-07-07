# Contributing to Stacked

PRs and issues are welcome.

## Dev setup

```sh
swift build          # compile
swift test           # unit tests (StackedCore)
./Scripts/bundle.sh  # produce build/Stacked.app
```

## Guidelines

- For changes touching the event tap, hotkey, panel, or pasteboard behavior,
  run the manual QA checklist in `docs/QA.md` before opening a PR — most of
  that behavior can't be covered by unit tests.
- Code style: follow the existing files. Keep `StackedCore` free of UI code
  and fully unit-tested.
- No new third-party dependencies without prior discussion in an issue.
- Keep every commit buildable.
