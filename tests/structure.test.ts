import { describe, test, expect } from '@jest/globals';
import { readFileSync } from 'fs';

// Simple utility tests that work with ES modules
describe('Framework Structure Tests', () => {
  test('should have correct package.json configuration', () => {
    const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'));
    
    expect(packageJson.name).toBe('secret-network-mcp');
    expect(packageJson.type).toBe('module');
    expect(packageJson.engines.node).toBe('>=18.0.0');
    expect(packageJson.scripts.build).toBe('tsc');
    expect(packageJson.scripts.start).toBe('node dist/server.js');
  });

  test('should have TypeScript configuration', () => {
    const tsConfig = JSON.parse(readFileSync('./tsconfig.json', 'utf8'));
    
    expect(tsConfig.compilerOptions.target).toBe('ES2022');
    expect(tsConfig.compilerOptions.module).toBe('NodeNext');
    expect(tsConfig.compilerOptions.strict).toBe(true);
    expect(tsConfig.compilerOptions.isolatedModules).toBe(true);
  });

  test('should have network configuration', () => {
    const networksConfig = JSON.parse(readFileSync('./config/networks.json', 'utf8'));
    
    expect(networksConfig.testnet).toBeDefined();
    expect(networksConfig.testnet.chainId).toBe('pulsar-3');
    expect(networksConfig.mainnet).toBeDefined();
    expect(networksConfig.mainnet.chainId).toBe('secret-4');
  });

  test('should have contract configuration', () => {
    const contractsConfig = JSON.parse(readFileSync('./config/contracts.json', 'utf8'));
    
    expect(contractsConfig.testnet).toBeDefined();
    expect(contractsConfig.mainnet).toBeDefined();
    expect(contractsConfig.testnet.tokens).toBeDefined();
  });

  test('should have correct Jest configuration', () => {
    const jestConfig = JSON.parse(readFileSync('./jest.config.json', 'utf8'));
    
    expect(jestConfig.preset).toBe('ts-jest/presets/default-esm');
    expect(jestConfig.testEnvironment).toBe('node');
    expect(jestConfig.extensionsToTreatAsEsm).toContain('.ts');
  });
});

// Basic validation tests
describe('Environment Tests', () => {
  test('should have Node.js version 18+', () => {
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    expect(majorVersion).toBeGreaterThanOrEqual(18);
  });

  test('should have required environment variables', () => {
    // These are set in test setup
    expect(process.env.NODE_ENV).toBe('test');
    expect(process.env.NETWORK).toBe('testnet');
    expect(process.env.LOG_LEVEL).toBe('error');
  });

  test('should have correct working directory', () => {
    const cwd = process.cwd();
    expect(cwd).toMatch(/secret-network-mcp$/);
  });
});

// File structure tests
describe('Project Structure Tests', () => {
  const { existsSync } = require('fs');

  test('should have required source directories', () => {
    expect(existsSync('./src')).toBe(true);
    expect(existsSync('./src/tools')).toBe(true);
    expect(existsSync('./src/services')).toBe(true);
    expect(existsSync('./src/types')).toBe(true);
    expect(existsSync('./src/utils')).toBe(true);
  });

  test('should have required configuration files', () => {
    expect(existsSync('./config')).toBe(true);
    expect(existsSync('./config/networks.json')).toBe(true);
    expect(existsSync('./config/contracts.json')).toBe(true);
  });

  test('should have required project files', () => {
    expect(existsSync('./package.json')).toBe(true);
    expect(existsSync('./tsconfig.json')).toBe(true);
    expect(existsSync('./Dockerfile')).toBe(true);
    expect(existsSync('./docker-compose.yml')).toBe(true);
    expect(existsSync('./README.md')).toBe(true);
  });

  test('should have required source files', () => {
    expect(existsSync('./src/server.ts')).toBe(true);
    expect(existsSync('./src/utils/index.ts')).toBe(true);
    expect(existsSync('./src/types/index.ts')).toBe(true);
    expect(existsSync('./src/services/secretNetwork.ts')).toBe(true);
    expect(existsSync('./src/services/chainAbstraction.ts')).toBe(true);
  });

  test('should have MCP tool files', () => {
    expect(existsSync('./src/tools/network.ts')).toBe(true);
    expect(existsSync('./src/tools/tokens.ts')).toBe(true);
    expect(existsSync('./src/tools/contracts.ts')).toBe(true);
  });
});

// Build verification tests
describe('Build Verification Tests', () => {
  const { existsSync } = require('fs');

  test('should have compiled JavaScript files if built', () => {
    if (existsSync('./dist')) {
      expect(existsSync('./dist/server.js')).toBe(true);
      expect(existsSync('./dist/utils/index.js')).toBe(true);
      expect(existsSync('./dist/types/index.js')).toBe(true);
      expect(existsSync('./dist/tools/network.js')).toBe(true);
      expect(existsSync('./dist/services/secretNetwork.js')).toBe(true);
    } else {
      // If not built, that's okay for some test scenarios
      console.warn('dist/ directory not found - run npm run build to enable more tests');
    }
  });

  test('should have package.json with correct dependencies', () => {
    const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'));
    
    // Check critical dependencies
    expect(packageJson.dependencies['@modelcontextprotocol/sdk']).toBeDefined();
    expect(packageJson.dependencies['secretjs']).toBeDefined();
    expect(packageJson.dependencies['zod']).toBeDefined();
    expect(packageJson.dependencies['winston']).toBeDefined();
    expect(packageJson.dependencies['dotenv']).toBeDefined();
    
    // Check dev dependencies
    expect(packageJson.devDependencies['typescript']).toBeDefined();
    expect(packageJson.devDependencies['jest']).toBeDefined();
    expect(packageJson.devDependencies['ts-jest']).toBeDefined();
  });
});
