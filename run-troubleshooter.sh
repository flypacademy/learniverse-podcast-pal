
#!/bin/bash

# Make the troubleshooting script executable and run it
chmod +x troubleshoot-and-rebuild-ios.sh

# Check if the script exists and is executable
if [ -f "troubleshoot-and-rebuild-ios.sh" ] && [ -x "troubleshoot-and-rebuild-ios.sh" ]; then
  echo "Running troubleshooter script..."
  ./troubleshoot-and-rebuild-ios.sh
else
  echo "ERROR: troubleshoot-and-rebuild-ios.sh script not found or not executable."
  echo "Creating a new script..."
  
  # Create the script again
  cat > troubleshoot-and-rebuild-ios.sh << 'EOL'
#!/bin/bash

echo "==== FlypCast iOS Advanced Troubleshooting and Rebuild ===="

# Check system requirements
echo -e "\n[Checking] System requirements..."
if [ "$(uname)" != "Darwin" ]; then
  echo "ERROR: iOS builds require macOS. You appear to be running $(uname)."
  exit 1
fi

# Check Xcode installation
echo -e "\n[Checking] Xcode installation..."
if [ ! -d "/Applications/Xcode.app" ]; then
  echo "ERROR: Xcode not found. Please install Xcode from the App Store."
  exit 1
else
  echo "OK: Xcode is installed."
fi

# Force accept Xcode license if needed
sudo xcodebuild -license accept 2>/dev/null

# Kill any existing processes
echo -e "\n[Step 1/8] Stopping any running processes..."
killall node 2>/dev/null
killall npm 2>/dev/null
killall Xcode 2>/dev/null

# Clean npm cache and reinstall
echo -e "\n[Step 2/8] Cleaning npm cache..."
npm cache clean --force
rm -rf node_modules
npm install

# Build the web app
echo -e "\n[Step 3/8] Building web app..."
rm -rf dist
npm run build

# Reset iOS setup
echo -e "\n[Step 4/8] Resetting iOS setup..."
rm -rf ios
rm -rf node_modules/.cache/capacitor

# Set Xcode command line tools
echo -e "\n[Step 5/8] Setting Xcode command line tools..."
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer

# Add iOS platform again
echo -e "\n[Step 6/8] Adding iOS platform..."
npx cap add ios --skip-appid-validation

# Sync with iOS
echo -e "\n[Step 7/8] Syncing with iOS..."
npx cap sync

# Open in Xcode
echo -e "\n[Step 8/8] Opening in Xcode..."
npx cap open ios

echo -e "\n==== Troubleshooting complete ===="
echo "Now in Xcode:"
echo "1. Select a real device or simulator"
echo "2. Select your Apple ID / Development Team in Signing & Capabilities"
echo "3. Select Product > Clean Build Folder"
echo "4. Click the Play button to build and run"
EOL
  
  chmod +x troubleshoot-and-rebuild-ios.sh
  ./troubleshoot-and-rebuild-ios.sh
fi
