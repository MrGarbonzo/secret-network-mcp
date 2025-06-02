import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { chainAbstraction } from '../services/chainAbstraction.js';
import { formatMCPResponse, handleError, isValidAddress, loadJsonConfig } from '../utils/index.js';

export const contractTools: Tool[] = [
  {
    name: 'query_contract',
    description: 'Execute a query on a smart contract',
    inputSchema: {
      type: 'object',
      properties: {
        contractAddress: {
          type: 'string',
          description: 'Smart contract address'
        },
        query: {
          type: 'object',
          description: 'Query object to send to the contract'
        }
      },
      required: ['contractAddress', 'query']
    }
  },
  {
    name: 'get_contract_info',
    description: 'Get information about a smart contract (code ID, creator, admin, etc.)',
    inputSchema: {
      type: 'object',
      properties: {
        contractAddress: {
          type: 'string',
          description: 'Smart contract address'
        }
      },
      required: ['contractAddress']
    }
  },
  {
    name: 'list_known_contracts',
    description: 'List known smart contracts for the current network',
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description: 'Contract category (tokens, dex, etc.) - optional',
          optional: true
        }
      },
      required: []
    }
  },
  {
    name: 'get_contract_code_info',
    description: 'Get information about contract code by code ID',
    inputSchema: {
      type: 'object',
      properties: {
        codeId: {
          type: 'number',
          description: 'Contract code ID'
        }
      },
      required: ['codeId']
    }
  }
];

export async function handleContractTool(name: string, args: any): Promise<any> {
  try {
    const chain = chainAbstraction.getActiveChain();

    switch (name) {
      case 'query_contract': {
        const { contractAddress, query } = args;
        
        if (!isValidAddress(contractAddress)) {
          return formatMCPResponse(false, null, 'Invalid contract address format');
        }

        if (!query || typeof query !== 'object') {
          return formatMCPResponse(false, null, 'Query must be a valid object');
        }

        const result = await chain.queryContract(contractAddress, query);
        return formatMCPResponse(true, {
          contractAddress,
          query,
          result
        });
      }

      case 'get_contract_info': {
        const { contractAddress } = args;
        
        if (!isValidAddress(contractAddress)) {
          return formatMCPResponse(false, null, 'Invalid contract address format');
        }

        const contractInfo = await chain.getContractInfo(contractAddress);
        return formatMCPResponse(true, contractInfo);
      }

      case 'list_known_contracts': {
        const { category } = args;
        
        try {
          const contractsConfig = await loadJsonConfig('./config/contracts.json');
          const networkConfig = await chainAbstraction.getActiveNetworkInfo();
          
          // Determine current network
          const networkKey = networkConfig.chainId === 'secret-4' ? 'mainnet' : 'testnet';
          const networkContracts = contractsConfig[networkKey] || {};

          let contracts = {};
          
          if (category && networkContracts[category]) {
            contracts = { [category]: networkContracts[category] };
          } else {
            contracts = networkContracts;
          }

          return formatMCPResponse(true, {
            network: networkKey,
            chainId: networkConfig.chainId,
            category: category || 'all',
            contracts
          });
        } catch (error) {
          return formatMCPResponse(false, null, 'Failed to load contract configuration');
        }
      }

      case 'get_contract_code_info': {
        const { codeId } = args;
        
        if (!Number.isInteger(codeId) || codeId < 1) {
          return formatMCPResponse(false, null, 'Invalid code ID');
        }

        // This would require extending the ChainInterface with getCodeInfo method
        // For now, we'll return a not implemented message
        return formatMCPResponse(false, null, 'Contract code info queries not yet implemented');
      }

      default:
        return formatMCPResponse(false, null, `Unknown contract tool: ${name}`);
    }
  } catch (error) {
    const errorMsg = handleError(error, `handleContractTool:${name}`);
    return formatMCPResponse(false, null, errorMsg);
  }
}

// Helper function to validate common Secret Network contract queries
export function validateCommonQueries(contractAddress: string, query: any): string | null {
  const queryKeys = Object.keys(query);
  
  if (queryKeys.length !== 1) {
    return 'Query should contain exactly one method';
  }

  const method = queryKeys[0];
  if (!method) {
    return 'Query method not specified';
  }
  
  const commonMethods = [
    'token_info', 'balance', 'allowance', 'minters',
    'config', 'state', 'get_exchange_rate', 'pool_info'
  ];

  // This is just a basic validation - in practice, you'd want more sophisticated validation
  if (!commonMethods.includes(method)) {
    return `Unknown query method: ${method}. Common methods: ${commonMethods.join(', ')}`;
  }

  return null;
}
