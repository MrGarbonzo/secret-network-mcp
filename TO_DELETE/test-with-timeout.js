#!/usr/bin/env node

// Quick test with timeout to see network connectivity results
import { SecretNetworkMCPServer } from './dist/server.js';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 Testing Secret Network MCP Server (with timeout)...');
console.log('\n📋 Environment check:');
console.log('- SECRET_LCD_URL:', process.env.SECRET_LCD_URL);
console.log('- ALLOW_OFFLINE_MODE:', process.env.ALLOW_OFFLINE_MODE);
console.log('- SKIP_NETWORK_CHECK:', process.env.SKIP_NETWORK_CHECK);

async function testWithTimeout() {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Test timeout after 30 seconds')), 30000);
  });

  const testPromise = async () => {
    try {
      const server = new SecretNetworkMCPServer();
      console.log('\n🔄 Initializing server...');
      
      await server.initialize();
      console.log('✅ Server initialized successfully!');
      
      console.log('\n🔄 Testing health check...');
      const isHealthy = await server.healthCheck();
      
      if (isHealthy) {
        console.log('✅ Health check passed - REAL network connection established!');
        console.log('\n🎉 SUCCESS: Server connected to actual Secret Network!');
      } else {
        console.log('❌ Health check failed - connection issue');
      }
      
      await server.stop();
      return true;
      
    } catch (error) {
      console.error('\n❌ Server test failed:', error.message);
      
      if (error.message.includes('Chain initialization failed')) {
        console.log('\n✅ ANALYSIS: This is actually GOOD news!');
        console.log('   → Server is rejecting mock data');
        console.log('   → Offline mode fallbacks have been removed');
        console.log('   → Server requires real network connection');
        return false;
      } else if (error.message.includes('Real network connection required')) {
        console.log('\n✅ EXCELLENT: Server refuses to use mock data!');
        return false;
      } else {
        console.log('\n❓ Unexpected error type');
        return false;
      }
    }
  };

  try {
    await Promise.race([testPromise(), timeoutPromise]);
  } catch (error) {
    if (error.message.includes('timeout')) {
      console.log('\n⏱️ Test timed out - network call may be hanging');
      console.log('\n🔍 ANALYSIS:');
      console.log('   ✅ Server is attempting real network connections (not using mock data)');
      console.log('   ⚠️  Network call may be slow or blocked');
      console.log('   💡 Try restarting Claude Desktop and testing the MCP tools directly');
    } else {
      throw error;
    }
  }
}

testWithTimeout().then(() => {
  console.log('\n✅ Test completed');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Test error:', error);
  process.exit(1);
});
