import { SecretNetworkClient } from 'secretjs';
import { 
  NetworkConfig, 
  NetworkStatus, 
  BlockInfo, 
  TransactionInfo, 
  TokenBalance, 
  ContractInfo,
  ChainInterface 
} from '../types/index.js';
import { 
  createLogger, 
  handleError, 
  retryAsync, 
  formatTokenAmount 
} from '../utils/index.js';

export class SecretNetworkService implements ChainInterface {
  private client!: SecretNetworkClient;
  private config: NetworkConfig;
  private logger = createLogger();

  constructor(config: NetworkConfig) {
    this.config = config;
    this.initializeClient();
  }

  private initializeClient(): void {
    try {
      // Use lcdUrl if available, otherwise fall back to rpcUrl
      const url = this.config.lcdUrl || this.config.rpcUrl;
      
      this.client = new SecretNetworkClient({
        url,
        chainId: this.config.chainId,
      });
      
      this.logger.info('Secret Network client initialized', {
        chainId: this.config.chainId,
        network: this.config.name,
        url,
        urlType: this.config.lcdUrl ? 'LCD' : 'RPC'
      });
    } catch (error) {
      this.logger.error('Failed to initialize Secret Network client', { error });
      throw new Error('Failed to initialize Secret Network client');
    }
  }

  async getNetworkStatus(): Promise<NetworkStatus> {
    try {
      return await retryAsync(async () => {
        const [latestBlock, stakingPool, inflation] = await Promise.all([
          this.client.query.tendermint.getLatestBlock({}),
          this.client.query.staking.pool({}),
          this.client.query.mint.inflation({}).catch(() => null)
        ]);

        const validatorSet = await this.client.query.tendermint.getValidatorSetByHeight({
          height: latestBlock.block?.header?.height || '0'
        });

        // Convert timestamp to string if needed
        const blockTime = latestBlock.block?.header?.time;
        const timeString = typeof blockTime === 'string' ? blockTime : 
                          blockTime && typeof blockTime === 'object' && 'seconds' in blockTime ? 
                          new Date(Number(blockTime.seconds) * 1000).toISOString() : '';

        // Handle inflation parsing
        let inflationValue: number | undefined;
        if (inflation?.inflation) {
          const inflationData = inflation.inflation;
          if (typeof inflationData === 'string') {
            inflationValue = parseFloat(inflationData);
          } else if (inflationData instanceof Uint8Array) {
            inflationValue = parseFloat(Buffer.from(inflationData).toString());
          }
        }

        return {
          chainId: this.config.chainId,
          latestBlockHeight: parseInt(latestBlock.block?.header?.height || '0'),
          latestBlockTime: timeString,
          validatorCount: validatorSet.validators?.length || 0,
          bondedTokens: stakingPool.pool?.bonded_tokens || '0',
          inflation: inflationValue
        };
      });
    } catch (error) {
      throw new Error(handleError(error, 'getNetworkStatus'));
    }
  }

  async getBlockInfo(height: number): Promise<BlockInfo> {
    try {
      return await retryAsync(async () => {
        const block = await this.client.query.tendermint.getBlockByHeight({
          height: height.toString()
        });

        if (!block.block) {
          throw new Error(`Block not found at height ${height}`);
        }

        // Convert timestamp to string if needed
        const blockTime = block.block.header?.time;
        const timeString = typeof blockTime === 'string' ? blockTime : 
                          blockTime && typeof blockTime === 'object' && 'seconds' in blockTime ? 
                          new Date(Number(blockTime.seconds) * 1000).toISOString() : '';

        // Convert proposer address from Uint8Array to string if needed
        const proposerAddr = block.block.header?.proposer_address;
        const proposerString = proposerAddr ? 
          (typeof proposerAddr === 'string' ? proposerAddr : Buffer.from(proposerAddr).toString('hex')) : '';

        // Convert hash from Uint8Array to string if needed
        const blockHash = block.block_id?.hash;
        const hashString = blockHash ? 
          (typeof blockHash === 'string' ? blockHash : Buffer.from(blockHash).toString('hex')) : '';

        return {
          height: parseInt(block.block.header?.height || '0'),
          hash: hashString,
          time: timeString,
          proposer: proposerString,
          txCount: block.block.data?.txs?.length || 0,
          gasUsed: '0', // Not directly available, would need to process all txs
          gasWanted: '0' // Not directly available, would need to process all txs
        };
      });
    } catch (error) {
      throw new Error(handleError(error, 'getBlockInfo'));
    }
  }

