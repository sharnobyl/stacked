#!/bin/bash
# Stacked one-line installer.
#   curl -fsSL https://raw.githubusercontent.com/sharnobyl/stacked/main/install.sh | bash
set -euo pipefail

REPO="sharnobyl/stacked"
APP_DIR="/Applications"

echo "Downloading the latest Stacked release..."
URL=$(curl -fsSL "https://api.github.com/repos/$REPO/releases/latest" \
    | grep -o '"browser_download_url": *"[^"]*\.zip"' | head -1 \
    | sed 's/.*"\(https[^"]*\)"/\1/')
if [ -z "$URL" ]; then
    echo "Could not find a release download. See https://github.com/$REPO/releases"
    exit 1
fi

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
curl -fsSL "$URL" -o "$TMP/Stacked.zip"
ditto -xk "$TMP/Stacked.zip" "$TMP"

rm -rf "$APP_DIR/Stacked.app"
ditto "$TMP/Stacked.app" "$APP_DIR/Stacked.app"
# The app is not notarized; clear the quarantine flag so it opens normally.
xattr -dr com.apple.quarantine "$APP_DIR/Stacked.app" 2>/dev/null || true

echo "Installed $APP_DIR/Stacked.app — launching it now."
open "$APP_DIR/Stacked.app"
echo
echo "Press Shift-Cmd-C to start a stack. To let Cmd-V paste items out"
echo "automatically, grant Accessibility when prompted (System Settings →"
echo "Privacy & Security → Accessibility → enable Stacked)."
