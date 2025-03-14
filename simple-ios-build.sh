
#!/bin/bash

# Simple iOS build script
# This is the most straightforward way to rebuild your iOS app

echo "========== STARTING SIMPLE IOS BUILD =========="

# Step 1: Build the web app
echo "Step 1: Building web app..."
npm run build

# Step 2: Sync with iOS
echo "Step 2: Syncing with iOS..."
npx cap sync

# Step 3: Fix permissions (most common issue)
echo "Step 3: Fixing permissions..."
chmod -R +x ios/App/Pods

# Step 4: Open in Xcode
echo "Step 4: Opening in Xcode..."
npx cap open ios

echo "========== BUILD PROCESS COMPLETE =========="
echo ""
echo "In Xcode:"
echo "1. Select Product > Clean Build Folder"
echo "2. Try building with Product > Build"
echo ""
