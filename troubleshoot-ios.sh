
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
