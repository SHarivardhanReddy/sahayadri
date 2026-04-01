# Deploy to Render from GitHub - Complete Guide

## ✅ Prerequisites

- ✅ GitHub repository: https://github.com/SHarivardhanReddy/sahayadri
- ✅ Dockerfile configured (already in place)
- ✅ AI model files committed to git
- ✅ Render account (free at https://render.com)

---

## 🚀 Deploy in 5 Steps

### **Step 1: Sign In to Render**
1. Go to https://dashboard.render.com
2. Click **"Sign Up"** or **"Sign In"** (if already have account)
3. Choose **"Continue with GitHub"**
4. Authorize Render to access your GitHub account

### **Step 2: Create New Web Service**
1. In Render dashboard, click **"New +"** (top right)
2. Select **"Web Service"**

### **Step 3: Connect GitHub Repository**
1. Under **"GitHub"**, click **"Connect account"** (if not connected)
2. Search for your repository: **`sahayadri`**
3. Click **"Connect"** next to the repo
4. *Optional: Select which branch to deploy - choose `main`*

### **Step 4: Configure Service**

Fill in the following settings:

| Field | Value |
|-------|-------|
| **Name** | `ai-fitness-server` |
| **Environment** | `Docker` (auto-detected) |
| **Region** | `Oregon` (or your preference) |
| **Branch** | `main` |
| **Dockerfile Path** | `./Dockerfile` (default) |
| **Plan** | `Free` (or upgrade later) |

**Environment Variables (Optional):**
| Key | Value |
|-----|-------|
| `FLASK_ENV` | `production` |
| `FLASK_DEBUG` | `false` |

Click **"Advanced"** to add more variables if needed.

### **Step 5: Deploy**
1. Click **"Create Web Service"**
2. **Wait 3-5 minutes** for the build to complete
3. Watch the logs as it builds:
   - Downloads Python 3.12.3
   - Installs dependencies
   - Copies your AI model
   - Starts Gunicorn server
4. Once complete, you'll see a green checkmark ✅

---

## 🎉 Your Service is Live!

**You'll get a URL like:**
```
https://ai-fitness-server-abc123.onrender.com
```

---

## ✅ Test Your Deployment

### **Test 1: Health Check**
```bash
curl https://ai-fitness-server-abc123.onrender.com/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "model_ready": true,
  "timestamp": "2026-04-01 10:30:45.123456"
}
```

### **Test 2: API Status**
```bash
curl https://ai-fitness-server-abc123.onrender.com/api/status
```

### **Test 3: Make a Prediction**
```bash
curl -X POST https://ai-fitness-server-abc123.onrender.com/api/predict \
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

---

## 📊 Build Logs (What You'll See)

```
Building Docker image from Dockerfile...
Step 1/16: FROM python:3.12.3-slim
Step 2/16: WORKDIR /app
Step 3/16: COPY ai_model/requirements.txt .
Step 4/16: RUN python -m pip install --upgrade pip setuptools wheel
Step 5/16: RUN pip install --only-binary :all: -r requirements.txt
...
Step 16/16: CMD ["sh", "-c", "gunicorn -w 4 -b 0.0.0.0:${PORT:-5001}..."]

✓ Successfully built Docker image
✓ Deploying service...
✓ Service live at: https://ai-fitness-server-abc123.onrender.com

Listening on Port 10000
```

---

## 🔄 Auto-Deployment

**After initial deployment, updates are automatic:**

1. Make changes locally
2. Commit to git: `git add . && git commit -m "Update"`
3. Push to GitHub: `git push origin main`
4. Render automatically:
   - Detects the push
   - Rebuilds Docker image
   - Deploys new version
   - **Zero downtime!** ✅

---

## 🔧 Manage Your Service

### **View Logs**
- Dashboard → Service → Logs
- Real-time logs as your app runs

### **Restart Service**
- Dashboard → Service → Manual Deploy

### **Check Status**
- Look for green checkmark (✅ deployed)
- Red X means build/deployment failed

### **Update Environment Variables**
- Dashboard → Service Settings → Environment

### **Upgrade Plan**
- Dashboard → Service → Plan
- Free: Spins down after 15 min inactivity
- Starter ($7/month): Always-on

---

## 🆘 Troubleshooting

### **Build Failed: "Model not found"**
```
ERROR: fitness_model.joblib not found!
```

**Solution:**
```bash
git add ai_model/fitness_model.joblib --force
git commit -m "Add model file"
git push origin main
# Then click "Manual Deploy" in Render
```

### **Build Failed: "Docker error"**
1. Check Dockerfile is in project root
2. Check `.dockerignore` exists
3. Click "Clear Build Cache" in Render

### **Service won't start**
1. Check Render logs for errors
2. Look for "ERROR" or "CRITICAL" messages
3. Common issues:
   - Model file missing (see above)
   - Dependencies not installed
   - Port binding issues (fixed in Dockerfile)

### **First request is slow (~30 seconds)**
- Normal for Free tier (service spins up)
- Upgrade to Starter ($7/month) for instant responses

### **Service keeps crashing**
1. Check logs: `docker logs <service>`
2. Verify model files exist
3. Check Python version compatibility

---

## 📈 Monitor Your Production Deployment

### **In Render Dashboard:**
- ✅ View live logs
- ✅ Check request metrics
- ✅ Monitor CPU/Memory usage
- ✅ Set up alerts for failures
- ✅ View deployment history

### **Performance Metrics:**
- **Free Plan:** 0-10 requests/minute
- **Starter Plan:** 10-100 requests/minute
- **Standard Plan:** 100+ requests/minute

---

## 🔐 Security Checklist

- ✅ `.env` files in `.gitignore` (no secrets exposed)
- ✅ CORS configured (frontend can call API)
- ✅ HTTPS enabled (Render provides free SSL)
- ✅ Environment variables not in code (configured in Render)
- ✅ Model files are read-only in container

---

## 💡 Pro Tips

✅ **Custom Domain (Optional)**
- Domain Settings → Add Custom Domain
- Requires purchasing a domain (not free)

✅ **Slack Notifications**
- Settings → Notifications → Slack
- Get alerts on deployments

✅ **Rollback if Needed**
- Deployments tab shows history
- Click previous deployment to rollback

✅ **Keep Costs Low**
- Free tier is fine for testing
- Upgrade only when you need always-on service
- Monitor usage to optimize plan

---

## 📚 Additional Resources

| Resource | Link | Purpose |
|----------|------|---------|
| Render Docs | https://render.com/docs | Official documentation |
| Docker Guide | https://render.com/docs/docker | Docker deployment help |
| Environment Variables | https://render.com/docs/environment-variables | Manage secrets |
| API Reference | [README.md](README.md) | Your API docs |
| Local Setup | [PYTHON_SETUP.md](PYTHON_SETUP.md) | Run locally |

---

## ✅ Deployment Checklist

Before clicking "Create Web Service":

- [ ] GitHub account authorized with Render
- [ ] Repository selected: `SHarivardhanReddy/sahayadri`
- [ ] Branch selected: `main`
- [ ] Name entered: `ai-fitness-server`
- [ ] Environment: `Docker` (auto-detected)
- [ ] Region selected (Oregon recommended)
- [ ] Plan selected (Free for testing)
- [ ] Environment variables set (optional)

---

## 🎯 Next Steps After Deployment

1. **Update Frontend**
   ```javascript
   // Change from:
   const API_URL = 'http://localhost:5001'
   
   // To:
   const API_URL = 'https://ai-fitness-server-xxxxx.onrender.com'
   ```

2. **Test All Endpoints**
   - Health check
   - API status
   - Make predictions

3. **Monitor Logs**
   - Check for errors
   - Verify requests are working

4. **Celebrate! 🎉**
   - Your AI server is live
   - Accessible from anywhere
   - Auto-deploys on git push

---

## ⏱️ Expected Timeline

| Step | Time |
|------|------|
| Push to GitHub | seconds |
| Render detects push | ~30 seconds |
| Build Docker image | 1-2 minutes |
| Deploy service | 1-2 minutes |
| **Total** | **3-5 minutes** |

---

**Ready to deploy? Go to https://dashboard.render.com and click "New +" 🚀**

*Once deployed, your API will be live 24/7 at:*
```
https://ai-fitness-server-xxxxx.onrender.com
```
