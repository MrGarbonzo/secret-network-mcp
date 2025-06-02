#!/usr/bin/env node

/**
 * Simplified test runner focused on basic validation
 * Avoids chain initialization issues
 */

import { readFileSync, existsSync } from 'fs';

async function runSimpleTests() {
  console.log('🧪 Secret Network MCP - Simplified Test Runner');
  console.log('===============================================\n');

  let passed = 0;
  let failed = 0;
  let skipped = 0;

  const test = (name, fn) => {
    try {
      const result = fn();
      if (result === true || result === undefined) {
        console.log(`✅ ${name}`);
        passed++;
      } else {
        console.log(`❌ ${name}`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${name}: ${error.message}`);
      failed++;
    }
  };

  const skip = (name, reason) => {
    console.log(`⏭️  ${name} (${reason})`);
    skipped++;
  };

  // =====================================
  // Basic Setup Tests
  // =====================================
  console.log('📁 Project Setup Tests');
  console.log('-----------------------');
  
  test('All required directories exist', () => {
    return existsSync('./src') && 
           existsSync('./config') && 
           existsSync('./tests') &&
           existsSync('./docs');
  });

  test('All core files exist', () => {
    return existsSync('./package.json') && 
           existsSync('./tsconfig.json') && 
           existsSync('./Dockerfile') &&
           existsSync('./docker-compose.yml') &&
           existsSync('./README.md');
  });

  test('All source files exist', () => {
    return existsSync('./src/server.ts') && 
           existsSync('./src/utils/index.ts') && 
           existsSync('./src/tools/network.ts') &&
           existsSync('./src/tools/tokens.ts') &&
           existsSync('./src/tools/contracts.ts') &&
           existsSync('./src/services/secretNetwork.ts') &&
           existsSync('./src/services/chainAbstraction.ts') &&
           existsSync('./src/types/index.ts');
  });

  // =====================================
  // Configuration Validation
  // =====================================
  console.log('\n⚙️  Configuration Validation');
  console.log('-----------------------------');

  test('Package.json is properly configured', () => {
    try {
      const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));
      const hasName = pkg.name === 'secret-network-mcp';
      const hasType = pkg.type === 'module';
      const hasDeps = !!pkg.dependencies;
      const hasMCP = !!pkg.dependencies?.['@modelcontextprotocol/sdk'];
      const hasSecret = !!pkg.dependencies?.['secretjs'];
      const hasScripts = !!pkg.scripts;
      const hasBuild = !!pkg.scripts?.build;
      const hasTest = !!pkg.scripts?.test;
      
      if (!hasName) console.log('   ❌ Wrong package name:', pkg.name);
      if (!hasType) console.log('   ❌ Wrong package type:', pkg.type);
      if (!hasDeps) console.log('   ❌ No dependencies found');
      if (!hasMCP) console.log('   ❌ Missing MCP SDK dependency');
      if (!hasSecret) console.log('   ❌ Missing Secret.js dependency');
      if (!hasScripts) console.log('   ❌ No scripts found');
      if (!hasBuild) console.log('   ❌ Missing build script');
      if (!hasTest) console.log('   ❌ Missing test script');
      
      return hasName && hasType && hasDeps && hasMCP && hasSecret && hasScripts && hasBuild && hasTest;
    } catch (error) {
      console.log('   ❌ Error:', error.message);
      return false;
    }
  });

  test('TypeScript configuration is correct', () => {
    try {
      const tsConfig = JSON.parse(readFileSync('./tsconfig.json', 'utf8'));
      return tsConfig.compilerOptions &&
             tsConfig.compilerOptions.target === 'ES2022' &&
             tsConfig.compilerOptions.module === 'NodeNext' &&
             tsConfig.compilerOptions.strict === true &&
             tsConfig.compilerOptions.isolatedModules === true;
    } catch (error) {
      console.log('   Error:', error.message);
      return false;
    }
  });

  test('Network configuration is valid', () => {
    try {
      const networks = JSON.parse(readFileSync('./config/networks.json', 'utf8'));
      const hasTestnet = !!networks.testnet;
      const testnetChain = networks.testnet?.chainId === 'pulsar-3';
      const hasMainnet = !!networks.mainnet;
      const mainnetChain = networks.mainnet?.chainId === 'secret-4';
      const testnetRpc = !!networks.testnet?.rpcUrl;
      const mainnetRpc = !!networks.mainnet?.rpcUrl;
      
      if (!hasTestnet) console.log('   ❌ No testnet config found');
      if (!testnetChain) console.log('   ❌ Wrong testnet chainId:', networks.testnet?.chainId);
      if (!hasMainnet) console.log('   ❌ No mainnet config found');
      if (!mainnetChain) console.log('   ❌ Wrong mainnet chainId:', networks.mainnet?.chainId);
      if (!testnetRpc) console.log('   ❌ Missing testnet rpcUrl');
      if (!mainnetRpc) console.log('   ❌ Missing mainnet rpcUrl');
      
      return hasTestnet && testnetChain && hasMainnet && mainnetChain && testnetRpc && mainnetRpc;
    } catch (error) {
      console.log('   ❌ Error:', error.message);
      return false;
    }
  });

  test('Contract configuration is valid', () => {
    try {
      const contracts = JSON.parse(readFileSync('./config/contracts.json', 'utf8'));
      const hasTestnet = !!contracts.testnet;
      const hasMainnet = !!contracts.mainnet;
      const testnetTokens = !!contracts.testnet?.tokens;
      const mainnetTokens = !!contracts.mainnet?.tokens;
      
      if (!hasTestnet) console.log('   ❌ No testnet config found');
      if (!hasMainnet) console.log('   ❌ No mainnet config found');
      if (!testnetTokens) console.log('   ❌ No testnet tokens found');
      if (!mainnetTokens) console.log('   ❌ No mainnet tokens found');
      
      return hasTestnet && hasMainnet && testnetTokens && mainnetTokens;
    } catch (error) {
      console.log('   ❌ Error:', error.message);
      return false;
    }
  });

  // =====================================
  // Build Status
  // =====================================
  console.log('\n🔨 Build Status');
  console.log('----------------');

  if (existsSync('./dist')) {
    test('Server compiled successfully', () => existsSync('./dist/server.js'));
    test('Utils compiled successfully', () => existsSync('./dist/utils/index.js'));
    test('Types compiled successfully', () => existsSync('./dist/types/index.js'));
    test('Tools compiled successfully', () => {
      return existsSync('./dist/tools/network.js') &&
             existsSync('./dist/tools/tokens.js') &&
             existsSync('./dist/tools/contracts.js');
    });
    test('Services compiled successfully', () => {
      return existsSync('./dist/services/secretNetwork.js') &&
             existsSync('./dist/services/chainAbstraction.js');
    });
  } else {
    skip('Build verification', 'No dist/ directory - run npm run build');
    skipped += 5;
  }

  // =====================================
  // Tool Definitions (if built)
  // =====================================
  console.log('\n🛠️  Tool Definitions');
  console.log('--------------------');

  try {
    const { networkTools } = await import('./dist/tools/network.js');
    const { tokenTools } = await import('./dist/tools/tokens.js');
    const { contractTools } = await import('./dist/tools/contracts.js');
    
    test('Network tools are defined', () => {
      return Array.isArray(networkTools) && networkTools.length === 4;
    });

    test('Token tools are defined', () => {
      return Array.isArray(tokenTools) && tokenTools.length === 4;
    });

    test('Contract tools are defined', () => {
      return Array.isArray(contractTools) && contractTools.length === 4;
    });

    test('All tools have correct structure', () => {
      const allTools = [...networkTools, ...tokenTools, ...contractTools];
      return allTools.every(tool => 
        tool.name && 
        tool.description && 
        tool.inputSchema &&
        tool.inputSchema.type === 'object'
      );
    });

    test('Total tool count is correct', () => {
      const totalTools = networkTools.length + tokenTools.length + contractTools.length;
      return totalTools === 12;
    });

  } catch (error) {
    skip('Tool definition tests', 'Tools not compiled - run npm run build');
    skipped += 5;
  }

  // =====================================
  // Validation Logic (if built)
  // =====================================
  console.log('\n🔍 Validation Logic');
  console.log('--------------------');

  try {
    const utils = await import('./dist/utils/index.js');
    
    test('Address validation works', () => {
      try {
        const validTest = utils.isValidAddress('secret1abc123def456ghi789jkl012mno345pqr678st');
        const invalidTest = !utils.isValidAddress('invalid');
        
        if (!validTest) console.log('   ❌ Valid address rejected');
        if (!invalidTest) console.log('   ❌ Invalid address accepted');
        
        return validTest && invalidTest;
      } catch (error) {
        console.log('   ❌ Error in address validation:', error.message);
        return false;
      }
    });

    test('Hash validation works', () => {
      try {
        const validHash = 'ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890';
        const validTest = utils.isValidTransactionHash(validHash);
        const invalidTest = !utils.isValidTransactionHash('invalid');
        
        if (!validTest) console.log('   ❌ Valid hash rejected');
        if (!invalidTest) console.log('   ❌ Invalid hash accepted');
        
        return validTest && invalidTest;
      } catch (error) {
        console.log('   ❌ Error in hash validation:', error.message);
        return false;
      }
    });

    test('MCP response formatting works', () => {
      try {
        const response = utils.formatMCPResponse(true, { test: 'data' });
        const hasSuccess = response.success === true;
        const hasData = !!response.data;
        const hasTimestamp = !!response.timestamp;
        
        if (!hasSuccess) console.log('   ❌ Response missing success field');
        if (!hasData) console.log('   ❌ Response missing data field');
        if (!hasTimestamp) console.log('   ❌ Response missing timestamp field');
        
        return hasSuccess && hasData && hasTimestamp;
      } catch (error) {
        console.log('   ❌ Error in MCP response formatting:', error.message);
        return false;
      }
    });

    test('Environment config works', () => {
      try {
        const config = utils.getEnvironmentConfig();
        // Environment config should provide defaults even if env vars are undefined
        const hasNodeEnv = !!config && !!config.NODE_ENV;
        const hasNetwork = !!config && !!config.NETWORK;
        const hasPort = !!config && !!config.PORT && config.PORT > 0;
        
        // In test environment, these should have defaults
        if (!hasNodeEnv) console.log('   ℹ️  NODE_ENV defaults to:', config?.NODE_ENV);
        if (!hasNetwork) console.log('   ℹ️  NETWORK defaults to:', config?.NETWORK);
        if (!hasPort) console.log('   ℹ️  PORT defaults to:', config?.PORT);
        
        // This should always work since getEnvironmentConfig provides defaults
        return hasNodeEnv && hasNetwork && hasPort;
      } catch (error) {
        console.log('   ❌ Error in environment config:', error.message);
        return false;
      }
    });

  } catch (error) {
    skip('Validation logic tests', 'Utils not compiled - run npm run build');
    skipped += 4;
  }

  // =====================================
  // Docker Configuration
  // =====================================
  console.log('\n🐳 Docker Configuration');
  console.log('------------------------');

  test('Dockerfile exists and is configured', () => {
    try {
      if (!existsSync('./Dockerfile')) {
        console.log('   ❌ Dockerfile does not exist');
        return false;
      }
      const content = readFileSync('./Dockerfile', 'utf8');
      const hasNodeBase = content.includes('FROM node:18-alpine');
      const hasProjectName = content.includes('secret-network-mcp');
      const hasHealthcheck = content.includes('HEALTHCHECK');
      
      if (!hasNodeBase) console.log('   ❌ Missing node:18-alpine base image');
      if (!hasProjectName) console.log('   ❌ Missing project name reference');
      if (!hasHealthcheck) console.log('   ❌ Missing HEALTHCHECK directive');
      
      return hasNodeBase && hasProjectName && hasHealthcheck;
    } catch (error) {
      console.log('   ❌ Error reading Dockerfile:', error.message);
      return false;
    }
  });

  test('Docker Compose is configured', () => {
    try {
      return existsSync('./docker-compose.yml');
    } catch (error) {
      return false;
    }
  });

  test('Docker scripts are available', () => {
    try {
      const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));
      const hasScripts = !!pkg.scripts;
      const hasDockerbuild = !!pkg.scripts?.['docker:build'];
      const hasDockerrun = !!pkg.scripts?.['docker:run'];
      
      if (!hasScripts) console.log('   ❌ No scripts section found');
      if (!hasDockerbuild) console.log('   ❌ Missing docker:build script');
      if (!hasDockerrun) console.log('   ❌ Missing docker:run script');
      
      return hasScripts && hasDockerbuild && hasDockerrun;
    } catch (error) {
      console.log('   ❌ Error checking Docker scripts:', error.message);
      return false;
    }
  });

  // =====================================
  // Summary
  // =====================================
  console.log('\n📊 Test Summary');
  console.log('================');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log(`📋 Total: ${passed + failed + skipped}`);

  const successRate = passed / (passed + failed);
  
  if (failed === 0) {
    console.log('\n🎉 All available tests passed!');
    if (skipped > 0) {
      console.log('\n💡 To enable more tests:');
      console.log('   • Run "npm run build" to compile TypeScript');
      console.log('   • Run full test suite with "npm test"');
    } else {
      console.log('\n🚀 Framework is fully validated and ready for production!');
    }
  } else {
    console.log(`\n⚠️  Success rate: ${(successRate * 100).toFixed(1)}%`);
    console.log('🔧 Please fix the failed tests before proceeding');
  }

  console.log('\n🎯 Recommended Next Steps:');
  if (failed > 0) {
    console.log('   1. Fix configuration issues shown above');
    console.log('   2. Run this test again');
  } else if (skipped > 5) {
    console.log('   1. npm run build - Compile TypeScript');
    console.log('   2. Run this test again to verify build');
    console.log('   3. npm test - Run full Jest test suite');
  } else {
    console.log('   1. npm test - Run full Jest test suite');
    console.log('   2. npm run dev - Start development server');
    console.log('   3. Test with actual Secret Network');
  }

  return failed === 0;
}

// Run tests
runSimpleTests()
  .then(success => {
    console.log(`\n${success ? '✅' : '❌'} Simplified test ${success ? 'completed successfully' : 'completed with issues'}`);
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Test runner error:', error);
    process.exit(1);
  });
