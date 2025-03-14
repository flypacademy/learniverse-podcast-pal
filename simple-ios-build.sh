
#!/bin/bash

# Simple iOS Build Script
# Run with: bash simple-ios-build.sh

echo "==== STARTING iOS BUILD ===="

# Build the web app
echo "[1/5] Building web app..."
npm run build

# Remove iOS folder if it exists
echo "[2/5] Removing existing iOS folder..."
rm -rf ios

# Clear Capacitor cache
echo "[3/5] Clearing Capacitor cache..."
rm -rf node_modules/.cache/capacitor

# Set Xcode command line tools path
echo "[4/5] Setting Xcode command line tools..."
if [ -d "/Applications/Xcode.app" ]; then
  sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
else
  echo "ERROR: Xcode not found at /Applications/Xcode.app"
  echo "Please install Xcode from the App Store and try again."
  exit 1
fi

# Add iOS platform with validation skipped
echo "[5/5] Adding iOS platform..."
npx cap add ios --skip-appid-validation

# Sync with iOS
echo "[6/5] Syncing with iOS..."
npx cap sync

# Open in Xcode
echo "[7/5] Opening in Xcode..."
npx cap open ios

echo "==== iOS BUILD COMPLETE ===="
echo ""
echo "NEXT STEPS IN XCODE:"
echo "1. Select a device or simulator"
echo "2. Configure your Apple ID in Signing & Capabilities"
echo "3. Clean the build (Product > Clean Build Folder)"
echo "4. Build and run (click the Play button)"
