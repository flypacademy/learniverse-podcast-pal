
# iOS Build Guide for Learniverse App

This guide will help you build and run the Learniverse app on your iPhone.

## Prerequisites

1. macOS computer with Xcode installed (latest version recommended)
2. Apple Developer account (free account works for development)
3. iPhone device for testing
4. USB cable to connect your iPhone to your Mac

## Step 1: Clone and Prepare the Project

1. Clone your GitHub repository to your local machine
   ```bash
   git clone <your-github-repo-url>
   cd <your-repository-folder>
   ```

2. Install dependencies
   ```bash
   npm install
   ```

## Step 2: Build the Web App

1. Build the web app which will be packaged into the iOS app
   ```bash
   npm run build
   ```

## Step 3: Set Up iOS Project

1. Add iOS platform to the project (skip if already added)
   ```bash
   npx cap add ios
   ```

2. Sync the web build with the iOS project
   ```bash
   npx cap sync
   ```

3. Fix permissions on CocoaPods files (common issue)
   ```bash
   chmod -R +x ios/App/Pods
   ```

## Step 4: Open in Xcode and Configure

1. Open the project in Xcode
   ```bash
   npx cap open ios
   ```

2. In Xcode:
   - Select the "App" project in the Navigator panel
   - In the "Signing & Capabilities" tab, select your Apple Developer account
   - Create a development team (your personal Apple ID can be used)
   - Update the Bundle Identifier if needed (must be unique)

## Step 5: Connect Your iPhone

1. Connect your iPhone to your Mac with a USB cable
2. Trust the computer on your iPhone if prompted
3. In Xcode, select your iPhone from the device dropdown in the toolbar

## Step 6: Build and Run

1. In Xcode, click the Play button (▶️) to build and run the app on your device
2. The first time you run on your device, you'll need to:
   - On your iPhone: Go to Settings > General > Device Management
   - Trust the developer profile associated with your Apple ID

## Troubleshooting Common Issues

### If you encounter build errors:

1. Clean the build folder in Xcode:
   - Product > Clean Build Folder

2. Fix permissions again if needed:
   ```bash
   chmod -R +x ios/App/Pods
   ```

3. Update and sync again:
   ```bash
   npx cap update ios
   npx cap sync
   ```

### If you need to make code changes:

1. Edit your React code
2. Build the web app again:
   ```bash
   npm run build
   ```
3. Sync changes to iOS:
   ```bash
   npx cap sync
   ```
4. Open in Xcode and run again:
   ```bash
   npx cap open ios
   ```

## Updating the App

After making changes to your React code:

1. Rebuild the web app:
   ```bash
   npm run build
   ```

2. Sync with iOS:
   ```bash
   npx cap sync
   ```

3. Open in Xcode:
   ```bash
   npx cap open ios
   ```

4. Click the Play button in Xcode to deploy the updated app to your device

## Helpful Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Apple Developer Documentation](https://developer.apple.com/documentation/)
- [Xcode Help](https://help.apple.com/xcode/)

