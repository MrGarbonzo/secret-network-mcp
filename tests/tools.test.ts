import { describe, test, expect } from '@jest/globals';
import { readFileSync, existsSync } from 'fs';

// MCP Tools tests that work with static analysis
describe('MCP Tools Tests', () => {
  describe('Tool File Structure', () => {
    test('should have all required tool files', () => {
      const toolFiles = [
        './src/tools/network.ts',
        './src/tools/tokens.ts',
        './src/tools/contracts.ts'
      ];
      
      toolFiles.forEach(file => {
        expect(existsSync(file)).toBe(true);
      });
    });

    test('should have proper imports in tool files', () => {
      const toolFiles = [
        './src/tools/network.ts',
        './src/tools/tokens.ts',
        './src/tools/contracts.ts'
      ];
      
      toolFiles.forEach(file => {
        const content = readFileSync(file, 'utf8');
        
        // Should import Tool type from MCP SDK
        expect(content).toContain("import { Tool } from '@modelcontextprotocol/sdk/types.js'");
        
        // Should import chain abstraction
        expect(content).toContain("import { chainAbstraction } from '../services/chainAbstraction.js'");
        
        // Should import utilities
        expect(content).toContain("import { formatMCPResponse, handleError");
      });
    });

    test('should export tools arrays and handlers', () => {
      const expectedExports = [
        { file: './src/tools/network.ts', tools: 'networkTools', handler: 'handleNetworkTool' },
        { file: './src/tools/tokens.ts', tools: 'tokenTools', handler: 'handleTokenTool' },
        { file: './src/tools/contracts.ts', tools: 'contractTools', handler: 'handleContractTool' }
      ];
      
      expectedExports.forEach(({ file, tools, handler }) => {
        const content = readFileSync(file, 'utf8');
        
        expect(content).toContain(`export const ${tools}`);
        expect(content).toContain(`export async function ${handler}`);
      });
    });
  });

  describe('Network Tools Structure', () => {
    test('should define expected network tools', () => {
      const content = readFileSync('./src/tools/network.ts', 'utf8');
      
      const expectedTools = [
        'get_network_status',
        'get_block_info',
        'get_transaction_info',
        'get_latest_blocks'
      ];
      
      expectedTools.forEach(tool => {
        expect(content).toContain(`name: '${tool}'`);
      });
    });

    test('should have proper tool structure', () => {
      const content = readFileSync('./src/tools/network.ts', 'utf8');
      
      // Should have tool definitions with required properties
      expect(content).toContain('name:');
      expect(content).toContain('description:');
      expect(content).toContain('inputSchema:');
      expect(content).toContain('type: \'object\'');
      expect(content).toContain('properties:');
      expect(content).toContain('required:');
    });

    test('should handle tool validation', () => {
      const content = readFileSync('./src/tools/network.ts', 'utf8');
      
      // Should validate inputs
      expect(content).toContain('isValidTransactionHash');
      expect(content).toContain('Invalid block height');
      expect(content).toContain('Invalid transaction hash format');
    });
  });

  describe('Token Tools Structure', () => {
    test('should define expected token tools', () => {
      const content = readFileSync('./src/tools/tokens.ts', 'utf8');
      
      const expectedTools = [
        'get_token_balance',
        'get_snip20_token_info',
        'get_snip20_balance',
        'list_known_tokens'
      ];
      
      expectedTools.forEach(tool => {
        expect(content).toContain(`name: '${tool}'`);
      });
    });

    test('should handle SNIP-20 specific functionality', () => {
      const content = readFileSync('./src/tools/tokens.ts', 'utf8');
      
      // Should handle SNIP-20 tokens
      expect(content).toContain('SNIP-20');
      expect(content).toContain('viewingKey');
      expect(content).toContain('getSnip20TokenInfo');
      expect(content).toContain('getSnip20Balance');
    });

    test('should validate addresses', () => {
      const content = readFileSync('./src/tools/tokens.ts', 'utf8');
      
      expect(content).toContain('isValidAddress');
      expect(content).toContain('Invalid Secret Network address format');
      expect(content).toContain('Invalid contract address format');
    });
  });

  describe('Contract Tools Structure', () => {
    test('should define expected contract tools', () => {
      const content = readFileSync('./src/tools/contracts.ts', 'utf8');
      
      const expectedTools = [
        'query_contract',
        'get_contract_info',
        'list_known_contracts',
        'get_contract_code_info'
      ];
      
      expectedTools.forEach(tool => {
        expect(content).toContain(`name: '${tool}'`);
      });
    });

    test('should handle contract queries', () => {
      const content = readFileSync('./src/tools/contracts.ts', 'utf8');
      
      // Should handle contract interactions
      expect(content).toContain('queryContract');
      expect(content).toContain('getContractInfo');
      expect(content).toContain('Query must be a valid object');
    });

    test('should validate common query methods', () => {
      const content = readFileSync('./src/tools/contracts.ts', 'utf8');
      
      // Should have common query validation
      expect(content).toContain('validateCommonQueries');
      expect(content).toContain('token_info');
      expect(content).toContain('balance');
      expect(content).toContain('config');
    });
  });

  describe('Tool Input Validation', () => {
    test('should validate inputs in all tool handlers', () => {
      const toolFiles = [
        './src/tools/network.ts',
        './src/tools/tokens.ts',
        './src/tools/contracts.ts'
      ];
      
      toolFiles.forEach(file => {
        const content = readFileSync(file, 'utf8');
        
        // Should handle unknown tools
        expect(content).toContain('Unknown');
        expect(content).toContain('tool');
        
        // Should format responses properly
        expect(content).toContain('formatMCPResponse');
        expect(content).toContain('handleError');
      });
    });

    test('should handle errors gracefully', () => {
      const toolFiles = [
        './src/tools/network.ts',
        './src/tools/tokens.ts',
        './src/tools/contracts.ts'
      ];
      
      toolFiles.forEach(file => {
        const content = readFileSync(file, 'utf8');
        
        // Should have try-catch blocks
        expect(content).toContain('try {');
        expect(content).toContain('} catch (error) {');
        
        // Should return formatted error responses
        expect(content).toContain('formatMCPResponse(false');
      });
    });
  });

  describe('Tool Configuration Integration', () => {
    test('should reference configuration files', () => {
      const tokenToolsContent = readFileSync('./src/tools/tokens.ts', 'utf8');
      const contractToolsContent = readFileSync('./src/tools/contracts.ts', 'utf8');
      
      // Should load configuration
      expect(tokenToolsContent).toContain('loadJsonConfig');
      expect(contractToolsContent).toContain('loadJsonConfig');
      
      // Should reference config files
      expect(tokenToolsContent).toContain('./config/contracts.json');
      expect(contractToolsContent).toContain('./config/contracts.json');
    });

    test('should handle network switching', () => {
      const toolFiles = [
        './src/tools/tokens.ts',
        './src/tools/contracts.ts'
      ];
      
      toolFiles.forEach(file => {
        const content = readFileSync(file, 'utf8');
        
        // Should determine network
        expect(content).toContain('getActiveNetworkInfo');
        expect(content).toContain('chainId');
        expect(content).toContain('secret-4');
        expect(content).toContain('mainnet');
        expect(content).toContain('testnet');
      });
    });
  });

  describe('Compiled Tools Verification', () => {
    test('should have compiled tool files if built', () => {
      if (existsSync('./dist')) {
        const compiledToolFiles = [
          './dist/tools/network.js',
          './dist/tools/tokens.js',
          './dist/tools/contracts.js'
        ];
        
        compiledToolFiles.forEach(file => {
          expect(existsSync(file)).toBe(true);
        });
      } else {
        console.warn('Compiled tools not found - run npm run build to verify compilation');
      }
    });

    test('should have proper module exports in compiled files', () => {
      if (existsSync('./dist/tools')) {
        const compiledFiles = [
          './dist/tools/network.js',
          './dist/tools/tokens.js',
          './dist/tools/contracts.js'
        ];
        
        compiledFiles.forEach(file => {
          if (existsSync(file)) {
            const content = readFileSync(file, 'utf8');
            
            // Should export tools and handlers
            expect(content).toContain('export');
            expect(content).toContain('Tools');
            expect(content).toContain('handle');
          }
        });
      }
    });
  });
});

