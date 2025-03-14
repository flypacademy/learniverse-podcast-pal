
#!/bin/bash

echo "==== FlypCast iOS Fix and Setup Script ===="

# Create temporary directory for our work
mkdir -p temp_ios_fix
cd temp_ios_fix

# Create the fix-and-rebuild script
echo "Creating fix script..."
cat > fix-and-rebuild.sh << 'EOL'
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
EOL

# Make it executable
chmod +x fix-and-rebuild.sh

# Return to original directory and run the script
cd ..
echo "Running fix script..."
./temp_ios_fix/fix-and-rebuild.sh

# Clean up
echo "Cleaning up temporary files..."
rm -rf temp_ios_fix

echo "iOS setup complete!"
