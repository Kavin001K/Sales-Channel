import { build } from 'esbuild';
import { readFileSync } from 'fs';

// Read package.json to get dependencies
const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));

// All dependencies should be external (will be available in node_modules at runtime)
const externalDependencies = Object.keys(pkg.dependencies || {});

build({
  entryPoints: ['server/index.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outdir: 'dist',
  external: [
    // Keep all dependencies external except the ones we explicitly want to bundle
    ...externalDependencies,
    // Also externalize native modules
    'fsevents',
    'lightningcss',
    '@babel/*',
    // Node built-ins are automatically external with platform: 'node'
  ],
  logLevel: 'info',
}).catch(() => process.exit(1));
