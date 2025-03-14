
#!/bin/bash

echo "==== Creating fresh scripts with Unix line endings ===="

# Create complete-rebuild.sh
cat > complete-rebuild.sh << 'EOL'
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
EOL

# Create fix-scripts.sh
cat > fix-scripts.sh << 'EOL'
#!/bin/bash

echo "==== Fixing script files and making them executable ===="

# Find all shell scripts and fix line endings
echo "Fixing line endings in all shell scripts..."
find . -name "*.sh" -type f -exec sed -i -e 's/\r$//' {} \;

# Make all shell scripts executable
echo "Making all shell scripts executable..."
find . -name "*.sh" -type f -exec chmod +x {} \;

echo "==== All scripts fixed and made executable ===="
echo "You can now run ./complete-rebuild.sh"
EOL

# Create make-scripts-executable.sh
cat > make-scripts-executable.sh << 'EOL'
#!/bin/bash

echo "Making all shell scripts executable..."
find . -name "*.sh" -type f -exec chmod +x {} \;
echo "Done! All scripts are now executable."
EOL

# Make all the scripts executable
chmod +x *.sh

echo "==== Fresh scripts created with Unix line endings ===="
echo "You can now run ./complete-rebuild.sh directly"
