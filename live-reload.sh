
#!/bin/bash

echo "==== Starting FlypCast Development with Live Reload ===="

# Kill any existing Node processes
echo "Cleaning up existing processes..."
killall node 2>/dev/null
killall npm 2>/dev/null

# Ensure build is done first
echo "Building application..."
npm run build

# Sync with iOS
echo "Syncing with iOS..."
npx cap sync

# Start development server
echo "Starting development server..."
npm run dev &
DEV_PID=$!

# Wait a moment for dev server to initialize
echo "Waiting for development server to initialize..."
sleep 5

# Run with live reload
echo "Starting iOS simulator with live reload..."
npx cap run ios -l --external

# If the iOS command exits, kill the dev server
kill $DEV_PID

echo "==== Development session ended ===="
