#!/bin/bash

# Test Docker build script for Secret Network MCP
echo "Testing Docker build for Secret Network MCP..."

# Set project directory
PROJECT_DIR="F:/coding/secret-network-mcp"
cd "$PROJECT_DIR" || exit 1

echo "Current directory: $(pwd)"

# Step 1: Build TypeScript
echo "Step 1: Building TypeScript..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ TypeScript build failed"
    exit 1
fi
echo "✅ TypeScript build successful"

# Step 2: Test Docker build
echo "Step 2: Testing Docker build..."
docker build -t secret-network-mcp-test .
if [ $? -ne 0 ]; then
    echo "❌ Docker build failed"
    exit 1
fi
echo "✅ Docker build successful"

# Step 3: Test running the container
echo "Step 3: Testing container startup..."
docker run --rm --name mcp-test -e SKIP_NETWORK_CHECK=true -e ALLOW_OFFLINE_MODE=true secret-network-mcp-test timeout 5s &
sleep 2
if docker ps | grep -q mcp-test; then
    echo "✅ Container started successfully"
    docker stop mcp-test 2>/dev/null
else
    echo "❌ Container failed to start"
    exit 1
fi

echo "🎉 All tests passed! Docker setup is ready."
echo ""
echo "Next steps:"
echo "1. Push code to GitHub"
echo "2. Set up GitHub Actions"
echo "3. Deploy to TEE VM"
