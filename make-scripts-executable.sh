
#!/bin/bash

echo "Making all shell scripts executable..."
find . -name "*.sh" -type f -exec chmod +x {} \;
echo "Done! All scripts are now executable."
