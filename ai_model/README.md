# AI Fitness Assessment Server

A Flask-based REST API server for fitness assessment predictions using a pre-trained machine learning model.

## 📋 Prerequisites

- Python 3.8+
- pip (Python package manager)

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
cd ai_model
pip install -r requirements.txt
```

### 2. Verify Model Files

Ensure the following files exist in the `ai_model` directory:
- `fitness_model.joblib` - The trained ML model
- `model_features.json` - Feature configuration

### 3. Run the Server

```bash
python ai_server.py
```

Expected output:
```
============================================================
🚀 AI Fitness Prediction Server
============================================================
📊 Model Status: ✅ Ready
🌐 Running on: http://localhost:5001
🔗 Flask CORS enabled for cross-origin requests
...
```

## 📍 API Endpoints

### Health & Status Endpoints

#### GET `/health`
Basic health check
```bash
curl http://localhost:5001/health
```

Response:
```json
{
  "status": "healthy",
  "model_ready": true,
  "timestamp": "2026-04-01 10:30:45.123456"
}
```

#### GET `/api/health`
API health check
```bash
curl http://localhost:5001/api/health
```

#### GET `/api/status`
Detailed model status
```bash
curl http://localhost:5001/api/status
```

Response:
```json
{
  "status": "ready",
  "model_features": 28,
  "available_endpoints": ["/api/health", "/api/status", "/api/predict"]
}
```

### Prediction Endpoint

#### POST `/api/predict`
Get fitness assessment prediction

```bash
curl -X POST http://localhost:5001/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "age": 30,
    "gender": "Male",
    "work_types": ["general_labour"],
    "asthma": "No",
    "knee_pain": "No",
    "smoking": "No",
    "alcohol": "No"
  }'
```

Response:
```json
{
  "fitness_status": "Fit",
  "confidence": "0.85",
  "contributions": [
    {
      "key": "age",
      "label": "Age",
      "value": 0.15
    },
    {
      "key": "work_general_labour",
      "label": "Job Input: General Labour",
      "value": 0.22
    }
  ]
}
```

### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `age` | number | Yes | Age in years (must be ≥ 18) |
| `gender` | string | No | "Male" or "Female" |
| `work_types` | array | Yes | Array of job types (e.g., ["general_labour"]) |
| `asthma` | string | No | "Yes" or "No" |
| `knee_pain` | string | No | "Yes" or "No" |
| `leg_injury` | string | No | "Yes" or "No" |
| `hand_injury` | string | No | "Yes" or "No" |
| `chest_pain` | string | No | "Yes" or "No" |
| `heart_issue` | string | No | "Yes" or "No" |
| `smoking` | string | No | "Yes" or "No" |
| `alcohol` | string | No | "Yes" or "No" |
| `kidney_issue` | string | No | "Yes" or "No" |
| `headache_issue` | string | No | "Yes" or "No" |
| `eyesight_issue` | string | No | "Yes" or "No" |
| `appendicitis_history` | string | No | "Yes" or "No" |

### Response Format

```json
{
  "fitness_status": "Fit|Unfit",
  "confidence": "0.00-1.00",
  "contributions": [
    {
      "key": "feature_name",
      "label": "Display Label",
      "value": 0.0-1.0
    }
  ]
}
```

## 🔄 Integration with Backend

The backend Node.js server calls this API at:
```
POST http://127.0.0.1:5001/api/predict
```

Ensure the AI server is running before starting the backend server.

## 🐛 Troubleshooting

### Model Not Loading
```
❌ Model not ready
```
**Solution:** Verify `fitness_model.joblib` exists in the `ai_model` directory.

### Port Already in Use
```
OSError: [Errno 48] Address already in use
```
**Solution:** Change the port in `ai_server.py` or kill the process using port 5001.

### Dependencies not installed
```
ModuleNotFoundError: No module named 'flask'
```
**Solution:** Run `pip install -r requirements.txt`

## 🔧 Environment Variables

Create a `.env` file (optional) for configuration:
```
FLASK_ENV=development
FLASK_DEBUG=true
```

## 📦 Requirements

See [requirements.txt](requirements.txt) for the complete list of dependencies.

## 📝 Features

✅ RESTful API with Flask & Flask-CORS  
✅ Model health checks  
✅ Explainable predictions with feature importance  
✅ Age-based eligibility policy (under 18 → unfit)  
✅ Cross-origin resource sharing enabled  
✅ Error handling & validation  
✅ Production-ready configuration  

## 🚀 Production Deployment

For production deployments, use a WSGI server like Gunicorn:

```bash
pip install gunicorn
gunicorn -w 4 -b 127.0.0.1:5001 ai_server:app
```

## 📄 License

Internal use only.
