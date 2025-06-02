#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { chainAbstraction } from './services/chainAbstraction.js';
import { createLogger, getEnvironmentConfig } from './utils/index.js';

// Import tools
import { networkTools, handleNetworkTool } from './tools/network.js';
import { tokenTools, handleTokenTool } from './tools/tokens.js';
import { contractTools, handleContractTool } from './tools/contracts.js';

// Get the directory path of the current file and load environment variables from project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
dotenv.config({ path: path.join(projectRoot, '.env') });

class SecretNetworkMCPServer {
  private server: Server;
  private logger = createLogger();
  private config = getEnvironmentConfig();

  constructor() {
    this.server = new Server(
      {
        name: 'secret-network-mcp',
        version: '0.1.0',
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const allTools = [
        ...networkTools,
        ...tokenTools,
        ...contractTools
      ];

      return {
        tools: allTools
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      this.logger.info('Tool called', { name, args });

      try {
        // Route to appropriate tool handler
        if (networkTools.find(tool => tool.name === name)) {
          return { content: [{ type: 'text', text: JSON.stringify(await handleNetworkTool(name, args), null, 2) }] };
        }
        
        if (tokenTools.find(tool => tool.name === name)) {
          return { content: [{ type: 'text', text: JSON.stringify(await handleTokenTool(name, args), null, 2) }] };
        }
        
        if (contractTools.find(tool => tool.name === name)) {
          return { content: [{ type: 'text', text: JSON.stringify(await handleContractTool(name, args), null, 2) }] };
        }

        throw new Error(`Unknown tool: ${name}`);
      } catch (error) {
        this.logger.error('Tool execution failed', { name, error });
        
        const errorResponse = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        };

        return { 
          content: [{ 
            type: 'text', 
            text: JSON.stringify(errorResponse, null, 2) 
          }] 
        };
      }
    });
  }

  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing Secret Network MCP Server', {
        network: this.config.NETWORK,
        logLevel: this.config.LOG_LEVEL,
        skipNetworkCheck: process.env.SKIP_NETWORK_CHECK,
        allowOfflineMode: process.env.ALLOW_OFFLINE_MODE
      });

      // CRITICAL FIX: Only skip network check if explicitly requested
      const skipNetworkCheck = process.env.SKIP_NETWORK_CHECK === 'true';
      
      if (skipNetworkCheck) {
        this.logger.info('Skipping network initialization (explicitly requested)');
        this.logger.info('Secret Network MCP Server initialized successfully (offline mode)');
        return;
      }

      // CRITICAL FIX: Initialize chain abstraction layer and FAIL if it fails
      this.logger.info('Attempting to connect to Secret Network...');
      await chainAbstraction.initialize(this.config.NETWORK);

      // Verify connectivity (BLOCKING - must succeed)
      const healthStatus = await chainAbstraction.healthCheck();
      this.logger.info('Chain health check completed', { healthStatus });

      if (!healthStatus.secret) {
        throw new Error('Secret Network connection failed health check');
      }

      this.logger.info('Secret Network MCP Server initialized successfully with REAL network connection', {
        healthStatus
      });

    } catch (error) {
      this.logger.error('Network initialization failed', { error });
      
      // CRITICAL FIX: Only continue in offline mode if explicitly allowed
      if (process.env.ALLOW_OFFLINE_MODE === 'true') {
        this.logger.warn('Continuing in offline mode as explicitly requested');
      } else {
        // Fail fast instead of running with broken/mock data
        throw new Error(`Failed to connect to Secret Network: ${error instanceof Error ? error.message : 'Unknown error'}. Set ALLOW_OFFLINE_MODE=true to continue with mock data.`);
      }
    }
  }

  async start(): Promise<void> {
    await this.initialize();
    
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    this.logger.info('Secret Network MCP Server started', {
      transport: 'stdio',
      network: this.config.NETWORK
    });
  }

  async stop(): Promise<void> {
    this.logger.info('Stopping Secret Network MCP Server');
    await this.server.close();
  }

  // Health check endpoint for Docker health checks
  async healthCheck(): Promise<boolean> {
    try {
      const healthStatus = await chainAbstraction.healthCheck();
      this.logger.info('Health check result', { healthStatus });
      return healthStatus.secret === true;
    } catch (error) {
      this.logger.error('Health check failed', { error });
      return false;
    }
  }
}

// Handle process signals for graceful shutdown
async function main(): Promise<void> {
  const server = new SecretNetworkMCPServer();

  process.on('SIGINT', async () => {
    console.log('Received SIGINT, shutting down gracefully...');
    await server.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('Received SIGTERM, shutting down gracefully...');
    await server.stop();
    process.exit(0);
  });

  try {
    await server.start();
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server if this file is run directly
// Check if this script is being executed directly (not imported)
if (process.argv[1]?.endsWith('server.js') || process.argv[1]?.endsWith('server.ts')) {
  main().catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

export { SecretNetworkMCPServer, main };
