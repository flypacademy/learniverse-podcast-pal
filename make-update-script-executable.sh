
#!/bin/bash

# This script makes update-ios-app.sh executable
# Run with: bash make-update-script-executable.sh

echo "Making update-ios-app.sh executable and fixing line endings..."

# Fix line endings (remove carriage returns)
tr -d '\r' < update-ios-app.sh > update-ios-app.tmp
mv update-ios-app.tmp update-ios-app.sh

# Make executable
chmod +x update-ios-app.sh

echo "Script is now executable. You can run it with:"
echo "./update-ios-app.sh"
echo ""
echo "If you still get 'permission denied', run:"
echo "bash update-ios-app.sh"
