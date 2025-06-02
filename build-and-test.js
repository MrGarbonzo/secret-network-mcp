#!/usr/bin/env node

// Build script to ensure everything is compiled
const { execSync } = require('child_process');
const path = require('path');

console.log('🔧 Building Secret Network MCP Server...');

try {
  // Change to project directory
  const projectDir = 'F:\\coding\\secret-network-mcp';
  process.chdir(projectDir);
  
  console.log('📂 Current directory:', process.cwd());
  
  // Clean and build
  console.log('🧹 Cleaning old build...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('✅ Build completed successfully!');
  console.log('🚀 You can now restart Claude Desktop to test the updated server.');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  console.log('💡 Try running: npm install && npm run build');
}
