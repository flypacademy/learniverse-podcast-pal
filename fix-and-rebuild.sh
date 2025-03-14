
#!/bin/bash

# Fix permissions and rebuild script
# A simpler script just to fix permissions and rebuild

echo "========== FIXING PERMISSIONS AND REBUILDING =========="

# Step 1: Clean build products
echo "Step 1: Cleaning build products..."
rm -rf ios/App/build
echo "✓ Build products cleaned"
echo ""

# Step 2: Fix permissions
echo "Step 2: Fixing permissions on CocoaPods files..."
mkdir -p ios/App/Pods/Target\ Support\ Files/Pods-App
chmod +x ios/App/Pods/Target\ Support\ Files/Pods-App/Pods-App-frameworks.sh
chmod -R +x ios/App/Pods
echo "✓ Permissions fixed"
echo ""

echo "========== FIX COMPLETE =========="
echo ""
echo "NEXT STEPS:"
echo "1. Open Xcode with: npx cap open ios"
echo "2. In Xcode: Select Product > Clean Build Folder"
echo "3. Try building again with Product > Build"
echo ""
