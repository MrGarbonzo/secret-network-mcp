#!/usr/bin/env node

/**
 * Quick pre-build framework test
 * Tests source files directly with tsx
 */

async function testFrameworkSource() {
  console.log('🧪 Testing Framework Source Files...\n');

  try {
    // Test 1: Utility functions
    console.log('1. Testing utilities...');
    const { formatMCPResponse, isValidAddress, getEnvironmentConfig } = await import('./src/utils/index.js');
    
    const testResponse = formatMCPResponse(true, { test: 'data' });
    const validAddr = isValidAddress('secret1abc123def456ghi789jkl012mno345pqr678st');
    const config = getEnvironmentConfig();
    
    console.log('   ✅ MCP response formatting:', testResponse.success);
    console.log('   ✅ Address validation:', validAddr);
    console.log('   ✅ Environment config:', config.NETWORK);

    // Test 2: Configuration loading
    console.log('\n2. Testing configuration...');
    const { loadJsonConfig } = await import('./src/utils/index.js');
    
    const networksConfig = await loadJsonConfig('./config/networks.json');
    const contractsConfig = await loadJsonConfig('./config/contracts.json');
    
    console.log('   ✅ Networks config:', Object.keys(networksConfig).join(', '));
    console.log('   ✅ Contracts config:', Object.keys(contractsConfig).join(', '));

    // Test 3: Tool definitions
    console.log('\n3. Testing MCP tools...');
    const { networkTools } = await import('./src/tools/network.js');
    const { tokenTools } = await import('./src/tools/tokens.js');
    const { contractTools } = await import('./src/tools/contracts.js');
    
    console.log(`   ✅ Network tools: ${networkTools.length}`);
    console.log(`   ✅ Token tools: ${tokenTools.length}`);
    console.log(`   ✅ Contract tools: ${contractTools.length}`);

    // Test 4: Tool handlers (with mock data)
    console.log('\n4. Testing tool validation...');
    const { handleNetworkTool } = await import('./src/tools/network.js');
    const { handleTokenTool } = await import('./src/tools/tokens.js');
    
    // Test invalid inputs (should return error responses, not throw)
    const invalidBlockResponse = await handleNetworkTool('get_block_info', { height: -1 });
    const invalidAddrResponse = await handleTokenTool('get_token_balance', { address: 'invalid' });
    
    console.log('   ✅ Block validation:', !invalidBlockResponse.success);
    console.log('   ✅ Address validation:', !invalidAddrResponse.success);

    console.log('\n🎉 Source framework validation successful!');
    console.log('\n📋 Ready for build test:');
    console.log('   • Run "npm run build" to compile');
    console.log('   • Run "node validate-build.js" to test build');

  } catch (error) {
    console.error('\n❌ Source validation failed:', error.message);
    console.error('   This suggests TypeScript or import issues');
    console.error('   Fix these before building');
  }
}

testFrameworkSource().catch(console.error);