// Test tool count expectations
describe('Tool Count Validation', () => {
  test('should define the expected number of tools per category', () => {
    const toolDefinitions = [
      { file: './src/tools/network.ts', expectedCount: 4 },
      { file: './src/tools/tokens.ts', expectedCount: 4 },
      { file: './src/tools/contracts.ts', expectedCount: 4 }
    ];
    
    toolDefinitions.forEach(({ file, expectedCount }) => {
      const content = readFileSync(file, 'utf8');
      
      // Count tool definitions by counting 'name:' occurrences in tool arrays
      const toolMatches = content.match(/name:\s*['"`]/g);
      expect(toolMatches).toBeDefined();
      expect(toolMatches!.length).toBeGreaterThanOrEqual(expectedCount);
    });
  });

  test('should have 12 total tools across all categories', () => {
    const toolFiles = [
      './src/tools/network.ts',
      './src/tools/tokens.ts',
      './src/tools/contracts.ts'
    ];
    
    let totalTools = 0;
    
    toolFiles.forEach(file => {
      const content = readFileSync(file, 'utf8');
      const toolMatches = content.match(/name:\s*['"`]/g);
      if (toolMatches) {
        totalTools += toolMatches.length;
      }
    });
    
    expect(totalTools).toBeGreaterThanOrEqual(12);
  });
});
