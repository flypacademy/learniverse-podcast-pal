
#!/bin/bash

echo "==== FlypCast iOS Advanced Troubleshooting and Rebuild ===="

# Check system requirements
echo -e "\n[Checking] System requirements..."
if [ "$(uname)" != "Darwin" ]; then
  echo "ERROR: iOS builds require macOS. You appear to be running $(uname)."
  exit 1
fi

# Check Xcode installation
echo -e "\n[Checking] Xcode installation..."
if [ ! -d "/Applications/Xcode.app" ]; then
  echo "ERROR: Xcode not found. Please install Xcode from the App Store."
  exit 1
else
  echo "OK: Xcode is installed."
fi

# Check Xcode command line tools
echo -e "\n[Checking] Xcode command line tools..."
if ! xcode-select -p | grep -q "Xcode.app"; then
  echo "FIXING: Xcode command line tools path..."
  sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
  echo "FIXED: Xcode command line tools now point to Xcode.app"
else
  echo "OK: Xcode command line tools are properly configured."
fi

# Kill any existing processes
echo -e "\n[Step 1/10] Stopping any running processes..."
killall node 2>/dev/null
killall npm 2>/dev/null
echo "OK: Killed any existing node/npm processes."

# Clean npm cache
echo -e "\n[Step 2/10] Cleaning npm cache..."
npm cache clean --force
echo "OK: Cleaned npm cache."

# Clean build
echo -e "\n[Step 3/10] Cleaning previous build..."
rm -rf dist
echo "OK: Removed previous build artifacts."

# Build the web app
echo -e "\n[Step 4/10] Building web app..."
npm run build
if [ ! -d "dist" ]; then
  echo "ERROR: Build failed - 'dist' directory not found."
  exit 1
else
  echo "OK: Build completed successfully."
fi

# Check capacitor.config.json
echo -e "\n[Step 5/10] Checking Capacitor configuration..."
if [ ! -f "capacitor.config.json" ]; then
  echo "ERROR: capacitor.config.json not found. This file is required."
  exit 1
else
  echo "OK: capacitor.config.json exists."
fi

# Remove iOS directory
echo -e "\n[Step 6/10] Removing iOS folder..."
rm -rf ios
echo "OK: Removed iOS folder."

# Clear Capacitor cache
echo -e "\n[Step 7/10] Clearing Capacitor cache..."
rm -rf node_modules/.cache/capacitor
echo "OK: Cleared Capacitor cache."

# Add iOS platform
echo -e "\n[Step 8/10] Adding iOS platform..."
npx cap add ios
if [ ! -d "ios" ]; then
  echo "ERROR: Failed to add iOS platform - 'ios' directory not found."
  echo "Trying to add iOS platform with validation skipped..."
  npx cap add ios --skip-appid-validation
  
  if [ ! -d "ios" ]; then
    echo "ERROR: Still failed to add iOS platform. Aborting."
    exit 1
  else
    echo "OK: Added iOS platform with validation skipped."
  fi
else
  echo "OK: Added iOS platform."
fi

# Sync with iOS
echo -e "\n[Step 9/10] Syncing with iOS..."
npx cap sync
echo "OK: Synced with iOS."

# Open in Xcode
echo -e "\n[Step 10/10] Opening in Xcode..."
npx cap open ios

echo -e "\n==== Troubleshooting and rebuild finished ===="
echo "IMPORTANT NEXT STEPS IN XCODE:"
echo "1. Select a real device or simulator in the device dropdown at the top"
echo "2. Select your Apple ID / Development Team in Signing & Capabilities"
echo "3. Select Product > Clean Build Folder"
echo "4. Click the Play button to build and run"
echo ""
echo "If you're still having issues, please check the capacitor-setup-instructions.md file"
