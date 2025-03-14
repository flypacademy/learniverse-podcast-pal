
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
