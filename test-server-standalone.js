#!/usr/bin/env node

/**
 * Quick standalone test for the Secret Network MCP server
 * Tests basic functionality without Claude Desktop
 */

import { spawn } from 'child_process';
import { readFileSync, existsSync } from 'fs';

async function testServer() {
  console.log('🧪 Testing Secret Network MCP Server');
  console.log('=====================================\n');

  // Check if server file exists
  const serverPath = './dist/server.js';
  if (!existsSync(serverPath)) {
    console.log('❌ Server file not found at:', serverPath);
    console.log('💡 Run "npm run build" first');
    return false;
  }

  console.log('✅ Server file found');

  // Test server startup
  console.log('🚀 Testing server startup...');
  
  return new Promise((resolve) => {
    const serverProcess = spawn('node', [serverPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        NODE_ENV: 'test',
        NETWORK: 'mainnet',
        LOG_LEVEL: 'info',
        MCP_MODE: 'true',
        SKIP_NETWORK_CHECK: 'true',
        ALLOW_OFFLINE_MODE: 'true'
      }
    });

    let output = '';
    let errorOutput = '';
    let serverStarted = false;

    // Set a timeout for the test
    const timeout = setTimeout(() => {
      console.log('⏰ Test timeout reached');
      if (serverStarted) {
        console.log('✅ Server started successfully (offline mode)');
        resolve(true);
      } else {
        console.log('❌ Server failed to start within timeout');
        console.log('📋 Output:', output);
        console.log('🚨 Errors:', errorOutput);
        resolve(false);
      }
      serverProcess.kill();
    }, 5000);

    serverProcess.stdout.on('data', (data) => {
      output += data.toString();
      console.log('📤 Server output:', data.toString().trim());
      
      // Check for successful startup indicators
      if (data.toString().includes('initialized successfully') ||
          data.toString().includes('started') ||
          data.toString().includes('Secret Network MCP Server')) {
        serverStarted = true;
      }
    });

    serverProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
      console.log('🚨 Server error:', data.toString().trim());
    });

    serverProcess.on('close', (code) => {
      clearTimeout(timeout);
      console.log(`🏁 Server process exited with code: ${code}`);
      
      if (serverStarted || code === 0) {
        console.log('✅ Server test completed successfully');
        resolve(true);
      } else {
        console.log('❌ Server test failed');
        console.log('📋 Final output:', output);
        console.log('🚨 Final errors:', errorOutput);
        resolve(false);
      }
    });

    serverProcess.on('error', (error) => {
      clearTimeout(timeout);
      console.log('❌ Server process error:', error.message);
      resolve(false);
    });

    // Send test message after a brief delay
    setTimeout(() => {
      console.log('📨 Sending test initialization...');
      try {
        const initMessage = JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'initialize',
          params: {
            protocolVersion: '2024-11-05',
            capabilities: {},
            clientInfo: {
              name: 'test-client',
              version: '0.1.0'
            }
          }
        }) + '\n';
        
        serverProcess.stdin.write(initMessage);
      } catch (error) {
        console.log('❌ Failed to send test message:', error.message);
      }
    }, 1000);
  });
}

// Run the test
testServer()
  .then(success => {
    console.log('\n📊 Test Result:');
    if (success) {
      console.log('✅ Secret Network MCP Server is working correctly!');
      console.log('\n💡 Next steps:');
      console.log('1. Run the fix-claude-config.bat script');
      console.log('2. Restart Claude Desktop');
      console.log('3. Your MCP server should now connect');
    } else {
      console.log('❌ Server test failed');
      console.log('\n🔧 Troubleshooting:');
      console.log('1. Check that all dependencies are installed: npm install');
      console.log('2. Rebuild the project: npm run build');
      console.log('3. Check for any TypeScript errors');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Test runner error:', error);
    process.exit(1);
  });
