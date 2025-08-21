#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting client build for Netlify...');
console.log('📁 Current directory:', process.cwd());
console.log('📁 Script directory:', __dirname);

try {
  // Change to the root directory
  const rootDir = path.join(__dirname, '..');
  console.log('📁 Root directory:', rootDir);
  process.chdir(rootDir);
  console.log('📁 Changed to directory:', process.cwd());
  
  // Check if package.json exists
  if (!fs.existsSync('package.json')) {
    throw new Error('package.json not found in root directory');
  }
  
  // Check if client directory exists
  if (!fs.existsSync('client')) {
    throw new Error('client directory not found');
  }
  
  // Check if client/vite.config.ts exists
  if (!fs.existsSync('client/vite.config.ts')) {
    throw new Error('client/vite.config.ts not found');
  }
  
  // Always install dependencies to ensure they're available
  console.log('📦 Installing dependencies...');
  execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully');
  
  // Verify that vite is available
  console.log('🔍 Checking if vite is available...');
  try {
    execSync('npx vite --version', { stdio: 'pipe' });
    console.log('✅ Vite is available');
  } catch (viteError) {
    console.error('❌ Vite is not available, trying to install it specifically...');
    execSync('npm install vite@^5.4.14 --save', { stdio: 'inherit' });
  }
  
  // Try to run TypeScript check first
  console.log('🔍 Running TypeScript check...');
  try {
    execSync('npx tsc --noEmit --project client/tsconfig.app.json', { stdio: 'inherit' });
    console.log('✅ TypeScript check passed');
  } catch (tsError) {
    console.warn('⚠️  TypeScript check failed, but continuing with build...');
  }
  
  // Build the client using the simplified command
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
    
    // Check for critical files
    const criticalFiles = ['index.html', '_redirects'];
    for (const file of criticalFiles) {
      if (fs.existsSync(path.join(buildPath, file))) {
        console.log(`✅ ${file} found`);
      } else {
        console.warn(`⚠️  ${file} not found`);
      }
    }
  } else {
    console.error('❌ Build failed - dist/public directory not found');
    process.exit(1);
  }
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}
