
#!/bin/bash

echo "==== Creating and fixing all scripts with proper Unix line endings ===="

# First, create a single reliable script with proper Unix line endings
cat > complete-rebuild.sh << 'EOF'
#!/bin/bash

echo "==== Starting complete rebuild and cache clearing ===="

# Kill any existing processes
killall node 2>/dev/null
killall npm 2>/dev/null

# Clean build
echo "Cleaning previous build..."
rm -rf dist

# Build the web app
echo "Building web app..."
npm run build

# Clear Capacitor cache
echo "Clearing Capacitor cache..."
rm -rf node_modules/.cache/capacitor

# Remove iOS folder
echo "Removing iOS folder..."
rm -rf ios

# Add iOS platform again
echo "Adding iOS platform..."
npx cap add ios

# Sync with iOS
echo "Syncing with iOS..."
npx cap sync

# Open in Xcode
echo "Opening in Xcode..."
npx cap open ios

echo "==== Complete rebuild finished ===="
echo "Now in Xcode:"
echo "1. Select Product > Clean Build Folder" 
echo "2. Click the Play button to build and run"
EOF

# Make the complete-rebuild script executable
chmod +x complete-rebuild.sh

echo "Created and made executable: complete-rebuild.sh"
echo ""
echo "==== All done! ===="
echo "You can now run: ./complete-rebuild.sh"
