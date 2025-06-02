// Test setup file for Jest with ES modules
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment defaults
process.env.NODE_ENV = 'test';
process.env.NETWORK = 'testnet';
process.env.LOG_LEVEL = 'error'; // Reduce log noise in tests

// Global test timeout
jest.setTimeout(30000);

// Mock external network calls if needed
if (process.env.MOCK_NETWORK === 'true') {
  // Add network mocking setup here if needed
}

// Suppress console.log in tests unless debugging
if (!process.env.DEBUG_TESTS) {
  const originalConsole = global.console;
  global.console = {
    ...console,
    log: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    // Keep error for debugging
    error: originalConsole.error
  };
}

// Mock Secret Network for tests
beforeAll(() => {
  // Mock environment for consistent testing
  process.env.NODE_ENV = 'test';
  process.env.NETWORK = 'testnet';
});
