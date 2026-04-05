# Complete Deployment Guide - Sahayadri Health System

Comprehensive guide for deploying the entire Digital Health Record Labour Fitness Assessment System (Frontend, Backend, AI Model, and Database).

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Quick Start with Docker](#quick-start-with-docker)
- [Component Setup](#component-setup)
- [Deployment Options](#deployment-options)
- [Production Deployment](#production-deployment)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Troubleshooting](#troubleshooting)

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (React)                  │
│              http://localhost:5173                  │
└────────────────────┬────────────────────────────────┘
                     │
         ┌───────────┴────────────┐
         ↓                        ↓
    ┌─────────────┐    ┌──────────────────┐
    │ Backend API │    │  AI Model Server │
    │  (Node.js)  │    │    (Flask/Python)│
    │ :5000       │    │      :5001       │
    └──────┬──────┘    └────────┬─────────┘
           │                    │
           ├─── Predictions ────┤
           │                    │
           └───────────┬────────┘
                       ↓
              ┌─────────────────┐
              │  MongoDB        │
              │  Database       │
              │  :27017         │
              └─────────────────┘
```

## 🚀 Quick Start with Docker (Recommended)

### Prerequisites

- Docker and Docker Compose installed
- Git installed
- 4GB+ RAM available
- Internet connection for pulling images

### 1. Clone Repository

```bash
git clone https://github.com/SHarivardhanReddy/sahayadri.git
cd sahayadri
```

### 2. Configure Environment

Create `.env` file in root directory:

```bash
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx

# Optional: CORS and API Settings
CORS_ORIGIN=http://localhost:5173
VITE_API_URL=http://localhost:5000/api
```

### 3. Build and Start All Services

```bash
# Build images and start containers
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### 4. Access Services

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:5000
- **AI Model:** http://localhost:5001
- **MongoDB:** localhost:27017

### 5. Stop Services

```bash
docker-compose down
```

## 📦 Component Setup

### AI Model (Flask API)

**Location:** `ai_model/`

**Configuration:** Update `ai_model/.env`
```env
HF_MODEL_REPO=ZORO1112/random_forest
HF_MODEL_FILENAME=ai_model/fitness_model.joblib
FLASK_ENV=production
FLASK_HOST=0.0.0.0
FLASK_PORT=5001
```

**Run Standalone:**
```bash
cd ai_model
pip install -r requirements.txt
python ai_server.py
```

**See:** [ai_model/README.md](ai_model/README.md) for detailed guide

### Backend (Node.js API)

**Location:** `backend/`

**Configuration:** Update `backend/.env`
```env
MONGO_URI=mongodb://localhost:27017/sahayadri
EMAIL_USER=your@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
AI_SERVER_URL=http://localhost:5001
```

**Run Standalone:**
```bash
cd backend
npm install
npm start
```

**See:** [backend/README.md](backend/README.md) for detailed guide

### Frontend (React + Vite)

**Location:** `frontend/`

**Run Development:**
```bash
cd frontend
npm install
npm run dev
```

**Build for Production:**
```bash
cd frontend
npm run build
npm run preview
```

## 🎯 Deployment Options

### Option 1: Docker Compose (All Services)

**Best for:** Local development, staging, small production

```bash
# Start everything
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop everything
docker-compose down
```

**Services included:**
- Frontend (React)
- Backend (Node.js)
- AI Model (Flask)
- MongoDB

### Option 2: Individual Docker Containers

**Best for:** Microservices architecture, Kubernetes

```bash
# Build each component
docker build -t sahayadri-frontend ./frontend
docker build -t sahayadri-backend ./backend
docker build -t sahayadri-ai ./ai_model

# Run with custom networking
docker network create sahayadri-net

docker run -d --name mongo --network sahayadri-net mongo:7.0
docker run -d --name ai --network sahayadri-net sahayadri-ai
docker run -d --name backend --network sahayadri-net -e MONGO_URI=mongodb://mongo:27017 sahayadri-backend
docker run -d --name frontend --network sahayadri-net -p 5173:5173 sahayadri-frontend
```

### Option 3: Manual Installation

**Best for:** Development, custom configurations

```bash
# Terminal 1: MongoDB
mongod

# Terminal 2: AI Model
cd ai_model
pip install -r requirements.txt
python ai_server.py

# Terminal 3: Backend
cd backend
npm install
npm start

# Terminal 4: Frontend
cd frontend
npm install
npm run dev
```

### Option 4: Kubernetes Deployment

**Best for:** Production, high availability

Create manifest files:

```bash
# Create namespace
kubectl create namespace sahayadri

# Create MongoDB deployment
kubectl apply -f k8s/mongo.yaml -n sahayadri

# Create AI Model deployment
kubectl apply -f k8s/ai-model.yaml -n sahayadri

# Create Backend deployment
kubectl apply -f k8s/backend.yaml -n sahayadri

# Create Frontend deployment
kubectl apply -f k8s/frontend.yaml -n sahayadri

# Create service
kubectl apply -f k8s/service.yaml -n sahayadri
```

See [k8s/README.md](k8s/README.md) for Kubernetes manifests

## 🏭 Production Deployment

### Pre-Deployment Checklist

- [ ] Update all `.env` files with production values
- [ ] Use MongoDB Atlas (not local)
- [ ] Configure Gmail App Password
- [ ] Set CORS to your domain
- [ ] Enable HTTPS/SSL
- [ ] Set NODE_ENV=production
- [ ] Set FLASK_ENV=production
- [ ] Configure logging
- [ ] Setup monitoring
- [ ] Enable backups
- [ ] Test all endpoints

### Environment Variables (Production)

**Backend (.env):**
```env
NODE_ENV=production
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/sahayadri
EMAIL_USER=noreply@yourdomain.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
PORT=5000
AI_SERVER_URL=https://ai.yourdomain.com
CORS_ORIGIN=https://yourdomain.com
```

**AI Model (.env):**
```env
FLASK_ENV=production
FLASK_HOST=0.0.0.0
FLASK_PORT=5001
HF_MODEL_REPO=ZORO1112/random_forest
HF_MODEL_FILENAME=ai_model/fitness_model.joblib
```

### Nginx Reverse Proxy Configuration

```nginx
upstream backend_app {
    server localhost:5000;
}

upstream ai_app {
    server localhost:5001;
}

server {
    listen 80;
    server_name yourdomain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    # Frontend - Static files
    location / {
        root /var/www/sahayadri/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://backend_app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # AI Model API
    location /ai/ {
        proxy_pass http://ai_app/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Docker Swarm Deployment

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml sahayadri

# Check status
docker stack services sahayadri

# View logs
docker service logs sahayadri_backend

# Scale service
docker service scale sahayadri_backend=3
```

### AWS EC2 Deployment

1. **Launch EC2 Instance**
   - Ubuntu 22.04 LTS
   - t2.medium or larger
   - Security Group: Allow 80, 443, 22

2. **Install Docker & Docker Compose**
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   sudo apt-get install docker-compose-plugin
   ```

3. **Setup Application**
   ```bash
   git clone <repo>
   cd sahayadri
   cp .env.example .env
   # Edit .env with production values
   ```

4. **Deploy**
   ```bash
   docker-compose -f docker-compose.yml up -d
   ```

5. **Setup SSL with Let's Encrypt**
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot certonly --standalone -d yourdomain.com
   ```

## 📊 Monitoring & Maintenance

### Health Checks

```bash
# Backend health
curl http://localhost:5000/health

# AI Model health
curl http://localhost:5001/health

# Database health
mongosh localhost:27017
```

### View Logs

```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs ai_model

# Real-time logs
docker-compose logs -f
```

### Database Backup

```bash
# Backup MongoDB
docker exec sahayadri_mongodb mongodump --out /backup

# Restore MongoDB
docker exec sahayadri_mongodb mongorestore /backup
```

### Performance Monitoring

```bash
# Container stats
docker stats

# Service logs with timestamps
docker-compose logs --timestamps
```

## 🔍 Troubleshooting

### Service Won't Start

```bash
# Check logs
docker-compose logs <service>

# Check port availability
netstat -lnt | grep 5000

# Restart service
docker-compose restart <service>

# Full restart
docker-compose down
docker-compose up -d
```

### Database Connection Error

```bash
# Check MongoDB is running
docker exec sahayadri_mongodb mongosh --eval "db.adminCommand('ping')"

# Check connection string
echo $MONGO_URI

# Restart MongoDB
docker-compose restart mongo
```

### Email Service Error

```bash
# Check credentials
grep EMAIL_ .env

# Test email connection
# Add test endpoint in backend
# Try sending OTP from frontend
```

### AI Model Connection Failed

```bash
# Check AI service
curl http://localhost:5001/health

# Check logs
docker-compose logs ai_model

# Verify Hugging Face download
docker exec sahayadri_ai_model ls -la /app/hf_cache/
```

### CORS Errors

```bash
# Check CORS setting
grep CORS .env

# Update CORS_ORIGIN in .env:
CORS_ORIGIN=http://your-domain.com

# Restart backend
docker-compose restart backend
```

## 📝 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Port already in use | Change port in .env or stop conflicting service |
| MongoDB connection failed | Check MONGO_URI, ensure MongoDB running |
| Email not sending | Verify Email credentials, check spam folder |
| AI model slow | Increase workers in gunicorn config |
| Frontend blank page | Check VITE_API_URL, browser console errors |
| Docker image too large | Remove dev dependencies, use multi-stage builds |

## 🔐 Security Checklist

- [ ] HTTPS enabled
- [ ] Environment variables not in code
- [ ] CORS configured for your domain
- [ ] MongoDB authentication enabled
- [ ] Email credentials in .env only
- [ ] Input validation enabled
- [ ] Rate limiting configured
- [ ] Logging doesn't contain sensitive data
- [ ] Regular security updates
- [ ] Database backups enabled
- [ ] Firewall configured

## 📞 Support & Resources

- **AI Model:** See [ai_model/README.md](ai_model/README.md)
- **Backend:** See [backend/README.md](backend/README.md)
- **Frontend:** See [frontend/README.md](frontend/README.md)
- **Issues:** Check service logs with `docker-compose logs`
- **Configuration:** Review `.env.example` files

## 📜 Deployment Summary

✅ **Fully Containerized** - Docker Compose ready
✅ **Production Ready** - Environment variables, CORS, error handling
✅ **Scalable** - Easy to add more workers/replicas
✅ **Monitored** - Health checks on all services
✅ **Documented** - Comprehensive guides included
✅ **Flexible** - Multiple deployment options

---

**System Ready for Production Deployment!** 🚀

For detailed information, see:
- [Frontend Setup](frontend/README.md)
- [Backend Setup](backend/README.md)
- [AI Model Setup](ai_model/README.md)
