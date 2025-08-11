#!/usr/bin/env node
// Simple pre-launch auditor for web/electron + mobile PWA packaging
const fs = require('fs');
const path = require('path');

const fail = (msg) => { console.error(`✖ ${msg}`); process.exitCode = 1; };
const ok = (msg) => console.log(`✔ ${msg}`);

const root = process.cwd();

// 1) Required env vars
const requiredEnv = [
  'VITE_APP_NAME',
  'DATABASE_URL',
];
requiredEnv.forEach((k) => {
  if (!process.env[k]) fail(`Missing env var ${k}`); else ok(`Env ${k} present`);
});

// 2) Legal pages
const legalFiles = [
  path.join(root, 'public', 'privacy-policy.html'),
  path.join(root, 'public', 'terms.html'),
];
legalFiles.forEach((f) => {
  if (!fs.existsSync(f)) fail(`Missing legal file: ${path.relative(root, f)}`); else ok(`Found ${path.relative(root, f)}`);
});

// 3) Icons and screenshots (basic existence checks)
const iconPaths = [
  path.join(root, 'public', 'icon.png'),
];
iconPaths.forEach((f) => {
  if (!fs.existsSync(f)) fail(`Missing icon: ${path.relative(root, f)}`); else ok(`Found ${path.relative(root, f)}`);
});

// 4) Package sanity
const pkg = require(path.join(root, 'package.json'));
if (!pkg.version || pkg.version === '0.0.0') fail('Update package.json version'); else ok(`Version ${pkg.version}`);
if (!pkg.build || !pkg.build.productName) fail('electron-builder productName missing'); else ok('Build config present');

// 5) Route presence (basic)
const mustHaveFiles = [
  'src/pages/CompanyLogin.tsx',
  'src/pages/EmployeeLogin.tsx',
  'src/pages/Dashboard.tsx',
  'src/components/ProtectedRoute.tsx'
];
mustHaveFiles.forEach((rel) => {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) fail(`Missing file: ${rel}`); else ok(`Found ${rel}`);
});

if (process.exitCode) {
  console.error('\nPrelaunch checks found issues. Please fix and re-run.');
  process.exit(process.exitCode);
} else {
  console.log('\nAll prelaunch checks passed.');
}


