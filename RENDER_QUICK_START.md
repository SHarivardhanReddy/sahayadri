# ⚡ Quick Start: Deploy AI Fitness Server to Render

## 🎯 Current Status: ✅ READY FOR DEPLOYMENT

All configuration files are in place and pushed to GitHub. You can now deploy to Render in 5 minutes!

---

## 🚀 Deploy in 5 Minutes

### 1️⃣ Go to Render Dashboard
```
https://dashboard.render.com
```

### 2️⃣ Click "New +" → "Web Service"

### 3️⃣ Connect GitHub
- Select: **SHarivardhanReddy/sahayadri**
- Click "Connect"

### 4️⃣ Configure Service
| Field | Value |
|-------|-------|
| **Name** | ai-fitness-server |
| **Environment** | Docker (auto-detected) |
| **Branch** | main |
| **Plan** | Free |

### 5️⃣ Click "Create Web Service"
Wait 3-5 minutes for deployment ⏳

---

## ✅ Your Deployment Contains

### Core Files
- ✅ **Dockerfile** - Python 3.12.3 with Flask & gunicorn
- ✅ **fitness_model.joblib** - ML model (16.4 MB)
- ✅ **model_features.json** - Feature configuration
- ✅ **ai_server.py** - Flask REST API
- ✅ **requirements.txt** - All dependencies

### Configuration Files
- ✅ **render.json** - Render service configuration
- ✅ **.dockerignore** - Build optimization
- ✅ **runtime.txt** - Python version (3.12.3)

### Health & Monitoring
- ✅ Health check endpoint: `/health`
- ✅ Status endpoint: `/api/status`
- ✅ Prediction endpoint: `/api/predict`
- ✅ Auto-restart on failures
- ✅ 30-second health check intervals

---

## 🔍 Test Your Deployment

Once live, test these endpoints:

### Health Check
```bash
curl https://ai-fitness-server-xxxxx.onrender.com/health
```

### API Status
```bash
curl https://ai-fitness-server-xxxxx.onrender.com/api/status
```

### Make Prediction
```bash
curl -X POST https://ai-fitness-server-xxxxx.onrender.com/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "age": 35,
    "gender": "Male",
    "work_types": ["general_labour"]
  }'
```

---

## 📊 What Gets Deployed

```
Render Container
├── Python 3.12.3
├── Flask 3.0.0
├── Gunicorn (WSGI server)
├── Joblib + Pandas + Scikit-learn
└── Your AI Model
    ├── fitness_model.joblib
    └── model_features.json
```

---

## 🔗 After Deployment

Your service URL will be something like:
```
https://ai-fitness-server-abc123.onrender.com
```

### Update Your Frontend
Change API calls from:
```javascript
// Before (local)
const apiUrl = 'http://localhost:5001/api/predict'

// After (Render)
const apiUrl = 'https://ai-fitness-server-xxxxx.onrender.com/api/predict'
```

### Use with MCP
```python
# MCP server can call:
ai_server_url = "https://ai-fitness-server-xxxxx.onrender.com"
requests.post(f"{ai_server_url}/api/predict", json=data)
```

---

## 📋 Files Pushed to GitHub

```
✅ Dockerfile (updated with better error checking)
✅ render.json (Render configuration)
✅ ai_model/DEPLOYMENT_CHECKLIST.md (detailed guide)
✅ ai_model/fitness_model.joblib (model file)
✅ ai_model/model_features.json (features)
✅ All other necessary files
```

---

## ⚙️ Environment Variables (Automatic)

```
FLASK_ENV=production
FLASK_DEBUG=false
PYTHONUNBUFFERED=1
PORT=<assigned dynamically by Render>
```

---

## 🆘 Troubleshooting

### Build fails with "Model not found"
✅ **Fixed** - Model file is now committed to git

### Service crashes on startup
1. Check Render logs
2. Look for errors about missing files
3. Model files must be in `ai_model/` directory

### Slow first request
- Free tier spins down after 15 min inactivity
- First request boots the service (~30 sec)
- Upgrade to Starter ($7/month) for always-on

### CORS errors from frontend
- ✅ Already enabled in Flask: `CORS(app)`
- Use full Render URL in frontend API calls

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [DEPLOYMENT_CHECKLIST.md](ai_model/DEPLOYMENT_CHECKLIST.md) | Complete step-by-step guide |
| [RENDER_DEPLOYMENT.md](ai_model/RENDER_DEPLOYMENT.md) | Advanced deployment topics |
| [README.md](ai_model/README.md) | API reference |
| [MCP_SERVER.md](ai_model/MCP_SERVER.md) | MCP integration guide |

---

## 🎉 Next Steps

1. **Deploy** → Go to render.com and follow the 5-step guide above
2. **Test** → Verify endpoints work with curl commands
3. **Update Frontend** → Change API URL to your new Render URL
4. **Monitor** → Check logs regularly in Render dashboard
5. **Scale** → Upgrade plan if needed for better performance

---

## 💡 Pro Tips

✅ **Auto-deploy on git push:**
- Every `git push origin main` triggers automatic redeploy
- Your changes go live in ~2-3 minutes

✅ **Monitor your service:**
- Render dashboard shows logs, metrics, and status
- Set up email alerts for deployment failures

✅ **Save money:**
- Free plan is perfect for testing
- Upgrade to Starter ($7/month) only when needed

---

**Ready? Go to https://dashboard.render.com and click "New +" 🚀**

---

*Configuration created: April 1, 2026*
*All files pushed to GitHub ✅*
*Deployment status: READY ✅*
