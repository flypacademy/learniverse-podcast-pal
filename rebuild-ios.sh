
#!/bin/bash

echo "==== FlypCast iOS Rebuild Script ===="

# Step 1: Stop any running processes
echo -e "\n[Step 1/6] Stopping any running processes..."
killall node 2>/dev/null
killall npm 2>/dev/null

# Step 2: Build the application
echo -e "\n[Step 2/6] Building the application..."
npm run build

# Step 3: Clean up iOS directory and Capacitor cache
echo -e "\n[Step 3/6] Cleaning up previous iOS files and cache..."
rm -rf ios
rm -rf node_modules/.cache/capacitor

# Step 4: Add iOS platform
echo -e "\n[Step 4/6] Adding iOS platform..."
npx cap add ios

# Step 5: Sync web code to iOS
echo -e "\n[Step 5/6] Syncing web code to iOS..."
npx cap sync

# Step 6: Open in Xcode
echo -e "\n[Step 6/6] Opening in Xcode..."
npx cap open ios

echo -e "\n==== Rebuild Complete ===="
echo "The iOS app should now reflect your latest changes."
echo "If you want to run with live reload instead, use: ./live-reload.sh"
