
#!/bin/bash

# This script fixes line endings and makes all scripts executable
# Run with: bash fix-scripts.sh

echo "Making all scripts executable and fixing line endings..."

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

echo "All scripts are now executable. You can run any of them directly with:"
echo "./script-name.sh"
echo ""
echo "If you still get 'permission denied' or 'no such file' errors, run:"
echo "bash script-name.sh"
