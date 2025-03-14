
#!/bin/bash

echo "==== Making ALL scripts executable and fixing line endings ===="

# First, ensure this script itself is executable
chmod +x "$0"

# Fix line endings in all shell scripts
echo "Fixing line endings in all shell scripts..."
for script in *.sh; do
  if [ -f "$script" ]; then
    echo "Processing $script..."
    tr -d '\r' < "$script" > "$script.tmp"
    mv "$script.tmp" "$script"
    chmod +x "$script"
  fi
done

echo "==== All scripts are now executable with proper line endings ===="
echo "You can now run: ./rebuild-ios-now.sh"
