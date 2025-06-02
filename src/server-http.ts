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
import { createServer } from 'http';

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

      // Skip network check if explicitly requested
      const skipNetworkCheck = process.env.SKIP_NETWORK_CHECK === 'true';
      
      if (skipNetworkCheck) {
        this.logger.info('Skipping network initialization (explicitly requested)');
        this.logger.info('Secret Network MCP Server initialized successfully (offline mode)');
        return;
      }

      // Initialize chain abstraction layer
      this.logger.info('Attempting to connect to Secret Network...');
      await chainAbstraction.initialize(this.config.NETWORK);

      // Verify connectivity
      const healthStatus = await chainAbstraction.healthCheck();
      this.logger.info('Chain health check completed', { healthStatus });

      if (!healthStatus.secret) {
        throw new Error('Secret Network connection failed health check');
      }

      this.logger.info('Secret Network MCP Server initialized successfully with network connection', {
        healthStatus
      });

    } catch (error) {
      this.logger.error('Network initialization failed', { error });
      
      if (process.env.ALLOW_OFFLINE_MODE === 'true') {
        this.logger.warn('Continuing in offline mode as explicitly requested');
      } else {
        throw new Error(`Failed to connect to Secret Network: ${error instanceof Error ? error.message : 'Unknown error'}. Set ALLOW_OFFLINE_MODE=true to continue with mock data.`);
      }
    }
  }

  async startHTTP(): Promise<void> {
    await this.initialize();
    
    const port = parseInt(process.env.PORT || '3000');
    
    const httpServer = createServer(async (req, res) => {
      // Enable CORS
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      
      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }
      
      // Health check endpoint
      if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          status: 'ok', 
          transport: 'http',
          message: 'Secret Network MCP Server running'
        }));
        return;
      }
      
      // MCP JSON-RPC endpoint
      if (req.url === '/mcp' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
          try {
            const request = JSON.parse(body);
            
            // Handle list tools
            if (request.method === 'tools/list') {
              const allTools = [...networkTools, ...tokenTools, ...contractTools];
              const response = {
                jsonrpc: '2.0',
                id: request.id,
                result: { tools: allTools }
              };
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(response));
              return;
            }
            
            // Handle tool calls
            if (request.method === 'tools/call') {
              const { name, arguments: args } = request.params;
              
              let result;
              if (networkTools.find(tool => tool.name === name)) {
                result = await handleNetworkTool(name, args);
              } else if (tokenTools.find(tool => tool.name === name)) {
                result = await handleTokenTool(name, args);
              } else if (contractTools.find(tool => tool.name === name)) {
                result = await handleContractTool(name, args);
              } else {
                throw new Error(`Unknown tool: ${name}`);
              }
              
              const response = {
                jsonrpc: '2.0',
                id: request.id,
                result: { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
              };
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(response));
              return;
            }
            
            // Unknown method
            const response = {
              jsonrpc: '2.0',
              id: request.id,
              error: { code: -32601, message: 'Method not found' }
            };
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(response));
            
          } catch (error) {
            const response = {
              jsonrpc: '2.0',
              id: request.id || null,
              error: { code: -32603, message: error.message }
            };
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(response));
          }
        });
        return;
      }
      
      // Default response
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found. Use /mcp for MCP endpoint or /health for status.' }));
    });
    
    httpServer.listen(port, () => {
      this.logger.info('Secret Network MCP HTTP Server started', {
        transport: 'http',
        port: port,
        network: this.config.NETWORK,
        endpoints: {
          mcp: `http://localhost:${port}/mcp`,
          health: `http://localhost:${port}/health`
        }
      });
    });
  }

  async start(): Promise<void> {
    const useHTTP = process.env.MCP_HTTP_MODE === 'true';
    
    if (useHTTP) {
      await this.startHTTP();
    } else {
      await this.initialize();
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      
      this.logger.info('Secret Network MCP Server started', {
        transport: 'stdio',
        network: this.config.NETWORK
      });
    }
  }
}

// Start the server
const server = new SecretNetworkMCPServer();
await server.start();

export { SecretNetworkMCPServer };
