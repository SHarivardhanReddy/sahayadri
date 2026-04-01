# Render Deployment Checklist for AI Fitness Server

## 📋 Pre-Deployment Checklist

### ✅ 1. Verify All Required Files

**Critical Files (MUST EXIST):**
- [ ] `Dockerfile` - Root level Docker configuration ✓
- [ ] `Dockerfile` uses Python 3.12.3 ✓
- [ ] `ai_model/fitness_model.joblib` - ML model file (16.4 MB) ✓
- [ ] `ai_model/model_features.json` - Feature configuration ✓
- [ ] `ai_model/requirements.txt` - Python dependencies ✓
- [ ] `ai_model/ai_server.py` - Flask application ✓

**Configuration Files:**
- [ ] `render.json` - Render deployment config ✓
- [ ] `.dockerignore` - Docker build optimization ✓
- [ ] `ai_model/.dockerignore` - Additional optimization ✓
- [ ] `ai_model/runtime.txt` - Python version specification ✓

**Documentation:**
- [ ] `ai_model/RENDER_DEPLOYMENT.md` - Deployment guide ✓
- [ ] `ai_model/README.md` - API documentation ✓
- [ ] `ai_model/MCP_SERVER.md` - MCP integration docs ✓

### ✅ 2. Git Commits

**Verify everything is committed:**
```bash
git status  # Should show "working tree clean"
git log --oneline -5  # Show last 5 commits
```

**Files to commit:**
- [ ] Dockerfile (updated with health checks)
- [ ] render.json (new configuration)
- [ ] ai_model/fitness_model.joblib (model file)
- [ ] ai_model/model_features.json (features)
- [ ] All other configuration files

### ✅ 3. Repository Status

**GitHub Setup:**
- [ ] Repository: https://github.com/SHarivardhanReddy/sahayadri
- [ ] Branch: `main`
- [ ] All files pushed to GitHub
- [ ] No uncommitted changes locally

## 🚀 Render Deployment Steps

### Step 1: Go to Render Dashboard
1. Open https://dashboard.render.com
2. Sign in with your account

### Step 2: Create New Web Service
1. Click **"New +"** button (top right)
2. Select **"Web Service"**

### Step 3: Connect GitHub Repository
1. Click **"Deploy from GitHub"** (if not already connected)
2. Authorize Render to access your GitHub
3. Select repository: **SHarivardhanReddy/sahayadri**
4. Click **"Connect"**

### Step 4: Configure Service

**Basic Settings:**
| Setting | Value |
|---------|-------|
| Name | `ai-fitness-server` |
| Environment | Docker (auto-detected) |
| Branch | `main` |
| Build Command | *(Leave empty - uses Dockerfile)* |
| Start Command | *(Leave empty - uses Dockerfile CMD)* |
| Public URL | *(Auto-generated)* |

**Plan:**
- [ ] Select **Free Plan** (or upgrade for more resources)

**Environment Variables** (suggested):
| Key | Value | Required |
|-----|-------|----------|
| FLASK_ENV | production | No (default in Dockerfile) |
| FLASK_DEBUG | false | No (default in Dockerfile) |

### Step 5: Review and Deploy
1. Click **"Create Web Service"**
2. Wait for build to complete (~3-5 minutes)
3. Check logs for any errors

**Expected Build Output:**
```
Building Docker image...
✓ Step 1/14: FROM python:3.12.3-slim
✓ Step 2/14: WORKDIR /app
...
✓ Successfully built Docker image
✓ Deploying service...
✓ Service live at: https://ai-fitness-server-xxxxx.onrender.com
```

## ✅ Post-Deployment Verification

### 1. Health Check
```bash
curl https://ai-fitness-server-xxxxx.onrender.com/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "model_ready": true,
  "timestamp": "2026-04-01 10:30:45.123456"
}
```

### 2. API Status
```bash
curl https://ai-fitness-server-xxxxx.onrender.com/api/status
```

**Expected Response:**
```json
{
  "status": "ready",
  "model_features": 28,
  "available_endpoints": [
    "/api/health",
    "/api/status",
    "/api/predict"
  ]
}
```

### 3. Test Prediction
```bash
curl -X POST https://ai-fitness-server-xxxxx.onrender.com/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "age": 35,
    "gender": "Male",
    "work_types": ["general_labour"],
    "asthma": "No",
    "smoking": "No"
  }'
```

**Expected Response:**
```json
{
  "fitness_status": "Fit",
  "confidence": "0.85",
  "contributions": [
    {
      "key": "age",
      "label": "Age",
      "value": 0.15
    }
  ]
}
```

