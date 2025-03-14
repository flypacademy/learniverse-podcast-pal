
#!/bin/bash

echo "Setting up FlypCast iOS app..."

# Quick setup in one script
npm run build && \
rm -rf ios && \
rm -rf node_modules/.cache/capacitor && \
npx cap add ios && \
npx cap sync && \
npx cap open ios

echo "Setup complete! Build the app in Xcode to see your changes."
