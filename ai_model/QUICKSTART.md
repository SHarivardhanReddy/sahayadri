# Quick Start Guide for AI Model Deployment

## 🚀 Get Started in 5 Minutes

### For Windows Users

1. **Open Command Prompt** in the `ai_model` folder

2. **Run the deployment script:**
```bash
deploy.bat production development
```

3. **Server will start on:** `http://localhost:5001`

4. **Test it:**
```bash
curl http://localhost:5001/api/health
```

### For macOS/Linux Users

1. **Open Terminal** in the `ai_model` folder

2. **Make the script executable:**
```bash
chmod +x deploy.sh
```

3. **Run the deployment script:**
```bash
./deploy.sh production development
```

4. **Server will start on:** `http://localhost:5001`

5. **Test it:**
```bash
curl http://localhost:5001/api/health
```

## 📦 Installation for Production

### Option 1: Gunicorn (Recommended for Linux/macOS servers)

```bash
# Install dependencies
pip install -r requirements.txt

# Run with Gunicorn (4 workers, suitable for 2 CPU cores)
gunicorn --bind 0.0.0.0:5001 --workers 4 --timeout 60 wsgi:app
```

### Option 2: Docker (Recommended for cloud deployment)

```bash
# Using Docker Compose (easiest)
docker-compose up -d

# Or standalone Docker
docker build -t fitness-ai-model .
docker run -p 5001:5001 fitness-ai-model
```

### Option 3: Automated Script

**Windows:**
```cmd
deploy.bat production gunicorn
# or for Docker
deploy.bat production docker-compose
```

**Linux/macOS:**
```bash
./deploy.sh production gunicorn
# or for Docker
./deploy.sh production docker-compose
```

## ✅ Verify Installation

### Check Server Health

```bash
# Quick health check
curl http://localhost:5001/api/health

# Detailed status
curl http://localhost:5001/api/status
```

### Test Prediction

```bash
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

## 📁 Project Files

All deployment-ready files are included:

```
ai_model/
├── ai_server.py              ✅ Flask API server (production-ready)
├── wsgi.py                   ✅ Gunicorn entry point
├── mcp_server.py             ✅ MCP server for Claude
├── fitness_model.joblib      ✅ Trained ML model
├── model_features.json       ✅ Feature configuration
├── requirements.txt          ✅ Production dependencies
├── requirements-dev.txt      ✅ Development dependencies
├── Dockerfile                ✅ Container definition
├── docker-compose.yml        ✅ Docker Compose setup
├── .env.example              ✅ Configuration template
├── deploy.sh                 ✅ Linux/macOS deployment script
├── deploy.bat                ✅ Windows deployment script
├── README.md                 ✅ Full documentation
└── QUICKSTART.md            ✅ This file
```

## 🔧 Configuration

### Change Port or Host

Edit `.env` file:
```bash
cp .env.example .env
# Edit .env with your editor
nano .env  # or use your preferred editor
```

### Environment Variables

```bash
FLASK_ENV=production      # production or development
FLASK_HOST=0.0.0.0        # Listen on all interfaces
FLASK_PORT=5001           # Change port number
LOG_LEVEL=INFO            # Logging level
```

## 🐳 Docker Deployment

### Quick Start with Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f ai_model

# Stop services
docker-compose down
```

### Health Check

```bash
# Container health status
docker-compose ps

# View service logs
docker-compose logs ai_model
```

## 🚨 Troubleshooting

### Port Already in Use

**Windows:**
```bash
netstat -ano | findstr :5001
taskkill /PID <PID> /F
```

**macOS/Linux:**
```bash
lsof -ti:5001 | xargs kill -9
```

### Model Not Loading

1. Check if `fitness_model.joblib` exists in ai_model folder
2. Check file permissions
3. Check logs: `docker-compose logs ai_model`

### Connection Refused

1. Verify server is running: `curl http://localhost:5001/health`
2. Check firewall settings
3. Verify port 5001 is not blocked

## 📊 Performance Tuning

### For High Traffic (1000+ requests/sec)

```bash
# Increase Gunicorn workers
gunicorn --bind 0.0.0.0:5001 --workers 8 --worker-class gevent wsgi:app

# Or use deployment script with custom workers
WORKERS=8 ./deploy.sh production gunicorn
```

### For Limited Resources

```bash
# Run with fewer workers
gunicorn --bind 0.0.0.0:5001 --workers 2 wsgi:app
```

## 📚 More Information

For complete documentation, see [README.md](README.md)

Key sections:
- [API Endpoints](README.md#-api-endpoints)
- [Docker Deployment](README.md#-docker-deployment)
- [Production Deployment](README.md#-production-deployment)
- [Troubleshooting](README.md#-troubleshooting)
- [Monitoring](README.md#-monitoring)

## 🔗 Integration with Backend

The Node.js backend should call:

```javascript
// Example: Node.js/Express
const axios = require('axios');

const response = await axios.post('http://localhost:5001/api/predict', {
  age: 30,
  gender: 'Male',
  work_types: ['general_labour'],
  // ... other health data
});

console.log(response.data); // { fitness_status, confidence, contributions }
```

## ✨ What's Included

✅ **Production-Ready Code**
- Logging instead of print
- Error handling
- Environment variables
- Health checks

✅ **Multiple Deployment Options**
- Development server
- Gunicorn (production)
- Docker container
- Docker Compose
- Automated scripts

✅ **Comprehensive Documentation**
- API reference
- Deployment guides
- Configuration examples
- Troubleshooting

✅ **Testing & Quality**
- Health endpoints
- Status endpoints
- Validation
- Error handling

## 🎯 Next Steps

1. **Test Locally:** `python ai_server.py`
2. **Test with Gunicorn:** Run the deployment script
3. **Test with Docker:** `docker-compose up`
4. **Deploy to Production:** Use your chosen method
5. **Monitor:** Use health endpoints

## 📞 Support

After reviewing this guide:
1. Check [README.md](README.md) for detailed documentation
2. Review deployment logs
3. Test endpoints manually
4. Check the Troubleshooting section

Happy Deploying! 🚀
