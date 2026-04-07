from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import json
import traceback
import os
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Configuration from environment variables
app.config['ENV'] = os.getenv('FLASK_ENV', 'production')
app.config['DEBUG'] = app.config['ENV'] == 'development'
app.config['JSON_SORT_KEYS'] = False

# --- MODEL INITIALIZATION ---
model = None
features_dict = None
model_ready = False

# Get the directory where this script is located
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

def load_model():
    global model, features_dict, model_ready
    try:
        model_path = os.path.join(SCRIPT_DIR, 'fitness_model.joblib')
        features_path = os.path.join(SCRIPT_DIR, 'model_features.json')
        
        if not os.path.exists(model_path):
            logger.error(f"Model file not found: {model_path}")
            return False
            
        if not os.path.exists(features_path):
            logger.error(f"Features file not found: {features_path}")
            return False
        
        model = joblib.load(model_path)
        with open(features_path, 'r') as f:
            features_dict = json.load(f)
            
        logger.info(f"Model loaded successfully: {model.n_features_in_} features expected")
        logger.info(f"Features config loaded: {len(features_dict.get('feature_columns', []))} columns")
        model_ready = True
        return True
    except Exception as e:
        logger.error(f"Model load failed: {str(e)}", exc_info=True)
        model_ready = False
        return False

# Load model on startup
load_model()

# --- HEALTH CHECK ENDPOINTS ---
@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "model_ready": model_ready,
        "timestamp": str(pd.Timestamp.now())
    }), 200

@app.route('/api/health', methods=['GET'])
def api_health():
    """API health check endpoint"""
    return jsonify({
        "status": "healthy",
        "model_ready": model_ready,
        "service": "AI Fitness Prediction Service",
        "version": "1.0.0"
    }), 200

@app.route('/api/status', methods=['GET'])
def status():
    """Model status endpoint"""
    if not model_ready:
        return jsonify({
            "status": "error",
            "message": "Model not loaded"
        }), 503
    
    return jsonify({
        "status": "ready",
        "model_features": model.n_features_in_,
        "available_endpoints": [
            "/api/health",
            "/api/status", 
            "/api/predict"
        ]
    }), 200

@app.route('/predict', methods=['POST'])
@app.route('/api/predict', methods=['POST'])
def predict():
    """Fitness prediction endpoint - accepts health data and returns fitness assessment"""
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400

        # Policy: age under 18 is 100% unfit (not eligible for labour fitness assessment)
        if 'age' in data:
            try:
                if float(data['age']) < 18:
                    return jsonify({
                        "fitness_status": "Unfit",
                        "confidence": "1.00",
                        "contributions": [{
                            "key": "age_policy",
                            "label": "Age under 18: not eligible (policy)",
                            "value": 1.0
                        }]
                    })
            except (TypeError, ValueError):
                pass
        
        if not model_ready or model is None:
            return jsonify({"error": "Model not ready. Please check server status."}), 503
            
        feature_cols = features_dict.get('feature_columns', [])

        work_types = data.get('work_types', ['general_labour'])
        if not isinstance(work_types, list):
            work_types = [work_types]

        df_input = pd.DataFrame(0, index=[0], columns=feature_cols)
        
        if 'age' in data:
            df_input['age'] = float(data['age'])
            
        binary_cols = ['asthma','knee_pain','leg_injury','appendicitis_history','hand_injury',
                       'headache_issue','eyesight_issue','chest_pain','heart_issue','kidney_issue',
                       'smoking','alcohol']
                       
        for c in binary_cols:
            if c in data:
                val = str(data[c]).strip().title()
                if val == 'Yes' or val == 'True' or val == '1' or val == 'true':
                    df_input[c] = 1

        # Combine all requested jobs simultaneously
        for wt in work_types:
            work_col = f"work_{str(wt).strip().lower()}"
            if work_col in df_input.columns:
                df_input[work_col] = 1
                
        if 'gender' in data:
            gen_val = str(data['gender']).strip().lower()
            col_name = f"gender_{gen_val}"
            if col_name in df_input.columns:
                df_input[col_name] = 1

        importances = model.feature_importances_
        prediction = model.predict(df_input)[0]
        status = "Fit" if prediction == 1 else "Unfit"
        prob = model.predict_proba(df_input)[0].max()
        
        contributions = []
        for i, col in enumerate(feature_cols):
            val = df_input[col][0]
            imp = importances[i]
            if val > 0 and imp > 0.01:
                display_name = col.replace('_', ' ').title()
                if col.startswith('work_'):
                    display_name = f"Job Input: {col.replace('work_', '').replace('_', ' ').title()}"
                elif col.startswith('gender_'):
                    display_name = f"Gender: {col.replace('gender_', '').title()}"
                
                weight = imp * (1.0 if col != 'age' else 0.5)
                contributions.append({
                    "key": col,
                    "label": display_name,
                    "value": weight
                })
                
        if not contributions:
            contributions.append({"key": "healthy", "label": "No negative flags", "value": 1.0})

        return jsonify({
            "fitness_status": status, 
            "confidence": f"{prob:.2f}",
            "contributions": contributions
        })
    
    except Exception as e:
        logger.error(f"Prediction failed: {str(e)}", exc_info=True)
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    logger.warning(f"404 error - endpoint not found")
    return jsonify({
        "error": "Endpoint not found",
        "available_endpoints": [
            "/health",
            "/api/health",
            "/api/status",
            "/api/predict",
            "/predict"
        ]
    }), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    logger.error(f"500 error: {str(error)}", exc_info=True)
    return jsonify({
        "error": "Internal server error",
        "message": str(error)
    }), 500

if __name__ == '__main__':
    # Configuration from environment variables
    flask_env = os.getenv('FLASK_ENV', 'production')
    host = os.getenv('FLASK_HOST', '0.0.0.0')
    port = int(os.getenv('FLASK_PORT', 7860))
    debug_mode = flask_env == 'development'
    
    logger.info("=" * 60)
    logger.info("🚀 AI Fitness Prediction Server")
    logger.info("=" * 60)
    logger.info(f"📊 Model Status: {'✅ Ready' if model_ready else '❌ Not Ready'}")
    logger.info(f"🌐 Running on: http://{host}:{port}")
    logger.info(f"🔗 Flask CORS enabled for cross-origin requests")
    logger.info(f"🔐 Environment: {flask_env}")
    logger.info("\n📍 Available Endpoints:")
    logger.info("   - GET  /health                 (Basic health check)")
    logger.info("   - GET  /api/health             (API health check)")
    logger.info("   - GET  /api/status             (Model status)")
    logger.info("   - POST /api/predict            (Fitness prediction)")
    logger.info("   - POST /predict                (Legacy endpoint - use /api/predict)")
    logger.info("\n💡 Example prediction request:")
    logger.info("   curl -X POST http://localhost:7860/api/predict")
    logger.info("     -H 'Content-Type: application/json'")
    logger.info("     -d '{\"age\": 30, \"gender\": \"Male\", \"work_types\": [\"general_labour\"]}'")
    logger.info("=" * 60 + "\n")
    
    # Run with production-ready settings
    app.run(
        host=host,
        port=port,
        debug=debug_mode,
        use_reloader=False,
        threaded=True
    )
