# Secret Network MCP Server

A Model Context Protocol (MCP) server providing secure access to Secret Network blockchain functionality. Designed for deployment in TEE (Trusted Execution Environment) VMs with comprehensive blockchain querying capabilities.

## 🌟 Features

- **Complete Secret Network Integration** - Real-time blockchain data access
- **MCP Protocol Compliant** - Works seamlessly with Claude Desktop and other MCP clients  
- **TEE VM Optimized** - Production deployment in confidential computing environments
- **Docker Ready** - Containerized deployment with health monitoring
- **Multiple Transport Modes** - STDIO for local use, SSE for remote access
- **Comprehensive API** - Network status, transactions, tokens, and smart contracts

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker (for containerized deployment)
- Git

### Local Development

```bash
# Clone and setup
git clone <your-repository-url>
cd secret-network-mcp
npm install

# Configure environment
cp .env.example .env
# Edit .env with your preferred settings

# Build and run
npm run build
npm start
```

### Docker Deployment (Recommended)

```bash
# Development with hot reload
docker-compose up -d

# Production deployment (TEE VM ready)
docker-compose -f docker-compose.prod.yml up -d
```

## 🛠️ Available Tools

### Network Information
- **`get_network_status`** - Current network status, block height, validator count, bonded tokens
- **`get_block_info`** - Detailed block information by height
- **`get_transaction_info`** - Transaction details by hash
- **`get_latest_blocks`** - Recent block information (up to 20 blocks)

### Token Operations  
- **`get_token_balance`** - SCRT or custom token balances for any address
- **`get_snip20_token_info`** - SNIP-20 token metadata (name, symbol, decimals, supply)
- **`get_snip20_balance`** - Private token balance with viewing key
- **`list_known_tokens`** - Directory of known tokens and contracts

### Smart Contract Queries
- **`query_contract`** - Execute queries on any smart contract
- **`get_contract_info`** - Contract metadata (code ID, creator, admin)
- **`list_known_contracts`** - Directory of known contracts by category
- **`get_contract_code_info`** - Contract code information by code ID

## 📖 Usage Examples

### Network Status
```json
{
  "tool": "get_network_status",
  "arguments": {}
}
```
Returns current block height (~19M+), validator count (~60+), and bonded tokens.

### Check Token Balance
```json
{
  "tool": "get_token_balance", 
  "arguments": {
    "address": "secret1abc123...",
    "denom": "uscrt"
  }
}
```

### Query Smart Contract
```json
{
  "tool": "query_contract",
  "arguments": {
    "contractAddress": "secret1k0jntykt7e4g3y88ltc60czgjuqdy4c9e8fzek",
    "query": {
      "token_info": {}
    }
  }
}
```

### Private Token Balance
```json
{
  "tool": "get_snip20_balance",
  "arguments": {
    "contractAddress": "secret1k0jntykt7e4g3y88ltc60czgjuqdy4c9e8fzek", 
    "address": "secret1abc123...",
    "viewingKey": "your-viewing-key"
  }
}
```

## ⚙️ Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Application environment |
| `NETWORK` | `mainnet` | Secret Network (mainnet/testnet) |
| `PORT` | `3000` | Server port |
| `LOG_LEVEL` | `info` | Logging level (error/warn/info/debug) |
| `MCP_TRANSPORT` | `stdio` | Transport mode (stdio/sse) |
| `CACHE_TTL` | `300` | Cache duration in seconds |
| `RATE_LIMIT_REQUESTS` | `100` | Max requests per window |
| `RATE_LIMIT_WINDOW` | `60000` | Rate limit window (ms) |

### Secret Network Configuration
```bash
# Optional: Override default RPC endpoints
SECRET_CHAIN_ID=secret-4
SECRET_CHAIN_URL=https://lcd.secret.express
SECRET_RPC_URL=https://secretnetwork-rpc.lavenderfive.com:443
SECRET_GRPC_URL=https://secretnetwork-grpc.lavenderfive.com:443
```

### TEE VM Security Variables (Auto-injected)
```bash
SECRET_API_KEY=${SECRET_API_KEY:-}
ENCRYPTION_KEY=${ENCRYPTION_KEY:-}
```

## 🏗️ Architecture

```
secret-network-mcp/
├── src/
│   ├── server.ts              # Main MCP server (stdio)
│   ├── server-http.ts         # HTTP/SSE server
│   ├── server-tcp.ts          # TCP server variant
│   ├── tools/                 # MCP tool implementations
│   │   ├── network.ts         # Network & block tools
│   │   ├── tokens.ts          # Token & SNIP-20 tools
│   │   └── contracts.ts       # Smart contract tools
│   ├── services/              # Core business logic
│   │   ├── secretNetwork.ts   # Secret.js integration
│   │   └── chainAbstraction.ts # Multi-chain framework
│   ├── types/                 # TypeScript definitions
│   └── utils/                 # Utility functions
├── config/                    # Network configurations
├── deployment/                # Deployment configs
├── docs/                      # Documentation
└── tests/                     # Test suites
```

