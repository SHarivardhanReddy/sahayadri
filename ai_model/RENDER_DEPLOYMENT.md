# Render Deployment Guide for AI Fitness Server

## Problem: Python 3.14 Compatibility

Render uses Linux containers. When Python 3.14 was detected, it tried to compile pandas from source, which failed due to Python 3.14's new C API incompatibilities.

**Solution:** Use Python 3.12 instead (fully compatible with all dependencies).

## Files Added for Render Deployment

### 1. `runtime.txt` **(Optional - superseded by Dockerfile)**
Previously specified Python 3.12.3. Now using Dockerfile for more control.

### 2. `Dockerfile` (Root Directory) **NEW - RECOMMENDED**
Explicitly uses Python 3.12.3 with all proper configurations:
- ✅ Upgrades pip before installing dependencies
- ✅ Uses `--only-binary :all:` to avoid compilation
- ✅ Pre-validates model files exist
- ✅ Includes health checks
- ✅ Proper environment variables

### 3. `.dockerignore` (Root Directory)
Excludes unnecessary files from Docker build context for faster builds.

### 4. `render.yaml`
Render-specific configuration (optional, for advanced setup).

### 5. Updated `requirements.txt`
- Added `gunicorn==21.2.0` (production WSGI server)
- All versions fully compatible with Python 3.12

## Step-by-Step Deployment to Render

### Step 1: Prepare Your GitHub Repository

Make sure these files are committed to your `main` branch:

```bash
git add Dockerfile
git add .dockerignore
git add ai_model/runtime.txt
git add ai_model/render.yaml
git add ai_model/requirements.txt
git add ai_model/RENDER_DEPLOYMENT.md
git commit -m "Add Docker-based Render deployment configuration for Python 3.12"
git push origin main
```

### Step 2: Create New Service on Render

