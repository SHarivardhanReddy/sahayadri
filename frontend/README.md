# Sahayadri Frontend - React + Vite

React + Vite frontend for the Digital Health Record Labour Fitness Assessment System. Ready for production deployment to Railway.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Development](#development)
- [Build & Deployment](#build--deployment)
- [Environment Variables](#environment-variables)
- [Docker Deployment](#docker-deployment)
- [Railway Deployment](#railway-deployment)
- [API Integration](#api-integration)
- [Troubleshooting](#troubleshooting)

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and **npm** 8+
- **Backend API** running at `https://sahayadri-production.up.railway.app`

### Installation

```bash
# Install dependencies
npm install

# Development
npm run dev     # Start dev server on http://localhost:5173

# Production Build
npm run build   # Creates optimized dist/ folder

# Preview production build
npm run preview
```

## 📦 Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Verify Configuration

The frontend is pre-configured with:
- ✅ Development API pointing to `http://localhost:5000`
- ✅ Production API pointing to `https://sahayadri-production.up.railway.app`
- ✅ Environment files ready (`.env.development`, `.env.production`)

## ⚙️ Configuration

### Environment Variables

#### Development (`.env.development`)
```env
VITE_API_URL=http://localhost:5000
```

#### Production (`.env.production`)
```env
VITE_API_URL=https://sahayadri-production.up.railway.app
```

### API Configuration

The frontend uses `src/api/axiosConfig.js` to configure API calls:

```javascript
const apiBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

This ensures:
- ✅ Development points to local backend
- ✅ Production points to Railway backend
- ✅ Automatically switches based on environment

## 🏗️ Development

### Start Development Server

```bash
npm run dev
```

- Runs on `http://localhost:5173`
- Hot reload enabled
- Connects to local backend (`http://localhost:5000`)
- Open in browser: http://localhost:5173

### Linting

```bash
npm run lint
```

Runs ESLint to check code quality.

## 🔨 Build & Deployment

### Production Build

```bash
npm run build
```

Creates optimized `dist/` folder with:
- ✅ Minified JavaScript
- ✅ Optimized CSS
- ✅ Production environment variables
- ✅ Ready for deployment

### Preview Production Build

```bash
npm run preview
```

Serves `dist/` folder locally to test production build before deploying.

## 📊 Project Structure

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   └── DoctorDashboard.jsx
│   ├── api/
│   │   └── axiosConfig.js   # API configuration
│   ├── assets/              # Images, fonts, etc.
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # Entry point
│   ├── App.css
│   └── index.css
├── public/                  # Static assets
├── .env.development         # Dev environment vars
├── .env.production          # Production environment vars
├── vite.config.js           # Vite configuration
├── package.json
├── Dockerfile               # Docker configuration
├── index.html               # HTML entry point
└── README.md
```

## 🐳 Docker Deployment

### Build Docker Image

```bash
docker build -t sahayadri-frontend .
```

### Run Container

```bash
docker run -d \
  -p 5173:5173 \
  -e VITE_API_URL=https://sahayadri-production.up.railway.app \
  sahayadri-frontend
```

### Docker Compose

```yaml
services:
  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    environment:
      - VITE_API_URL=https://sahayadri-production.up.railway.app
    depends_on:
      - backend
```

## 🚂 Railway Deployment

### Prerequisites

- Railway account (https://railway.app)
- GitHub repository connected to Railway

### Deployment Steps

1. **Connect Repository**
   - Push code to GitHub
   - Connect GitHub repo to Railway

2. **Set Environment Variables**
   - In Railway dashboard → Variables
   - Add: `VITE_API_URL=https://sahayadri-production.up.railway.app`

3. **Configure Build**
   - Build Command: `npm run build`
   - Start Command: `npm run preview`
   - Railway auto-detects from `package.json`

4. **Deploy**
   - Push to GitHub
   - Railway auto-deploys on push

5. **Access App**
   - Railway provides URL like: `https://sahayadri-frontend-production.up.railway.app`
   - Frontend connects to backend at `https://sahayadri-production.up.railway.app`

## 🌍 Multi-Platform Deployment

### 1. **Railway** (Current)
```env
VITE_API_URL=https://sahayadri-production.up.railway.app
```

### 2. **Vercel / Netlify**
```bash
# Build
npm run build

# Deploy dist/ folder

# Environment Variables
VITE_API_URL=https://your-backend-api.com
```

### 3. **AWS Amplify**
```bash
# Build: npm run build
# Output: dist
# Environment: VITE_API_URL=https://your-aws-backend.com
```

### 4. **Heroku**
```bash
# Create Procfile
npm run build && serve -s dist -l $PORT

# Set environment variable
heroku config:set VITE_API_URL=https://your-heroku-api.com
```

### 5. **Docker (Any Platform)**
```bash
# Build
docker build -t sahayadri-frontend .

# Run with environment
docker run -p 5173:5173 \
  -e VITE_API_URL=https://your-backend-api.com \
  sahayadri-frontend
```

### 6. **Docker Compose**
```yaml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    environment:
      - VITE_API_URL=http://backend:5000
    depends_on:
      - backend
  
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - MONGO_URI=mongodb://mongo:27017/sahayadri
      - RESEND_API_KEY=your-key
```

### 7. **Custom Server (VPS, Dedicated, etc)**
```bash
# Build
npm run build

# Copy dist/ to server
scp -r dist/ user@server:/var/www/sahayadri-frontend/

# Use Nginx reverse proxy
# Point to backend: https://your-server-ip:5000
```

### 8. **GitHub Pages (Static Only)**
```bash
# Works for static content only (no Node.js required)
# Set VITE_API_URL before build
VITE_API_URL=https://your-backend-api.com npm run build

# Deploy dist/ to GitHub Pages
```

## 🔧 Configuration for Any Platform

### Step 1: Update Backend URL
Edit `.env.production` with your backend URL:

```env
# Example: Change this to YOUR backend address
VITE_API_URL=https://your-actual-backend-url.com
```

### Step 2: Build for Production
```bash
npm run build
```

This creates the `dist/` folder ready for any platform.

### Step 3: Deploy
- **Static Hosting** (Vercel, Netlify): Upload `dist/` folder
- **Docker**: Build image with `Dockerfile`
- **Server**: Copy `dist/` to web server root
- **Docker Compose**: Use included `docker-compose.yml`

## 🔌 API Integration

### Axios Configuration

File: `src/api/axiosConfig.js`

```javascript
import axios from 'axios';

// Automatically uses correct environment
const apiBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: apiBaseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default apiClient;
```

### Making API Calls

```javascript
import apiClient from './api/axiosConfig';

// Request OTP
await apiClient.post('/api/request-otp', {
  identifier: 'email@mlrit.ac.in'
});

// Verify OTP
await apiClient.post('/api/verify-otp', {
  identifier: 'email@mlrit.ac.in',
  otp: '1234'
});

// Fitness evaluation
await apiClient.post('/api/evaluate-fitness', {
  age: 35,
  bmi: 24.5,
  heart_rate: 72,
  // ... other data
});
```

## 🔧 Available Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start development server (hot reload) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

## 🔍 Debugging

### Check API Connection

```javascript
// Add to any component
useEffect(() => {
  console.log('API URL:', import.meta.env.VITE_API_URL);
}, []);
```

### Browser DevTools

1. Open DevTools (F12)
2. Check Network tab for API calls
3. Verify API URL in Console: `import.meta.env.VITE_API_URL`
4. Check for CORS errors

### Production Troubleshooting

```bash
# Build and test locally
npm run build
npm run preview

# Check build output size
ls -lh dist/

# Verify API calls work with production backend
```

## ✅ Deployment Checklist

- [ ] `.env.production` has correct API URL
- [ ] Backend running at `https://sahayadri-production.up.railway.app`
- [ ] `npm install` completes without errors
- [ ] `npm run build` succeeds
- [ ] `npm run preview` works locally
- [ ] Test on mobile browser
- [ ] No console errors in DevTools
- [ ] API calls work in production
- [ ] Railway environment variables set
- [ ] GitHub repo pushed and synced

## 🔒 Security Checklist

- [ ] No hardcoded API URLs in components
- [ ] Environment variables used for all URLs
- [ ] HTTPS enabled for production
- [ ] CORS properly configured on backend
- [ ] No sensitive data in localStorage
- [ ] Content Security Policy headers set

## 📞 Troubleshooting

### Issue: API calls fail in production

**Error:** `404 Not Found` or `CORS error`

**Solutions:**
1. Verify `.env.production` has correct backend URL
2. Check backend is running and accessible
3. Verify CORS is enabled on backend
4. Check browser console for actual errors

### Issue: Blank page on load

**Error:** Page loads but shows nothing

**Solutions:**
1. Check browser console for JavaScript errors
2. Verify `VITE_API_URL` is set correctly
3. Test with `npm run preview` locally
4. Check `dist/` folder was built

### Issue: API URL incorrect

**Error:** Frontend can't reach backend

**Solutions:**
1. Check `.env.production` file
2. Verify Railway backend URL is correct
3. Add console.log to print API URL for debugging
4. Ensure environment variables are set in Railway

### Issue: Build fails

**Error:** `npm run build` fails

**Solutions:**
1. Clear `node_modules`: `rm -rf node_modules && npm install`
2. Clear `.vite` cache: `rm -rf .vite`
3. Check Node.js version: `node --version` (should be 18+)
4. Check for TypeScript errors

## 📈 Performance Optimization

- ✅ Minified JavaScript & CSS
- ✅ Code splitting enabled
- ✅ Dynamic imports for routes
- ✅ Optimized images
- ✅ Vite's fast build system

## 🧪 Testing

```bash
# Lint code
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📝 Notes

- Frontend automatically uses correct API based on environment
- Development uses local backend (localhost:5000)
- Production uses Railway backend (https://sahayadri-production.up.railway.app)
- Vite handles hot reload in development
- Production build is optimized and minified

---

**Frontend Ready for Deployment!** ✅
