"""
WSGI entry point for Gunicorn production deployment.

To run with Gunicorn:
    gunicorn --bind 0.0.0.0:5001 --workers 4 --timeout 60 wsgi:app
"""

import os
import sys

# Add the current directory to the path so we can import ai_server
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from ai_server import app

if __name__ == "__main__":
    app.run()
