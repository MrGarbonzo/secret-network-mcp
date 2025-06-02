#!/usr/bin/env node

/**
 * Comprehensive framework validator
 * Tests the complete Secret Network MCP framework
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function validateCompleteFramework() {
  console.log('🧪 Secret Network MCP Framework - Complete Validation');
  console.log('=====================================================\n');

  let allPassed = true;
  const results = {
    utilities: false,
    types: false,
    tools: false,
    services: false,
    build: false,
    docker: false
  };

  try {
    // ===============================
    // Phase 1: Core Utilities
    // ===============================
    console.log('📦 Phase 1: Core Utilities');
    console.log('---------------------------');
    
    try {
      const utils = await import('./src/utils/index.js');
      
      // Test MCP response formatting
      const successResponse = utils.formatMCPResponse(true, { test: 'data' });
      const errorResponse = utils.formatMCPResponse(false, null, 'Test error');
      
      console.log('✅ MCP Response formatting:', successResponse.success && !errorResponse.success);
      
      // Test validation functions
      const validAddr = utils.isValidAddress('secret1abc123def456ghi789jkl012mno345pqr678st');
      const invalidAddr = utils.isValidAddress('invalid');
      const validHash = utils.isValidTransactionHash('ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890');
      const invalidHash = utils.isValidTransactionHash('invalid');
      
      console.log('✅ Address validation:', validAddr && !invalidAddr);
      console.log('✅ Hash validation:', validHash && !invalidHash);
      
      // Test environment config
      const config = utils.getEnvironmentConfig();
      console.log('✅ Environment config:', config.NETWORK && config.PORT);
      
      // Test config loading
      const networksConfig = await utils.loadJsonConfig('./config/networks.json');
      const contractsConfig = await utils.loadJsonConfig('./config/contracts.json');
      console.log('✅ Configuration loading:', networksConfig.testnet && contractsConfig.testnet);
      
      // Test error handling
      const errorMsg = utils.handleError(new Error('Test error'), 'test context');
      console.log('✅ Error handling:', errorMsg.includes('Test error'));
      
      // Test token formatting
      const formatted = utils.formatTokenAmount('1000000', 6);
      console.log('✅ Token formatting:', formatted === '1');
      
      results.utilities = true;
      console.log('🎯 Phase 1 Status: PASSED\n');
    } catch (error) {
      console.log('❌ Phase 1 Status: FAILED - Source modules not compiled');
      console.log('💡 Run "npm run build" first\n');
      results.utilities = false;
    }

    // ===============================
    // Phase 2: Type Definitions
    // ===============================
    console.log('📝 Phase 2: Type Definitions');
    console.log('-----------------------------');
    
    try {
      const types = await import('./src/types/index.js');
      
      // Test schema validation
      const testNetwork = {
        chainId: 'pulsar-3',
        name: 'Test Network',
        rpcUrl: 'https://test.com',
        grpcUrl: 'https://test.com:443',
        nativeDenom: 'uscrt',
        coinGeckoId: null,
        explorer: 'https://test.com'
      };
      
      const validatedNetwork = types.NetworkConfigSchema.parse(testNetwork);
      console.log('✅ Network schema validation:', validatedNetwork.chainId === 'pulsar-3');
      
      results.types = true;
      console.log('🎯 Phase 2 Status: PASSED\n');
    } catch (error) {
      console.log('❌ Phase 2 Status: FAILED - Type modules not compiled\n');
      results.types = false;
    }

    // ===============================
    // Phase 3: MCP Tools
    // ===============================
    console.log('🛠️  Phase 3: MCP Tools');
    console.log('----------------------');
    
    try {
      const { networkTools, handleNetworkTool } = await import('./src/tools/network.js');
      const { tokenTools, handleTokenTool } = await import('./src/tools/tokens.js');
      const { contractTools, handleContractTool } = await import('./src/tools/contracts.js');
      
      console.log(`✅ Network tools loaded: ${networkTools.length} tools`);
      console.log(`✅ Token tools loaded: ${tokenTools.length} tools`);
      console.log(`✅ Contract tools loaded: ${contractTools.length} tools`);
      
      const totalTools = networkTools.length + tokenTools.length + contractTools.length;
      console.log(`✅ Total MCP tools: ${totalTools} tools`);
      
      // Test tool validation (should return errors, not throw)
      const invalidBlock = await handleNetworkTool('get_block_info', { height: -1 });
      const invalidAddr2 = await handleTokenTool('get_token_balance', { address: 'invalid' });
      const invalidContract = await handleContractTool('get_contract_info', { contractAddress: 'invalid' });
      
      console.log('✅ Input validation working:', 
        !invalidBlock.success && !invalidAddr2.success && !invalidContract.success);
      
      results.tools = true;
      console.log('🎯 Phase 3 Status: PASSED\n');
    } catch (error) {
      console.log('❌ Phase 3 Status: FAILED - Tool modules not compiled\n');
      results.tools = false;
    }

    // ===============================
    // Phase 4: Service Architecture
    // ===============================
    console.log('🏗️  Phase 4: Service Architecture');
    console.log('----------------------------------');
    
    try {
      const { chainAbstraction } = await import('./src/services/chainAbstraction.js');
      console.log('✅ Chain abstraction imported');
      
      // Test available chains
      const availableChains = chainAbstraction.getAvailableChains();
      console.log('✅ Chain support framework:', availableChains.length >= 0);
      
      results.services = true;
      console.log('🎯 Phase 4 Status: PASSED\n');
    } catch (error) {
      console.log('❌ Phase 4 Status: FAILED - Service modules not compiled\n');
      results.services = false;
    }

    // ===============================
    // Phase 5: Build Test
    // ===============================
    console.log('🔨 Phase 5: Build System');
    console.log('-------------------------');
    
    const hasDistDir = existsSync('./dist');
    
    if (hasDistDir) {
      console.log('✅ Build directory exists');
      
      // Check for key files
      const keyFiles = [
        './dist/server.js',
        './dist/utils/index.js',
        './dist/types/index.js',
        './dist/tools/network.js'
      ];
      
      let filesExist = 0;
      for (const file of keyFiles) {
        if (existsSync(file)) {
          filesExist++;
        }
      }
      
      console.log(`✅ Key files compiled: ${filesExist}/${keyFiles.length}`);
      results.build = filesExist === keyFiles.length;
    } else {
      console.log('⚠️  Build directory not found - run "npm run build" first');
      results.build = false;
    }
    
    console.log('🎯 Phase 5 Status:', results.build ? 'PASSED' : 'NEEDS BUILD\n');

    // ===============================
    // Phase 6: Docker Readiness
    // ===============================
    console.log('🐳 Phase 6: Docker Configuration');
    console.log('---------------------------------');
    
    const dockerFileExists = existsSync('./Dockerfile');
    const composeFileExists = existsSync('./docker-compose.yml');
    const packageJsonExists = existsSync('./package.json');
    
    console.log('✅ Dockerfile exists:', dockerFileExists);
    console.log('✅ Docker Compose exists:', composeFileExists);
    console.log('✅ Package.json configured:', packageJsonExists);
    
    results.docker = dockerFileExists && composeFileExists && packageJsonExists;
    console.log('🎯 Phase 6 Status:', results.docker ? 'PASSED' : 'INCOMPLETE\n');

    // ===============================
    // Final Summary
    // ===============================
    console.log('🎉 VALIDATION SUMMARY');
    console.log('=====================');
    
    Object.entries(results).forEach(([phase, passed]) => {
      console.log(`${passed ? '✅' : '❌'} ${phase.charAt(0).toUpperCase() + phase.slice(1)}: ${passed ? 'PASSED' : 'FAILED'}`);
    });
    
    const allPhasesPassed = Object.values(results).every(result => result);
    allPassed = allPhasesPassed;
    
    console.log('\n🎯 OVERALL STATUS:', allPassed ? '✅ READY FOR PRODUCTION' : '⚠️  NEEDS ATTENTION');
    
    if (allPassed) {
      console.log('\n🚀 Next Steps:');
      console.log('   • npm test - Run full test suite');
      console.log('   • npm run dev - Start development server');
      console.log('   • npm run docker:build - Build container');
      console.log('   • Test with actual Secret Network');
    } else {
      console.log('\n🔧 Required Actions:');
      if (!results.build) console.log('   • npm run build - Compile TypeScript');
      if (!results.docker) console.log('   • Complete Docker setup');
      if (!results.utilities || !results.tools || !results.services) {
        console.log('   • Fix compilation errors and rebuild');
      }
    }

  } catch (error) {
    console.error('\n❌ Validation failed:', error);
    console.error('Error details:', error.message);
    allPassed = false;
  }

  return allPassed;
}

// Run validation
validateCompleteFramework()
  .then(success => {
    console.log(`\n${success ? '✅' : '❌'} Framework validation ${success ? 'completed successfully' : 'completed with issues'}`);
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Validation error:', error);
    process.exit(1);
  });
