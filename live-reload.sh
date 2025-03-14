
#!/bin/bash

echo "==== Starting FlypCast Development with Live Reload ===="

# Start development server
echo "Starting development server..."
npm run dev &
DEV_PID=$!

# Wait a moment for dev server to initialize
sleep 5

# Run with live reload
echo "Starting iOS simulator with live reload..."
npx cap sync
npx cap run ios -l --external

# If the iOS command exits, kill the dev server
kill $DEV_PID

echo "==== Development session ended ===="
