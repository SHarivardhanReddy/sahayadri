# Render Deployment Guide for AI Fitness Server

## Problem: Python 3.14 Compatibility

Render uses Linux containers. When Python 3.14 was detected, it tried to compile pandas from source, which failed due to Python 3.14's new C API incompatibilities.

**Solution:** Use Python 3.12 instead (fully compatible with all dependencies).

## Files Added for Render Deployment

### 1. `runtime.txt`
Specifies Python 3.12.3 for Render deployment.

### 2. `render.yaml`
Render-specific configuration (optional, for advanced setup).

### 3. Updated `requirements.txt`
- Added `gunicorn==21.2.0` (production WSGI server)
- Pinned compatible versions for Python 3.12

## Step-by-Step Deployment to Render

### Step 1: Prepare Your GitHub Repository

Make sure these files are committed to your `main` branch:

```bash
git add ai_model/runtime.txt
git add ai_model/render.yaml
git add ai_model/requirements.txt
git commit -m "Add Render deployment configuration"
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
| **Environment** | `Python 3` |
| **Build Command** | `pip install -r ai_model/requirements.txt` |
| **Start Command** | `cd ai_model && gunicorn -w 4 -b 0.0.0.0:$PORT ai_server:app` |
| **Branch** | `main` |
| **Plan** | Free (or paid if needed) |

### Step 3: Set Environment Variables

In Render dashboard → Service Settings → Environment:

```
FLASK_ENV=production
FLASK_DEBUG=false
```

### Step 4: Deploy

Click **"Deploy"** and wait for the build to complete.

**Expected Output:**
```
╔══════════════════════════════════════════════════════════════════════════════╗
║                          Build successful                                    ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ Step 1/5: Building Docker image from Dockerfile...                          ║
║ Step 2/5: Pushing Docker image...                                           ║
║ Step 3/5: Running start command...                                          ║
║ Step 4/5: Service live at https://ai-fitness-server.onrender.com            ║
╚══════════════════════════════════════════════════════════════════════════════╝
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

### Build Error: "pandas compilation failed"
- ✅ **Fixed** with `runtime.txt` specifying Python 3.12
- Clear build cache: Dashboard → Service → Clear Build Cache → Manual Deploy

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
├── ai_model/
│   ├── ai_server.py              (Main app)
│   ├── mcp_server.py             (MCP integration)
│   ├── fitness_model.joblib      (ML model - REQUIRED)
│   ├── model_features.json       (Feature config - REQUIRED)
│   ├── requirements.txt          (Dependencies)
│   ├── runtime.txt               (Python version - NEW)
│   ├── render.yaml               (Render config - NEW)
│   ├── README.md                 (Documentation)
│   ├── MCP_SERVER.md             (MCP docs)
│   └── PYTHON_SETUP.md           (Setup guide)
├── backend/
├── frontend/
└── README.md
```

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
