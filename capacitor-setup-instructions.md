
# Capacitor Setup Instructions

## Important: First-time Setup

1. First, make sure you're in your project directory (not your home directory):
```bash
cd /path/to/your/project
```

2. Make sure you've pulled the latest code and installed all dependencies:
```bash
npm install
```

3. **DO NOT run** `npx cap init` as it's already initialized. The configuration is in `capacitor.config.json`.

4. Build your project first:
```bash
npm run build
```

## Standard Setup

5. If you have an existing ios folder, remove it first:
```bash
rm -rf ios
```

6. Add the iOS platform:
```bash
npx cap add ios
```

7. Sync your web code to the native project:
```bash
npx cap sync
```

8. To open the project in Xcode:
```bash
npx cap open ios
```

## Troubleshooting: Missing Podfile Error

If you encounter the "Error: ENOENT: no such file or directory, open '.../ios/App/Podfile'" error:

1. Verify your iOS folder structure. You should have:
```
ios/
  ├── App/
  │   ├── App/
  │   ├── App.xcodeproj/
  │   ├── App.xcworkspace/
  │   └── Podfile  <-- This file is missing
  └── capacitor-cordova-ios-plugins/
```

2. If the Podfile is missing, create it manually:
```bash
# First, ensure the App directory exists
mkdir -p ios/App

# Create a basic Podfile
cat > ios/App/Podfile << 'EOL'
platform :ios, '13.0'
use_frameworks!

# workaround to avoid Xcode caching of Pods that requires
# Product -> Clean Build Folder after new Cordova plugins installed
# Requires CocoaPods 1.6 or newer
install! 'cocoapods', :disable_input_output_paths => true

def capacitor_pods
  pod 'Capacitor', :path => '../../node_modules/@capacitor/ios'
  pod 'CapacitorCordova', :path => '../../node_modules/@capacitor/ios'
end

target 'App' do
  capacitor_pods
  # Add your Pods here
end
EOL
```

3. Try running the sync command again:
```bash
npx cap sync
```

4. If you still encounter issues, you may need to install CocoaPods if it's not already installed:
```bash
sudo gem install cocoapods
```

5. Run pod install manually:
```bash
cd ios/App && pod install && cd ../..
```

## Troubleshooting: App ID Format Error

If you see an error message about invalid App ID format:

1. This might happen if you try to run `npx cap init` again, which you shouldn't do since the project is already initialized.

2. Verify your capacitor.config.json has the correct appId format:
   - It should be in Java package form with no dashes (ex: com.example.app)
   - Have at least two segments (one or more dots)
   - Each segment must start with a letter
   - All characters must be alphanumeric or an underscore [a-zA-Z0-9_]

3. For Capacitor v4+, if you get "unknown option" errors with "--skip-appid-validation", try these steps instead:
   
   a. First check if your capacitor.config.json has the correct format already:
   ```json
   {
     "appId": "com.lovable.flypcast",
     "appName": "FlypCast",
     "webDir": "dist",
     "server": {
       "url": "https://your-project-url.com",
       "cleartext": true
     }
   }
   ```
   
   b. Make sure you've built your web app first:
   ```bash
   npm run build
   ```
   
   c. Delete any existing ios folder:
   ```bash
   rm -rf ios
   ```
   
   d. Run the add command without any extra flags:
   ```bash
   npx cap add ios
   ```
   
   e. If this still fails, you might need to try reinstalling the Capacitor CLI:
   ```bash
   npm uninstall -g @capacitor/cli
   npm install -g @capacitor/cli@latest
   ```

## Alternative Setup (Skip iOS Platform Addition)

If you're experiencing persistent issues with the `npx cap add ios` command, you can try this alternative approach:

1. Create the iOS folder structure manually:
```bash
mkdir -p ios/App/App
mkdir -p ios/App/Pods
mkdir -p ios/App/public
```

2. Download a basic Capacitor iOS template:
```bash
# Option 1: Clone the template repository (recommended)
git clone https://github.com/ionic-team/capacitor-ios-template-minimal.git temp-ios
cp -r temp-ios/* ios/
rm -rf temp-ios

# Option 2: If git clone doesn't work, download directly
curl -L https://github.com/ionic-team/capacitor-ios-template-minimal/archive/refs/heads/main.zip -o ios-template.zip
unzip ios-template.zip
cp -r capacitor-ios-template-minimal-main/* ios/
rm -rf capacitor-ios-template-minimal-main ios-template.zip
```

3. Edit the App/App/Info.plist file to match your app configuration:
```bash
# Open Info.plist in your text editor
# Change CFBundleIdentifier to match your appId in capacitor.config.json (com.lovable.flypcast)
# Change CFBundleDisplayName to match your appName in capacitor.config.json (FlypCast)
```

4. Run the sync command to copy your web content:
```bash
npx cap sync
```

5. If sync completes but you still can't open the project, try creating a basic Xcode project configuration:
```bash
# Create a basic xcodeproj file
touch ios/App/App.xcodeproj
```

6. Try opening in Xcode:
```bash
npx cap open ios
```

7. If Xcode fails to open the project properly, you may need to:
   - Open Xcode manually
   - Choose "Open another project..."
   - Navigate to your project's ios/App directory
   - Select the .xcworkspace file (if it exists) or create a new project
   - Set your Bundle Identifier to "com.lovable.flypcast"
   - Configure your Team for signing

## Manual Configuration (Last Resort)

If you're still having trouble, you can create a completely new iOS app in Xcode and manually integrate Capacitor:

1. Open Xcode and create a new iOS app project
2. Name it "App" and save it in your project's ios directory
3. Set the Bundle Identifier to "com.lovable.flypcast"
4. Add the Capacitor iOS SDK using Swift Package Manager:
   - In Xcode, go to File > Add Packages...
   - Enter URL: https://github.com/ionic-team/capacitor-ios
   - Select the latest version
5. Add your web files:
   - Create a "public" folder in your Xcode project
   - Copy files from your "dist" folder into this "public" folder
6. Configure AppDelegate.swift to load your web content
7. Run your app directly from Xcode

## Common Issues and Solutions

### NPM Error: "Could not read package.json"
If you see this error, you are likely not in your project directory. Make sure to navigate to your project folder first before running any npm commands.

### App ID Format Error
If you see an error about invalid App ID format, the App ID in capacitor.config.json must:
- Be in Java package form with no dashes (ex: com.example.app)
- Have at least two segments (one or more dots)
- Each segment must start with a letter
- All characters must be alphanumeric or an underscore [a-zA-Z0-9_]

### iOS Platform Not Added
If you see "ios platform has not been added yet", try these steps:
1. Make sure you've run `npm run build` before adding iOS
2. Try removing the ios folder if it exists: `rm -rf ios`
3. Then run `npx cap add ios` again
4. If issues persist, check that Xcode is properly installed
5. As a last resort, use the Alternative Setup method above

### Xcode Signing Issues
When opening in Xcode:
- Select your project in the Navigator
- Go to "Signing & Capabilities" 
- Check "Automatically manage signing"
- Select your Team (Apple ID)

## Running on Physical Devices
To run the app on a physical iOS device:
1. Open the project in Xcode using `npx cap open ios`
2. Connect your iOS device
3. Select your device in Xcode
4. Click the Play button to build and run

## Development with Live Reload
For development and live-reload, you can use:
```bash
npm run dev
npx cap run ios -l --external
```

Remember to run `npx cap sync` anytime you make changes to your web code or after you run a build.
