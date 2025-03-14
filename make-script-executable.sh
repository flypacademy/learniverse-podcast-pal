
#!/bin/bash

# This script ensures the rebuild script is executable
# Run this with: bash make-script-executable.sh

echo "Making rebuild-ios-now.sh executable..."
chmod +x rebuild-ios-now.sh

echo "Script is now executable. Run it with:"
echo "./rebuild-ios-now.sh"

# If you're having trouble with ./rebuild-ios-now.sh, try:
echo ""
echo "If you still get 'No such file or directory', try running:"
echo "bash rebuild-ios-now.sh"
