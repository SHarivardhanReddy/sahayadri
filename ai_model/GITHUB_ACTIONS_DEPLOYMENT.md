# GitHub Actions Deployment Guide

This project uses GitHub Actions for automated CI/CD. All automation runs natively on GitHub without external services.

## Workflows Overview

### 1. **deploy.yml** - Build & Push Docker Image
**Triggers:** Push to `main` branch or PR to `main`

**What it does:**
- Builds Docker image from `Dockerfile`
- Pushes image to GitHub Container Registry (`ghcr.io`)
- Runs validation tests on model files
- Creates GitHub deployment records
- Automatically comments on PRs with image details

**Jobs:**
- `build`: Builds and pushes Docker image with caching
- `test`: Validates model files and Flask imports
- `notify`: Reports deployment status

**Output:** Docker image available at:
```
ghcr.io/SHarivardhanReddy/sahayadri/ai-fitness-server:latest
ghcr.io/SHarivardhanReddy/sahayadri/ai-fitness-server:main-<commit-sha>
```

### 2. **ci.yml** - Code Validation
**Triggers:** Pull requests to `main`, push to `main`

**What it does:**
- Validates Python syntax
- Checks model files exist
- Validates model compatibility
- Tests Flask app initialization
- Builds Docker image for validation
- Lints code with flake8
- Security scanning with bandit

**Jobs:**
- `validate`: Core validation and model checks
- `lint`: Code quality checks (optional failures)
- `security`: Security scanning (optional failures)

## Setup Requirements

### 1. GitHub Token (Automatic)
GitHub provides `GITHUB_TOKEN` automatically for all workflows. This token allows pushing to GitHub Container Registry.

**Permissions are set to:**
```yaml
contents: read
packages: write
```

### 2. Container Registry Authentication
No additional setup needed! The `docker/login-action@v3` step uses `GITHUB_TOKEN` to authenticate.

## How to Use

### Automatic Deployment (On Push)
1. Make changes to `ai_model/**` or `Dockerfile`
2. Commit and push to `main` branch
3. GitHub Actions automatically:
   - Builds Docker image
   - Runs tests
   - Pushes to `ghcr.io`
   - Creates deployment record

