import { z } from 'zod';

// Network Configuration Schema
export const NetworkConfigSchema = z.object({
  chainId: z.string(),
  name: z.string(),
  rpcUrl: z.string(),
  rpcUrlBackup: z.string().optional(),
  lcdUrl: z.string().optional(),
  lcdUrlBackup: z.string().optional(),
  grpcUrl: z.string(),
  grpcUrlBackup: z.string().optional(),
  nativeDenom: z.string(),
  coinGeckoId: z.string().nullable(),
  explorer: z.string()
});

export type NetworkConfig = z.infer<typeof NetworkConfigSchema>;

// Token Configuration Schema
export const TokenConfigSchema = z.object({
  address: z.string(),
  name: z.string(),
  symbol: z.string(),
  decimals: z.number()
});

export type TokenConfig = z.infer<typeof TokenConfigSchema>;

// Network Status Response
export const NetworkStatusSchema = z.object({
  chainId: z.string(),
  latestBlockHeight: z.number(),
  latestBlockTime: z.string(),
  validatorCount: z.number(),
  bondedTokens: z.string(),
  inflation: z.number().optional()
});

export type NetworkStatus = z.infer<typeof NetworkStatusSchema>;

// Block Information
export const BlockInfoSchema = z.object({
  height: z.number(),
  hash: z.string(),
  time: z.string(),
  proposer: z.string(),
  txCount: z.number(),
  gasUsed: z.string(),
  gasWanted: z.string()
});

export type BlockInfo = z.infer<typeof BlockInfoSchema>;

// Transaction Information
export const TransactionInfoSchema = z.object({
  hash: z.string(),
  height: z.number(),
  index: z.number(),
  code: z.number(),
  gasUsed: z.string(),
  gasWanted: z.string(),
  fee: z.string(),
  timestamp: z.string(),
  memo: z.string().optional()
});

export type TransactionInfo = z.infer<typeof TransactionInfoSchema>;

// Token Balance
export const TokenBalanceSchema = z.object({
  address: z.string(),
  amount: z.string(),
  denom: z.string(),
  symbol: z.string().optional(),
  decimals: z.number().optional()
});

export type TokenBalance = z.infer<typeof TokenBalanceSchema>;

// Contract Info
export const ContractInfoSchema = z.object({
  address: z.string(),
  codeId: z.number(),
  creator: z.string(),
  admin: z.string().nullable(),
  label: z.string(),
  ibcPortId: z.string().nullable()
});

export type ContractInfo = z.infer<typeof ContractInfoSchema>;

// MCP Tool Response
export interface MCPToolResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

// Environment Variables
export interface EnvironmentConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  NETWORK: 'mainnet' | 'testnet';
  PORT: number;
  LOG_LEVEL: 'error' | 'warn' | 'info' | 'debug';
  CACHE_TTL: number;
  RATE_LIMIT_REQUESTS: number;
  RATE_LIMIT_WINDOW: number;
}

// Chain abstraction interface
export interface ChainInterface {
  getNetworkStatus(): Promise<NetworkStatus>;
  getBlockInfo(height: number): Promise<BlockInfo>;
  getTransactionInfo(hash: string): Promise<TransactionInfo>;
  getTokenBalance(address: string, denom?: string): Promise<TokenBalance[]>;
  queryContract(contractAddress: string, query: object): Promise<any>;
  getContractInfo(contractAddress: string): Promise<ContractInfo>;
}
