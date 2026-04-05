#!/bin/bash
# Deployment script for AI Fitness Model Service
# Usage: ./deploy.sh [development|production] [docker|gunicorn|development]

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_DIR="$SCRIPT_DIR/venv"
LOG_DIR="$SCRIPT_DIR/logs"
PID_FILE="$SCRIPT_DIR/ai_server.pid"

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running on Windows
is_windows() {
    [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]
}

# Create virtual environment
setup_venv() {
    log_info "Setting up virtual environment..."
    
    if [ ! -d "$VENV_DIR" ]; then
        python -m venv "$VENV_DIR"
        log_info "Virtual environment created"
    fi
    
    # Activate virtual environment
    if is_windows; then
        source "$VENV_DIR/Scripts/activate"
    else
        source "$VENV_DIR/bin/activate"
    fi
    
    log_info "Virtual environment activated"
    
    # Upgrade pip
    pip install --upgrade pip setuptools wheel
    
    # Install requirements
    log_info "Installing dependencies..."
    pip install -r "$SCRIPT_DIR/requirements.txt"
    log_info "Dependencies installed"
}

# Setup environment file
setup_env() {
    if [ ! -f "$SCRIPT_DIR/.env" ]; then
        log_info "Creating .env file from template..."
        cp "$SCRIPT_DIR/.env.example" "$SCRIPT_DIR/.env"
        log_warn "Please review and update .env file if needed"
    fi
}

# Create logs directory
setup_logs() {
    if [ ! -d "$LOG_DIR" ]; then
        mkdir -p "$LOG_DIR"
        log_info "Logs directory created: $LOG_DIR"
    fi
}

# Run with development server
run_development() {
    log_info "Starting AI Model Server in development mode..."
    log_info "Server will run on http://localhost:5001"
    log_info "Press Ctrl+C to stop"
    
    cd "$SCRIPT_DIR"
    export FLASK_ENV=development
    export FLASK_HOST=127.0.0.1
    export FLASK_PORT=5001
    
    python ai_server.py
}

# Run with Gunicorn (production)
run_gunicorn() {
    log_info "Starting AI Model Server with Gunicorn..."
    log_info "Server will run on http://0.0.0.0:5001"
    
    cd "$SCRIPT_DIR"
    export FLASK_ENV=production
    export FLASK_HOST=0.0.0.0
    export FLASK_PORT=5001
    
    # Determine number of workers (2 x CPU cores)
    if is_windows; then
        WORKERS=4
    else
        WORKERS=$((2 * $(nproc)))
    fi
    
    log_info "Starting $WORKERS Gunicorn workers..."
    
    gunicorn \
        --bind 0.0.0.0:5001 \
        --workers $WORKERS \
        --worker-class sync \
        --timeout 60 \
        --access-logfile "$LOG_DIR/access.log" \
        --error-logfile "$LOG_DIR/error.log" \
        --log-level info \
        wsgi:app
}

# Run with Docker
run_docker() {
    log_info "Building Docker image..."
    docker build -t fitness-ai-model:latest "$SCRIPT_DIR"
    
    log_info "Starting Docker container..."
    docker run -d \
        --name fitness_ai_model \
        -p 5001:5001 \
        -e FLASK_ENV=production \
        -e FLASK_HOST=0.0.0.0 \
        -e FLASK_PORT=5001 \
        --restart unless-stopped \
        fitness-ai-model:latest
    
    log_info "Container started. Use 'docker logs fitness_ai_model' to view logs"
}

# Run with Docker Compose
run_docker_compose() {
    log_info "Starting with Docker Compose..."
    docker-compose up -d
    log_info "Services started. Use 'docker-compose logs -f' to view logs"
}

# Stop running service
stop_service() {
    log_info "Stopping AI Model Server..."
    
    # Stop Docker container if running
    if docker ps | grep -q fitness_ai_model; then
        log_info "Stopping Docker container..."
        docker stop fitness_ai_model
        docker rm fitness_ai_model
    fi
    
    # Kill Gunicorn process
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if kill -0 $PID 2>/dev/null; then
            kill $PID
            log_info "Gunicorn process stopped"
        fi
        rm "$PID_FILE"
    fi
}

# Health check
health_check() {
    log_info "Checking server health..."
    
    for i in {1..5}; do
        if curl -s http://localhost:5001/api/health > /dev/null; then
            log_info "✓ Server is healthy"
            curl -s http://localhost:5001/api/health | python -m json.tool
            return 0
        fi
        
        if [ $i -lt 5 ]; then
            log_warn "Server not ready, retrying in 2 seconds..."
            sleep 2
        fi
    done
    
    log_error "Server health check failed"
    return 1
}

# Main
main() {
    local env="${1:-production}"
    local mode="${2:-gunicorn}"
    
    log_info "AI Fitness Model Service Deployment Script"
    log_info "Environment: $env | Mode: $mode"
    
    # Check prerequisites
    if ! command -v python &> /dev/null; then
        log_error "Python is not installed"
        exit 1
    fi
    
    # Setup
    setup_env
    setup_logs
    setup_venv
    
    # Run service
    case "$mode" in
        development)
            run_development
            ;;
        gunicorn)
            run_gunicorn
            ;;
        docker)
            run_docker
            health_check
            ;;
        docker-compose)
            run_docker_compose
            sleep 3
            health_check
            ;;
        stop)
            stop_service
            ;;
        health)
            health_check
            ;;
        *)
            log_error "Unknown mode: $mode"
            echo "Usage: $0 [production|development] [development|gunicorn|docker|docker-compose|stop|health]"
            exit 1
            ;;
    esac
}

# Run main
main "$@"
