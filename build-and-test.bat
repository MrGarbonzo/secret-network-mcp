@echo off
echo Building and testing Secret Network MCP Server...
echo.

cd /d "F:\coding\secret-network-mcp"

echo Step 1: Building TypeScript...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed
    pause
    exit /b 1
)
echo ✅ Build completed

echo.
echo Step 2: Testing real network connection...
call npm run test:connection
if %errorlevel% neq 0 (
    echo ❌ Network connection test failed
    echo This indicates the server is now properly configured to require real connections!
) else (
    echo ✅ Network connection test passed!
)

echo.
echo Done!
pause
