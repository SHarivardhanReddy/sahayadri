FROM python:3.12.3-slim

# Set working directory
WORKDIR /app

# Copy requirements first for optimal layer caching
COPY ai_model/requirements.txt .

# Update pip and install build essentials
RUN python -m pip install --upgrade pip setuptools wheel

# Install Python dependencies (pre-built wheels only to avoid compilation)
RUN pip install --only-binary :all: -r requirements.txt

# Copy the entire ai_model directory content
COPY ai_model/ .

# Verify critical files exist before starting
RUN test -f fitness_model.joblib || (echo "ERROR: fitness_model.joblib not found!" && exit 1)
RUN test -f model_features.json || (echo "ERROR: model_features.json not found!" && exit 1)
RUN test -f ai_server.py || (echo "ERROR: ai_server.py not found!" && exit 1)

RUN echo "✓ All critical files verified"

# Set environment variables
ENV FLASK_APP=ai_server.py \
    PYTHONUNBUFFERED=1 \
    FLASK_ENV=production \
    FLASK_DEBUG=false

# Expose port (informational, Render assigns dynamically)
EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:${PORT:-5001}/health', timeout=2)" || exit 1

# Run Gunicorn WSGI server
# Render provides PORT env variable automatically
CMD ["sh", "-c", "gunicorn -w 4 -b 0.0.0.0:${PORT:-5001} --timeout 120 --access-logfile - --error-logfile - ai_server:app"]
