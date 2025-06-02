@echo off
setlocal enabledelayedexpansion

echo ===============================================
echo    Claude Desktop MCP Configuration Fix
echo ===============================================
echo.

:: Check if running as administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo WARNING: Not running as administrator
    echo Some operations may fail if Claude is running
    echo.
)

:: Step 1: Check if server is built
echo [Step 1] Checking server build...
if not exist "dist\server.js" (
    echo ❌ Server not built. Building now...
    call npm run build
    if errorlevel 1 (
        echo ❌ Build failed. Please fix build errors first.
        pause
        exit /b 1
    )
    echo ✅ Server built successfully
) else (
    echo ✅ Server already built
)

:: Step 2: Test server functionality
echo.
echo [Step 2] Testing server...
node test-server-standalone.js
if errorlevel 1 (
    echo ❌ Server test failed. Please check server issues first.
    echo.
    echo Continuing anyway - server might work in MCP mode...
    timeout /t 3 >nul
)

:: Step 3: Check Claude directory
echo.
echo [Step 3] Checking Claude configuration directory...
set "CLAUDE_DIR=%APPDATA%\Claude"
if not exist "!CLAUDE_DIR!" (
    echo Creating Claude config directory...
    mkdir "!CLAUDE_DIR!"
    if errorlevel 1 (
        echo ❌ Failed to create Claude directory
        echo Please create manually: !CLAUDE_DIR!
        pause
        exit /b 1
    )
)
echo ✅ Claude directory ready

:: Step 4: Backup existing config
echo.
echo [Step 4] Backing up existing configuration...
set "CONFIG_FILE=!CLAUDE_DIR!\claude_desktop_config.json"
if exist "!CONFIG_FILE!" (
    set "BACKUP_FILE=!CLAUDE_DIR!\claude_desktop_config.json.backup.%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
    set "BACKUP_FILE=!BACKUP_FILE: =0!"
    copy "!CONFIG_FILE!" "!BACKUP_FILE!" >nul
    if errorlevel 1 (
        echo ❌ Failed to backup existing config
    ) else (
        echo ✅ Backed up to: !BACKUP_FILE!
    )
) else (
    echo ℹ️  No existing config to backup
)

:: Step 5: Apply corrected configuration
echo.
echo [Step 5] Applying corrected configuration...
copy "claude_desktop_config_CORRECTED.json" "!CONFIG_FILE!" >nul
if errorlevel 1 (
    echo ❌ Failed to copy configuration
    echo.
    echo Manual steps:
    echo 1. Copy claude_desktop_config_CORRECTED.json 
    echo 2. To: !CONFIG_FILE!
    pause
    exit /b 1
)
echo ✅ Configuration applied successfully

:: Step 6: Verify configuration
echo.
echo [Step 6] Verifying configuration...
if exist "!CONFIG_FILE!" (
    echo ✅ Configuration file exists
    
    :: Check if it contains our server
    findstr /c:"secret-network" "!CONFIG_FILE!" >nul
    if errorlevel 1 (
        echo ❌ Configuration missing secret-network server
    ) else (
        echo ✅ Secret Network server configured
    )
    
    findstr /c:"F:\\coding\\secret-network-mcp\\dist\\server.js" "!CONFIG_FILE!" >nul
    if errorlevel 1 (
        echo ❌ Server path not found in config
    ) else (
        echo ✅ Server path correctly configured
    )
) else (
    echo ❌ Configuration file not found
)

:: Step 7: Check for running Claude processes
echo.
echo [Step 7] Checking for running Claude processes...
tasklist | findstr /i claude >nul
if errorlevel 1 (
    echo ✅ No Claude processes running
) else (
    echo ⚠️  Claude is currently running
    echo.
    echo To apply changes:
    echo 1. Close Claude Desktop completely
    echo 2. Wait 5 seconds  
    echo 3. Restart Claude Desktop
    echo.
    choice /c yn /m "Would you like to kill Claude processes now? (y/n)"
    if !errorlevel! equ 1 (
        echo Killing Claude processes...
        taskkill /f /im "*claude*" >nul 2>&1
        taskkill /f /im "Claude.exe" >nul 2>&1
        timeout /t 2 >nul
        echo ✅ Claude processes terminated
        echo.
        echo You can now restart Claude Desktop
    )
)

echo.
echo ===============================================
echo                 FIX COMPLETE
echo ===============================================
echo.
echo ✅ Configuration updated with:
echo    • Absolute server path: F:\coding\secret-network-mcp\dist\server.js
echo    • MCP mode enabled
echo    • Offline mode enabled
echo    • Network checks skipped
echo.
echo 🚀 Next steps:
echo    1. Restart Claude Desktop (if not already done)
echo    2. Look for MCP server indicators in Claude
echo    3. Test filesystem and Secret Network tools
echo.
echo 🔧 If issues persist:
echo    • Check the troubleshooting guide
echo    • Verify server file exists
echo    • Check Claude's error logs
echo.
pause