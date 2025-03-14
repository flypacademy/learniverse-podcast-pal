
# iOS Build Troubleshooting Guide

## Common Issues and Solutions

### 1. "No such file or directory" Errors

If you encounter a "no such file or directory" error when trying to run a script:

```bash
# First make sure you're in the project directory
cd /path/to/your/project

# Make the fix-and-rebuild.sh script executable
chmod +x fix-and-rebuild.sh

# Run the fix script
./fix-and-rebuild.sh
```

### 2. Xcode Command Line Tools Issues

If you see an error about Xcode command line tools:

```bash
# Set the correct path to Xcode
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer

# Accept the license if needed
sudo xcodebuild -license accept
```

### 3. iOS Build Fails

If your iOS build fails after opening in Xcode:

1. In Xcode, go to Product > Clean Build Folder
2. Make sure you select your development team in Signing & Capabilities
3. Try building again with Product > Build

### 4. Missing Podfile or CocoaPods Issues

If you encounter CocoaPods related errors:

```bash
# Install CocoaPods if not installed
sudo gem install cocoapods

# Run pod install manually
cd ios/App && pod install && cd ../..
```

### 5. Live Reload Not Working

If live reload isn't working correctly:

1. Make sure your development server is running with `npm run dev`
2. Verify the server URL in capacitor.config.json is correct
3. Try manually syncing with `npx cap sync`
4. Restart the simulator or device

### 6. Sandbox Permission Errors

If you encounter errors like `Sandbox: bash deny file-read-data Pods-App-frameworks.sh`:

1. Close Xcode completely
2. Fix permissions on the CocoaPods scripts:
   ```bash
   chmod +x ios/App/Pods/Target\ Support\ Files/Pods-App/Pods-App-frameworks.sh
   chmod -R +x ios/App/Pods
   ```
3. Open Xcode again and clean the build:
   ```bash
   open ios/App/App.xcworkspace
   ```
4. In Xcode, select Product > Clean Build Folder
5. Try building again

If the error persists, try a complete reset:
```bash
# Clean everything and start fresh
rm -rf ios
rm -rf node_modules/.cache/capacitor
npm run build
npx cap add ios
npx cap sync
# Fix permissions
chmod -R +x ios/App/Pods
# Open in Xcode
npx cap open ios
```

## Step-by-Step Clean Rebuild Process

For a completely fresh start:

1. Remove the iOS directory and cache:
   ```bash
   rm -rf ios
   rm -rf node_modules/.cache/capacitor
   ```
2. Rebuild and add iOS:
   ```bash
   npm run build
   npx cap add ios
   npx cap sync
   ```
3. Fix permissions on CocoaPods scripts:
   ```bash
   chmod -R +x ios/App/Pods
   ```
4. Open in Xcode:
   ```bash
   npx cap open ios
   ```
5. In Xcode, select Product > Clean Build Folder
6. In Xcode, select Product > Build

## For Development with Live Reload

To develop with live reload:

```bash
# Build the app
npm run build

# Sync with iOS
npx cap sync

# Start dev server and run with live reload
npm run dev &
npx cap run ios -l --external
```
