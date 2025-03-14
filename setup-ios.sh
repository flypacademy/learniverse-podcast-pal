
#!/bin/bash

echo "==== FlypCast iOS Setup Script ===="
echo "This script will perform all steps needed to set up the iOS app"

# Fix Xcode tools first
echo -e "\n[Step 1/6] Fixing Xcode command line tools..."
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -license accept

# Build the app
echo -e "\n[Step 2/6] Building the app..."
npm run build

# Clean up previous iOS directory
echo -e "\n[Step 3/6] Cleaning up previous iOS installation..."
rm -rf ios

# Clear Capacitor cache
echo -e "\n[Step 4/6] Clearing Capacitor cache..."
rm -rf node_modules/.cache/capacitor

# Add iOS platform
echo -e "\n[Step 5/6] Adding iOS platform..."
npx cap add ios

# Sync web code to native app
echo -e "\n[Step 6/6] Syncing web code to native app..."
npx cap sync

echo -e "\n==== Setup Complete ===="
echo "To open the app in Xcode, run: npx cap open ios"
echo "To run with live reload during development, run: npm run dev & npx cap run ios -l --external"
