
#!/bin/bash

echo "==== FlypCast iOS Advanced Troubleshooting ===="

# Check system requirements
echo -e "\n[Checking] System requirements..."
if [ "$(uname)" != "Darwin" ]; then
  echo "ERROR: iOS builds require macOS. You appear to be running $(uname)."
  exit 1
fi

# Check Xcode installation
echo -e "\n[Checking] Xcode installation..."
if [ ! -d "/Applications/Xcode.app" ]; then
  echo "ERROR: Xcode not found. Please install Xcode from the App Store."
  exit 1
fi

# Check Xcode command line tools
echo -e "\n[Checking] Xcode command line tools..."
if ! xcode-select -p | grep -q "Xcode.app"; then
  echo "FIXING: Xcode command line tools path..."
  sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
  echo "FIXED: Xcode command line tools now point to Xcode.app"
else
  echo "OK: Xcode command line tools are properly configured."
fi

# Check dependencies
echo -e "\n[Checking] Node.js version..."
NODE_VERSION=$(node -v)
echo "Using Node.js $NODE_VERSION"

echo -e "\n[Checking] Capacitor packages..."
if ! npm list @capacitor/ios | grep -q "@capacitor/ios"; then
  echo "WARNING: @capacitor/ios not found in node_modules. Your installation may be corrupted."
  echo "SUGGESTION: Run 'npm install @capacitor/ios' to reinstall."
else
  echo "OK: @capacitor/ios is installed."
fi

# Check build directory
echo -e "\n[Checking] Build output..."
if [ ! -d "dist" ]; then
  echo "WARNING: 'dist' directory not found. The project may not be built."
  echo "SUGGESTION: Run 'npm run build' before trying to sync with iOS."
else
  echo "OK: 'dist' directory exists."
fi

# Check iOS directory
echo -e "\n[Checking] iOS project..."
if [ ! -d "ios" ]; then
  echo "INFO: 'ios' directory not found. This is normal if you haven't added the iOS platform yet."
  echo "SUGGESTION: Run 'npx cap add ios' to add the iOS platform."
else
  echo "OK: 'ios' directory exists."
  
  # Check Podfile
  if [ ! -f "ios/App/Podfile" ]; then
    echo "WARNING: Podfile not found in ios/App. The iOS project may be corrupted."
    echo "SUGGESTION: Delete the 'ios' directory and run 'npx cap add ios' again."
  else
    echo "OK: Podfile exists in ios/App."
  fi
  
  # Check if pods are installed
  if [ ! -d "ios/App/Pods" ]; then
    echo "WARNING: Pods directory not found. CocoaPods dependencies may not be installed."
    echo "SUGGESTION: Run 'cd ios/App && pod install && cd ../..' to install dependencies."
  else
    echo "OK: Pods directory exists."
  fi
fi

# Check for common errors in capacitor.config.json
echo -e "\n[Checking] Capacitor configuration..."
if [ ! -f "capacitor.config.json" ]; then
  echo "ERROR: capacitor.config.json not found. This file is required."
  echo "SUGGESTION: Create a capacitor.config.json file with the correct configuration."
else
  echo "OK: capacitor.config.json exists."
  
  # Check webDir configuration
  if ! grep -q '"webDir"' capacitor.config.json; then
    echo "WARNING: webDir not specified in capacitor.config.json."
    echo "SUGGESTION: Add '\"webDir\": \"dist\"' to capacitor.config.json."
  fi
  
  # Check appId format
  APP_ID=$(grep -o '"appId": "[^"]*"' capacitor.config.json | cut -d'"' -f4)
  if [[ ! $APP_ID =~ ^[a-z][a-z0-9]*(\.[a-z0-9]+)+$ ]]; then
    echo "WARNING: appId format may be invalid: $APP_ID"
    echo "SUGGESTION: Use a reverse-domain format like 'com.example.app' in capacitor.config.json."
  else
    echo "OK: appId format looks valid: $APP_ID"
  fi
fi

echo -e "\n==== Troubleshooting Complete ===="
echo "Next steps:"
echo "1. Run './rebuild-ios-complete.sh' for a complete rebuild"
echo "2. If you're still having issues, check capacitor-setup-instructions.md"
