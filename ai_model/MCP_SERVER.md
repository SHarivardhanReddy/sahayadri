# MCP Server for AI Fitness Assessment Model

## Overview

This MCP (Model Context Protocol) server exposes the fitness assessment model as tools that can be used by Claude and other AI applications. It acts as a bridge between the Flask-based AI server and MCP-compatible clients.

## Architecture

```
┌─────────────────────┐
│   Claude/AI Apps    │
└──────────┬──────────┘
           │
           │ (MCP Protocol)
           │
┌──────────▼──────────┐
│   MCP Server        │ (mcp_server.py)
│ (Tool Definitions)  │
└──────────┬──────────┘
           │
           │ (HTTP REST)
           │
┌──────────▼──────────┐
│  Flask AI Server    │ (ai_server.py)
│ (Fitness Model)     │
└─────────────────────┘
```

## Setup

### 1. Install Dependencies

```bash
cd ai_model
pip install -r requirements.txt
```

Required packages:
- `mcp` - Model Context Protocol SDK
- `requests` - HTTP client
- Flask, joblib, pandas, scikit-learn (existing dependencies)

### 2. Start the AI Server (Terminal 1)

```bash
cd ai_model
python ai_server.py
```

This starts the Flask server on `http://localhost:5001`

### 3. Start the MCP Server (Terminal 2)

```bash
cd ai_model
python mcp_server.py
```

Or with a custom AI server URL:

```bash
python mcp_server.py --ai-server http://your-server:5001
```

## Available Tools

### 1. `assess_fitness`

Assess a worker's fitness for labour based on their health data.

**Required Parameters:**
- `age` (number) - Age in years, must be ≥ 18
- `work_types` (array) - Types of work (e.g., ["general_labour"])

**Optional Parameters:**
- `gender` - "Male" or "Female"
- `asthma` - "Yes" or "No"
- `knee_pain` - "Yes" or "No"
- `leg_injury` - "Yes" or "No"
- `hand_injury` - "Yes" or "No"
- `chest_pain` - "Yes" or "No"
- `heart_issue` - "Yes" or "No"
- `smoking` - "Yes" or "No"
- `alcohol` - "Yes" or "No"
- `kidney_issue` - "Yes" or "No"
- `headache_issue` - "Yes" or "No"
- `eyesight_issue` - "Yes" or "No"
- `appendicitis_history` - "Yes" or "No"

**Example Usage (via Claude):**
```
"Assess the fitness of a 35-year-old male worker with no health issues 
for general labour work."
```

**Response:**
```
**Fitness Assessment Result**

📊 **Status**: Fit
📈 **Confidence**: 0.85

**Contributing Factors**:
- Age: 0.15
- Job Input: General Labour: 0.22
- Health Status: 0.48
```

### 2. `get_model_status`

Get the current status of the fitness assessment model.

**Parameters:** None

**Example Response:**
```
**Model Status**

Status: ready
Features: 28

Available Endpoints:
- /api/health
- /api/status
- /api/predict
```

## Integration with Claude

### Method 1: VS Code Copilot Chat

Configure Copilot to use the fitness assessment MCP server by adding to your VS Code settings:

```json
{
  "github.copilot.chat.mcpServers": [
    {
      "name": "fitness-assessment",
      "command": "python",
      "args": ["path/to/ai_model/mcp_server.py"],
      "env": {
        "AI_SERVER_URL": "http://127.0.0.1:5001"
      }
    }
  ]
}
```

### Method 2: Claude Desktop App

Add the MCP server to your Claude desktop configuration file:

**Location:** `~/.claude/config.json` (or Windows equivalent)

```json
{
  "mcpServers": {
    "fitness-assessment": {
      "command": "python",
      "args": [
        "C:\\path\\to\\ai_model\\mcp_server.py"
      ],
      "env": {
        "AI_SERVER_URL": "http://127.0.0.1:5001"
      }
    }
  }
}
```

Then you can ask Claude directly:
```
"Please assess the fitness of a 45-year-old female with asthma and knee pain 
for heavy construction work."
```

Claude will:
1. Parse your request
2. Extract the required parameters
3. Call the `assess_fitness` tool
4. Return the fitness assessment with explanations

## Features

✅ **Type-Safe Interface** - Full TypeScript/Python typing support  
✅ **Error Handling** - Graceful error messages when AI server is unavailable  
✅ **Explainability** - Returns feature contributions for fitness decisions  
✅ **Async Support** - Non-blocking calls for better performance  
✅ **Status Monitoring** - Check model health via `get_model_status`  
✅ **Flexible Configuration** - Configurable AI server URL  

## Troubleshooting

### "Could not connect to AI server"
- Ensure `ai_server.py` is running on http://127.0.0.1:5001
- Check the port is not blocked by firewall
- Verify `Flask-CORS` is installed

### "Unknown tool" error
- Ensure MCP server is properly initialized
- Check Python version (3.8+)
- Verify all dependencies are installed: `pip install -r requirements.txt`

### Claude doesn't see the tools
- Restart Claude/Copilot after starting MCP server
- Check MCP server console shows "🚀 Fitness Assessment MCP Server running"
- Verify configuration file path is correct

## File Structure

```
ai_model/
├── ai_server.py          # Flask REST API server
├── mcp_server.py         # MCP protocol server (NEW)
├── mcp.json              # MCP configuration (NEW)
├── requirements.txt      # Python dependencies (UPDATED)
├── fitness_model.joblib  # Trained ML model
├── model_features.json   # Feature configuration
└── README.md             # API documentation
```

## Security Considerations

⚠️ **Important Notes:**

1. **Local Only by Default** - The MCP server connects to a local Flask server
2. **No Authentication** - Add authentication if deploying to production
3. **Input Validation** - The Flask server validates all input parameters
4. **CORS Enabled** - Frontend-friendly but not restrictive for local use

For production deployment:
- Use proper authentication (API keys, OAuth)
- Restrict CORS to known domains
- Use HTTPS instead of HTTP
- Add rate limiting
- Monitor access logs

## Performance

- **Latency**: ~100-500ms per prediction (local)
- **Throughput**: Single-threaded, handle ~10-20 concurrent requests
- **Memory**: ~200MB (model + dependencies)

For scaling:
- Use Gunicorn with multiple workers: `gunicorn -w 4 ai_server:app`
- Deploy to cloud (Render, Heroku, AWS Lambda)
- Add caching layer for repeated requests

## Example Chat Interactions

### Example 1: Basic Assessment
```
User: "Check if a 28-year-old can work as a construction worker"
Claude: I'll assess the fitness for construction work. Let me check the 
        basic eligibility:
        [calls assess_fitness with age=28, work_types=["construction"], 
         minimal health conditions]
        Result: Fit with confidence 0.92
```

### Example 2: Complex Health History
```
User: "A 52-year-old with heart issues and smoking habits wants to do 
      manual labour. Is it safe?"
Claude: Let me perform a comprehensive fitness assessment...
        [calls assess_fitness with age=52, work_types=["general_labour"],
         heart_issue="Yes", smoking="Yes"]
        Result: Unfit - High risk factors detected
        
        I recommend alternative roles or medical evaluation first.
```

## Future Enhancements

- [ ] WebSocket support for real-time streaming
- [ ] Database integration for history tracking
- [ ] Multi-language support
- [ ] Mobile app integration
- [ ] Advanced analytics dashboard

## License

Internal use only.
