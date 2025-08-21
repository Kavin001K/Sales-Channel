#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting client build for Netlify...');

try {
  // Change to the root directory
  process.chdir(path.join(__dirname, '..'));
  
  // Install dependencies if node_modules doesn't exist
  if (!fs.existsSync('node_modules')) {
    console.log('📦 Installing dependencies...');
    execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });
  }
  
  // Build the client
  console.log('🔨 Building client...');
  execSync('npm run build:client', { stdio: 'inherit' });
  
  // Verify the build output
  const buildPath = path.join('dist', 'public');
  if (fs.existsSync(buildPath)) {
    console.log('✅ Build completed successfully!');
    console.log(`📁 Build output: ${buildPath}`);
    
    // List build contents
    const files = fs.readdirSync(buildPath);
    console.log('📋 Build contents:', files);
  } else {
    console.error('❌ Build failed - dist/public directory not found');
    process.exit(1);
  }
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