  async getTransactionInfo(hash: string): Promise<TransactionInfo> {
    try {
      return await retryAsync(async () => {
        const tx = await this.client.query.getTx(hash);

        if (!tx) {
          throw new Error(`Transaction not found: ${hash}`);
        }

        // Extract transaction hash - different properties depending on Secret.js version
        let txHash = '';
        if ('txhash' in tx && typeof tx.txhash === 'string') {
          txHash = tx.txhash;
        } else if ('hash' in tx && typeof tx.hash === 'string') {
          txHash = tx.hash;
        } else if ('transactionHash' in tx && typeof tx.transactionHash === 'string') {
          txHash = tx.transactionHash;
        } else {
          // Fallback - try to extract from raw response
          txHash = hash; // Use the provided hash parameter as fallback
        }

        return {
          hash: txHash,
          height: tx.height || 0,
          index: 0, // Index not directly available in current Secret.js response
          code: tx.code || 0,
          gasUsed: tx.gasUsed?.toString() || '0',
          gasWanted: tx.gasWanted?.toString() || '0',
          fee: tx.tx?.auth_info?.fee?.amount?.[0]?.amount || '0',
          timestamp: tx.timestamp || '',
          memo: tx.tx?.body?.memo || ''
        };
      });
    } catch (error) {
      throw new Error(handleError(error, 'getTransactionInfo'));
    }
  }

  async getTokenBalance(address: string, denom?: string): Promise<TokenBalance[]> {
    try {
      return await retryAsync(async () => {
        // Get native SCRT balance
        const balances = await this.client.query.bank.allBalances({
          address: address
        });

        const tokenBalances: TokenBalance[] = [];

        for (const balance of balances.balances || []) {
          if (!denom || balance.denom === denom) {
            tokenBalances.push({
              address,
              amount: balance.amount || '0',
              denom: balance.denom || '',
              symbol: balance.denom === this.config.nativeDenom ? 'SCRT' : balance.denom,
              decimals: balance.denom === this.config.nativeDenom ? 6 : undefined
            });
          }
        }

        return tokenBalances;
      });
    } catch (error) {
      throw new Error(handleError(error, 'getTokenBalance'));
    }
  }

  async queryContract(contractAddress: string, query: object): Promise<any> {
    try {
      return await retryAsync(async () => {
        const result = await this.client.query.compute.queryContract({
          contract_address: contractAddress,
          query
        });

        return result;
      });
    } catch (error) {
      throw new Error(handleError(error, 'queryContract'));
    }
  }

  async getContractInfo(contractAddress: string): Promise<ContractInfo> {
    try {
      return await retryAsync(async () => {
        const contractInfo = await this.client.query.compute.contractInfo({
          contract_address: contractAddress
        });

        if (!contractInfo.contract_info) {
          throw new Error(`Contract not found: ${contractAddress}`);
        }

        // Convert creator from Uint8Array to string if needed
        const creator = contractInfo.contract_info.creator;
        const creatorString = creator ? 
          (typeof creator === 'string' ? creator : Buffer.from(creator).toString('hex')) : '';

        return {
          address: contractAddress,
          codeId: parseInt(contractInfo.contract_info.code_id?.toString() || '0'),
          creator: creatorString,
          admin: contractInfo.contract_info.admin || null,
          label: contractInfo.contract_info.label || '',
          ibcPortId: contractInfo.contract_info.ibc_port_id || null
        };
      });
    } catch (error) {
      throw new Error(handleError(error, 'getContractInfo'));
    }
  }

  // Secret Network specific methods
  async getSnip20TokenInfo(contractAddress: string): Promise<any> {
    try {
      const tokenInfo = await this.queryContract(contractAddress, {
        token_info: {}
      });
      return tokenInfo;
    } catch (error) {
      throw new Error(handleError(error, 'getSnip20TokenInfo'));
    }
  }

  async getSnip20Balance(
    contractAddress: string, 
    address: string, 
    viewingKey: string
  ): Promise<any> {
    try {
      const balance = await this.queryContract(contractAddress, {
        balance: {
          address,
          key: viewingKey
        }
      });
      return balance;
    } catch (error) {
      throw new Error(handleError(error, 'getSnip20Balance'));
    }
  }

  // Health check method
  async isHealthy(): Promise<boolean> {
    try {
      await this.client.query.tendermint.getLatestBlock({});
      return true;
    } catch (error) {
      this.logger.warn('Health check failed', { error });
      return false;
    }
  }

  // Get current network configuration
  getNetworkConfig(): NetworkConfig {
    return { ...this.config };
  }
}
