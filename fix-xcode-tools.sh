
#!/bin/bash

echo "Checking if Xcode is installed..."
if ! [ -d "/Applications/Xcode.app" ]; then
  echo "Error: Xcode is not installed. Please install Xcode from the App Store first."
  exit 1
fi

echo "Setting correct Xcode command line tools path..."
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer

echo "Accepting Xcode license agreement if needed..."
sudo xcodebuild -license accept

echo "Xcode command line tools have been configured correctly."
echo "Now you can try running the iOS build process again with these commands:"
echo "1. npm run build"
echo "2. rm -rf ios"
echo "3. rm -rf node_modules/.cache/capacitor"
echo "4. npx cap add ios"
echo "5. npx cap sync"
echo "6. npx cap open ios"
