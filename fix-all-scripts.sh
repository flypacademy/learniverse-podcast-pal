
#!/bin/bash

echo "==== Creating and fixing all scripts with proper Unix line endings ===="

# First, ensure this script has proper line endings
# This is critical for execution
if [ ! -x "$0" ]; then
  echo "Making this script executable..."
  chmod +x "$0"
fi

# Create complete-rebuild.sh with proper Unix line endings
echo "Creating complete-rebuild.sh with proper Unix line endings..."
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

# Fix line endings in all existing sh files
echo "Fixing line endings in all shell scripts..."
for script in *.sh; do
  if [ -f "$script" ]; then
    echo "Processing $script..."
    tr -d '\r' < "$script" > "$script.tmp"
    mv "$script.tmp" "$script"
    chmod +x "$script"
  fi
done

# Verify the scripts are executable
echo "Verifying scripts are executable..."
for script in *.sh; do
  if [ -f "$script" ] && [ ! -x "$script" ]; then
    echo "Making $script executable..."
    chmod +x "$script"
  fi
done

echo "Created and made executable: complete-rebuild.sh"
echo "Fixed line endings for all shell scripts."
echo ""
echo "==== All done! ===="
echo "You can now run: ./complete-rebuild.sh"
