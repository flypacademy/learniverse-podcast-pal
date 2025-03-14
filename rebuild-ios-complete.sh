
#!/bin/bash

# Complete iOS rebuild script
# Run this script from your project root directory

echo "========== STARTING COMPLETE IOS REBUILD =========="
echo "This script will completely rebuild your iOS app from scratch"
echo ""

# Step 1: Remove existing iOS directory
echo "Step 1: Removing existing iOS directory..."
rm -rf ios
rm -rf node_modules/.cache/capacitor
echo "✓ Removed iOS directory and Capacitor cache"
echo ""

# Step 2: Build the app
echo "Step 2: Building the app..."
npm run build
echo "✓ App built successfully"
echo ""

# Step 3: Add iOS platform
echo "Step 3: Adding iOS platform..."
npx cap add ios
echo "✓ iOS platform added"
echo ""

# Step 4: Sync the app with iOS
echo "Step 4: Syncing app with iOS..."
npx cap sync
echo "✓ App synced with iOS"
echo ""

# Step 5: Fix permissions on CocoaPods files
echo "Step 5: Fixing permissions on CocoaPods files..."
chmod -R +x ios/App/Pods
echo "✓ Permissions fixed"
echo ""

# Step 6: Open in Xcode
echo "Step 6: Opening in Xcode..."
npx cap open ios
echo ""

echo "========== IOS REBUILD COMPLETE =========="
echo ""
echo "IMPORTANT NEXT STEPS IN XCODE:"
echo "1. Select Product > Clean Build Folder"
echo "2. Select your development team in Signing & Capabilities"
echo "3. Try building with Product > Build"
echo ""
echo "If you encounter sandbox permission errors:"
echo "Close Xcode, run 'chmod -R +x ios/App/Pods' again, and reopen Xcode"
echo ""
