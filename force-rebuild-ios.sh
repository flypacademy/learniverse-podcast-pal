
#!/bin/bash

echo "==== FORCE REBUILDING iOS APP ===="

# Stop everything first
killall node 2>/dev/null
killall npm 2>/dev/null
killall Xcode 2>/dev/null

# Delete everything to start fresh
rm -rf ios
rm -rf dist
rm -rf node_modules/.cache/capacitor

# Force rebuild
echo "Building web app..."
npm run build

echo "Setting up iOS..."
# Force Xcode to use the correct command line tools
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer

# Add iOS platform with validation skipped
echo "Adding iOS platform..."
npx cap add ios --skip-appid-validation

# Update native dependencies
echo "Syncing web code with iOS..."
npx cap sync

echo "Opening Xcode..."
npx cap open ios

echo "==== FORCE REBUILD COMPLETE ===="
echo "REQUIRED STEPS IN XCODE:"
echo "1. Select a simulator or real device"
echo "2. Set your Apple ID in Signing & Capabilities"
echo "3. Select Product > Clean Build Folder"
echo "4. Select Product > Build"
echo "5. Click the Play button to run"
