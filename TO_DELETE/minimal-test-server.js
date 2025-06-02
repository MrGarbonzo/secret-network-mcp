#!/usr/bin/env node

// Absolute minimal MCP server for testing Claude Desktop connection
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema,
  ListToolsRequestSchema 
} from '@modelcontextprotocol/sdk/types.js';

// Simple console logging with timestamps
function log(message, ...args) {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ${message}`, ...args);
}

log('🟢 Minimal MCP server starting...');

const server = new Server({
  name: 'minimal-test',
  version: '1.0.0',
  capabilities: {
    tools: {}
  }
});

// Simple ping tool
server.setRequestHandler(ListToolsRequestSchema, async () => {
  log('📋 ListTools requested');
  return {
    tools: [{
      name: 'ping',
      description: 'Simple ping test tool',
      inputSchema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            description: 'Message to echo back',
            default: 'pong'
          }
        }
      }
    }]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  log(`🔧 Tool called: ${name}`, args);
  
  if (name === 'ping') {
    const message = args?.message || 'pong';
    const response = {
      success: true,
      message: `Echo: ${message}`,
      timestamp: new Date().toISOString(),
      serverInfo: 'Minimal MCP test server'
    };
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(response, null, 2)
      }]
    };
  }
  
  throw new Error(`Unknown tool: ${name}`);
});

try {
  log('🔌 Connecting to STDIO transport...');
  const transport = new StdioServerTransport();
  await server.connect(transport);
  log('✅ Minimal server connected successfully!');
  log('📡 Ready for Claude Desktop connection...');
} catch (error) {
  log('❌ Server failed to connect:', error.message);
  log('Stack:', error.stack);
  process.exit(1);
}

// Keep the process alive
process.on('SIGINT', () => {
  log('👋 Server shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('👋 Server terminating...');
  process.exit(0);
});
