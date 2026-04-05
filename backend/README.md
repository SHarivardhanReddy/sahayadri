# Backend API - Sahayadri Health System

Node.js/Express REST API for the Digital Health Record Labour Fitness Assessment System.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Features](#features)
- [Architecture](#architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Server](#running-the-server)
- [API Endpoints](#api-endpoints)
- [Database](#database)
- [Authentication & OTP](#authentication--otp)
- [Email Setup](#email-setup)
- [AI Model Integration](#ai-model-integration)
- [Docker Deployment](#docker-deployment)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)

## 🚀 Quick Start

### Prerequisites

- **Node.js** 14+ and **npm** 6+
- **Python** 3.8+ (for AI model predictions)
- **MongoDB** (local or Atlas)
- **Resend Account** (for email service)

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Setup environment variables:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start the server:**
```bash
npm start
# or for development with auto-reload
npm run dev
```

Server will run on `http://localhost:5000` (default port)

## ✨ Features

✅ **User Authentication**
- Doctor authentication with @mlrit.ac.in email
- Worker OTP-based authentication
- Email verification system

✅ **Health Assessment**
- Fitness evaluation via ML model
- Integration with AI server
- Assessment history tracking

✅ **Email Integration**
- OTP sending via Gmail
- Email notifications
- Verification system

✅ **Database**
- MongoDB integration
- Doctor and Worker models
- Assessment records

✅ **API Security**
- CORS configuration
- Input validation
- Error handling

## 🏗️ Architecture

```
Backend (Express.js)
├── API Server (Port 5000)
├── MongoDB Connection
├── Email Service (Nodemailer)
├── AI Model Integration (HTTP calls to Flask)
└── Models/
    ├── Doctor Schema
    └── Worker Schema
```

### Request Flow

```
Frontend Request
    ↓
Express Server (Port 5000)
    ↓
    ├─→ MongoDB (Data persistence)
    ├─→ Email Service (OTP/Notifications)
    └─→ AI Server (Port 5001) - Fitness predictions
    ↓
Response to Frontend
```

## 📦 Installation

### Step 1: Install Node Dependencies

```bash
npm install
```

### Step 2: Install Python Dependencies

The backend uses Python for AI model predictions. Install required packages:

```bash
# Windows
pip install scikit-learn joblib pandas numpy python-dotenv

# macOS/Linux
pip3 install scikit-learn joblib pandas numpy python-dotenv
```

**Verify Python setup:**
```bash
python --version  # Should be 3.8+
python -c "import sklearn, joblib; print('OK')"
```

### Step 3: Configure Environment Variables

```bash
# .env file already exists, just verify/update:
nano .env
# Check: MODEL_URL, FEATURES_URL, PYTHON_EXECUTABLE
```

### Step 4: Start the Server

```bash
npmMODEL_URL` | Hugging Face URL | Fitness model download URL |
| `FEATURES_URL` | Hugging Face URL | Model features JSON URL |
| `PYTHON_EXECUTABLE` | python | Python executable ('python' on Windows, 'python3' on Unix)
# ✅ MongoDB connected
# ✅ Email service ready
# Backend running on http://localhost:5000
```

## ⚙️ Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MONGO_URI` | (required) | MongoDB connection string |
| `EMAIL_USER` | (required) | Gmail account email |
| `EMAIL_PASS` | (required) | Gmail App Password |
| `PORT` | 5000 | Server port |
| `NODE_ENV` | development | Environment |
| `AI_SERVER_URL` | http://localhost:5001 | AI model API URL |
| `CORS_ORIGIN` | * | CORS allowed origin |

### MongoDB Setup

#### Option 1: Local MongoDB
```bash
# Install MongoDB locally
# Start MongoDB service
# Use: mongodb://localhost:27017/sahayadri
```

#### Option 2: MongoDB Atlas (Recommended)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster
4. Get connection string
5. Use in `.env`: `MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/sahayadri`

### Email Configuration (Gmail)

1. **Enable 2-Factor Authentication:**
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate App Password:**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer"
   - Copy the 16-character password
   - Add to `.env` as `EMAIL_PASS`

3. **Update .env:**
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
```

## 🏃 Running the Server

### Development Mode

```bash
# With auto-reload
npm run dev

# Output should show:
# ✅ MongoDB connected
# ✅ Email service ready - credentials verified
# Backend running on http://localhost:5000
```

### Production Mode

```bash
# Set environment
set NODE_ENV=production  # Windows
export NODE_ENV=production  # macOS/Linux

npm start
```

### Docker

```bash
# Build image
docker build -t sahayadri-backend .

# Run container
docker run -p 5000:5000 \
  -e MONGO_URI=mongodb://mongo:27017/sahayadri \
  -e EMAIL_USER=your@gmail.com \
  -e EMAIL_PASS=xxxx xxxx xxxx xxxx \
  -e AI_SERVER_URL=http://ai_model:5001 \
  sahayadri-backend
```

## 🔌 API Endpoints

### Authentication

#### POST `/api/request-otp`
Request OTP for worker authentication.

**Request:**
```json
{
  "identifier": "9876543210"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent to your email",
  "expiresIn": 600000
}
```

#### POST `/api/verify-otp`
Verify OTP and authenticate user.

**Request:**
```json
{
  "identifier": "9876543210",
  "otp": "1234"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt-token-here",
  "worker": {
    "id": "worker-id",
    "email": "worker@example.com"
  }
}
```

#### POST `/api/doctor-login`
Doctor authentication with email.

**Request:**
```json
{
  "email": "doctor@mlrit.ac.in",
  "password": "password"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt-token-here",
  "doctor": {
    "id": "doctor-id",
    "email": "doctor@mlrit.ac.in"
  }
}
```

### Fitness Assessment

#### POST `/api/assess-fitness`
Submit health data and get fitness assessment.

**Request:**
```json
{
  "age": 30,
  "gender": "Male",
  "work_types": ["general_labour"],
  "asthma": "No",
  "smoking": "No",
  "alcohol": "No"
}
```

**Response:**
```json
{
  "success": true,
  "assessment": {
    "fitness_status": "Fit",
    "confidence": "0.95",
    "contributions": [...]
  }
}
```

## 📊 Database

### MongoDB Collections

#### doctors
```json
{
  "email": "doctor@mlrit.ac.in",
  "name": "Dr. Name",
  "password": "hashed-password",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

#### workers
```json
{
  "email": "worker@example.com",
  "mobile": "9876543210",
  "name": "Worker Name",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

#### Fitness Assessments
```json
{
  "workerId": "worker-id",
  "doctorId": "doctor-id",
  "healthData": {...},
  "assessment": {...},
  "createdAt": "2024-01-01T00:00:00Z"
}
```

## 🔐 Authentication & OTP

### OTP Flow

1. **Request OTP:**
   - User provides email or mobile
   - Server sends OTP to email
   - OTP valid for 10 minutes

2. **Verify OTP:**
   - User enters OTP
   - Server verifies match
   - Returns JWT token on success

3. **Token Usage:**
   - Include token in API requests
   - Token used for authorization

### OTP Storage

- Stored in memory (production: use Redis)
- Auto-expires after 10 minutes
- One OTP per identifier

## 📧 Email Setup

### Resend Configuration

1. **Sign up at Resend:** https://resend.com
2. **Get API Key:**
   - Navigate to https://resend.com/api-keys
   - Click "Create API Key"
   - Copy the generated key

3. **Add to `.env`:**
```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
```

### How Emails Work

- Resend handles all email delivery (no Gmail setup needed)
- Emails are sent from `onboarding@resend.dev` by default
- Later you can configure custom domains in Resend dashboard
- All OTP emails go through Resend API

### Testing Email Service

The backend will log when Resend is configured:
```
✅ Email service ready - Resend API configured
```

If you see a warning about missing `RESEND_API_KEY`, add it to your `.env` file.

## 🤖 AI Model Integration
How It Works

The backend now integrates AI predictions directly via Python subprocess, downloading the model from Hugging Face on first use:

```
Client Request → /api/evaluate-fitness
    ↓
Node.js Backend (server.js)
    ↓
Python Subprocess (predict_model.py)
    ├── Check if model exists locally
    ├── Download from Hugging Face (first run only)
    ├── Load scikit-learn Random Forest model
    ├── Run prediction
    └── Return JSON result
    ↓
Response to Client
```

### Model Details

- **Location:** Hugging Face Hub
- **Repository:** https://huggingface.co/ZORO1112/random_forest
- **Model File:** fitness_model.joblib (~50 MB)
- **Model Type:** scikit-learn Random Forest Classifier
- **Auto-Download:** On first use, stored in backend folder

### Configuration

The model URLs are in `.env`:
```env
MODEL_URL=https://huggingface.co/ZORO1112/random_forest/resolve/main/ai_model/fitness_model.joblib
FEATURES_URL=https://huggingface.co/ZORO1112/random_forest/resolve/main/ai_model/model_features.json
PYTHON_EXECUTABLE=python  # or python3 on macOS/Linux
```

### Input Format

Send to `/api/evaluate-fitness`:
```json
{
  "age": 35,
  "bmi": 24.5,
  "heart_rate": 72,
  "blood_pressure_systolic": 120,
  "blood_pressure_diastolic": 80,
  "vo2_max": 45.2,
  "flexibility": 8,
  "muscle_strength": 85,
  "endurance": 7
}
```

### Response Format

```json
{
  "success": true,
  "results": {
    "prediction": 1,
    "confidence": 0.92,
    "model_type": "RandomForestClassifier"
  }
}
```

### Python Script Details

The `predict_model.py` script:
- Automatically downloads the .joblib model from Hugging Face on first execution
- Caches the model locally in the backend folder for fast subsequent predictions
- Loads features configuration from model_features.json
- Validates input features and handles errors gracefully
- Returns predictions with confidence scores

### Testing the AI Endpoint

```bash
curl -X POST http://localhost:5000/api/evaluate-fitness \
  -H "Content-Type: application/json" \
  -d '{
    "age": 35,
    "bmi": 24.5,
    "heart_rate": 72,
    "blood_pressure_systolic": 120,
    "blood_pressure_diastolic": 80,
    "vo2_max": 45.2,
    "flexibility": 8,
    "muscle_strength": 85,
    "endurance": 7
  }'
```

**First request** will take ~10-30 seconds (downloading model), subsequent requests will be fast (~1-2 seconds).
```

## 🐳 Docker Deployment

### Dockerfile

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
```

### Build and Run

```bash
# Build
docker build -t sahayadri-backend .

# Run
docker run -d \
  --name backend \
  -p 5000:5000 \
  -e MONGO_URI=mongodb://mongo:27017/sahayadri \
  -e EMAIL_USER=your@gmail.com \
  -e EMAIL_PASS=xxxx xxxx xxxx xxxx \
  -e AI_SERVER_URL=http://ai_model:5001 \
  sahayadri-backend
```

### Docker Compose

```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "5000:5000"
    environment:
      - MONGO_URI=mongodb://mongo:27017/sahayadri
      - EMAIL_USER=your@gmail.com
      - EMAIL_PASS=xxxx xxxx xxxx xxxx
      - AI_SERVER_URL=http://ai_model:5001
    depends_on:
      - mongo
      - ai_model
    networks:
      - app-network

  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
    networks:
      - app-network

  ai_model:
    build: ../ai_model
    ports:
      - "5001:5001"
    networks:
      - app-network

volumes:
  mongo-data:

networks:
  app-network:
    driver: bridge
```

## 🏭 Production Deployment

### Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use MongoDB Atlas (not local)
- [ ] Configure Gmail App Password
- [ ] Set strong session secret
- [ ] Use HTTPS with reverse proxy
- [ ] Enable CORS for your domain
- [ ] Set proper AI_SERVER_URL
- [ ] Configure logging
- [ ] Set up health checks
- [ ] Enable monitoring
- [ ] Regular backups enabled

### Environment Variables (Production)

```env
NODE_ENV=production
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/sahayadri
EMAIL_USER=noreply@sahayadri.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
PORT=5000
CORS_ORIGIN=https://yourdomain.com
AI_SERVER_URL=https://ai-server.yourdomain.com
SESSION_SECRET=your-strong-secret-key
JWT_SECRET=your-jwt-secret-key
```

### Health Check Endpoint (Add)

```javascript
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});
```

### Nginx Reverse Proxy

```nginx
upsEvaluate Fitness (now uses Python subprocess)
const evaluateFitness = async (healthData) => {
  const response = await axios.post(`${API_BASE}/evaluate-fitness`, healthData);
  return response.data;
};

// Usage
const result = await evaluateFitness({
  age: 35,
  bmi: 24.5,
  heart_rate: 72,
  blood_pressure_systolic: 120,
  blood_pressure_diastolic: 80,
  vo2_max: 45.2,
  flexibility: 8,
  muscle_strength: 85,
  endurance: 7
});
console.log(result); // { success: true, results: { prediction: 1, confidence: 0.92, ... } }
```

### cURL

```bash
# Request OTP
curl -X POST http://localhost:5000/api/request-otp \
  -H "Content-Type: application/json" \
  -d '{"identifier":"9876543210"}'

# Verify OTP
curl -X POST http://localhost:5000/api/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"identifier":"9876543210","otp":"1234"}'

# Evaluate Fitness (Python subprocess)
curl -X POST http://localhost:5000/api/evaluate-fitness \
  -H "Content-Type: application/json" \
  -d '{
    "age": 35,
    "bmi": 24.5,
    "heart_rate": 72,
    "blood_pressure_systolic": 120,
    "blood_pressure_diastolic": 80,
    "vo2_max": 45.2,
    "flexibility": 8,
    "muscle_strength": 85,
    "endurance": 7
  
const API_BASE = 'http://localhost:5000/api';

// Request OTP
const requestOTP = async (identifier) => {
  coPython Model Download Failed

**Error:** `Failed to download model from Hugging Face`

**Solutions:**
1. Check internet connection
2. Verify Hugging Face URL is accessible:
   ```bash
   curl -I https://huggingface.co/ZORO1112/random_forest/resolve/main/ai_model/fitness_model.joblib
   ```
3. Ensure disk space available (~50 MB)
4. Check `MODEL_URL` in `.env` is correct

### Python Execution Failed

**Error:** `Python script not found` or `No module named 'sklearn'`

**Solutions:**
1. Verify Python installed: `python --version`
2. Install dependencies: `pip install scikit-learn joblib pandas numpy`
3. Check `PYTHON_EXECUTABLE` in `.env`:
   - Windows: `python`
   - macOS/Linux: `python3`
4. Verify `predict_model.py` exists in backend folderxios.post(`${API_BASE}/verify-otp`, {
    identifier,
    otp
  });
  return response.data;
};

// Get Assessment
const getAssessment = async (healthData) => {
  const response = await axios.post(`${API_BASE}/assess-fitness`, 
    healthData,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  return response.data;
};
```

### cURL

```bash
# Request OTP
curl -X POST http://localhost:5000/api/request-otp \
  -H "Content-Type: application/json" \
  -d '{"identifier":"9876543210"}'

# Verify OTP
curl -X POST http://localhost:5000/api/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"identifier":"9876543210","otp":"1234"}'

# Get Assessment
curl -X POST http://localhost:5000/api/assess-fitness \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"age":30,"gender":"Male",...}'
```

## 🔍 Troubleshooting

### MongoDB Connection Failed

**Error:** `MongooseError: connect ECONNREFUSED 127.0.0.1:27017`

**Solutions:**
1. Check MongoDB is running locally: `mongosh`
2. Or use MongoDB Atlas connection string
3. Verify `MONGO_URI` in `.env` is correct

### Email Service Error

**Error:** `Email configuration error: Invalid login`

**Solutions:**
1. Enable 2-Factor Authentication on Gmail
2. Generate App Password (not regular password)
3. Use 16-character App Password in `.env`
4. Check `EMAIL_USER` is correct

### AI Server Connection Failed

**Error:** `Error: connect ECONNREFUSED 127.0.0.1:5001`

**Solutions:**
1. Verify AI server is running on port 5001
2. Check `AI_SERVER_URL` in `.env`
3. Increase `AI_SERVER_TIMEOUT` if needed
4. Check firewall settings

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::5000`

**Solutions:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

### CORS Errors

**Error:** `Cross-Origin Request Blocked`

**Solutions:**
1. Update `CORS_ORIGIN` in `.env`
2. Or allow multiple origins:
```javascript
app.use(cors({
  origin: ['http://localhost:5173', 'https://yourdomain.com']
}));
```

## 📊 Monitoring

### Health Check

```bash
curl http://localhost:5000/health
```

### Logs

```bash
# View logs in real-time
npm start

# Or save to file
npm start > logs.txt 2>&1
```

### Database Status

```javascript
// Add to server.js
app.get('/api/status', (req, res) => {
  res.json({
    status: 'operational',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date()
  });
});
```

## 📝 Notes

- OTP expires after 10 minutes
- Email delivery may take 1-2 seconds
- AI Server must be running for assessments
- MongoDB Atlas connection requires internet

## 🔒 Security Checklist

- [ ] Email credentials never in code
- [ ] CORS proper origins
- [ ] Input validation enabled
- [ ] Rate limiting configured
- [ ] HTTPS in production
- [ ] Session secrets strong
- [ ] Error messages safe
- [ ] Database backups enabled

## 📞 Support

For issues:
1. Check logs: `npm start`
2. Verify `.env` configuration
3. Test MongoDB connection
4. Check email credentials
5. Verify AI server is running

## 📜 License

ISC

---

**Backend Ready for Deployment!** ✅
