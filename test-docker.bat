@echo off
REM Test Docker build script for Secret Network MCP (Windows)

echo Testing Docker build for Secret Network MCP...

REM Set project directory
cd /d "F:\coding\secret-network-mcp"
if %errorlevel% neq 0 (
    echo Failed to change to project directory
    exit /b 1
)

echo Current directory: %cd%

REM Step 1: Build TypeScript
echo.
echo Step 1: Building TypeScript...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ TypeScript build failed
    exit /b 1
)
echo ✅ TypeScript build successful

REM Step 2: Test Docker build
echo.
echo Step 2: Testing Docker build...
docker build -t secret-network-mcp-test .
if %errorlevel% neq 0 (
    echo ❌ Docker build failed
    exit /b 1
)
echo ✅ Docker build successful

REM Step 3: Test running the container (quick test)
echo.
echo Step 3: Testing container startup...
docker run --rm -d --name mcp-test -e SKIP_NETWORK_CHECK=true -e ALLOW_OFFLINE_MODE=true secret-network-mcp-test
if %errorlevel% neq 0 (
    echo ❌ Container failed to start
    exit /b 1
)

REM Wait a moment and check if container is running
timeout /t 3 /nobreak > nul
docker ps | findstr mcp-test > nul
if %errorlevel% neq 0 (
    echo ❌ Container not running properly
    docker stop mcp-test 2>nul
    exit /b 1
)

echo ✅ Container started successfully
docker stop mcp-test 2>nul

echo.
echo 🎉 All tests passed! Docker setup is ready.
echo.
echo Next steps:
echo 1. Push code to GitHub
echo 2. Set up GitHub Actions
echo 3. Deploy to TEE VM

pause
