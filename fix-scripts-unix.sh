
#!/bin/bash

echo "==== Converting scripts to Unix format and making them executable ===="

# Convert Windows line endings to Unix and make executable
for script in *.sh; do
  echo "Converting $script to Unix format..."
  tr -d '\r' < "$script" > temp.sh
  mv temp.sh "$script"
  
  echo "Making $script executable..."
  chmod +x "$script"
done

echo "==== All scripts have been fixed ===="
echo "You can now run ./complete-rebuild.sh"
