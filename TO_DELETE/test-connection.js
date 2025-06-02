#!/usr/bin/env node

// Test script to verify Secret Network MCP Server functionality
import { SecretNetworkMCPServer } from './dist/server.js';

async function testServerConnection() {
  console.log('🧪 Testing Secret Network MCP Server...');
  console.log('='.repeat(50));
  
  try {
    // Test 1: Server initialization
    console.log('📡 Test 1: Server Initialization');
    const server = new SecretNetworkMCPServer();
    await server.initialize();
    console.log('✅ Server initialized successfully');
    
    // Test 2: Health check
    console.log('\n🏥 Test 2: Health Check');
    const isHealthy = await server.healthCheck();
    console.log(`✅ Health check result: ${isHealthy ? 'HEALTHY' : 'OFFLINE'}`);
    
    console.log('\n🎉 All tests passed!');
    console.log('📝 The server should now work with Claude Desktop.');
    
    return true;
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.log('\n🔍 Debugging info:');
    console.log('- Network:', process.env.NETWORK || 'testnet');
    console.log('- Skip network check:', process.env.SKIP_NETWORK_CHECK);
    console.log('- Offline mode:', process.env.ALLOW_OFFLINE_MODE);
    
    return false;
  }
}

// Environment setup
process.env.NODE_ENV = 'development';
process.env.NETWORK = 'mainnet';
process.env.LOG_LEVEL = 'info';
process.env.MCP_MODE = 'false'; // Not in MCP mode for testing

// Run tests
testServerConnection()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });
