@echo off
echo Starting Secret Network MCP Server...
cd /d "F:\coding\secret-network-mcp"

REM Set environment variables
set NODE_ENV=production
set NETWORK=mainnet
set LOG_LEVEL=debug

REM Start the server
echo Current directory: %CD%
echo Node version:
node --version
echo.
echo Starting server...
node dist/server.js

pause
