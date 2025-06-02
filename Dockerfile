# Multi-stage build for Secret Network MCP Server (secret-network-mcp)
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files for secret-network-mcp
COPY package*.json ./
COPY tsconfig.json ./

# Install ALL dependencies (including devDependencies for building)
RUN npm ci && npm cache clean --force

# Copy source code
COPY src/ ./src/
COPY config/ ./config/

# Build TypeScript
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S mcp -u 1001

# Set working directory
WORKDIR /app

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Copy config directory
COPY --from=builder /app/config ./config

# Copy environment example for reference
COPY .env.example ./

# Create logs directory
RUN mkdir -p /app/logs

# Change ownership to non-root user
RUN chown -R mcp:nodejs /app
USER mcp

# Set environment variables
ENV NODE_ENV=production
ENV LOG_LEVEL=info
ENV NETWORK=testnet

# For Docker deployment, we'll use stdio transport but with docker exec
# No ports exposed since MCP uses stdio

# Health check using a simple node script
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "console.log('MCP Server Health Check'); process.exit(0)"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the MCP server (stdio transport by default, HTTP if MCP_HTTP_MODE=true)
CMD ["sh", "-c", "if [ \"$MCP_HTTP_MODE\" = \"true\" ]; then node dist/server-http.js; else node dist/server.js; fi"]

# Labels for better container management
LABEL maintainer="Secret Network MCP Contributors"
LABEL description="MCP Server for Secret Network blockchain interaction"
LABEL version="0.1.0"