## 🐳 Docker Deployment

### Development Mode
Uses `docker-compose.yml`:
- Local build from source
- Hot reload enabled
- Testnet by default
- Debug logging
- Local volume mounts

### Production Mode (TEE VM)
Uses `docker-compose.prod.yml`:
- Pre-built image from GitHub Container Registry
- Mainnet configuration
- Resource limits (512MB RAM, 0.5 CPU)
- Named volumes for persistence
- Health monitoring
- Security optimizations

### Transport Modes

**STDIO (Default)** - For Claude Desktop integration:
```bash
docker run -it secret-network-mcp node dist/server.js
```

**SSE (Remote Access)** - For web/remote clients:
```bash
docker run -p 3000:3000 -e MCP_TRANSPORT=sse secret-network-mcp
```

## 🔒 Security Features

### Privacy Preservation
- No sensitive data logging in production
- Secure viewing key handling for private queries  
- Encrypted communication channels in TEE environment
- Minimal attack surface in Docker containers

### Access Control
- Rate limiting per client connection
- Input validation and sanitization
- Resource limits to prevent abuse
- Health checks for monitoring

## 🧪 Development

### Available Scripts

```bash
# Development
npm run dev              # Hot reload development server
npm run build           # TypeScript compilation
npm run test            # Run test suite
npm run test:watch      # Tests with hot reload

# Docker
npm run docker:build:prod     # Build production image
npm run docker:compose:up     # Start development stack
npm run docker:compose:prod   # Start production stack

# Validation
npm run lint            # Code style checking
npm run lint:fix        # Auto-fix style issues
npm run deploy:check    # Pre-deployment validation
```

### Testing
```bash
# Run all tests
npm test

# Quick functionality test
npm run test:simple

# Real network connection test
npm run test:connection

# Framework validation
npm run test:framework
```

## 🚀 Production Deployment

### TEE VM Deployment

1. **Upload Configuration**: Use `docker-compose.prod.yml`
2. **Environment Setup**: TEE VM auto-injects security variables
3. **Start Services**: `docker-compose -f docker-compose.prod.yml up -d`
4. **Health Check**: Automatic container health monitoring

### Claude Desktop Integration

**For TEE VM deployment (SSE mode)**:
```json
{
  "mcpServers": {
    "secret-network": {
      "command": "node",
      "args": ["-e", "/* SSE client code */"],
      "env": {
        "MCP_SERVER_URL": "https://your-tee-vm-domain:3000"
      }
    }
  }
}
```

**For local development (stdio mode)**:
```json
{
  "mcpServers": {
    "secret-network": {
      "command": "node",
      "args": ["F:\\coding\\secret-network-mcp\\dist\\server.js"],
      "env": {
        "NODE_ENV": "development"
      }
    }
  }
}
```

### Health Monitoring

The server includes comprehensive health checks:
- Container health endpoint
- Secret Network connectivity verification  
- Service dependency validation
- Resource usage monitoring

## 📊 Performance

### Optimizations
- Response caching with configurable TTL
- Connection pooling for blockchain queries
- Rate limiting to prevent abuse
- Resource limits for stable performance

### Resource Usage (Production)
- **Memory**: 256MB reserved, 512MB max
- **CPU**: 0.25 cores reserved, 0.5 cores max
- **Storage**: Persistent logs volume
- **Network**: Minimal bandwidth usage

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes and add tests
4. Ensure all tests pass: `npm test`
5. Submit pull request

### Development Guidelines
- Follow TypeScript best practices
- Add tests for new functionality
- Update documentation as needed
- Ensure Docker compatibility
- Test in both development and production modes

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Documentation

- **Issues**: Create GitHub issues for bugs or feature requests
- **Documentation**: Check the [docs/](docs/) directory for detailed guides
- **Deployment**: See [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md) for deployment specifics

## 🙏 Acknowledgments

- [Secret Network](https://scrt.network/) - Privacy-preserving blockchain platform
- [Anthropic](https://www.anthropic.com/) - Model Context Protocol specification
- [Secret.js](https://github.com/scrtlabs/secret.js) - Secret Network JavaScript SDK
- Secret Network developer community

---

**Status**: ✅ Production Ready - Successfully deployed on TEE VM with real mainnet connectivity
