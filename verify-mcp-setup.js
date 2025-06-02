#!/usr/bin/env node

/**
 * Comprehensive verification script for Claude MCP setup
 * Tests all components before and after configuration changes
 */

import { existsSync, readFileSync } from 'fs';
import { spawn } from 'child_process';
import { join } from 'path';

class MCPVerifier {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0
    };
  }

  log(type, message, details = '') {
    const icons = {
      pass: '✅',
      fail: '❌', 
      warn: '⚠️',
      info: 'ℹ️'
    };
    
    console.log(`${icons[type]} ${message}`);
    if (details) {
      console.log(`   ${details}`);
    }
    
    if (type === 'pass') this.results.passed++;
    if (type === 'fail') this.results.failed++;
    if (type === 'warn') this.results.warnings++;
  }

  async runVerification() {
    console.log('🔍 MCP Configuration Comprehensive Verification');
    console.log('================================================\n');

    await this.checkProjectStructure();
    await this.checkServerBuild();
    await this.checkClaudeConfig();
    await this.testServerStartup();
    await this.checkEnvironment();
    this.showSummary();
  }

  async checkProjectStructure() {
    console.log('📁 Project Structure Check');
    console.log('---------------------------');

    const requiredFiles = [
      'package.json',
      'tsconfig.json', 
      'src/server.ts',
      'dist/server.js'
    ];

    const requiredDirs = [
      'src',
      'dist',
      'config',
      'src/tools',
      'src/services',
      'src/utils'
    ];

    for (const file of requiredFiles) {
      if (existsSync(file)) {
        this.log('pass', `Required file exists: ${file}`);
      } else {
        this.log('fail', `Missing required file: ${file}`);
      }
    }

    for (const dir of requiredDirs) {
      if (existsSync(dir)) {
        this.log('pass', `Required directory exists: ${dir}`);
      } else {
        this.log('fail', `Missing required directory: ${dir}`);
      }
    }

    console.log('');
  }

  async checkServerBuild() {
    console.log('🔨 Server Build Verification');
    console.log('-----------------------------');

    // Check if dist directory exists and has content
    if (!existsSync('dist')) {
      this.log('fail', 'No dist directory found', 'Run: npm run build');
      return;
    }

    const serverFile = 'dist/server.js';
    if (!existsSync(serverFile)) {
      this.log('fail', 'Server not compiled', 'Run: npm run build');
      return;
    }

    this.log('pass', 'Server file exists');

    // Check server file content
    try {
      const content = readFileSync(serverFile, 'utf8');
      
      if (content.includes('SecretNetworkMCPServer')) {
        this.log('pass', 'Server class found in compiled output');
      } else {
        this.log('fail', 'Server class not found in compiled output');
      }

      if (content.includes('@modelcontextprotocol/sdk')) {
        this.log('pass', 'MCP SDK imports found');
      } else {
        this.log('fail', 'MCP SDK imports not found');
      }

      if (content.includes('secretjs')) {
        this.log('pass', 'Secret Network dependencies found');
      } else {
        this.log('warn', 'Secret Network dependencies not found in output');
      }

    } catch (error) {
      this.log('fail', 'Could not read server file', error.message);
    }

    console.log('');
  }

  async checkClaudeConfig() {
    console.log('⚙️ Claude Configuration Check');
    console.log('------------------------------');

    // Check local config files
    const configFiles = [
      'claude_desktop_config.json',
      'claude_desktop_config_CORRECTED.json',
      'claude_desktop_config_final.json'
    ];

    for (const configFile of configFiles) {
      if (existsSync(configFile)) {
        this.log('info', `Local config found: ${configFile}`);
        try {
          const config = JSON.parse(readFileSync(configFile, 'utf8'));
          if (config.mcpServers && config.mcpServers['secret-network']) {
            this.log('pass', `Valid MCP config in ${configFile}`);
            
            const serverConfig = config.mcpServers['secret-network'];
            if (serverConfig.args && serverConfig.args[0].includes('F:\\coding\\secret-network-mcp')) {
              this.log('pass', 'Correct server path in config');
            } else {
              this.log('warn', 'Server path may be incorrect', `Path: ${serverConfig.args?.[0]}`);
            }
          }
        } catch (error) {
          this.log('fail', `Invalid JSON in ${configFile}`, error.message);
        }
      }
    }

    // Check Claude's actual config location
    const userProfile = process.env.USERPROFILE;
    if (userProfile) {
      const claudeConfigPath = join(userProfile, 'AppData', 'Roaming', 'Claude', 'claude_desktop_config.json');
      
      if (existsSync(claudeConfigPath)) {
        this.log('pass', 'Claude config file exists');
        try {
          const config = JSON.parse(readFileSync(claudeConfigPath, 'utf8'));
          if (config.mcpServers && config.mcpServers['secret-network']) {
            this.log('pass', 'Secret Network server configured in Claude');
            
            const serverConfig = config.mcpServers['secret-network'];
            const serverPath = serverConfig.args?.[0];
            
            if (serverPath && serverPath.includes('F:\\coding\\secret-network-mcp\\dist\\server.js')) {
              this.log('pass', 'Correct absolute path in Claude config');
            } else {
              this.log('fail', 'Incorrect server path in Claude config', `Current: ${serverPath}`);
            }
            
            if (serverConfig.env && serverConfig.env.MCP_MODE === 'true') {
              this.log('pass', 'MCP mode enabled');
            } else {
              this.log('warn', 'MCP mode not explicitly enabled');
            }
            
          } else {
            this.log('fail', 'Secret Network server not found in Claude config');
          }
        } catch (error) {
          this.log('fail', 'Could not parse Claude config', error.message);
        }
      } else {
        this.log('fail', 'Claude config file not found', claudeConfigPath);
      }
    }

    console.log('');
  }

  async testServerStartup() {
    console.log('🚀 Server Startup Test');
    console.log('-----------------------');

    return new Promise((resolve) => {
      const serverProcess = spawn('node', ['dist/server.js'], {
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

      let startupSuccessful = false;
      let output = '';
      let errorOutput = '';

      const timeout = setTimeout(() => {
        if (startupSuccessful) {
          this.log('pass', 'Server started successfully');
        } else {
          this.log('fail', 'Server startup timeout');
          if (output) this.log('info', 'Server output', output.substring(0, 200) + '...');
          if (errorOutput) this.log('info', 'Server errors', errorOutput.substring(0, 200) + '...');
        }
        serverProcess.kill();
        resolve();
      }, 8000);

      serverProcess.stdout.on('data', (data) => {
        output += data.toString();
        if (data.toString().includes('initialized') || 
            data.toString().includes('started') ||
            data.toString().includes('MCP Server')) {
          startupSuccessful = true;
        }
      });

      serverProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      serverProcess.on('close', (code) => {
        clearTimeout(timeout);
        if (startupSuccessful || code === 0) {
          this.log('pass', 'Server startup completed');
        } else {
          this.log('fail', `Server exited with code ${code}`);
          if (errorOutput) {
            this.log('info', 'Error details', errorOutput.substring(0, 300));
          }
        }
        resolve();
      });

      serverProcess.on('error', (error) => {
        clearTimeout(timeout);
        this.log('fail', 'Server startup error', error.message);
        resolve();
      });

      // Send test initialization
      setTimeout(() => {
        try {
          const initMessage = JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'initialize',
            params: {
              protocolVersion: '2024-11-05',
              capabilities: {},
              clientInfo: { name: 'test-client', version: '0.1.0' }
            }
          }) + '\n';
          
          serverProcess.stdin.write(initMessage);
        } catch (error) {
          // Ignore stdin errors in test
        }
      }, 1000);
    });
  }

  async checkEnvironment() {
    console.log('🌍 Environment Check');
    console.log('--------------------');

    // Check Node.js version
    try {
      const nodeVersion = process.version;
      const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
      
      if (majorVersion >= 18) {
        this.log('pass', `Node.js version compatible: ${nodeVersion}`);
      } else {
        this.log('fail', `Node.js version too old: ${nodeVersion}`, 'Requires Node.js 18+');
      }
    } catch (error) {
      this.log('fail', 'Could not check Node.js version');
    }

    // Check package.json dependencies
    try {
      const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
      
      const requiredDeps = [
        '@modelcontextprotocol/sdk',
        'secretjs',
        'zod',
        'winston',
        'dotenv'
      ];

      for (const dep of requiredDeps) {
        if (pkg.dependencies && pkg.dependencies[dep]) {
          this.log('pass', `Required dependency found: ${dep}`);
        } else {
          this.log('fail', `Missing dependency: ${dep}`, 'Run: npm install');
        }
      }

    } catch (error) {
      this.log('fail', 'Could not check package.json', error.message);
    }

    console.log('');
  }

  showSummary() {
    console.log('📊 Verification Summary');
    console.log('========================');
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`⚠️  Warnings: ${this.results.warnings}`);
    console.log(`📋 Total: ${this.results.passed + this.results.failed + this.results.warnings}`);

    const successRate = this.results.passed / (this.results.passed + this.results.failed + this.results.warnings);
    console.log(`🎯 Success Rate: ${(successRate * 100).toFixed(1)}%`);

    console.log('\n🔧 Recommendations:');
    
    if (this.results.failed === 0) {
      console.log('✅ Configuration appears to be correct!');
      console.log('🚀 Try starting Claude Desktop now.');
    } else if (this.results.failed <= 2) {
      console.log('⚠️  Minor issues detected. Fix the failed items above.');
      console.log('🔧 Run COMPLETE_FIX.bat to apply automatic fixes.');
    } else {
      console.log('❌ Multiple issues detected. Please:');
      console.log('   1. Run: npm install');
      console.log('   2. Run: npm run build');
      console.log('   3. Run: COMPLETE_FIX.bat');
      console.log('   4. Run this verification again');
    }

    console.log('\n💡 If issues persist after fixes:');
    console.log('   • Check Claude Desktop logs');
    console.log('   • Try the alternative configuration');
    console.log('   • Restart Claude as administrator');
  }
}

// Run verification
const verifier = new MCPVerifier();
verifier.runVerification()
  .then(() => {
    process.exit(verifier.results.failed > 0 ? 1 : 0);
  })
  .catch(error => {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  });
