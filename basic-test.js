#!/usr/bin/env node

/**
 * Ultra-simple test runner that tests basic setup
 * No ES modules required - just basic Node.js functionality
 */

import { readFileSync, existsSync } from 'fs';

console.log('🧪 Secret Network MCP - Basic Setup Test');
console.log('=========================================\n');

let allPassed = true;

function test(name, condition) {
  if (condition) {
    console.log(`✅ ${name}`);
  } else {
    console.log(`❌ ${name}`);
    allPassed = false;
  }
}

// Test 1: Basic file structure
console.log('📁 Project Structure:');
test('src directory exists', existsSync('./src'));
test('config directory exists', existsSync('./config'));
test('package.json exists', existsSync('./package.json'));
test('tsconfig.json exists', existsSync('./tsconfig.json'));
test('Dockerfile exists', existsSync('./Dockerfile'));

// Test 2: Critical source files
console.log('\n📄 Source Files:');
test('server.ts exists', existsSync('./src/server.ts'));
test('utils/index.ts exists', existsSync('./src/utils/index.ts'));
test('tools/network.ts exists', existsSync('./src/tools/network.ts'));
test('tools/tokens.ts exists', existsSync('./src/tools/tokens.ts'));
test('tools/contracts.ts exists', existsSync('./src/tools/contracts.ts'));

// Test 3: Configuration files
console.log('\n⚙️  Configuration:');
test('networks.json exists', existsSync('./config/networks.json'));
test('contracts.json exists', existsSync('./config/contracts.json'));

// Test 4: Package.json validation
console.log('\n📦 Package Configuration:');
try {
  const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));
  test('Package name is correct', pkg.name === 'secret-network-mcp');
  test('Package type is module', pkg.type === 'module');
  test('Has MCP SDK dependency', !!pkg.dependencies['@modelcontextprotocol/sdk']);
  test('Has Secret.js dependency', !!pkg.dependencies['secretjs']);
  test('Has build script', !!pkg.scripts['build']);
  test('Has test script', !!pkg.scripts['test']);
} catch (error) {
  test('Package.json is valid JSON', false);
  allPassed = false;
}

// Test 5: TypeScript configuration
console.log('\n🔧 TypeScript Config:');
try {
  const tsConfig = JSON.parse(readFileSync('./tsconfig.json', 'utf8'));
  test('Target is ES2022', tsConfig.compilerOptions?.target === 'ES2022');
  test('Module is NodeNext', tsConfig.compilerOptions?.module === 'NodeNext');
  test('Strict mode enabled', tsConfig.compilerOptions?.strict === true);
  test('Isolated modules enabled', tsConfig.compilerOptions?.isolatedModules === true);
} catch (error) {
  test('tsconfig.json is valid JSON', false);
  allPassed = false;
}

// Test 6: Network configuration
console.log('\n🌐 Network Config:');
try {
  const networks = JSON.parse(readFileSync('./config/networks.json', 'utf8'));
  test('Testnet config exists', !!networks.testnet);
  test('Mainnet config exists', !!networks.mainnet);
  test('Testnet chainId correct', networks.testnet?.chainId === 'pulsar-3');
  test('Mainnet chainId correct', networks.mainnet?.chainId === 'secret-4');
} catch (error) {
  test('networks.json is valid JSON', false);
  allPassed = false;
}

// Test 7: Build status
console.log('\n🔨 Build Status:');
if (existsSync('./dist')) {
  test('dist directory exists', true);
  test('server.js compiled', existsSync('./dist/server.js'));
  test('utils compiled', existsSync('./dist/utils/index.js'));
  console.log('   💡 Framework is built and ready!');
} else {
  console.log('   ⚠️  No dist directory found');
  console.log('   💡 Run "npm run build" to compile TypeScript');
}

// Summary
console.log('\n📊 Summary:');
if (allPassed) {
  console.log('🎉 All basic setup tests passed!');
  console.log('\n🚀 Ready for next steps:');
  if (!existsSync('./dist')) {
    console.log('   1. npm run build - Compile TypeScript');
    console.log('   2. npm run test:quick - Run comprehensive tests');
    console.log('   3. npm test - Run Jest test suite');
  } else {
    console.log('   1. npm run test:quick - Run comprehensive tests');
    console.log('   2. npm test - Run Jest test suite');
    console.log('   3. npm run dev - Start development server');
  }
} else {
  console.log('❌ Some basic setup issues found');
  console.log('🔧 Please fix the issues above before proceeding');
}

console.log(`\n${allPassed ? '✅' : '❌'} Basic setup test ${allPassed ? 'completed successfully' : 'completed with issues'}`);
process.exit(allPassed ? 0 : 1);
