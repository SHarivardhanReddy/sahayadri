#!/bin/bash
# Quick start script for AI Fitness Assessment MCP Server
# Usage: ./start_mcp_server.sh

set -e

echo "=========================================="
echo "AI Fitness Assessment - MCP Server Setup"
echo "=========================================="
echo ""

# Check Python version
python_version=$(python3 --version 2>&1 | awk '{print $2}')
echo "✓ Python version: $python_version"

# Install dependencies if needed
if ! python3 -m pip show mcp > /dev/null 2>&1; then
    echo ""
    echo "📦 Installing dependencies..."
    pip install -r requirements.txt
    echo "✓ Dependencies installed"
fi

# Check if AI server is running
echo ""
echo "🔍 Checking AI server..."
if curl -s http://127.0.0.1:5001/health > /dev/null 2>&1; then
    echo "✓ AI server is running on http://127.0.0.1:5001"
else
    echo "⚠️  AI server not detected on http://127.0.0.1:5001"
    echo "   Please start it first:"
    echo "   python ai_server.py"
fi

# Start MCP Server
echo ""
echo "=========================================="
echo "Starting MCP Server..."
echo "=========================================="
echo ""
python3 mcp_server.py "$@"
