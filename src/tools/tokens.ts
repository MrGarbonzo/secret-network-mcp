import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { chainAbstraction } from '../services/chainAbstraction.js';
import { SecretNetworkService } from '../services/secretNetwork.js';
import { formatMCPResponse, handleError, isValidAddress, loadJsonConfig } from '../utils/index.js';

export const tokenTools: Tool[] = [
  {
    name: 'get_token_balance',
    description: 'Get token balance for an address (SCRT or specific denom)',
    inputSchema: {
      type: 'object',
      properties: {
        address: {
          type: 'string',
          description: 'Secret Network address (secret1...)'
        },
        denom: {
          type: 'string',
          description: 'Token denomination (optional, defaults to all balances)',
          optional: true
        }
      },
      required: ['address']
    }
  },
  {
    name: 'get_snip20_token_info',
    description: 'Get SNIP-20 token information (name, symbol, decimals, total supply)',
    inputSchema: {
      type: 'object',
      properties: {
        contractAddress: {
          type: 'string',
          description: 'SNIP-20 contract address'
        }
      },
      required: ['contractAddress']
    }
  },
  {
    name: 'get_snip20_balance',
    description: 'Get SNIP-20 token balance for an address with viewing key',
    inputSchema: {
      type: 'object',
      properties: {
        contractAddress: {
          type: 'string',
          description: 'SNIP-20 contract address'
        },
        address: {
          type: 'string',
          description: 'Wallet address to check balance for'
        },
        viewingKey: {
          type: 'string',
          description: 'Viewing key for private balance query'
        }
      },
      required: ['contractAddress', 'address', 'viewingKey']
    }
  },
  {
    name: 'list_known_tokens',
    description: 'List known tokens and their contract addresses for the current network',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  }
];

export async function handleTokenTool(name: string, args: any): Promise<any> {
  try {
    const chain = chainAbstraction.getActiveChain();

    switch (name) {
      case 'get_token_balance': {
        const { address, denom } = args;
        
        if (!isValidAddress(address)) {
          return formatMCPResponse(false, null, 'Invalid Secret Network address format');
        }

        const balances = await chain.getTokenBalance(address, denom);
        return formatMCPResponse(true, {
          address,
          balances,
          totalBalances: balances.length
        });
      }

      case 'get_snip20_token_info': {
        const { contractAddress } = args;
        
        if (!isValidAddress(contractAddress)) {
          return formatMCPResponse(false, null, 'Invalid contract address format');
        }

        // Cast to access Secret Network specific methods
        const secretService = chain as SecretNetworkService;
        if (!('getSnip20TokenInfo' in secretService)) {
          return formatMCPResponse(false, null, 'SNIP-20 queries not supported by current chain');
        }

        const tokenInfo = await secretService.getSnip20TokenInfo(contractAddress);
        return formatMCPResponse(true, {
          contractAddress,
          tokenInfo
        });
      }

      case 'get_snip20_balance': {
        const { contractAddress, address, viewingKey } = args;
        
        if (!isValidAddress(contractAddress)) {
          return formatMCPResponse(false, null, 'Invalid contract address format');
        }
        
        if (!isValidAddress(address)) {
          return formatMCPResponse(false, null, 'Invalid wallet address format');
        }

        if (!viewingKey || viewingKey.length < 10) {
          return formatMCPResponse(false, null, 'Invalid viewing key');
        }

        // Cast to access Secret Network specific methods
        const secretService = chain as SecretNetworkService;
        if (!('getSnip20Balance' in secretService)) {
          return formatMCPResponse(false, null, 'SNIP-20 balance queries not supported by current chain');
        }

        const balance = await secretService.getSnip20Balance(contractAddress, address, viewingKey);
        return formatMCPResponse(true, {
          contractAddress,
          address,
          balance
        });
      }

      case 'list_known_tokens': {
        try {
          const contractsConfig = await loadJsonConfig('./config/contracts.json');
          const networkConfig = await chainAbstraction.getActiveNetworkInfo();
          
          // Determine current network
          const networkKey = networkConfig.chainId === 'secret-4' ? 'mainnet' : 'testnet';
          const tokens = contractsConfig[networkKey]?.tokens || {};

          return formatMCPResponse(true, {
            network: networkKey,
            chainId: networkConfig.chainId,
            tokens,
            tokenCount: Object.keys(tokens).length
          });
        } catch (error) {
          return formatMCPResponse(false, null, 'Failed to load token configuration');
        }
      }

      default:
        return formatMCPResponse(false, null, `Unknown token tool: ${name}`);
    }
  } catch (error) {
    const errorMsg = handleError(error, `handleTokenTool:${name}`);
    return formatMCPResponse(false, null, errorMsg);
  }
}
