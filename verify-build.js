// Simple build verification test
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

console.log('🔍 Verifying Secret Network MCP build...');

// Check if built files exist
const distDir = './dist';
const requiredFiles = [
  'server.js',
  'server-tcp.js',
  'services/chainAbstraction.js',
  'tools/network.js',
  'tools/tokens.js',
  'tools/contracts.js',
  'utils/index.js'
];

let allGood = true;

console.log('\n📁 Checking built files:');
for (const file of requiredFiles) {
  const fullPath = join(distDir, file);
  if (existsSync(fullPath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allGood = false;
  }
}

// Check package.json
console.log('\n📦 Checking package.json:');
try {
  const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));
  console.log(`✅ Name: ${pkg.name}`);
  console.log(`✅ Version: ${pkg.version}`);
  console.log(`✅ Main: ${pkg.main}`);
  console.log(`✅ Type: ${pkg.type}`);
} catch (error) {
  console.log('❌ package.json error:', error.message);
  allGood = false;
}

// Check Dockerfile
console.log('\n🐳 Checking Docker files:');
const dockerFiles = ['Dockerfile', 'docker-compose.yml', 'docker-compose.prod.yml'];
for (const file of dockerFiles) {
  if (existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allGood = false;
  }
}

console.log('\n' + '='.repeat(50));
if (allGood) {
  console.log('🎉 Build verification PASSED!');
  console.log('Ready for Docker build and deployment.');
} else {
  console.log('❌ Build verification FAILED!');
  console.log('Please fix the missing files before proceeding.');
  process.exit(1);
}

console.log('\n📋 Next steps:');
console.log('1. Run: npm run docker:build:prod');
console.log('2. Test: docker run --rm secret-network-mcp:latest');
console.log('3. Set up GitHub Actions for automated builds');
