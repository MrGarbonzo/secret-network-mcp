# Secret Network MCP Server

A Model Context Protocol (MCP) server that provides secure, extensible access to Secret Network blockchain functionality. Designed for deployment in TEE-based environments with future multi-chain and wallet integration capabilities.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker (for containerized deployment)
- Git

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd secret-network-mcp

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Build the project
npm run build

# Start the server
npm start
```

### Docker Deployment (Recommended)

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build and run manually
docker build -t secret-network-mcp .
docker run -p 3000:3000 secret-network-mcp
```

## 🛠️ Available Tools

### Network Information
- `get_network_status` - Get current network status including latest block height, validator count, and bonded tokens
- `get_block_info` - Get detailed information about a specific block by height
- `get_transaction_info` - Get detailed information about a transaction by hash
- `get_latest_blocks` - Get information about the latest N blocks

### Token Operations
- `get_token_balance` - Get token balance for an address (SCRT or specific denom)
- `get_snip20_token_info` - Get SNIP-20 token information (name, symbol, decimals, total supply)
- `get_snip20_balance` - Get SNIP-20 token balance for an address with viewing key
- `list_known_tokens` - List known tokens and their contract addresses

### Smart Contract Queries
- `query_contract` - Execute a query on a smart contract
- `get_contract_info` - Get information about a smart contract
- `list_known_contracts` - List known smart contracts for the current network

## 📖 Usage Examples

### Basic Network Query
```json
{
  "tool": "get_network_status",
  "arguments": {}
}
```

### Get Token Balance
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
    "contractAddress": "secret1contract...",
    "query": {
      "token_info": {}
    }
  }
}
```

## ⚙️ Configuration

### Environment Variables
- `NODE_ENV` - Application environment (development/production)
- `NETWORK` - Secret Network to connect to (mainnet/testnet)
- `PORT` - Server port (default: 3000)
- `LOG_LEVEL` - Logging level (error/warn/info/debug)
- `CACHE_TTL` - Cache time-to-live in seconds
- `RATE_LIMIT_REQUESTS` - Maximum requests per window
- `RATE_LIMIT_WINDOW` - Rate limiting window in milliseconds

### Network Configuration
Edit `config/networks.json` to modify network endpoints:

```json
{
  "testnet": {
    "chainId": "pulsar-3",
    "name": "Secret Network Testnet",
    "rpcUrl": "https://api.pulsar3.scrttestnet.com",
    "grpcUrl": "https://grpc.pulsar3.scrttestnet.com:443"
  }
}
```

### Known Contracts
Edit `config/contracts.json` to add known contract addresses:

```json
{
  "testnet": {
    "tokens": {
      "SSCRT": {
        "address": "secret1k0jntykt7e4g3y88ltc60czgjuqdy4c9e8fzek",
        "name": "Secret SCRT",
        "symbol": "SSCRT",
        "decimals": 6
      }
    }
  }
}
```

## 🧪 Development

### Development Mode
```bash
# Run with hot reload
npm run dev

# Run with Docker Compose (development profile)
docker-compose --profile dev up
```

### Testing
```bash
# Run tests
npm test

# Run tests with watch mode
npm run test:watch
```

### Linting
```bash
# Check code style
npm run lint

# Fix code style issues
npm run lint:fix
```

## 🏗️ Architecture

```
secret-network-mcp/
├── src/
│   ├── server.ts           # Main MCP server
│   ├── tools/              # MCP tool implementations
│   ├── services/           # Business logic
│   ├── types/              # TypeScript definitions
│   └── utils/              # Utility functions
├── config/                 # Configuration files
├── tests/                  # Test files
└── docs/                   # Documentation
```

### Key Components
- **MCP Protocol Layer** - Handles MCP communication
- **Secret Network Integration** - Blockchain interaction via Secret.js
- **Chain Abstraction** - Multi-chain support framework
- **Security Layer** - TEE-aware security practices

## 🔒 Security

### Privacy Preservation
- No sensitive data logging
- Secure viewing key handling for private queries
- Encrypted communication channels

### Access Control
- Rate limiting per client
- Input validation and sanitization
- Minimal attack surface in Docker container

## 🚀 Deployment

### TEE Environment
This server is designed for deployment in Trusted Execution Environment (TEE) based VMs that only allow a single Dockerfile upload.

### Production Deployment
```bash
# Build production image
docker build -t secret-network-mcp:prod .

# Run in production mode
docker run -d \
  --name secret-network-mcp \
  -e NODE_ENV=production \
  -e NETWORK=mainnet \
  -p 3000:3000 \
  secret-network-mcp:prod
```

### Health Checks
The server includes built-in health checks:
- HTTP endpoint for container orchestration
- Blockchain connectivity verification
- Service dependency validation

## 🗺️ Roadmap

### Phase 1: Foundation (Current)
- ✅ Basic MCP server implementation
- ✅ Secret Network integration
- ✅ Core query tools
- ✅ Docker deployment

### Phase 2: Enhanced Features
- [ ] Advanced query capabilities
- [ ] Performance optimizations
- [ ] Caching layer
- [ ] Enhanced error handling

### Phase 3: Transaction Support
- [ ] Transaction simulation
- [ ] Transaction broadcasting
- [ ] Wallet integration preparation

### Phase 4: Multi-Chain Support
- [ ] Chain abstraction framework
- [ ] Additional Cosmos chains
- [ ] Cross-chain queries

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Add tests for new features
- Update documentation as needed
- Ensure Docker compatibility

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- Create an issue for bug reports or feature requests
- Check the [documentation](docs/) for detailed guides
- Review the [project plan](docs/PROJECT_PLAN.md) for development roadmap

## 🙏 Acknowledgments

- [Secret Network](https://scrt.network/) for the privacy-preserving blockchain
- [Anthropic](https://www.anthropic.com/) for the Model Context Protocol
- The Secret Network developer community

---

**Note**: This is a foundational implementation. Please review the [project plan](docs/PROJECT_PLAN.md) for planned features and development phases.
