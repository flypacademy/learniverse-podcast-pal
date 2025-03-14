
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

5. Add the iOS platform:
```bash
npx cap add ios
```

6. Sync your web code to the native project:
```bash
npx cap sync
```

7. To open the project in Xcode:
```bash
npx cap open ios
```

## Common Issues and Solutions

### NPM Error: "Could not read package.json"
If you see this error, you are likely not in your project directory. Make sure to navigate to your project folder first before running any npm commands.

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
