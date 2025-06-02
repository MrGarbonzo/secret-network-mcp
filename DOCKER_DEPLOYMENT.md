# Secret Network MCP - Docker Deployment Guide

## Phase 1: Local Testing

### Quick Start
```bash
# 1. Build the project
npm run build

# 2. Build Docker image
npm run docker:build:prod

# 3. Test with Docker Compose
npm run docker:compose:up

# 4. Verify build
node verify-build.js
```

### Test Scripts
- `test-docker.bat` (Windows) - Complete Docker build and test
- `verify-build.js` - Verify all files are built correctly
- `quick-build-test.js` - Test module loading

## Docker Images

### Development
- Uses `docker-compose.yml`
- Hot reload enabled
- Debug logging
- Local network access

### Production (TEE VM)
- Uses `docker-compose.prod.yml`
- Optimized for security and performance
- Environment variables via TEE VM secure env system
- Resource limits configured

## MCP Transport Modes

### STDIO Mode (Default)
- Standard MCP over stdio
- Used for local Claude Desktop connections
- Container runs interactively

### SSE Mode (Remote Access)
- HTTP-based MCP using Server-Sent Events
- Use `MCP_TRANSPORT=sse` environment variable
- Exposes port 3000 for remote connections

## Environment Variables

### Core Settings
- `NODE_ENV` - production/development
- `NETWORK` - mainnet/testnet
- `LOG_LEVEL` - info/debug/error
- `MCP_TRANSPORT` - stdio/sse

### Secret Network
- `SECRET_CHAIN_ID` - Chain identifier
- `SECRET_CHAIN_URL` - RPC endpoint
- `SKIP_NETWORK_CHECK` - Skip connectivity test
- `ALLOW_OFFLINE_MODE` - Continue without network

### Security (TEE VM)
- `SECRET_API_KEY` - API authentication
- `ENCRYPTION_KEY` - Data encryption

## TEE VM Deployment

The `docker-compose.prod.yml` is optimized for TEE VM deployment:

1. **Single file upload** - Only docker-compose.yaml needed
2. **Secure environment** - Variables injected by TEE VM
3. **Resource limits** - Memory and CPU constraints
4. **Health monitoring** - Container health checks
5. **Persistent storage** - Logs volume

## Connecting Claude Desktop

### Local Docker (stdio)
```bash
docker exec -it secret-network-mcp node dist/server.js
```

### Remote Docker (SSE)
```json
{
  "mcpServers": {
    "secret-network": {
      "command": "node",
      "args": ["-e", "/* SSE client code */"],
      "env": {
        "MCP_SERVER_URL": "http://your-tee-vm-ip:3000/message"
      }
    }
  }
}
```

## Next Steps

1. **GitHub Actions** - Automated builds on tag
2. **Registry Push** - GitHub Container Registry
3. **TEE VM Deployment** - Upload docker-compose.prod.yml
4. **Claude Desktop Config** - Remote connection setup

## Troubleshooting

### Build Issues
```bash
# Clean and rebuild
rm -rf dist node_modules
npm install
npm run build
```

### Docker Issues
```bash
# Clean Docker
docker system prune -f
docker build --no-cache -t secret-network-mcp .
```

### Network Issues
- Set `SKIP_NETWORK_CHECK=true` for testing
- Use `ALLOW_OFFLINE_MODE=true` for development
- Check Secret Network RPC endpoints
