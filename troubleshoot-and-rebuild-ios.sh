
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

# Force accept Xcode license if needed
echo -e "\n[Checking] Xcode license..."
sudo xcodebuild -license accept 2>/dev/null
echo "OK: Xcode license accepted."

# Kill any existing processes
echo -e "\n[Step 1/12] Stopping any running processes..."
killall node 2>/dev/null
killall npm 2>/dev/null
killall Xcode 2>/dev/null
echo "OK: Killed any existing processes."

# Clean npm cache
echo -e "\n[Step 2/12] Cleaning npm cache..."
npm cache clean --force
echo "OK: Cleaned npm cache."

# Delete node_modules and reinstall
echo -e "\n[Step 3/12] Reinstalling dependencies..."
rm -rf node_modules
npm install
echo "OK: Reinstalled dependencies."

# Clean build
echo -e "\n[Step 4/12] Cleaning previous build..."
rm -rf dist
echo "OK: Removed previous build artifacts."

# Build the web app
echo -e "\n[Step 5/12] Building web app..."
npm run build
if [ ! -d "dist" ]; then
  echo "ERROR: Build failed - 'dist' directory not found."
  exit 1
else
  echo "OK: Build completed successfully."
fi

# Check capacitor.config.json
echo -e "\n[Step 6/12] Checking Capacitor configuration..."
if [ ! -f "capacitor.config.json" ]; then
  echo "ERROR: capacitor.config.json not found. This file is required."
  exit 1
else
  echo "OK: capacitor.config.json exists."
  
  # Update URL to force refresh content
  sed -i '' 's/"url": "http:\/\/localhost:8080"/"url": "http:\/\/localhost:8080?t='$(date +%s)'"/' capacitor.config.json
  echo "UPDATED: Added timestamp to server URL in capacitor.config.json to force refresh."
fi

# Remove iOS directory
echo -e "\n[Step 7/12] Removing iOS folder..."
rm -rf ios
echo "OK: Removed iOS folder."

# Clear Capacitor cache
echo -e "\n[Step 8/12] Clearing Capacitor cache..."
rm -rf node_modules/.cache/capacitor
echo "OK: Cleared Capacitor cache."

# Reinstall Capacitor iOS platform
echo -e "\n[Step 9/12] Reinstalling @capacitor/ios..."
npm uninstall @capacitor/ios
npm install @capacitor/ios
echo "OK: Reinstalled @capacitor/ios."

# Add iOS platform
echo -e "\n[Step 10/12] Adding iOS platform..."
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
echo -e "\n[Step 11/12] Syncing with iOS..."
npx cap sync
echo "OK: Synced with iOS."

# Clean CocoaPods cache if needed and install pods
echo -e "\n[Step 12/12] Ensuring CocoaPods are installed..."
if [ -d "ios/App" ]; then
  cd ios/App
  rm -rf Pods
  pod cache clean --all
  pod install
  cd ../..
  echo "OK: CocoaPods reinstalled."
fi

# Open in Xcode
echo -e "\n[Step 12/12] Opening in Xcode..."
npx cap open ios

echo -e "\n==== Troubleshooting and rebuild finished ===="
echo "IMPORTANT NEXT STEPS IN XCODE:"
echo "1. Select a real device or simulator in the device dropdown at the top"
echo "2. Select your Apple ID / Development Team in Signing & Capabilities"
echo "3. Select Product > Clean Build Folder"
echo "4. Click the Play button to build and run"
echo ""
echo "If you're still having issues, please check the capacitor-setup-instructions.md file"
