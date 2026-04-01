FROM python:3.12.3-slim

WORKDIR /app

# Copy only requirements first for optimal layer caching
COPY ai_model/requirements.txt .

# Upgrade pip and install build tools
RUN python -m pip install --upgrade pip setuptools wheel && \
    pip install --only-binary :all: -r requirements.txt

# Copy the entire ai_model directory
COPY ai_model/ /app/

# Verify critical files exist
RUN test -f fitness_model.joblib && test -f model_features.json && echo "✓ Model files verified"

# Set environment variables  
ENV FLASK_APP=ai_server.py \
    PYTHONUNBUFFERED=1 \
    FLASK_ENV=production

# Expose port (for documentation)
EXPOSE $PORT

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:${PORT:-5001}/health', timeout=2)" || exit 1

# Start Gunicorn
CMD ["sh", "-c", "gunicorn -w 4 -b 0.0.0.0:${PORT:-5001} --timeout 120 --access-logfile - ai_server:app"]
