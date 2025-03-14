
#!/bin/bash

# ==== FlypCast iOS Update Script ====
# This single script handles the entire process of updating your iOS app
# Run with: bash update-ios-app.sh

echo "==== STARTING iOS APP UPDATE ===="
echo "Current directory: $(pwd)"

# Stop any running processes
echo "[1/7] Stopping any running processes..."
killall node 2>/dev/null
killall npm 2>/dev/null
killall Xcode 2>/dev/null

# Build the web app
echo "[2/7] Building web app..."
npm run build

# Remove iOS folder if it exists
echo "[3/7] Removing existing iOS folder..."
if [ -d "ios" ]; then
  rm -rf ios
  echo "Removed iOS folder."
else
  echo "No iOS folder found (this is fine)."
fi

# Clear Capacitor cache
echo "[4/7] Clearing Capacitor cache..."
if [ -d "node_modules/.cache/capacitor" ]; then
  rm -rf node_modules/.cache/capacitor
  echo "Cleared Capacitor cache."
else
  echo "No Capacitor cache found (this is fine)."
fi

# Set Xcode command line tools path
echo "[5/7] Setting Xcode command line tools..."
if [ -d "/Applications/Xcode.app" ]; then
  sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
  echo "Xcode tools path set."
else
  echo "ERROR: Xcode not found at /Applications/Xcode.app"
  echo "Please install Xcode from the App Store and try again."
  exit 1
fi

# Add iOS platform with validation skipped
echo "[6/7] Adding iOS platform..."
npx cap add ios --skip-appid-validation
if [ ! -d "ios" ]; then
  echo "ERROR: Failed to add iOS platform."
  exit 1
else
  echo "iOS platform added successfully."
fi

# Sync with iOS and open Xcode
echo "[7/7] Syncing and opening Xcode..."
npx cap sync
npx cap open ios

echo "==== iOS APP UPDATE COMPLETE ===="
echo ""
echo "NEXT STEPS IN XCODE:"
echo "1. Select a device or simulator"
echo "2. Configure your Apple ID in Signing & Capabilities"
echo "3. Clean the build (Product > Clean Build Folder)"
echo "4. Build and run (click the Play button)"
echo ""
echo "If you encounter any issues, run this script again with:"
echo "bash update-ios-app.sh"
