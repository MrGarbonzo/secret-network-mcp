@echo off
echo Starting Secret Network MCP Server with logging...

REM Create logs directory if it doesn't exist
if not exist "logs" mkdir logs

REM Set current date and time for log file
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
set "timestamp=%YYYY%-%MM%-%DD%_%HH%-%Min%-%Sec%"

REM Log file names
set "LOG_FILE=logs\mcp-server-%timestamp%.log"
set "ERROR_FILE=logs\mcp-errors-%timestamp%.log"

echo [%date% %time%] Starting Secret Network MCP Server >> "%LOG_FILE%"
echo [%date% %time%] Logs will be saved to: %LOG_FILE% >> "%LOG_FILE%"
echo [%date% %time%] Errors will be saved to: %ERROR_FILE% >> "%LOG_FILE%"

REM Change to project directory
cd /d "F:\coding\secret-network-mcp"
echo [%date% %time%] Changed to directory: %CD% >> "%LOG_FILE%"

REM Set environment variables
set NODE_ENV=development
set NETWORK=testnet
set LOG_LEVEL=debug
set SKIP_NETWORK_CHECK=true
set ALLOW_OFFLINE_MODE=true

echo [%date% %time%] Environment variables set >> "%LOG_FILE%"
echo [%date% %time%] NODE_ENV=%NODE_ENV% >> "%LOG_FILE%"
echo [%date% %time%] NETWORK=%NETWORK% >> "%LOG_FILE%"
echo [%date% %time%] SKIP_NETWORK_CHECK=%SKIP_NETWORK_CHECK% >> "%LOG_FILE%"

REM Check if required files exist
if exist "dist\server.js" (
    echo [%date% %time%] Server file found: dist\server.js >> "%LOG_FILE%"
) else (
    echo [%date% %time%] ERROR: Server file not found: dist\server.js >> "%ERROR_FILE%"
    echo ERROR: Server file not found: dist\server.js
    pause
    exit /b 1
)

REM Check Node.js version
echo [%date% %time%] Checking Node.js version... >> "%LOG_FILE%"
node --version >> "%LOG_FILE%" 2>> "%ERROR_FILE%"

REM Start the server with both stdout and stderr logging
echo [%date% %time%] Starting server... >> "%LOG_FILE%"
echo Starting server at %date% %time%
echo Logs saved to: %LOG_FILE%
echo Errors saved to: %ERROR_FILE%
echo.
echo Press Ctrl+C to stop the server
echo.

REM Run the server and capture all output
node dist\server.js 1>> "%LOG_FILE%" 2>> "%ERROR_FILE%"

REM Log the exit
echo [%date% %time%] Server stopped with exit code: %ERRORLEVEL% >> "%LOG_FILE%"

if %ERRORLEVEL% neq 0 (
    echo.
    echo ======================================
    echo SERVER FAILED TO START!
    echo Exit code: %ERRORLEVEL%
    echo Check error log: %ERROR_FILE%
    echo ======================================
    type "%ERROR_FILE%"
    echo ======================================
)

pause
