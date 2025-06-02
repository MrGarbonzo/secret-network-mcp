#!/usr/bin/env node

// Independent test to verify server can start
console.log('🧪 Testing Secret Network MCP Server startup...');
console.log('=================================================');

async function testServerStartup() {
  console.log('📁 Checking files...');
  
  const fs = require('fs');
  const path = require('path');
  
  // Check if we're in the right directory
  const currentDir = process.cwd();
  console.log(`📂 Current directory: ${currentDir}`);
  
  // Check if server file exists
  const serverPath = path.join(currentDir, 'dist', 'server.js');
  if (!fs.existsSync(serverPath)) {
    console.error(`❌ Server file not found: ${serverPath}`);
    console.log('💡 Run "npm run build" first');
    process.exit(1);
  }
  console.log(`✅ Server file found: ${serverPath}`);
  
  // Check package.json
  const packagePath = path.join(currentDir, 'package.json');
  if (fs.existsSync(packagePath)) {
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    console.log(`📦 Package: ${pkg.name} v${pkg.version}`);
    console.log(`🔧 Type: ${pkg.type}`);
  }
  
  // Set environment variables for testing
  process.env.NODE_ENV = 'development';
  process.env.NETWORK = 'testnet';
  process.env.LOG_LEVEL = 'debug';
  process.env.SKIP_NETWORK_CHECK = 'true';
  process.env.ALLOW_OFFLINE_MODE = 'true';
  
  console.log('🌐 Environment variables set:');
  console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`   NETWORK: ${process.env.NETWORK}`);
  console.log(`   SKIP_NETWORK_CHECK: ${process.env.SKIP_NETWORK_CHECK}`);
  
  console.log('\n🚀 Attempting to import and start server...');
  
  try {
    // Import the server
    const { SecretNetworkMCPServer } = await import('./dist/server.js');
    console.log('✅ Server module imported successfully');
    
    // Create server instance
    const server = new SecretNetworkMCPServer();
    console.log('✅ Server instance created');
    
    // Test initialization only (not full start to avoid STDIO issues)
    await server.initialize();
    console.log('✅ Server initialized successfully');
    
    console.log('\n🎉 SUCCESS! Server can start properly');
    console.log('📝 This means the issue is with Claude Desktop configuration');
    
    return true;
    
  } catch (error) {
    console.error('\n❌ FAILED! Server cannot start');
    console.error('📝 Error details:');
    console.error('   Message:', error.message);
    console.error('   Stack:', error.stack);
    
    if (error.code) {
      console.error('   Code:', error.code);
    }
    
    console.log('\n💡 Common fixes:');
    console.log('   • Run "npm install" to ensure dependencies');
    console.log('   • Run "npm run build" to compile TypeScript');
    console.log('   • Check your .env file configuration');
    console.log('   • Verify network connectivity');
    
    return false;
  }
}

// Handle process cleanup
process.on('SIGINT', () => {
  console.log('\n👋 Test interrupted by user');
  process.exit(0);
});

process.on('unhandledRejection', (error) => {
  console.error('\n💥 Unhandled promise rejection:', error);
  process.exit(1);
});

// Run the test
testServerStartup()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n💥 Test runner failed:', error);
    process.exit(1);
  });
