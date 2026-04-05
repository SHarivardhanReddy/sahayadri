# Digital Health Record - Labour Fitness Assessment

A full-stack application for assessing worker fitness for labour-intensive roles using machine learning.

## Project Structure

```
├── ai_model/              # Machine Learning API (Flask + MCP)
│   ├── ai_server.py       # Flask REST API server
│   ├── mcp_server.py      # MCP protocol server for Claude
│   ├── fitness_model.joblib  # Trained ML model
│   ├── model_features.json   # Feature configuration
│   └── requirements.txt    # Python dependencies
├── backend/               # Node.js REST API
│   ├── server.js          # Express server
│   ├── models/            # Database models
│   └── package.json       # Node dependencies
├── frontend/              # React + Vite UI
│   ├── src/               # React components
│   ├── vite.config.js     # Build configuration
│   └── package.json       # Node dependencies
├── Dockerfile             # Container image for AI model
└── .github/workflows/     # CI/CD automation
    ├── deploy.yml         # Build and push Docker image
    └── ci.yml             # Code validation
```

## Quick Start

### Prerequisites
- Docker (for AI model deployment)
- Node.js 18+ (for backend/frontend)
- Python 3.12.3 (for local AI model development)

### AI Model (Flask + MCP)

**Run locally:**
```bash
cd ai_model
pip install -r requirements.txt
python ai_server.py
```

**Access API:**
- Health check: `GET http://localhost:5001/health`
- Fitness assessment: `POST http://localhost:5001/api/predict`
- Model status: `GET http://localhost:5001/api/status`

**Run with Docker:**
```bash
docker build -t fitness-api .
docker run -p 5001:5001 fitness-api
```

### Backend (Node.js)

**Setup:**
```bash
cd backend
npm install
```

**Run:**
```bash
npm start
```

### Frontend (React + Vite)

**Setup:**
```bash
cd frontend
npm install
```

**Development:**
```bash
npm run dev
```

**Build:**
```bash
npm run build
```

## API Endpoints

### AI Model (`/ai_model`)

**Health Check**
```
GET /health
```

**Predict Fitness**
```
POST /api/predict
Content-Type: application/json

{
  "age": 35,
  "gender": "M",
  "has_heart_disease": false,
  "has_high_bp": false,
  "has_diabetes": false,
  "has_asthma": false,
  "bmi": 24.5,
  "physical_activity": true,
  "smoker": false,
  "stroke_history": false,
  "kidney_disease": false,
  "difficulty_walking": false,
  "mental_health_days": 0,
  "work_type": "Private",
  "income": "High"
}

Response:
{
  "fitness": "Fit",
  "confidence": 0.92,
  "predicted_label": 1,
  "feature_importance": {...}
}
```

**Model Status**
```
GET /api/status
```

## GitHub Actions CI/CD

### Automated Workflows

**Deploy Workflow** (`.github/workflows/deploy.yml`)
- Triggers: Push to main branch
- Builds Docker image
- Validates model and code
- Pushes to GitHub Container Registry
- Image: `ghcr.io/SHarivardhanReddy/sahayadri/ai-fitness-server:latest`

**CI Workflow** (`.github/workflows/ci.yml`)
- Triggers: Pull requests and commits
- Validates Python syntax
- Checks model files
- Lints code with flake8
- Security scanning with bandit

### Docker Image Usage

**Pull from registry:**
```bash
docker login ghcr.io -u USERNAME -p TOKEN
docker pull ghcr.io/SHarivardhanReddy/sahayadri/ai-fitness-server:latest
```

**Run:**
```bash
docker run -p 5001:5001 \
  ghcr.io/SHarivardhanReddy/sahayadri/ai-fitness-server:latest
```

## Environment Variables

**AI Model (`ai_model/.env`):**
```env
FLASK_ENV=production
FLASK_DEBUG=0
PORT=5001
```

## Technologies Used

**AI Model:**
- Flask 3.0.0 - REST API framework
- Scikit-learn 1.3.2 - Machine learning
- Pandas 2.1.3 - Data processing
- MCP 1.0.0 - Claude integration
- Joblib 1.3.2 - Model serialization

**Backend:**
- Node.js - Runtime
- Express - REST API framework
- MongoDB - Database (if applicable)

**Frontend:**
- React 18+ - UI framework
- Vite - Build tool
- ESLint - Code quality

**Deployment:**
- Docker - Containerization
- GitHub Actions - CI/CD
- GitHub Container Registry - Image storage

## Project Branches

- `main` - Production ready code
- `ai-model` - AI model development
- `backend` - Backend API development
- `frontend` - Frontend development

## Deployment

### Option 1: GitHub Container Registry (Recommended)
Docker image is automatically built and pushed on every commit to main:
```
ghcr.io/SHarivardhanReddy/sahayadri/ai-fitness-server:latest
```

### Option 2: Deploy Anywhere
Pull the Docker image and deploy to:
- AWS EC2 / ECS
- Google Cloud Run
- Azure Container Instances
- DigitalOcean
- Render
- Railway
- Your own server

Example:
```bash
docker pull ghcr.io/SHarivardhanReddy/sahayadri/ai-fitness-server:latest
docker run -p 5001:5001 -d ghcr.io/SHarivardhanReddy/sahayadri/ai-fitness-server:latest
```

## Repository

GitHub: https://github.com/SHarivardhanReddy/sahayadri

## License

Proprietary