## 🔧 Troubleshooting

### Error: "Docker build failed"
- **Solution:** Check Docker logs in Render dashboard
- Ensure `Dockerfile` is in project root
- Verify `ai_model/fitness_model.joblib` is committed to git

### Error: "Model not found"
```
ERROR: fitness_model.joblib not found!
```
- **Solution:** Add model file to git
  ```bash
  git add ai_model/fitness_model.joblib --force
  git commit -m "Add AI model file"
  git push origin main
  ```
- Click "Manual Deploy" in Render dashboard

### Error: "Port already in use"
- Render automatically assigns PORT environment variable
- Dockerfile correctly uses `${PORT:-5001}`
- Gunicorn binds to dynamic port automatically

### Service crashes after deploy
1. Check logs: Dashboard → Service → Logs
2. Look for: "ERROR", "CRITICAL", "FAILED"
3. Common issues:
   - Model file missing → Add to git ✓
   - Dependencies missing → Check requirements.txt
   - Python version mismatch → Verify Dockerfile uses 3.12.3

### Cold start (first request slow)
- Free tier services spin down after 15 min inactivity
- First request takes ~30 seconds to boot (normal)
- Upgrade to Paid plan to keep service always-on

## 📊 Deployment Architecture

```
┌─────────────────────────────┐
│  GitHub: sahayadri          │
│  Branch: main               │
│  Files:                     │
│  - Dockerfile               │
│  - render.json              │
│  - ai_model/fitness_model   │
│  - ai_model/ai_server.py    │
└──────────────┬──────────────┘
               │
               ├─ Push event triggers
               │
┌──────────────▼──────────────┐
│  Render Build Pipeline      │
├─────────────────────────────┤
│ 1. Detect Dockerfile        │
│ 2. Parse render.json        │
│ 3. Build Docker image       │
│    - Python 3.12.3-slim     │
│    - pip install deps       │
│    - Copy ai_model/*        │
│ 4. Start Gunicorn server    │
│ 5. Run health checks        │
└──────────────┬──────────────┘
               │
┌──────────────▼──────────────────────────┐
│  Live Service                           │
│  https://ai-fitness-server-xxxxx.      │
│  onrender.com                           │
│                                         │
│  Endpoints:                             │
│  - /health (GET)                        │
│  - /api/health (GET)                    │
│  - /api/status (GET)                    │
│  - /api/predict (POST)                  │
└─────────────────────────────────────────┘
```

## 📈 Performance Expectations

| Metric | Free Plan | Starter Plan |
|--------|-----------|--------------|
| RAM | 512 MB | 2 GB |
| CPU | 0.5 vCPU | 1 vCPU |
| Always-on | No (spins down) | Yes |
| Cold start | ~30s | ~5s |
| Requests/min | 10-20 | 100+ |
| Price | Free | $7/month |

## 🔄 Continuous Deployment

After initial deployment, updates happen automatically:

1. **Make code changes** → Commit to `main` branch
2. **Push to GitHub** → `git push origin main`
3. **Render auto-detects** → Triggered within 30 seconds
4. **New build starts** → Docker rebuild and deploy
5. **Service updates** → Zero-downtime deployment

**Disable auto-deploy** (optional):
- Dashboard → Service Settings → Auto-Deploy → Toggle Off

## 📞 Support & Resources

**Render Documentation:**
- Official Docs: https://render.com/docs
- Docker Guide: https://render.com/docs/docker
- Environment Variables: https://render.com/docs/environment-variables

**Your Project Documentation:**
- API Reference: [README.md](ai_model/README.md)
- MCP Integration: [MCP_SERVER.md](ai_model/MCP_SERVER.md)
- Deployment Guide: [RENDER_DEPLOYMENT.md](ai_model/RENDER_DEPLOYMENT.md)

## ✅ Final Verification

Before considering deployment complete:

- [ ] Service is live and accessible
- [ ] `/health` endpoint returns 200 status
- [ ] `/api/predict` accepts POST requests
- [ ] Model predictions return correct format
- [ ] No error messages in logs
- [ ] Response times are acceptable (<1s)
- [ ] Frontend can call `/api/predict` endpoint

## 🎉 Deployment Complete!

Once all steps are done, your AI Fitness Server is live and ready to:
- Accept fitness assessment requests
- Provide explainable ML predictions
- Integrate with your frontend and MCP clients
- Scale automatically based on demand

---

**Current Status:** ✅ Ready for Deployment
**Last Updated:** April 1, 2026
