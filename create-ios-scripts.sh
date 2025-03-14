
#!/bin/bash

# This script will create all the iOS helper scripts

echo "Creating iOS helper scripts..."

# Create rebuild-ios.sh
cat > rebuild-ios.sh << 'EOF'
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
EOF

# Create troubleshoot-ios.sh
cat > troubleshoot-ios.sh << 'EOF'
#!/bin/bash

echo "==== FlypCast iOS Troubleshooting Script ===="

# Check if scripts are executable
echo -e "\n[Step 1/5] Checking if scripts are executable..."
if [ ! -x "./rebuild-ios.sh" ] || [ ! -x "./live-reload.sh" ]; then
  echo "Making scripts executable..."
  chmod +x *.sh
fi

# Check if Xcode is installed
echo -e "\n[Step 2/5] Checking if Xcode is installed..."
if [ ! -d "/Applications/Xcode.app" ]; then
  echo "ERROR: Xcode is not installed. Please install Xcode from the App Store."
  exit 1
fi

# Check Xcode command line tools
echo -e "\n[Step 3/5] Checking Xcode command line tools..."
if ! xcode-select -p | grep -q "Xcode.app"; then
  echo "Setting correct Xcode command line tools path..."
  sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
fi

# Check for capacity issues
echo -e "\n[Step 4/5] Checking for disk space..."
FREE_SPACE=$(df -h . | awk 'NR==2 {print $4}')
echo "Available disk space: $FREE_SPACE"

# Provide troubleshooting options
echo -e "\n[Step 5/5] Providing troubleshooting options..."
echo "If you're still encountering issues, try these options:"
echo "1. Run './fix-xcode-tools.sh' to fix Xcode command line tools"
echo "2. Run './rebuild-ios.sh' for a complete rebuild"
echo "3. Run './setup-ios.sh' to set up iOS environment from scratch"

echo -e "\n==== Troubleshooting Complete ===="
echo "If problems persist, please check 'capacitor-setup-instructions.md' for detailed instructions."
EOF

# Create setup-ios-compact.sh
cat > setup-ios-compact.sh << 'EOF'
#!/bin/bash

echo "Setting up FlypCast iOS app..."

# Quick setup in one script
npm run build && \
rm -rf ios && \
rm -rf node_modules/.cache/capacitor && \
npx cap add ios && \
npx cap sync && \
npx cap open ios

echo "Setup complete! Build the app in Xcode to see your changes."
EOF

# Create live-reload.sh
cat > live-reload.sh << 'EOF'
#!/bin/bash

echo "==== Starting FlypCast Development with Live Reload ===="

# Kill any existing Node processes
echo "Cleaning up existing processes..."
killall node 2>/dev/null
killall npm 2>/dev/null

# Ensure build is done first
echo "Building application..."
npm run build

# Sync with iOS
echo "Syncing with iOS..."
npx cap sync

# Start development server
echo "Starting development server..."
npm run dev &
DEV_PID=$!

# Wait a moment for dev server to initialize
echo "Waiting for development server to initialize..."
sleep 5

# Run with live reload
echo "Starting iOS simulator with live reload..."
npx cap run ios -l --external

# If the iOS command exits, kill the dev server
kill $DEV_PID

echo "==== Development session ended ===="
EOF

# Create setup-ios.sh
cat > setup-ios.sh << 'EOF'
#!/bin/bash

echo "==== FlypCast iOS Setup Script ===="
echo "This script will perform all steps needed to set up the iOS app"

# Fix Xcode tools first
echo -e "\n[Step 1/6] Fixing Xcode command line tools..."
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -license accept

# Build the app
echo -e "\n[Step 2/6] Building the app..."
npm run build

# Clean up previous iOS directory
echo -e "\n[Step 3/6] Cleaning up previous iOS installation..."
rm -rf ios

# Clear Capacitor cache
echo -e "\n[Step 4/6] Clearing Capacitor cache..."
rm -rf node_modules/.cache/capacitor

# Add iOS platform
echo -e "\n[Step 5/6] Adding iOS platform..."
npx cap add ios

# Sync web code to native app
echo -e "\n[Step 6/6] Syncing web code to native app..."
npx cap sync

echo -e "\n==== Setup Complete ===="
echo "To open the app in Xcode, run: npx cap open ios"
echo "To run with live reload during development, run: npm run dev & npx cap run ios -l --external"
EOF

# Create fix-xcode-tools.sh
cat > fix-xcode-tools.sh << 'EOF'
#!/bin/bash

echo "Checking if Xcode is installed..."
if ! [ -d "/Applications/Xcode.app" ]; then
  echo "Error: Xcode is not installed. Please install Xcode from the App Store first."
  exit 1
fi

echo "Setting correct Xcode command line tools path..."
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer

echo "Accepting Xcode license agreement if needed..."
sudo xcodebuild -license accept

echo "Xcode command line tools have been configured correctly."
echo "Now you can try running the iOS build process again with these commands:"
echo "1. npm run build"
echo "2. rm -rf ios"
echo "3. rm -rf node_modules/.cache/capacitor"
echo "4. npx cap add ios"
echo "5. npx cap sync"
echo "6. npx cap open ios"
EOF

# Create make-scripts-executable.sh
cat > make-scripts-executable.sh << 'EOF'
#!/bin/bash

echo "Making all shell scripts executable..."
chmod +x *.sh
echo "Done! All scripts are now executable."
EOF

# Create open-xcode.sh
cat > open-xcode.sh << 'EOF'
#!/bin/bash
npx cap open ios
EOF

# Create sync-ios.sh
cat > sync-ios.sh << 'EOF'
#!/bin/bash
npx cap sync
EOF

# Create add-ios.sh
cat > add-ios.sh << 'EOF'
#!/bin/bash
npx cap add ios
EOF

# Create reload-ios.sh
cat > reload-ios.sh << 'EOF'
#!/bin/bash
npm run build
npx cap sync
npx cap open ios
EOF

# Make all scripts executable
chmod +x *.sh

echo "All iOS helper scripts have been created and made executable!"
echo "You can now run any of these scripts with ./<script-name>.sh"
echo "For example: ./setup-ios-compact.sh"
EOF

# Make the create script itself executable
chmod +x create-ios-scripts.sh
