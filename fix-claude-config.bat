@echo off
echo Fixing Claude Desktop Configuration...
echo.

:: Check if Claude config directory exists
if not exist "%APPDATA%\Claude" (
    echo Creating Claude config directory...
    mkdir "%APPDATA%\Claude"
)

:: Backup existing config if it exists
if exist "%APPDATA%\Claude\claude_desktop_config.json" (
    echo Backing up existing configuration...
    copy "%APPDATA%\Claude\claude_desktop_config.json" "%APPDATA%\Claude\claude_desktop_config.json.backup" >nul
)

:: Copy our working config to Claude's directory
echo Copying configuration to Claude...
copy "claude_desktop_config_final.json" "%APPDATA%\Claude\claude_desktop_config.json" >nul

if errorlevel 1 (
    echo ERROR: Failed to copy configuration file
    echo Make sure you run this as administrator if needed
    pause
    exit /b 1
)

echo.
echo SUCCESS: Claude configuration updated!
echo.
echo Configuration applied:
echo - Filesystem server: F:\coding
echo - Secret Network server: F:\coding\secret-network-mcp\dist\server.js
echo.
echo Next steps:
echo 1. Close Claude Desktop completely
echo 2. Restart Claude Desktop
echo 3. Your MCP servers should now connect properly
echo.
pause
