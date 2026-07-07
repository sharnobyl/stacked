#!/bin/bash
# Bundle the SPM binary into build/Stacked.app.
# Usage: Scripts/bundle.sh [--universal]
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ "${1:-}" == "--universal" ]]; then
    swift build -c release --arch arm64 --arch x86_64
    BIN=".build/apple/Products/Release/StackedApp"
else
    swift build -c release
    BIN=".build/release/StackedApp"
fi

APP="build/Stacked.app"
rm -rf "$APP"
mkdir -p "$APP/Contents/MacOS"
cp "$BIN" "$APP/Contents/MacOS/Stacked"
cp Resources/Info.plist "$APP/Contents/Info.plist"

# Ad-hoc signature: required to launch on Apple Silicon and keeps the
# Accessibility grant more stable across rebuilds than an unsigned binary.
codesign --force --sign - "$APP"

echo "Built $APP"
