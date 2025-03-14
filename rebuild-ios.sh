
#!/bin/bash

echo "==== FlypCast iOS Complete Rebuild Script ===="

# Step 1: Stop any running processes
echo -e "\n[Step 1/8] Stopping any running processes..."
killall node 2>/dev/null
killall npm 2>/dev/null

# Step 2: Clean npm cache
echo -e "\n[Step 2/8] Cleaning npm cache..."
npm cache clean --force

# Step 3: Remove node_modules and reinstall
echo -e "\n[Step 3/8] Reinstalling dependencies..."
rm -rf node_modules
npm install

# Step 4: Build the application
echo -e "\n[Step 4/8] Building the application..."
npm run build

# Step 5: Clean up iOS directory and Capacitor cache
echo -e "\n[Step 5/8] Cleaning up previous iOS files and cache..."
rm -rf ios
rm -rf node_modules/.cache/capacitor

# Step 6: Add iOS platform
echo -e "\n[Step 6/8] Adding iOS platform..."
npx cap add ios

# Step 7: Sync web code to iOS
echo -e "\n[Step 7/8] Syncing web code to iOS..."
npx cap sync

# Step 8: Open in Xcode
echo -e "\n[Step 8/8] Opening in Xcode..."
npx cap open ios

echo -e "\n==== Rebuild Complete ===="
echo "The iOS app should now reflect your latest changes."
echo "IMPORTANT: You may need to rebuild the app in Xcode (Product > Build)."
echo "If you want to run with live reload instead, use: ./live-reload.sh"
