
#!/bin/bash

# Comprehensive iOS build fix script

echo "========== STARTING iOS BUILD FIX =========="

# Step 1: Ensure all dependencies are installed
echo "Step 1: Checking dependencies..."
npm install

# Step 2: Build the web app using our custom script
echo "Step 2: Building web app with fix-build script..."
node ./src/scripts/fix-build.js

# Check if build was successful
if [ ! -d "dist" ]; then
  echo "Error: Build failed to create the 'dist' directory."
  echo "Trying alternative build approach..."
  # Try using a direct approach
  npx --no-install vite build
fi

# Check again if build was successful
if [ ! -d "dist" ]; then
  echo "Error: All build attempts failed."
  exit 1
fi

echo "✓ Build successful!"

# Step 3: Sync with iOS
echo "Step 3: Syncing with iOS..."
npx cap sync

# Step 4: Fix permissions (most common issue)
echo "Step 4: Fixing permissions..."
if [ -d "ios/App/Pods" ]; then
  chmod -R +x ios/App/Pods
  echo "✓ Permissions fixed"
else
  echo "Warning: Pods directory not found. Skipping permission fix."
fi

# Step 5: Open in Xcode
echo "Step 5: Opening in Xcode..."
npx cap open ios

echo "========== BUILD PROCESS COMPLETE =========="
echo ""
echo "In Xcode:"
echo "1. Select Product > Clean Build Folder"
echo "2. Try building with Product > Build"
echo ""
