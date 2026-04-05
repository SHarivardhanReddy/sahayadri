# AI Fitness Prediction Model - Deployment Guide

This directory contains the trained ML model and Flask API server for the Digital Health Record Labour Fitness Assessment system.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Running the Server](#running-the-server)
- [API Endpoints](#api-endpoints)
- [Docker Deployment](#docker-deployment)
- [Production Deployment](#production-deployment)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)

## 🚀 Quick Start

### Development Mode (Local)

```bash
# Clone repository and navigate to ai_model folder
cd ai_model

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment configuration
cp .env.example .env

# Run the server
python ai_server.py
```

Server will be available at `http://localhost:5001`

### Production Mode (Docker)

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build manually
docker build -t fitness-ai-model .
docker run -p 5001:5001 fitness-ai-model
```

## 📁 Project Structure

```
ai_model/
├── ai_server.py              # Main Flask API server
├── wsgi.py                   # WSGI entry point for Gunicorn
├── mcp_server.py             # MCP server for Claude integration
├── fitness_model.joblib      # Trained ML model (joblib format)
├── model_features.json       # Feature mapping configuration
├── requirements.txt          # Python dependencies
├── Dockerfile                # Container image definition
├── docker-compose.yml        # Docker Compose configuration
├── .env.example             # Environment configuration template
├── .dockerignore            # Docker build exclusions
├── .gitignore               # Git exclusions
├── mcp.json                 # MCP server configuration
└── README.md                # This file
```

## 📦 Installation

### Prerequisites

- Python 3.8 or higher
- pip package manager
- (Optional) Docker and Docker Compose for containerized deployment

### Step 1: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 2: Verify Model Files

Ensure these files exist in the ai_model directory:
- `fitness_model.joblib` - The trained model
- `model_features.json` - Feature configuration

### Step 3: Configure Environment (Optional)

```bash
cp .env.example .env
# Edit .env if needed (optional - defaults work for most cases)
```

## 🏃 Running the Server

### Development Mode

```bash
# Simple run with Flask development server
python ai_server.py
```

Output should show:
```
🚀 AI Fitness Prediction Server
📊 Model Status: ✅ Ready
🌐 Running on: http://0.0.0.0:5001
```

### Production Mode with Gunicorn

```bash
gunicorn --bind 0.0.0.0:5001 --workers 4 --timeout 60 wsgi:app
```

Options:
- `--workers 4` - Number of worker processes (adjust based on CPU cores)
- `--timeout 60` - Worker timeout in seconds
- `--bind 0.0.0.0:5001` - Listen on all interfaces, port 5001

### Production Mode with Docker

```bash
# Using Docker Compose (recommended)
docker-compose up -d

# Or standalone Docker
docker build -t fitness-ai:latest .
docker run -p 5001:5001 \
  -e FLASK_ENV=production \
  -v /path/to/model/files:/app:ro \
  fitness-ai:latest
```

## 🔌 API Endpoints

### Health Check Endpoints

#### GET `/health`
Basic health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "model_ready": true,
  "timestamp": "2024-04-05 10:30:45.123456"
}
```

#### GET `/api/health`
API health check with service information.

**Response:**
```json
{
  "status": "healthy",
  "model_ready": true,
  "service": "AI Fitness Prediction Service",
  "version": "1.0.0"
}
```

#### GET `/api/status`
Detailed model status and available endpoints.

**Response:**
```json
{
  "status": "ready",
  "model_features": 42,
  "available_endpoints": [
    "/api/health",
    "/api/status",
    "/api/predict"
  ]
}
```

### Prediction Endpoint

#### POST `/api/predict`
Main fitness prediction endpoint. Accepts health data and returns fitness assessment.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "age": 35,
  "gender": "Male",
  "work_types": ["general_labour"],
  "asthma": "No",
  "knee_pain": "No",
  "leg_injury": "No",
  "hand_injury": "No",
  "chest_pain": "No",
  "heart_issue": "No",
  "smoking": "No",
  "alcohol": "No",
  "kidney_issue": "No",
  "headache_issue": "No",
  "eyesight_issue": "No",
  "appendicitis_history": "No"
}
```

**Response (Successful):**
```json
{
  "fitness_status": "Fit",
  "confidence": "0.95",
  "contributions": [
    {
      "key": "age",
      "label": "Age",
      "value": 0.15
    },
    {
      "key": "work_general_labour",
      "label": "Job Input: General Labour",
      "value": 0.42
    }
  ]
}
```

**Response (Age < 18):**
```json
{
  "fitness_status": "Unfit",
  "confidence": "1.00",
  "contributions": [
    {
      "key": "age_policy",
      "label": "Age under 18: not eligible (policy)",
      "value": 1.0
    }
  ]
}
```

**Response (Error):**
```json
{
  "error": "Model not ready. Please check server status."
}
```

**Status Codes:**
- `200` - Successful prediction
- `400` - Missing or invalid input data
- `503` - Model not loaded or not ready
- `500` - Server error

### Example Requests

Using cURL:
```bash
# Health check
curl http://localhost:5001/api/health

# Prediction
curl -X POST http://localhost:5001/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "age": 30,
    "gender": "Male",
    "work_types": ["general_labour"],
    "asthma": "No",
    "smoking": "No",
    "alcohol": "No"
  }'
```

Using Python:
```python
import requests

response = requests.post(
    'http://localhost:5001/api/predict',
    json={
        'age': 30,
        'gender': 'Male',
        'work_types': ['general_labour'],
        'asthma': 'No',
        'smoking': 'No'
    }
)
print(response.json())
```

Using JavaScript/Axios:
```javascript
const axios = require('axios');

axios.post('http://localhost:5001/api/predict', {
  age: 30,
  gender: 'Male',
  work_types: ['general_labour'],
  asthma: 'No',
  smoking: 'No'
})
.then(response => console.log(response.data))
.catch(error => console.error(error));
```

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

```bash
# Start the service
docker-compose up -d

# Check logs
docker-compose logs -f ai_model

# Stop the service
docker-compose down
```

### Manual Docker Build

```bash
# Build image
docker build -t fitness-ai-model:latest .

# Run container
docker run -d \
  --name fitness_ai \
  -p 5001:5001 \
  -e FLASK_ENV=production \
  -e FLASK_HOST=0.0.0.0 \
  -e FLASK_PORT=5001 \
  fitness-ai-model:latest

# Check status
docker ps
docker logs fitness_ai

# Stop container
docker stop fitness_ai
docker rm fitness_ai
```

### Docker Compose Services

The `docker-compose.yml` includes:
- **AI Model Service**: Flask API server with Gunicorn
- **Network**: Shared network for service communication
- **Health Checks**: Automated health monitoring
- **Volume Mounts**: Model and feature files (read-only)
- **Auto-restart**: Service restarts on failure

## 🏭 Production Deployment

### Deployment Checklist

- [ ] Use Python 3.10+ for better performance
- [ ] Set `FLASK_ENV=production`
- [ ] Use Gunicorn with multiple workers
- [ ] Set appropriate worker count (2 × CPU cores)
- [ ] Configure CORS properly for your domain
- [ ] Use reverse proxy (Nginx/Apache) in front
- [ ] Enable SSL/TLS encryption
- [ ] Set up monitoring and logging
- [ ] Configure health check endpoints
- [ ] Use environment variables for secrets
- [ ] Regular backup of model files
- [ ] Monitor model accuracy over time

### Recommended Stack

```
Internet
   ↓
Load Balancer (AWS ELB, etc.)
   ↓
Reverse Proxy (Nginx)
   ↓
Gunicorn Workers (4-8)
   ↓
Flask App + Model
```

### Nginx Configuration Example

```nginx
upstream ai_backend {
    server 127.0.0.1:5001;
}

server {
    listen 80;
    server_name your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    client_max_body_size 10M;

    location / {
        proxy_pass http://ai_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    location /health {
        proxy_pass http://ai_backend;
        access_log off;
    }
}
```

### Kubernetes Deployment Example

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: fitness-ai-model
spec:
  replicas: 3
  selector:
    matchLabels:
      app: fitness-ai-model
  template:
    metadata:
      labels:
        app: fitness-ai-model
    spec:
      containers:
      - name: ai-model
        image: fitness-ai-model:latest
        ports:
        - containerPort: 5001
        env:
        - name: FLASK_ENV
          value: "production"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 5001
          initialDelaySeconds: 10
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 5001
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: fitness-ai-service
spec:
  selector:
    app: fitness-ai-model
  ports:
  - protocol: TCP
    port: 80
    targetPort: 5001
  type: LoadBalancer
```

## ⚙️ Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `FLASK_ENV` | `production` | `development` or `production` |
| `FLASK_HOST` | `0.0.0.0` | Server bind address |
| `FLASK_PORT` | `5001` | Server port |
| `FLASK_DEBUG` | `false` | Enable Flask debug mode |
| `MODEL_PATH` | `fitness_model.joblib` | Path to model file |
| `FEATURES_PATH` | `model_features.json` | Path to features file |
| `LOG_LEVEL` | `INFO` | Logging level |

### Model Input Features

The model expects the following input features:

**Numeric:**
- `age` (integer, min: 18)

**Binary (Yes/No):**
- `asthma`
- `knee_pain`
- `leg_injury`
- `appendicitis_history`
- `hand_injury`
- `headache_issue`
- `eyesight_issue`
- `chest_pain`
- `heart_issue`
- `kidney_issue`
- `smoking`
- `alcohol`

**Categorical:**
- `gender` (Male/Female)
- `work_types` (array of work types)

## 🔧 Troubleshooting

### Model not loading

**Error:** "❌ Model file not found"

**Solution:**
1. Verify `fitness_model.joblib` exists in ai_model directory
2. Check file permissions (readable)
3. Verify file is not corrupted
4. Check logs for detailed error message

### Port already in use

**Error:** "Address already in use"

**Solution:**
```bash
# Change port via environment variable
set FLASK_PORT=5002  # Windows
export FLASK_PORT=5002  # macOS/Linux

# Or kill the process using the port
lsof -ti:5001 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :5001   # Windows
```

### CORS errors

**Error:** "Cross-Origin Request Blocked"

**Solution:**
1. Update `ALLOWED_ORIGINS` in `.env`
2. Ensure Flask-CORS is installed
3. Verify frontend origin matches configuration

### Model accuracy issues

**Monitor:**
- Track prediction confidence scores
- Monitor fitness status distribution
- Compare against expected patterns
- Log all predictions for analysis

**Solutions:**
1. Review model training data
2. Check for data drift
3. Consider model retraining
4. Verify input data normalization

### Memory issues with large predictions

**Solution:**
```python
# Reduce batch size or use streaming
# For Gunicorn, adjust worker count:
gunicorn --workers 2 --worker-class sync wsgi:app
```

### Slow predictions

**Solution:**
1. Increase Gunicorn workers
2. Use multi-threaded worker class
3. Enable caching for repeated inputs
4. Profile model inference time

## 📊 Monitoring

### Health Check Monitoring

```bash
# Monitor with curl
watch -n 5 'curl http://localhost:5001/api/health'

# Monitor with Python
import subprocess, json
result = subprocess.run(['curl', 'http://localhost:5001/api/health'], 
                       capture_output=True, text=True)
print(json.loads(result.stdout))
```

### Log Monitoring

```bash
# Docker logs
docker-compose logs -f ai_model

# System logs
tail -f /var/log/fitness_ai.log
```

## 📝 Notes

- The model is read-only after training
- Model updates require retraining and deployment
- Model files should be version-controlled separately (use Git LFS)
- Regular monitoring of prediction accuracy is recommended
- Keep the model and features files in sync

## 🔒 Security Considerations

1. **Input Validation**: All inputs are validated before prediction
2. **Age Policy**: Users under 18 are automatically marked as unfit
3. **CORS**: Configure allowed origins for your environment
4. **SSL/TLS**: Use in production with reverse proxy
5. **Authentication**: Add if needed via middleware
6. **Rate Limiting**: Consider implementing DDoS protection
7. **Logging**: Be careful with sensitive health data in logs

## 📞 Support

For issues or questions:
1. Check the logs: `docker-compose logs ai_model`
2. Verify environment configuration: `cat .env`
3. Test endpoints manually: `curl http://localhost:5001/api/health`
4. Review the API documentation above
5. Check Python error messages for traceback

## 📜 License

This project is part of the Digital Health Record Labour Fitness Assessment system.
