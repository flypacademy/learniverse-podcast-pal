
#!/bin/bash

echo "==== FlypCast iOS Fix and Rebuild Script ===="

# Step 1: Fix line endings and make scripts executable
echo -e "\n[Step 1/3] Fixing line endings and making scripts executable..."
for script in *.sh; do
  if [ -f "$script" ]; then
    echo "Processing $script..."
    tr -d '\r' < "$script" > "$script.tmp"
    mv "$script.tmp" "$script"
    chmod +x "$script"
  fi
done

# Step 2: Build the application
echo -e "\n[Step 2/3] Building the application..."
npm run build

# Step 3: Complete iOS setup
echo -e "\n[Step 3/3] Setting up iOS..."
# Remove iOS directory if it exists
rm -rf ios
# Clear Capacitor cache
rm -rf node_modules/.cache/capacitor
# Set up Xcode command line tools
if [ -d "/Applications/Xcode.app" ]; then
  echo "Setting Xcode command line tools..."
  sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
  sudo xcodebuild -license accept 2>/dev/null
else
  echo "WARNING: Xcode not found. iOS build may fail."
fi
# Add iOS platform
npx cap add ios
# Sync web code to iOS
npx cap sync
# Open in Xcode
npx cap open ios

echo -e "\n==== Fix and Rebuild Complete ===="
echo "IMPORTANT NEXT STEPS:"
echo "1. In Xcode, select Product > Clean Build Folder"
echo "2. Then select Product > Build (or press Cmd+B)"
echo "3. Finally, click the Play button to run on a simulator or device"
