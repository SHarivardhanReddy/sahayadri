@echo off
REM Deployment script for AI Fitness Model Service (Windows)
REM Usage: deploy.bat [development|production] [development|gunicorn|docker|docker-compose|stop|health]

setlocal enabledelayedexpansion

REM Configuration
set SCRIPT_DIR=%~dp0
set VENV_DIR=%SCRIPT_DIR%venv
set LOG_DIR=%SCRIPT_DIR%logs
set PID_FILE=%SCRIPT_DIR%ai_server.pid

REM Color codes (using title for status messages)
title AI Model Service Deployment

REM Functions
:log_info
echo [INFO] %~1
goto :eof

:log_warn
echo [WARN] %~1
goto :eof

:log_error
echo [ERROR] %~1
goto :eof

REM Setup virtual environment
:setup_venv
echo.
call :log_info Setting up virtual environment...

if not exist "%VENV_DIR%" (
    python -m venv "%VENV_DIR%"
    echo [INFO] Virtual environment created
) else (
    echo [INFO] Virtual environment already exists
)

REM Activate virtual environment
call "%VENV_DIR%\Scripts\activate.bat"
echo [INFO] Virtual environment activated

REM Upgrade pip
call :log_info Upgrading pip...
%VENV_DIR%\Scripts\python -m pip install --upgrade pip setuptools wheel >nul 2>&1

REM Install requirements
call :log_info Installing dependencies...
%VENV_DIR%\Scripts\pip install -r "%SCRIPT_DIR%requirements.txt" >nul 2>&1
if %errorlevel% equ 0 (
    echo [INFO] Dependencies installed successfully
) else (
    call :log_error Failed to install dependencies
    exit /b 1
)
goto :eof

REM Setup environment file
:setup_env
if not exist "%SCRIPT_DIR%.env" (
    call :log_info Creating .env file from template...
    copy "%SCRIPT_DIR%.env.example" "%SCRIPT_DIR%.env"
    call :log_warn Please review and update .env file if needed
)
goto :eof

REM Create logs directory
:setup_logs
if not exist "%LOG_DIR%" (
    mkdir "%LOG_DIR%"
    call :log_info Logs directory created: %LOG_DIR%
)
goto :eof

REM Run with development server
:run_development
call :log_info Starting AI Model Server in development mode...
call :log_info Server will run on http://localhost:5001
call :log_info Press Ctrl+C to stop
echo.

cd /d "%SCRIPT_DIR%"
set FLASK_ENV=development
set FLASK_HOST=127.0.0.1
set FLASK_PORT=5001

%VENV_DIR%\Scripts\python ai_server.py
goto :eof

REM Run with Gunicorn (production)
:run_gunicorn
call :log_info Starting AI Model Server with Gunicorn...
call :log_info Server will run on http://0.0.0.0:5001
echo.

cd /d "%SCRIPT_DIR%"
set FLASK_ENV=production
set FLASK_HOST=0.0.0.0
set FLASK_PORT=5001

call :log_info Starting Gunicorn workers...
%VENV_DIR%\Scripts\gunicorn --bind 0.0.0.0:5001 --workers 4 --timeout 60 --access-logfile "%LOG_DIR%\access.log" --error-logfile "%LOG_DIR%\error.log" wsgi:app
goto :eof

REM Run with Docker
:run_docker
call :log_info Building Docker image...
docker build -t fitness-ai-model:latest "%SCRIPT_DIR%"

call :log_info Starting Docker container...
docker run -d --name fitness_ai_model -p 5001:5001 -e FLASK_ENV=production -e FLASK_HOST=0.0.0.0 -e FLASK_PORT=5001 --restart unless-stopped fitness-ai-model:latest

if %errorlevel% equ 0 (
    call :log_info Container started. Use 'docker logs fitness_ai_model' to view logs
    REM Wait a bit and do health check
    timeout /t 3 /nobreak
    call :health_check
) else (
    call :log_error Failed to start Docker container
    exit /b 1
)
goto :eof

REM Run with Docker Compose
:run_docker_compose
call :log_info Starting with Docker Compose...
docker-compose up -d

if %errorlevel% equ 0 (
    call :log_info Services started. Use 'docker-compose logs -f' to view logs
    REM Wait a bit and do health check
    timeout /t 3 /nobreak
    call :health_check
) else (
    call :log_error Failed to start Docker Compose
    exit /b 1
)
goto :eof

REM Stop running service
:stop_service
call :log_info Stopping AI Model Server...

REM Stop Docker container if running
docker ps 2>nul | find "fitness_ai_model" >nul
if %errorlevel% equ 0 (
    call :log_info Stopping Docker container...
    docker stop fitness_ai_model >nul 2>&1
    docker rm fitness_ai_model >nul 2>&1
    if %errorlevel% equ 0 (
        call :log_info Docker container stopped
    )
)

call :log_info Service stopped
goto :eof

REM Health check
:health_check
call :log_info Checking server health...

for /l %%i in (1,1,5) do (
    powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:5001/api/health' -UseBasicParsing -TimeoutSec 2; if ($response.StatusCode -eq 200) { exit 0 } } catch { exit 1 }" >nul 2>&1
    
    if !errorlevel! equ 0 (
        call :log_info Server is healthy
        echo.
        powershell -Command "Invoke-WebRequest -Uri 'http://localhost:5001/api/health' -UseBasicParsing | ConvertFrom-Json | ConvertTo-Json"
        goto :eof
    )
    
    if not %%i equ 5 (
        call :log_warn Server not ready, retrying in 2 seconds...
        timeout /t 2 /nobreak >nul
    )
)

call :log_error Server health check failed
goto :eof

REM Main
:main
set ENV=%1
set MODE=%2

if "!ENV!"=="" set ENV=production
if "!MODE!"=="" set MODE=gunicorn

echo.
call :log_info AI Fitness Model Service Deployment Script
call :log_info Environment: !ENV! ^| Mode: !MODE!
echo.

REM Check Python installation
python --version >nul 2>&1
if %errorlevel% neq 0 (
    call :log_error Python is not installed or not in PATH
    exit /b 1
)

REM Setup
call :setup_env
call :setup_logs
call :setup_venv

REM Run service
if /i "!MODE!"=="development" (
    call :run_development
) else if /i "!MODE!"=="gunicorn" (
    call :run_gunicorn
) else if /i "!MODE!"=="docker" (
    call :run_docker
) else if /i "!MODE!"=="docker-compose" (
    call :run_docker_compose
) else if /i "!MODE!"=="stop" (
    call :stop_service
) else if /i "!MODE!"=="health" (
    call :health_check
) else (
    call :log_error Unknown mode: !MODE!
    echo Usage: deploy.bat [development^|production] [development^|gunicorn^|docker^|docker-compose^|stop^|health]
    exit /b 1
)

endlocal
exit /b %errorlevel%
