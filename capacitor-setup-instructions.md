
# Capacitor Setup Instructions

After installing the dependencies, follow these steps to complete the Capacitor setup:

1. First, add the iOS platform:
```bash
npx cap add ios
```

2. Build your project:
```bash
npm run build
```

3. Sync your web code to the native project:
```bash
npx cap sync
```

4. To open the project in Xcode:
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
