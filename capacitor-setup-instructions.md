
# Capacitor Setup Instructions

## Important: First-time Setup

1. First, make sure you've pulled the latest code and installed all dependencies:
```bash
npm install
```

2. **DO NOT run** `npx cap init` as it's already initialized. The configuration is in `capacitor.config.json`.

3. Build your project first:
```bash
npm run build
```

4. Add the iOS platform:
```bash
npx cap add ios
```

5. Sync your web code to the native project:
```bash
npx cap sync
```

6. To open the project in Xcode:
```bash
npx cap open ios
```

## Important Notes

- Make sure you have Xcode installed for iOS development
- For development and live-reload, you can use:
```bash
npm run dev
npx cap run ios -l --external
```

## Running on Physical Devices
To run the app on a physical iOS device:
1. Open the project in Xcode using `npx cap open ios`
2. Connect your iOS device
3. Select your device in Xcode
4. Click the Play button to build and run

Remember to run `npx cap sync` anytime you make changes to your web code or after you run a build.
