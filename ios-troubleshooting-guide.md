
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

### 7. Logging System Initialization Error

If you see "Failed to initialize logging system. Log messages may be missing":

1. In Xcode, go to Product > Scheme > Edit Scheme
2. Select the "Run" action on the left
3. Go to the "Arguments" tab
4. Add a new environment variable by clicking "+"
5. Set the name to `IDEPreferLogStreaming` and value to `YES`
6. Click "Close" and try running again

### 8. Sandbox Extension Error and Server Connection Issues

If you see "Could not create a sandbox extension" and "Error: Could not connect to the server":

1. Make sure your development server is running: `npm run dev`
2. Check capacitor.config.json and update the server URL:

```json
"server": {
  "url": "http://localhost:8080",
  "cleartext": true
}
```

3. If you're testing on a physical device, replace localhost with your computer's local IP address
4. If you're using HTTPS, ensure you have proper certificates set up
5. Try running with the explicit external flag:
   ```bash
   npx cap run ios -l --external
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
