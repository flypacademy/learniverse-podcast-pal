
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
