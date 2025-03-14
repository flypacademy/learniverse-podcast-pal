
#!/bin/bash

echo "==== FlypCast iOS Complete Rebuild Script ===="

# Make sure this script runs with proper permissions
if [ ! -x "$0" ]; then
  echo "Making this script executable..."
  chmod +x "$0"
fi

# Step 1: Stop any running processes
echo -e "\n[Step 1/9] Stopping any running processes..."
killall node 2>/dev/null
killall npm 2>/dev/null

# Step 2: Clean npm cache
echo -e "\n[Step 2/9] Cleaning npm cache..."
npm cache clean --force

# Step 3: Remove node_modules and reinstall
echo -e "\n[Step 3/9] Reinstalling dependencies..."
rm -rf node_modules
npm install

# Step 4: Build the application
echo -e "\n[Step 4/9] Building the application..."
npm run build

# Step 5: Clean up iOS directory and Capacitor cache
echo -e "\n[Step 5/9] Cleaning up previous iOS files and cache..."
rm -rf ios
rm -rf node_modules/.cache/capacitor

# Step 6: Fix Xcode command line tools (common issue)
echo -e "\n[Step 6/9] Ensuring Xcode command line tools are properly configured..."
if [ -d "/Applications/Xcode.app" ]; then
  sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
  sudo xcodebuild -license accept 2>/dev/null
else
  echo "WARNING: Xcode not found. iOS build may fail."
fi

# Step 7: Add iOS platform
echo -e "\n[Step 7/9] Adding iOS platform..."
npx cap add ios

# Step 8: Sync web code to iOS
echo -e "\n[Step 8/9] Syncing web code to iOS..."
npx cap sync

# Step 9: Open in Xcode
echo -e "\n[Step 9/9] Opening in Xcode..."
npx cap open ios

echo -e "\n==== Rebuild Complete ===="
echo "IMPORTANT NEXT STEPS:"
echo "1. In Xcode, select Product > Clean Build Folder"
echo "2. Then select Product > Build (or press Cmd+B)"
echo "3. Finally, click the Play button to run on a simulator or device"
echo ""
echo "If you encounter any issues, run: ./troubleshoot-ios.sh"
