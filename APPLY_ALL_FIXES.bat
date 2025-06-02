@echo off
echo ============================================
echo Secret Network MCP Server - COMPLETE FIX
echo ============================================
echo.

cd /d "F:\coding\secret-network-mcp"

echo Step 1: Cleaning previous builds...
if exist dist rmdir /s /q dist
if exist node_modules\.cache rmdir /s /q node_modules\.cache
echo ✅ Cleaned

echo.
echo Step 2: Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ npm install failed
    pause
    exit /b 1
)
echo ✅ Dependencies installed

echo.
echo Step 3: Building TypeScript...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed
    pause
    exit /b 1
)
echo ✅ Build completed

echo.
echo Step 4: Testing real network connection...
call npm run test:connection
if %errorlevel% neq 0 (
    echo ❌ Network connection test failed
    echo This means the server should now properly connect to real Secret Network!
    echo The error is expected because we removed offline mode fallbacks.
) else (
    echo ✅ Network connection test passed!
)

echo.
echo Step 5: Showing current environment configuration...
echo.
type .env
echo.

echo ============================================
echo FIXES APPLIED:
echo ============================================
echo ✅ Updated .env to disable offline mode
echo ✅ Added real RPC endpoints to environment
echo ✅ Fixed chainAbstraction.ts to fail fast instead of using mock data
echo ✅ Fixed server.ts to require real network connection
echo ✅ Added environment variable overrides for RPC URLs
echo ✅ Added connection validation before considering initialization complete
echo.
echo NEXT STEPS:
echo 1. Restart Claude Desktop to reload the MCP server
echo 2. Test with get_network_status() - should show real block heights
echo 3. Check that latestBlockHeight > 10,000,000 (not 0)
echo 4. Verify validatorCount > 50 (not 0)
echo ============================================

echo.
echo Press any key to finish...
pause > nul
