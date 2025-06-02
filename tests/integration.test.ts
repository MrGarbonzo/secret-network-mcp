import { describe, test, expect, beforeAll } from '@jest/globals';
import { readFileSync, existsSync } from 'fs';

// Integration tests that work without complex module loading
describe('Integration Tests', () => {
  beforeAll(() => {
    // Set up test environment
    process.env.NODE_ENV = 'test';
    process.env.NETWORK = 'testnet';
  });

  describe('Project Integration', () => {
    test('should have consistent configuration between files', () => {
      const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'));
      const tsConfig = JSON.parse(readFileSync('./tsconfig.json', 'utf8'));
      
      // Both should be configured for ES modules
      expect(packageJson.type).toBe('module');
      expect(tsConfig.compilerOptions.module).toBe('NodeNext');
      
      // Both should target modern environments
      expect(packageJson.engines.node).toBe('>=18.0.0');
      expect(tsConfig.compilerOptions.target).toBe('ES2022');
    });

    test('should have matching network configurations', () => {
      const networksConfig = JSON.parse(readFileSync('./config/networks.json', 'utf8'));
      const contractsConfig = JSON.parse(readFileSync('./config/contracts.json', 'utf8'));
      
      // Both should have same network keys
      const networkKeys = Object.keys(networksConfig);
      const contractKeys = Object.keys(contractsConfig);
      
      expect(networkKeys).toContain('testnet');
      expect(networkKeys).toContain('mainnet');
      expect(contractKeys).toContain('testnet');
      expect(contractKeys).toContain('mainnet');
      
      // Network chain IDs should be consistent
      expect(networksConfig.testnet.chainId).toBe('pulsar-3');
      expect(networksConfig.mainnet.chainId).toBe('secret-4');
    });

    test('should have complete project structure', () => {
      const requiredDirectories = [
        './src',
        './src/tools',
        './src/services',
        './src/types',
        './src/utils',
        './config',
        './tests',
        './docs'
      ];
      
      const requiredFiles = [
        './src/server.ts',
        './src/utils/index.ts',
        './src/types/index.ts',
        './src/services/secretNetwork.ts',
        './src/services/chainAbstraction.ts',
        './src/tools/network.ts',
        './src/tools/tokens.ts',
        './src/tools/contracts.ts',
        './config/networks.json',
        './config/contracts.json',
        './package.json',
        './tsconfig.json',
        './Dockerfile',
        './docker-compose.yml',
        './README.md'
      ];
      
      // Check all directories exist
      requiredDirectories.forEach(dir => {
        expect(existsSync(dir)).toBe(true);
      });
      
      // Check all files exist
      requiredFiles.forEach(file => {
        expect(existsSync(file)).toBe(true);
      });
    });

    test('should have valid Docker configuration', () => {
      const dockerfileContent = readFileSync('./Dockerfile', 'utf8');
      const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'));
      
      // Dockerfile should reference the project
      expect(dockerfileContent).toContain('secret-network-mcp');
      expect(dockerfileContent).toContain('FROM node:18-alpine');
      expect(dockerfileContent).toContain('HEALTHCHECK');
      
      // Package.json should have Docker scripts
      expect(packageJson.scripts['docker:build']).toBeDefined();
      expect(packageJson.scripts['docker:run']).toBeDefined();
    });
  });

  describe('Build Integration', () => {
    test('should have compiled files if build was run', () => {
      if (existsSync('./dist')) {
        const distFiles = [
          './dist/server.js',
          './dist/utils/index.js',
          './dist/types/index.js',
          './dist/tools/network.js',
          './dist/tools/tokens.js',
          './dist/tools/contracts.js',
          './dist/services/secretNetwork.js',
          './dist/services/chainAbstraction.js'
        ];
        
        distFiles.forEach(file => {
          expect(existsSync(file)).toBe(true);
        });
      } else {
        // If not built, log a message but don't fail
        console.warn('Build output not found - run npm run build to verify compilation');
      }
    });

    test('should have valid TypeScript configuration for building', () => {
      const tsConfig = JSON.parse(readFileSync('./tsconfig.json', 'utf8'));
      
      expect(tsConfig.compilerOptions.outDir).toBe('./dist');
      expect(tsConfig.compilerOptions.rootDir).toBe('./src');
      expect(tsConfig.compilerOptions.strict).toBe(true);
      expect(tsConfig.compilerOptions.moduleResolution).toBe('NodeNext');
      expect(tsConfig.include).toContain('src/**/*');
      expect(tsConfig.exclude).toContain('node_modules');
    });
  });

  describe('Configuration Integration', () => {
    test('should have valid network endpoints', () => {
      const networksConfig = JSON.parse(readFileSync('./config/networks.json', 'utf8'));
      
      Object.values(networksConfig).forEach((network: any) => {
        expect(network.chainId).toBeDefined();
        expect(network.name).toBeDefined();
        expect(network.rpcUrl).toMatch(/^https?:\/\//);
        expect(network.grpcUrl).toMatch(/^https?:\/\//);
        expect(network.nativeDenom).toBe('uscrt');
        expect(network.explorer).toMatch(/^https?:\/\//);
      });
    });

    test('should have valid contract addresses', () => {
      const contractsConfig = JSON.parse(readFileSync('./config/contracts.json', 'utf8'));
      
      Object.values(contractsConfig).forEach((networkContracts: any) => {
        if (networkContracts.tokens) {
          Object.values(networkContracts.tokens).forEach((token: any) => {
            expect(token.address).toMatch(/^secret[a-z0-9]{39}$/);
            expect(token.name).toBeDefined();
            expect(token.symbol).toBeDefined();
            expect(typeof token.decimals).toBe('number');
            expect(token.decimals).toBeGreaterThanOrEqual(0);
          });
        }
      });
    });

    test('should have consistent dependencies', () => {
      const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'));
      
      // Should have core dependencies
      const requiredDeps = [
        '@modelcontextprotocol/sdk',
        'secretjs',
        'zod',
        'winston',
        'dotenv'
      ];
      
      requiredDeps.forEach(dep => {
        expect(packageJson.dependencies[dep]).toBeDefined();
      });
      
      // Should have dev dependencies
      const requiredDevDeps = [
        'typescript',
        'jest',
        'ts-jest',
        '@types/node',
        '@types/jest'
      ];
      
      requiredDevDeps.forEach(dep => {
        expect(packageJson.devDependencies[dep]).toBeDefined();
      });
    });
  });

  describe('Tool Definition Integration', () => {
    test('should have complete tool structure in source files', () => {
      // Read the tool files to verify they exist and have content
      const networkToolsContent = readFileSync('./src/tools/network.ts', 'utf8');
      const tokenToolsContent = readFileSync('./src/tools/tokens.ts', 'utf8');
      const contractToolsContent = readFileSync('./src/tools/contracts.ts', 'utf8');
      
      // Should contain tool exports
      expect(networkToolsContent).toContain('export const networkTools');
      expect(networkToolsContent).toContain('export async function handleNetworkTool');
      
      expect(tokenToolsContent).toContain('export const tokenTools');
      expect(tokenToolsContent).toContain('export async function handleTokenTool');
      
      expect(contractToolsContent).toContain('export const contractTools');
      expect(contractToolsContent).toContain('export async function handleContractTool');
    });

    test('should have MCP tool definitions with required fields', () => {
      const toolFiles = [
        './src/tools/network.ts',
        './src/tools/tokens.ts',
        './src/tools/contracts.ts'
      ];
      
      toolFiles.forEach(file => {
        const content = readFileSync(file, 'utf8');
        
        // Should have Tool import from MCP SDK
        expect(content).toContain("from '@modelcontextprotocol/sdk/types.js'");
        
        // Should have tool definitions with required properties
        expect(content).toContain('name:');
        expect(content).toContain('description:');
        expect(content).toContain('inputSchema:');
      });
    });
  });
});
