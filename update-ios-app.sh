
#!/bin/bash

# Update iOS App Script
# Use this script when you've made changes to your web app and need to update iOS

echo "========== UPDATING IOS APP =========="

# Step 1: Build the web app with your latest changes
echo "Step 1: Building web app..."
npm run build
echo "✓ Web app built"

# Step 2: Sync changes to iOS
echo "Step 2: Syncing changes to iOS..."
npx cap sync
echo "✓ Changes synced to iOS"

# Step 3: Fix permissions
echo "Step 3: Fixing permissions (preventative)..."
chmod -R +x ios/App/Pods
echo "✓ Permissions fixed"

echo "========== UPDATE COMPLETE =========="
echo ""
echo "You can now open Xcode with: npx cap open ios"
echo "Or run on a device with: npx cap run ios"
echo ""
