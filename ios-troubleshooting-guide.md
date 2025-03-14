
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

### 6. Sandbox Permission Errors (MOST COMMON ISSUE)

If you encounter errors like `Sandbox: bash deny file-read-data Pods-App-frameworks.sh`:

**DO NOT DELETE the Pods-App-frameworks.sh file!** Instead, fix the permissions:

```bash
# Navigate to your project directory first
cd /path/to/your/project

# Create the directories if they don't exist (in case you're rebuilding)
mkdir -p ios/App/Pods/Target\ Support\ Files/Pods-App

# Fix permissions on the specific script
chmod +x ios/App/Pods/Target\ Support\ Files/Pods-App/Pods-App-frameworks.sh

# Fix permissions on all CocoaPods files (most reliable fix)
chmod -R +x ios/App/Pods

# Now close Xcode completely and reopen
open ios/App/App.xcworkspace
```

Then in Xcode:
1. Select Product > Clean Build Folder
2. Try building again

**If that doesn't work, try this complete reset:**
```bash
# Clean everything and start fresh
rm -rf ios
rm -rf node_modules/.cache/capacitor
npm run build
npx cap add ios
npx cap sync
# Fix permissions immediately before opening Xcode
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

### 8. Failed to Resolve Host Network App ID Error

If you see "Failed to resolve host network app id" or "WebView failed provisional navigation":

1. Make sure your development server is running (`npm run dev`) and accessible
2. Check that capacitor.config.json has the proper server settings:
   ```json
   "server": {
     "hostname": "localhost",
     "androidScheme": "https",
     "iosScheme": "capacitor",
     "cleartext": true
   }
   ```
3. Try using your computer's IP address instead of localhost
4. If testing on a physical device, ensure it's on the same network as your development machine
5. Try running:
   ```bash
   npx cap update ios
   npx cap sync
   npx cap open ios
   ```
6. In Xcode, clean build folder and rebuild

### 9. Error: Could not connect to the server

If you see "Error: Could not connect to the server":

1. Verify your development server is running on the correct port (usually 8080)
2. Check your network/firewall settings to ensure the port is accessible
3. Try updating vite.config.ts to explicitly set the host:
   ```typescript
   server: {
     host: "0.0.0.0",
     port: 8080,
     hmr: {
       host: "localhost",
     },
   }
   ```
4. Close Xcode, run `npx cap update ios`, `npx cap sync` and try again

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
