
#!/bin/bash

# This script fixes line endings and makes scripts executable
# Run with: bash fix-scripts.sh

echo "Making scripts executable and fixing line endings..."

# Find all shell scripts and make them executable
for script in *.sh; do
  if [ -f "$script" ]; then
    echo "Processing $script..."
    # Fix line endings (remove carriage returns)
    tr -d '\r' < "$script" > "$script.tmp"
    mv "$script.tmp" "$script"
    # Make executable
    chmod +x "$script"
  fi
done

echo "All scripts are now executable. You can run:"
echo "./simple-ios-build.sh"
echo ""
echo "If you still get 'permission denied', run:"
echo "bash simple-ios-build.sh"
