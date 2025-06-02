#!/usr/bin/env node

// Minimal MCP server for testing Claude Desktop connection
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema,
  ListToolsRequestSchema 
} from '@modelcontextprotocol/sdk/types.js';

console.log('🧪 Starting minimal test MCP server...');

const server = new Server({
  name: 'test-server',
  version: '1.0.0',
  capabilities: {
    tools: {}
  }
});

// Simple test tool
server.setRequestHandler(ListToolsRequestSchema, async () => {
  console.log('📋 Tools requested');
  return {
    tools: [{
      name: 'test_tool',
      description: 'A simple test tool',
      inputSchema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            description: 'Test message'
          }
        }
      }
    }]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  console.log(`🔧 Tool called: ${name} with args:`, args);
  
  if (name === 'test_tool') {
    return {
      content: [{
        type: 'text',
        text: `✅ Test successful! Received message: ${args?.message || 'No message provided'}`
      }]
    };
  }
  
  throw new Error(`Unknown tool: ${name}`);
});

try {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log('✅ Minimal test server connected successfully!');
  console.log('📡 Waiting for Claude Desktop to connect...');
} catch (error) {
  console.error('❌ Server failed to start:', error);
  process.exit(1);
}