### Manual Pull Requests
1. Create a PR with changes
2. `ci.yml` validates the code
3. `deploy.yml` builds image (but doesn't push to registry)
4. Review results, make changes if needed
5. Merge to `main` to trigger full deployment

## Running the Docker Image

### Pull from GitHub Container Registry
```bash
# Requires authentication (use PAT token)
docker login ghcr.io -u USERNAME -p YOUR_PAT_TOKEN

# Pull latest image
docker pull ghcr.io/SHarivardhanReddy/sahayadri/ai-fitness-server:latest
```

### Run Container Locally
```bash
docker run -p 5001:5001 \
  ghcr.io/SHarivardhanReddy/sahayadri/ai-fitness-server:latest
```

### Run with Environment Variables
```bash
docker run -p 5001:5001 \
  -e FLASK_ENV=production \
  -e FLASK_DEBUG=0 \
  -e PORT=5001 \
  ghcr.io/SHarivardhanReddy/sahayadri/ai-fitness-server:latest
```

### Verify Container Health
```bash
# Check if container is running
docker ps

# Test health endpoint
curl http://localhost:5001/health

# Test API status
curl http://localhost:5001/api/status
```

## Deployment Targets

### Option 1: Deploy to Your Server (Self-Hosted)
```bash
# SSH into your server
ssh user@your-server.com

# Pull and run the image
docker pull ghcr.io/SHarivardhanReddy/sahayadri/ai-fitness-server:latest
docker run -d -p 5001:5001 \
  --name fitness-api \
  ghcr.io/SHarivardhanReddy/sahayadri/ai-fitness-server:latest

# Verify
curl http://localhost:5001/health
```

### Option 2: Deploy to Cloud Platforms
**Available containers:**
- ✅ AWS ECR (push to private registry)
- ✅ Azure Container Registry
- ✅ Google Cloud Container Registry
- ✅ DigitalOcean App Platform
- ✅ Render.com
- ✅ Railway
- ✅ Heroku (with buildpack)

### Option 3: GitHub Container Registry Only
Image is available at:
```
ghcr.io/SHarivardhanReddy/sahayadri/ai-fitness-server:latest
```

## Accessing Images from Private Registry

### Create Personal Access Token (PAT)
1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token"
3. Select scopes:
   - `read:packages` - to pull images
   - `write:packages` - to push images
4. Copy token

### Authenticate Docker
```bash
# Using PAT token
docker login ghcr.io -u YOUR_USERNAME -p YOUR_PAT_TOKEN

# Or use .docker/config.json
echo "YOUR_PAT_TOKEN" | docker login ghcr.io -u YOUR_USERNAME --password-stdin
```

### Pull and Run
```bash
docker pull ghcr.io/SHarivardhanReddy/sahayadri/ai-fitness-server:latest
docker run -p 5001:5001 ghcr.io/SHarivardhanReddy/sahayadri/ai-fitness-server:latest
```

## Workflow Status & Monitoring

### View Workflow Runs
1. Go to GitHub repository: https://github.com/SHarivardhanReddy/sahayadri
2. Click "Actions" tab
3. Select workflow to view runs
4. Click run to see detailed logs

### Check Build Status
- Successful builds: Green checkmark ✓
- Failed builds: Red X ✗
- In progress: Yellow circle ⟳

### View Deployment History
1. Go to repository
2. Click "Deployments" section
3. View all deployed images and timestamps

## Troubleshooting

### Workflow Fails to Build
1. Check workflow logs in Actions tab
2. Verify all files in `ai_model/` are present:
   - `ai_server.py`
   - `mcp_server.py`
   - `fitness_model.joblib` (16.4 MB)
   - `model_features.json`
   - `requirements.txt`
3. Ensure `Dockerfile` exists in repository root

### Docker Image Won't Run
**Error: "No space left on device"**
```bash
docker system prune -a  # Clean up old images
```

**Error: "Port 5001 already in use"**
```bash
docker run -p 5002:5001 ...  # Use different port
```

**Error: "Model file not found"**
- Verify `fitness_model.joblib` is committed to git
- Check file exists in container: `docker exec <container> ls -la ai_model/`

### Authentication Issues
```bash
# Re-authenticate with new token
docker logout ghcr.io
docker login ghcr.io -u YOUR_USERNAME -p YOUR_NEW_PAT_TOKEN
```

## Environment Variables

Set these in your deployment platform:

```env
FLASK_ENV=production
FLASK_DEBUG=0
PORT=5001
```

## Performance Notes

- **Build time**: ~3-5 minutes on GitHub Actions
- **Image size**: ~400-500 MB (Python 3.12.3 + dependencies)
- **Container startup**: ~10-15 seconds
- **Health check**: Once every 30 seconds

## Related Documentation

- [README.md](../README.md) - API documentation
- [DEPLOYMENT_CHECKLIST.md](../ai_model/DEPLOYMENT_CHECKLIST.md) - Pre-deployment checklist
- [PYTHON_SETUP.md](../ai_model/PYTHON_SETUP.md) - Local development setup
- [GITHUB_RENDER_DEPLOYMENT.md](../ai_model/GITHUB_RENDER_DEPLOYMENT.md) - Manual Render deployment

## Next Steps

1. ✅ Push changes to `main` to trigger workflows
2. ✅ Monitor Actions tab for builds
3. ✅ Pull image from `ghcr.io` and test locally
4. ✅ Deploy to cloud platform of choice
5. ✅ Setup monitoring and alerting (optional)

## Questions?

Refer to GitHub Actions documentation:
- https://docs.github.com/en/actions
- https://docs.github.com/en/actions/publishing-packages/publishing-docker-images
