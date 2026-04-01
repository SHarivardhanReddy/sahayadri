@echo off
REM Quick start script for AI Fitness Assessment MCP Server (Windows)
REM Usage: start_mcp_server.bat

echo ==========================================
echo AI Fitness Assessment - MCP Server Setup
echo ==========================================
echo.

REM Check Python version
python --version
if errorlevel 1 (
    echo Error: Python not found. Please install Python 3.8+
    pause
    exit /b 1
)

REM Install dependencies if needed
echo.
echo Checking dependencies...
pip show mcp >nul 2>&1
if errorlevel 1 (
    echo.
    echo Installing dependencies...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo Error: Failed to install dependencies
        pause
        exit /b 1
    )
    echo Dependencies installed
) else (
    echo Dependencies already installed
)

REM Check if AI server is running
echo.
echo Checking AI server on http://127.0.0.1:5001...
powershell -Command "try { $null = Invoke-WebRequest -Uri 'http://127.0.0.1:5001/health' -TimeoutSec 2; Write-Host 'AI server is running' } catch { Write-Host 'AI server not detected - please start it with: python ai_server.py' }"

REM Start MCP Server
echo.
echo ==========================================
echo Starting MCP Server...
echo ==========================================
echo.
python mcp_server.py %*
pause
