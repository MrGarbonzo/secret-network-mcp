#!/usr/bin/env node

/**
 * Debug test runner to identify specific issues
 */

import { readFileSync, existsSync } from 'fs';

async function debugTests() {
  console.log('🔍 Debug Test Runner - Identifying Issues');
  console.log('==========================================\n');

  // Test 1: Package.json detailed check
  console.log('📦 Package.json Debug:');
  try {
    const pkgContent = readFileSync('./package.json', 'utf8');
    console.log('   ✅ File read successfully');
    
    const pkg = JSON.parse(pkgContent);
    console.log('   ✅ JSON parsed successfully');
    
    console.log('   📋 Package name:', pkg.name);
    console.log('   📋 Package type:', pkg.type);
    console.log('   📋 Has dependencies:', !!pkg.dependencies);
    console.log('   📋 Has MCP SDK:', !!pkg.dependencies?.['@modelcontextprotocol/sdk']);
    console.log('   📋 Has secretjs:', !!pkg.dependencies?.['secretjs']);
    console.log('   📋 Has scripts:', !!pkg.scripts);
    console.log('   📋 Has build script:', !!pkg.scripts?.build);
    console.log('   📋 Has test script:', !!pkg.scripts?.test);
    
    // Check Docker scripts specifically
    console.log('   📋 Has docker:build:', !!pkg.scripts?.['docker:build']);
    console.log('   📋 Has docker:run:', !!pkg.scripts?.['docker:run']);
    
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }

  // Test 2: Network config detailed check
  console.log('\n🌐 Network Config Debug:');
  try {
    const networksContent = readFileSync('./config/networks.json', 'utf8');
    console.log('   ✅ File read successfully');
    
    const networks = JSON.parse(networksContent);
    console.log('   ✅ JSON parsed successfully');
    
    console.log('   📋 Has testnet:', !!networks.testnet);
    console.log('   📋 Testnet chainId:', networks.testnet?.chainId);
    console.log('   📋 Has mainnet:', !!networks.mainnet);
    console.log('   📋 Mainnet chainId:', networks.mainnet?.chainId);
    console.log('   📋 Testnet rpcUrl:', !!networks.testnet?.rpcUrl);
    console.log('   📋 Mainnet rpcUrl:', !!networks.mainnet?.rpcUrl);
    
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }

  // Test 3: Contract config detailed check
  console.log('\n📄 Contract Config Debug:');
  try {
    const contractsContent = readFileSync('./config/contracts.json', 'utf8');
    console.log('   ✅ File read successfully');
    
    const contracts = JSON.parse(contractsContent);
    console.log('   ✅ JSON parsed successfully');
    
    console.log('   📋 Has testnet:', !!contracts.testnet);
    console.log('   📋 Has mainnet:', !!contracts.mainnet);
    console.log('   📋 Testnet tokens:', !!contracts.testnet?.tokens);
    console.log('   📋 Mainnet tokens:', !!contracts.mainnet?.tokens);
    
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }

  // Test 4: Utils module debug
  console.log('\n🔧 Utils Module Debug:');
  try {
    const utils = await import('./dist/utils/index.js');
    console.log('   ✅ Module imported successfully');
    
    console.log('   📋 Has formatMCPResponse:', typeof utils.formatMCPResponse);
    console.log('   📋 Has getEnvironmentConfig:', typeof utils.getEnvironmentConfig);
    
    // Test formatMCPResponse
    try {
      const response = utils.formatMCPResponse(true, { test: 'data' });
      console.log('   📋 formatMCPResponse result:', {
        success: response.success,
        hasData: !!response.data,
        hasTimestamp: !!response.timestamp
      });
    } catch (error) {
      console.log('   ❌ formatMCPResponse error:', error.message);
    }
    
    // Test getEnvironmentConfig
    try {
      const config = utils.getEnvironmentConfig();
      console.log('   📋 getEnvironmentConfig result:', {
        hasNodeEnv: !!config.NODE_ENV,
        hasNetwork: !!config.NETWORK,
        hasPort: !!config.PORT,
        port: config.PORT
      });
    } catch (error) {
      console.log('   ❌ getEnvironmentConfig error:', error.message);
    }
    
  } catch (error) {
    console.log('   ❌ Module import error:', error.message);
  }

  // Test 5: Dockerfile debug
  console.log('\n🐳 Dockerfile Debug:');
  try {
    if (existsSync('./Dockerfile')) {
      console.log('   ✅ Dockerfile exists');
      
      const content = readFileSync('./Dockerfile', 'utf8');
      console.log('   ✅ File read successfully');
      console.log('   📋 File length:', content.length);
      
      const hasNodeBase = content.includes('FROM node:18-alpine');
      const hasProjectName = content.includes('secret-network-mcp');
      const hasHealthcheck = content.includes('HEALTHCHECK');
      
      console.log('   📋 Has node base image:', hasNodeBase);
      console.log('   📋 Has project name:', hasProjectName);
      console.log('   📋 Has healthcheck:', hasHealthcheck);
      
      if (!hasNodeBase) {
        console.log('   📋 Base image line:', content.split('\n').find(line => line.includes('FROM')));
      }
      
    } else {
      console.log('   ❌ Dockerfile does not exist');
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }

  // Test 6: Environment variables debug
  console.log('\n🌍 Environment Variables Debug:');
  console.log('   📋 NODE_ENV:', process.env.NODE_ENV || 'undefined');
  console.log('   📋 NETWORK:', process.env.NETWORK || 'undefined');
  console.log('   📋 PORT:', process.env.PORT || 'undefined');
  console.log('   📋 LOG_LEVEL:', process.env.LOG_LEVEL || 'undefined');

  console.log('\n🎯 Summary');
  console.log('===========');
  console.log('The debug information above should help identify exactly what\'s failing.');
  console.log('Each test shows the specific values and conditions being checked.');
}

// Run debug tests
debugTests().catch(console.error);
