
#!/bin/bash

# This is an absolute fail-proof rebuild script that doesn't depend on other scripts

# Print current working directory for debugging
echo "==== CURRENT DIRECTORY: $(pwd) ===="
echo "==== REBUILDING iOS APP FROM SCRATCH ===="

# 1. Kill any running processes that might interfere
echo "[Step 1/7] Stopping running processes..."
killall node 2>/dev/null
killall npm 2>/dev/null
killall Xcode 2>/dev/null

# 2. Delete existing iOS folder completely
echo "[Step 2/7] Removing existing iOS folder..."
if [ -d "ios" ]; then
  rm -rf ios
  echo "Removed iOS folder."
else
  echo "No iOS folder found (this is fine)."
fi

# 3. Clean capacitor cache
echo "[Step 3/7] Cleaning Capacitor cache..."
if [ -d "node_modules/.cache/capacitor" ]; then
  rm -rf node_modules/.cache/capacitor
  echo "Cleared Capacitor cache."
else
  echo "No Capacitor cache found (this is fine)."
fi

# 4. Build web app
echo "[Step 4/7] Building web app..."
npm run build
if [ ! -d "dist" ]; then
  echo "ERROR: Build failed - 'dist' directory not found."
  exit 1
else
  echo "Build completed successfully."
fi

# 5. Fix Xcode tools path
echo "[Step 5/7] Setting Xcode tools path..."
if [ -d "/Applications/Xcode.app" ]; then
  sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
  echo "Xcode tools path set."
else
  echo "WARNING: Xcode not found. iOS build will fail."
  exit 1
fi

# 6. Add iOS platform with validation skipped
echo "[Step 6/7] Adding iOS platform..."
npx cap add ios --skip-appid-validation
if [ ! -d "ios" ]; then
  echo "ERROR: Failed to add iOS platform."
  exit 1
else
  echo "iOS platform added successfully."
fi

# 7. Sync web code with iOS and open Xcode
echo "[Step 7/7] Syncing and opening Xcode..."
npx cap sync
npx cap open ios

echo "==== REBUILD COMPLETE ===="
echo ""
echo "IMPORTANT! In Xcode, you MUST:"
echo "1. Select a simulator or physical device"
echo "2. Set your Apple ID in Signing & Capabilities"
echo "3. Select Product > Clean Build Folder"
echo "4. Click the Play button to build and run"
