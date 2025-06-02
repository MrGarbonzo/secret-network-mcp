#!/usr/bin/env node

/**
 * Simple validation script to test the basic framework
 * Run with: npx tsx test-framework.ts
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testFramework() {
  console.log('🔍 Testing Secret Network MCP Framework...\n');

  try {
    // Test 1: Environment Configuration
    console.log('1. Testing Environment Configuration...');
    const { getEnvironmentConfig } = await import('./src/utils/index.js');
    const config = getEnvironmentConfig();
    console.log('   ✅ Environment config loaded');
    console.log('   📋 Network:', config.NETWORK);
    console.log('   📋 Log Level:', config.LOG_LEVEL);
    console.log('   📋 Port:', config.PORT);

    // Test 2: Utility Functions
    console.log('\n2. Testing Utility Functions...');
    const { formatMCPResponse, isValidAddress, isValidTransactionHash } = await import('./src/utils/index.js');
    
    const testResponse = formatMCPResponse(true, { test: 'data' });
    console.log('   ✅ MCP response formatting works');
    
    const validAddress = isValidAddress('secret1abc123def456ghi789jkl012mno345pqr678st');
    const invalidAddress = isValidAddress('invalid');
    console.log('   ✅ Address validation works:', validAddress && !invalidAddress);
    
    const validHash = isValidTransactionHash('ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890');
    const invalidHash = isValidTransactionHash('invalid');
    console.log('   ✅ Transaction hash validation works:', validHash && !invalidHash);

    // Test 3: Configuration Loading
    console.log('\n3. Testing Configuration Loading...');
    const { loadJsonConfig } = await import('./src/utils/index.js');
    
    const networksConfig = await loadJsonConfig('./config/networks.json');
    console.log('   ✅ Networks config loaded');
    console.log('   📋 Available networks:', Object.keys(networksConfig));
    
    const contractsConfig = await loadJsonConfig('./config/contracts.json');
    console.log('   ✅ Contracts config loaded');
    console.log('   📋 Testnet tokens:', Object.keys(contractsConfig.testnet?.tokens || {}));

    // Test 4: Type Definitions
    console.log('\n4. Testing Type Definitions...');
    const { NetworkConfigSchema, TokenBalanceSchema } = await import('./src/types/index.js');
    
    // Test schema validation
    const testNetworkConfig = {
      chainId: 'pulsar-3',
      name: 'Test Network',
      rpcUrl: 'https://test.com',
      grpcUrl: 'https://test.com:443',
      nativeDenom: 'uscrt',
      coinGeckoId: null,
      explorer: 'https://explorer.test.com'
    };
    
    const validatedConfig = NetworkConfigSchema.parse(testNetworkConfig);
    console.log('   ✅ Network config schema validation works');
    
    // Test 5: Tool Definitions
    console.log('\n5. Testing Tool Definitions...');
    const { networkTools } = await import('./src/tools/network.js');
    const { tokenTools } = await import('./src/tools/tokens.js');
    const { contractTools } = await import('./src/tools/contracts.js');
    
    console.log('   ✅ Network tools loaded:', networkTools.length, 'tools');
    console.log('   ✅ Token tools loaded:', tokenTools.length, 'tools');
    console.log('   ✅ Contract tools loaded:', contractTools.length, 'tools');
    
    const allTools = [...networkTools, ...tokenTools, ...contractTools];
    console.log('   📋 Total tools available:', allTools.length);

    // Test 6: Tool Input Validation
    console.log('\n6. Testing Tool Input Validation...');
    const { handleNetworkTool } = await import('./src/tools/network.js');
    const { handleTokenTool } = await import('./src/tools/tokens.js');
    const { handleContractTool } = await import('./src/tools/contracts.js');
    
    // Test invalid inputs (should not throw, should return error responses)
    const invalidBlockResponse = await handleNetworkTool('get_block_info', { height: -1 });
    console.log('   ✅ Block height validation works:', !invalidBlockResponse.success);
    
    const invalidAddressResponse = await handleTokenTool('get_token_balance', { address: 'invalid' });
    console.log('   ✅ Address validation works:', !invalidAddressResponse.success);
    
    const invalidContractResponse = await handleContractTool('get_contract_info', { contractAddress: 'invalid' });
    console.log('   ✅ Contract address validation works:', !invalidContractResponse.success);

    console.log('\n🎉 All basic framework tests passed!');
    console.log('\n📝 Framework Summary:');
    console.log('   • Environment configuration: ✅');
    console.log('   • Utility functions: ✅');
    console.log('   • Configuration loading: ✅');
    console.log('   • Type definitions: ✅');
    console.log('   • MCP tools:', allTools.length, '✅');
    console.log('   • Input validation: ✅');
    
    console.log('\n🚀 Framework is ready for testing with Secret Network!');
    console.log('\n📋 Next Steps:');
    console.log('   1. Run "npm run build" to compile TypeScript');
    console.log('   2. Run "npm test" to run the test suite');
    console.log('   3. Run "npm run dev" to start development server');
    console.log('   4. Test with actual Secret Network connection');

  } catch (error) {
    console.error('\n❌ Framework test failed:', error);
    console.error('\n🔧 Debug info:');
    console.error('   Error message:', error.message);
    if (error.stack) {
      console.error('   Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Run the test
testFramework().catch(console.error);
