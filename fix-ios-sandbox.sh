
#!/bin/bash

echo "==== FlypCast iOS Sandbox Fix Script ===="

# Function to check if a command executed successfully
check_success() {
  if [ $? -ne 0 ]; then
    echo "ERROR: $1 failed. Exiting."
    exit 1
  else
    echo "SUCCESS: $1 completed."
  fi
}

# Make sure Xcode is installed
if [ ! -d "/Applications/Xcode.app" ]; then
  echo "ERROR: Xcode is not installed. Please install Xcode from the App Store."
  exit 1
fi

# Step 1: Fix Xcode command line tools
echo -e "\n[Step 1/8] Setting Xcode command line tools..."
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
check_success "Setting Xcode command line tools"

# Step 2: Accept Xcode license if needed
echo -e "\n[Step 2/8] Accepting Xcode license..."
sudo xcodebuild -license accept 2>/dev/null
check_success "Accepting Xcode license"

# Step 3: Build the web app
echo -e "\n[Step 3/8] Building web app..."
npm run build
check_success "Building web app"

# Step 4: Clean up previous installations
echo -e "\n[Step 4/8] Removing previous iOS folder and cache..."
rm -rf ios
rm -rf node_modules/.cache/capacitor
check_success "Cleaning previous installations"

# Step 5: Add iOS platform with validation skipped
echo -e "\n[Step 5/8] Adding iOS platform..."
npx cap add ios --skip-appid-validation
check_success "Adding iOS platform"

# Step 6: Sync with iOS
echo -e "\n[Step 6/8] Syncing web code with iOS..."
npx cap sync
check_success "Syncing web code"

# Step 7: Fix permissions for CocoaPods scripts
echo -e "\n[Step 7/8] Fixing CocoaPods scripts permissions..."
if [ -d "ios/App/Pods" ]; then
  find ios/App/Pods -name "*.sh" -type f -exec chmod +x {} \;
  echo "Set executable permissions on CocoaPods script files."
  
  # Specifically fix the Pods-App-frameworks.sh file
  if [ -f "ios/App/Pods/Target Support Files/Pods-App/Pods-App-frameworks.sh" ]; then
    chmod 755 "ios/App/Pods/Target Support Files/Pods-App/Pods-App-frameworks.sh"
    echo "Fixed permissions for Pods-App-frameworks.sh"
  else
    echo "Warning: Pods-App-frameworks.sh not found."
  fi
else
  echo "Warning: Pods directory not found. Running pod install..."
  cd ios/App
  pod install
  cd ../..
  find ios/App/Pods -name "*.sh" -type f -exec chmod +x {} \; 2>/dev/null
fi

# Step 8: Open in Xcode
echo -e "\n[Step 8/8] Opening in Xcode..."
npx cap open ios

echo -e "\n==== iOS Setup Complete ===="
echo ""
echo "IMPORTANT: In Xcode, you MUST:"
echo "1. Select a simulator or physical device from the dropdown at the top"
echo "2. Go to Signing & Capabilities and select your development team"
echo "3. Select Product > Clean Build Folder from the menu"
echo "4. Click the Play button to build and run"
echo ""
echo "If you still encounter sandbox errors:"
echo "1. In Xcode, go to Product > Scheme > Edit Scheme..."
echo "2. Select 'Run' on the left side"
echo "3. Go to the 'Arguments' tab"
echo "4. Add a new environment variable: DISK_USAGE_EVENT=0"
echo "5. Try building again"

