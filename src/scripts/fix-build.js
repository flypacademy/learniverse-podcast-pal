
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Check if package.json exists
const packageJsonPath = path.resolve(process.cwd(), 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('Error: package.json not found!');
  process.exit(1);
}

try {
  // First try to run with npx
  console.log('Attempting to build with npx vite build...');
  execSync('npx vite build', { stdio: 'inherit' });
  console.log('Build successful!');
  
  // Check if dist folder was created
  const distPath = path.resolve(process.cwd(), 'dist');
  if (fs.existsSync(distPath)) {
    console.log('Dist folder created successfully. Ready for npx cap sync');
  } else {
    console.error('Warning: build completed but dist folder not found!');
  }
} catch (error) {
  console.error('Build failed with npx. Trying with node_modules path...');
  try {
    // Try using the direct path to vite in node_modules
    execSync('node ./node_modules/vite/bin/vite.js build', { stdio: 'inherit' });
    console.log('Build successful with direct node_modules path!');
  } catch (secondError) {
    console.error('All build attempts failed. Please ensure vite is installed.');
    console.error('Try running: npm install vite --save-dev');
    process.exit(1);
  }
}