1. Go to [render.com](https://render.com) and sign in
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository `SHarivardhanReddy/sahayadri`
4. Fill in the following:

| Field | Value |
|-------|-------|
| **Name** | `ai-fitness-server` |
| **Environment** | `Docker` |
| **Branch** | `main` |
| **Build Command** | *(Leave empty - uses Dockerfile)* |
| **Start Command** | *(Leave empty - uses Dockerfile CMD)* |
| **Plan** | Free (or paid if needed) |

### Step 3: Set Environment Variables (Optional)

Render will auto-detect these, but you can override in dashboard → Service Settings → Environment:

```
FLASK_ENV=production
FLASK_DEBUG=false
```

### Step 4: Deploy

Click **"Create Web Service"** and wait for the build to complete.

**Expected Output:**
```
Building Docker image from Dockerfile...
Step 1/11: FROM python:3.12.3-slim
...
Step 11/11: CMD ["sh", "-c", "gunicorn..."]
Successfully built and deployed!
Service live at https://ai-fitness-server.onrender.com
```

## Quick Reference

### View Logs
```
Dashboard → Service → Logs
```

### Restart Service
```
Dashboard → Service → Manual Deploy
```

### Check Health
```
curl https://ai-fitness-server.onrender.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "model_ready": true,
  "service": "AI Fitness Prediction Service"
}
```

### Test Prediction Endpoint
```bash
curl -X POST https://ai-fitness-server.onrender.com/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "age": 35,
    "gender": "Male",
    "work_types": ["general_labour"],
    "asthma": "No",
    "smoking": "No"
  }'
```

## Troubleshooting

### Build Error: "pandas metadata-generation-failed"
**Error:**
```
error: metadata-generation-failed
× Encountered error while generating package metadata.
╰─> pandas
```

**Cause:** Python 3.14 doesn't have pre-built pandas wheels yet, causing compilation to fail.

**Solution:** ✅ **Fixed** with Dockerfile using Python 3.12.3
- Docker explicitly uses `FROM python:3.12.3-slim`
- `--only-binary :all:` ensures no compilation
- Clear build cache: Dashboard → Service → Clear Build Cache → Manual Deploy

### Build Error: "python-pip compatibility"
**Solution:** Dockerfile upgrades pip before installing: `pip install --upgrade pip setuptools wheel`

### Build Error: "python-buildpack detection"
**Solution:** Dockerfile explicitly declares all requirements, no guessing needed.
- Remove `runtime.txt` if Render is conflicting (Dockerfile takes precedence)
- Verify build logs show: `FROM python:3.12.3-slim`

### "Port already in use"
- Render automatically assigns `$PORT` environment variable
- Ensure `start command` uses: `gunicorn -b 0.0.0.0:$PORT`

### "Model not found"
- Ensure `fitness_model.joblib` exists in `ai_model/` directory
- Check file size: should be ~10-50 MB
- Commit to git: `git add ai_model/fitness_model.joblib && git commit -m "Add model"`

### Service won't stay awake
- Free tier services spin down after 15 min inactivity
- Upgrade to Starter plan for always-on service
- Or use a cronjob to ping the service periodically

### CORS errors with frontend
- Already enabled in `ai_server.py`: `CORS(app)`
- Frontend should call: `https://ai-fitness-server.onrender.com/api/predict`

## Production Architecture

```
┌──────────────────┐
│  VS Code/Local   │
│   Development    │
└────────┬─────────┘
         │
         ├─ Git Push
         │
┌────────▼──────────┐
│  GitHub Repo      │
│  (main branch)    │
└────────┬──────────┘
         │
         ├─ Render Detects Push
         │
┌────────▼──────────────────┐
│  Render Build Pipeline    │
├───────────────────────────┤
│ 1. Read runtime.txt       │
│    → Use Python 3.12      │
│ 2. pip install -r req.txt │
│    → All pre-built wheels │
│ 3. gunicorn ai_server:app │
│    → Port 10000-50000     │
└────────┬──────────────────┘
         │
┌────────▼──────────────────┐
│  Live Deployment          │
│  https://ai-fitness...    │
│  onrender.com             │
└───────────────────────────┘
```

## File Structure for Deployment

```
sahayadri/
├── Dockerfile                    (NEW - Main deployment config)
├── .dockerignore                 (NEW - Build optimization)
├── ai_model/
│   ├── ai_server.py              (Main app)
│   ├── mcp_server.py             (MCP integration)
│   ├── fitness_model.joblib      (ML model - REQUIRED)
│   ├── model_features.json       (Feature config - REQUIRED)
│   ├── requirements.txt          (Python dependencies)
│   ├── runtime.txt               (Python version hint)
│   ├── render.yaml               (Render config)
│   ├── README.md                 (API documentation)
│   ├── MCP_SERVER.md             (MCP docs)
│   ├── RENDER_DEPLOYMENT.md      (This file)
│   ├── PYTHON_SETUP.md           (Local setup guide)
│   └── .dockerignore             (Docker build exclusions)
├── backend/
├── frontend/
└── README.md
```

**Critical for Deployment:**
- ✅ `Dockerfile` - Must be in project root
- ✅ `.dockerignore` - Speeds up builds
- ✅ `ai_model/fitness_model.joblib` - Must exist and be committed
- ✅ `ai_model/model_features.json` - Must exist and be committed
- ✅ `ai_model/requirements.txt` - All dependencies listed

## Performance & Scaling

### Current Setup (Free Plan)
- **RAM:** 512 MB
- **CPU:** 0.5 vCPU
- **Cold starts:** ~30-60 seconds
- **Requests/min:** ~10-20

### Recommended for Production
- **Starter Plan:** $7/month
  - 2 GB RAM, Always on, 2GB disk
  - Can handle 100-200 requests/min
  
- **Standard Plan:** $12/month
  - 4 GB RAM, Better performance
  - Can handle 500+ requests/min

## CI/CD Integration (Future)

For automatic testing before deployment:

```yaml
# .github/workflows/deploy.yml
name: Deploy to Render
on:
  push:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.12'
      - run: pip install -r ai_model/requirements.txt
      - run: python ai_model/predict_test.py
```

## Next Steps

1. ✅ Commit `runtime.txt`, `render.yaml`, `requirements.txt` to git
2. ✅ Push to GitHub: `git push origin main`
3. ✅ Go to render.com and create new Web Service
4. ✅ Follow "Step-by-Step Deployment" above
5. ✅ Test endpoints with curl or Postman
6. ✅ Update frontend to call `https://ai-fitness-server.onrender.com/api/predict`

## Support

- **Render Docs:** https://render.com/docs
- **Python 3.12:** https://www.python.org/downloads/release/python-3123/
- **Gunicorn:** https://gunicorn.org/

---

**Deployment Status:** Ready for Render ✅
