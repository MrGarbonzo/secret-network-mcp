import winston from 'winston';
import { EnvironmentConfig } from '../types/index.js';

// Create logger instance
export const createLogger = (level: string = 'info') => {
  const transports: winston.transport[] = [];
  
  // Only add console transport if not running as MCP server
  // MCP uses stdio for communication, so console output interferes
  const isMCPMode = process.argv.some(arg => arg.includes('server.js')) || 
                    process.env.MCP_MODE === 'true';
  
  if (!isMCPMode) {
    transports.push(
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      })
    );
  }
  
  // Always add file transport if possible
  try {
    transports.push(
      new winston.transports.File({
        filename: 'logs/mcp-server.log',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        )
      })
    );
  } catch (error) {
    // File logging failed, continue without it
  }
  
  return winston.createLogger({
    level,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
    defaultMeta: { service: 'secret-network-mcp' },
    transports,
    // Suppress console output in MCP mode
    silent: isMCPMode && transports.length === 0
  });
};

// Environment configuration with defaults
export const getEnvironmentConfig = (): EnvironmentConfig => {
  return {
    NODE_ENV: (process.env.NODE_ENV as any) || 'development',
    NETWORK: (process.env.NETWORK as any) || 'mainnet',
    PORT: parseInt(process.env.PORT || '3000'),
    LOG_LEVEL: (process.env.LOG_LEVEL as any) || 'info',
    CACHE_TTL: parseInt(process.env.CACHE_TTL || '300'), // 5 minutes
    RATE_LIMIT_REQUESTS: parseInt(process.env.RATE_LIMIT_REQUESTS || '100'),
    RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW || '60000') // 1 minute
  };
};

// Configuration loader with fallback
export const loadJsonConfig = async (path: string): Promise<any> => {
  try {
    const { readFile } = await import('fs/promises');
    const configData = await readFile(path, 'utf-8');
    return JSON.parse(configData);
  } catch (error) {
    // Provide fallback configuration if file not found
    console.warn(`Failed to load configuration from ${path}, using fallback`);
    return {
      mainnet: {
        chainId: 'secret-4',
        name: 'Secret Network Mainnet',
        rpcUrl: 'https://secretnetwork-rpc.lavenderfive.com:443',
        grpcUrl: 'https://secretnetwork-grpc.lavenderfive.com:443',
        nativeDenom: 'uscrt',
        coinGeckoId: 'secret',
        explorer: 'https://secretnodes.com'
      },
      testnet: {
        chainId: 'pulsar-3',
        name: 'Secret Network Testnet',
        rpcUrl: 'https://lcd.testnet.secretsaturn.net',
        grpcUrl: 'https://grpc.testnet.secretsaturn.net:443',
        nativeDenom: 'uscrt',
        coinGeckoId: null,
        explorer: 'https://secretnodes.com/pulsar'
      }
    };
  }
};

// Response formatter for MCP tools
export const formatMCPResponse = <T>(
  success: boolean,
  data?: T,
  error?: string
) => {
  return {
    success,
    data,
    error,
    timestamp: new Date().toISOString()
  };
};

// Error handler
export const handleError = (error: unknown, context: string): string => {
  const logger = createLogger();
  
  if (error instanceof Error) {
    logger.error(`${context}: ${error.message}`, { stack: error.stack });
    return error.message;
  }
  
  const errorMsg = `Unknown error in ${context}`;
  logger.error(errorMsg, { error });
  return errorMsg;
};

// Validation helpers
export const isValidAddress = (address: string): boolean => {
  return /^secret[a-z0-9]{39}$/.test(address);
};

export const isValidTransactionHash = (hash: string): boolean => {
  return /^[A-F0-9]{64}$/i.test(hash);
};

// Number formatting helpers
export const formatTokenAmount = (
  amount: string, 
  decimals: number = 6
): string => {
  const num = parseFloat(amount) / Math.pow(10, decimals);
  return num.toLocaleString('en-US', { 
    minimumFractionDigits: 0,
    maximumFractionDigits: 6
  });
};

// Async retry helper
export const retryAsync = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError!;
};
