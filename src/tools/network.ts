import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { chainAbstraction } from '../services/chainAbstraction.js';
import { formatMCPResponse, handleError, isValidTransactionHash } from '../utils/index.js';

export const networkTools: Tool[] = [
  {
    name: 'get_network_status',
    description: 'Get current network status including latest block height, validator count, and bonded tokens',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'get_block_info',
    description: 'Get detailed information about a specific block by height',
    inputSchema: {
      type: 'object',
      properties: {
        height: {
          type: 'number',
          description: 'Block height to query'
        }
      },
      required: ['height']
    }
  },
  {
    name: 'get_transaction_info',
    description: 'Get detailed information about a transaction by hash',
    inputSchema: {
      type: 'object',
      properties: {
        hash: {
          type: 'string',
          description: 'Transaction hash to query (64 character hex string)'
        }
      },
      required: ['hash']
    }
  },
  {
    name: 'get_latest_blocks',
    description: 'Get information about the latest N blocks',
    inputSchema: {
      type: 'object',
      properties: {
        count: {
          type: 'number',
          description: 'Number of latest blocks to retrieve (max 20)',
          minimum: 1,
          maximum: 20
        }
      },
      required: ['count']
    }
  }
];

export async function handleNetworkTool(name: string, args: any): Promise<any> {
  try {
    const chain = chainAbstraction.getActiveChain();

    switch (name) {
      case 'get_network_status': {
        const status = await chain.getNetworkStatus();
        return formatMCPResponse(true, status);
      }

      case 'get_block_info': {
        const { height } = args;
        
        if (!Number.isInteger(height) || height < 1) {
          return formatMCPResponse(false, null, 'Invalid block height');
        }

        const blockInfo = await chain.getBlockInfo(height);
        return formatMCPResponse(true, blockInfo);
      }

      case 'get_transaction_info': {
        const { hash } = args;
        
        if (!isValidTransactionHash(hash)) {
          return formatMCPResponse(false, null, 'Invalid transaction hash format');
        }

        const txInfo = await chain.getTransactionInfo(hash);
        return formatMCPResponse(true, txInfo);
      }

      case 'get_latest_blocks': {
        const { count = 5 } = args;
        
        if (!Number.isInteger(count) || count < 1 || count > 20) {
          return formatMCPResponse(false, null, 'Count must be between 1 and 20');
        }

        // Get current height first
        const status = await chain.getNetworkStatus();
        const latestHeight = status.latestBlockHeight;
        
        // Fetch multiple blocks
        const blocks = [];
        for (let i = 0; i < count; i++) {
          const height = latestHeight - i;
          if (height > 0) {
            const block = await chain.getBlockInfo(height);
            blocks.push(block);
          }
        }

        return formatMCPResponse(true, {
          blocks,
          totalCount: blocks.length,
          latestHeight
        });
      }

      default:
        return formatMCPResponse(false, null, `Unknown network tool: ${name}`);
    }
  } catch (error) {
    const errorMsg = handleError(error, `handleNetworkTool:${name}`);
    return formatMCPResponse(false, null, errorMsg);
  }
}
