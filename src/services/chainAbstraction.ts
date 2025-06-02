import { ChainInterface, NetworkConfig } from '../types/index.js';
import { SecretNetworkService } from './secretNetwork.js';
import { createLogger, loadJsonConfig } from '../utils/index.js';

export type SupportedChain = 'secret';

export class ChainAbstraction {
  private chains: Map<SupportedChain, ChainInterface> = new Map();
  private activeChain: SupportedChain = 'secret';
  private logger = createLogger();

  constructor() {
    this.logger.info('Chain abstraction layer initialized');
  }

  async initialize(network: 'mainnet' | 'testnet' = 'mainnet'): Promise<void> {
    try {
      // Load network configurations
      const configPath = process.platform === 'win32' 
        ? new URL('../../config/networks.json', import.meta.url).pathname.substring(1)
        : new URL('../../config/networks.json', import.meta.url).pathname;
      const networksConfig = await loadJsonConfig(configPath);
      
      // Get base configuration
      let secretConfig: NetworkConfig = networksConfig[network];
      if (!secretConfig) {
        throw new Error(`Configuration not found for network: ${network}`);
      }

      // Override with environment variables if provided (CRITICAL FIX)
      if (process.env.SECRET_RPC_URL) {
        secretConfig.rpcUrl = process.env.SECRET_RPC_URL;
      }
      if (process.env.SECRET_LCD_URL) {
        secretConfig.lcdUrl = process.env.SECRET_LCD_URL;
      }
      if (process.env.SECRET_GRPC_URL) {
        secretConfig.grpcUrl = process.env.SECRET_GRPC_URL;
      }

      this.logger.info('Attempting to connect to Secret Network', {
        network,
        rpcUrl: secretConfig.rpcUrl,
        lcdUrl: secretConfig.lcdUrl,
        chainId: secretConfig.chainId
      });

      // Create service and test connection IMMEDIATELY
      const secretService = new SecretNetworkService(secretConfig);
      
      // CRITICAL: Test the connection before considering it initialized
      this.logger.info('Testing network connectivity...');
      const networkStatus = await secretService.getNetworkStatus();
      
      // Validate we got real data, not mock data
      if (networkStatus.latestBlockHeight === 0 || networkStatus.validatorCount === 0) {
        throw new Error('Received invalid network status - possible RPC connection failure');
      }
      
      this.logger.info('Successfully connected to Secret Network', { 
        networkStatus: {
          chainId: networkStatus.chainId,
          blockHeight: networkStatus.latestBlockHeight,
          validators: networkStatus.validatorCount
        }
      });
      
      this.chains.set('secret', secretService);

      this.logger.info('Chain services initialized successfully', {
        network,
        chains: Array.from(this.chains.keys()),
        connected: true
      });
    } catch (error) {
      this.logger.error('Failed to initialize chain services', { error });
      
      // CRITICAL FIX: Only fall back to offline mode if explicitly enabled
      if (process.env.ALLOW_OFFLINE_MODE === 'true') {
        this.logger.warn('Falling back to offline mode as explicitly requested');
        this.initializeOfflineMode(network);
      } else {
        // Fail fast instead of silently using mock data
        throw new Error(`Chain initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}. Set ALLOW_OFFLINE_MODE=true to continue with mock data.`);
      }
    }
  }

  getActiveChain(): ChainInterface {
    const chain = this.chains.get(this.activeChain);
    if (!chain) {
      // CRITICAL FIX: Only create mock if explicitly allowed
      if (process.env.ALLOW_OFFLINE_MODE === 'true') {
        this.logger.warn('No active chain available, creating offline mock (explicitly allowed)');
        this.initializeOfflineMode();
        return this.chains.get(this.activeChain) || this.createOfflineMock();
      }
      // Fail fast instead of creating mock data
      throw new Error(`Active chain '${this.activeChain}' not initialized. Real network connection required.`);
    }
    return chain;
  }

  setActiveChain(chainName: SupportedChain): void {
    if (!this.chains.has(chainName)) {
      throw new Error(`Chain '${chainName}' not available`);
    }
    this.activeChain = chainName;
    this.logger.info('Active chain changed', { activeChain: chainName });
  }

  getAvailableChains(): SupportedChain[] {
    return Array.from(this.chains.keys());
  }

  getChain(chainName: SupportedChain): ChainInterface {
    const chain = this.chains.get(chainName);
    if (!chain) {
      throw new Error(`Chain '${chainName}' not available`);
    }
    return chain;
  }

  async healthCheck(): Promise<{ [key in SupportedChain]?: boolean }> {
    const healthStatus: { [key in SupportedChain]?: boolean } = {};

    for (const [chainName, chain] of this.chains) {
      try {
        if ('isHealthy' in chain && typeof chain.isHealthy === 'function') {
          healthStatus[chainName] = await chain.isHealthy();
        } else {
          // Fallback health check
          await chain.getNetworkStatus();
          healthStatus[chainName] = true;
        }
      } catch (error) {
        this.logger.warn(`Health check failed for ${chainName}`, { error });
        healthStatus[chainName] = false;
      }
    }

    return healthStatus;
  }

  // Future method for adding new chain support
  addChain(chainName: SupportedChain, chainService: ChainInterface): void {
    this.chains.set(chainName, chainService);
    this.logger.info('New chain added', { chainName });
  }

  // Get network information for active chain
  async getActiveNetworkInfo(): Promise<any> {
    const chain = this.getActiveChain();
    
    if ('getNetworkConfig' in chain && typeof chain.getNetworkConfig === 'function') {
      return chain.getNetworkConfig();
    }
    
    // Fallback to basic network status
    return await chain.getNetworkStatus();
  }

  // Initialize offline mode with mock chain
  private initializeOfflineMode(network: 'mainnet' | 'testnet' = 'mainnet'): void {
    this.logger.info('Initializing offline mode');
    const mockChain = this.createOfflineMock(network);
    this.chains.set('secret', mockChain);
  }

  // Create a mock chain for offline operation
  private createOfflineMock(network: 'mainnet' | 'testnet' = 'mainnet'): ChainInterface {
    return {
      async getNetworkStatus() {
        return {
          chainId: network === 'mainnet' ? 'secret-4' : 'pulsar-3',
          latestBlockHeight: 0,
          latestBlockTime: new Date().toISOString(),
          validatorCount: 0,
          bondedTokens: '0',
          inflation: 0
        };
      },
      async getBlockInfo(height: number) {
        return {
          height,
          hash: '',
          time: new Date().toISOString(),
          proposer: '',
          txCount: 0,
          gasUsed: '0',
          gasWanted: '0'
        };
      },
      async getTransactionInfo(hash: string) {
        return {
          hash,
          height: 0,
          index: 0,
          code: 0,
          gasUsed: '0',
          gasWanted: '0',
          fee: '0',
          timestamp: new Date().toISOString(),
          memo: ''
        };
      },
      async getTokenBalance(address: string, denom?: string) {
        return [];
      },
      async queryContract(contractAddress: string, query: object) {
        throw new Error('Contract queries not available in offline mode');
      },
      async getContractInfo(contractAddress: string) {
        throw new Error('Contract info not available in offline mode');
      }
    };
  }
}

// Singleton instance
export const chainAbstraction = new ChainAbstraction();
