#!/usr/bin/env python3
"""
AI Model Prediction Script
Downloads and loads the fitness model from Hugging Face
Performs predictions based on input features
"""

import json
import sys
import os
import joblib
import urllib.request
import urllib.error

# Model configuration
MODEL_URL = os.getenv('MODEL_URL', 'https://huggingface.co/ZORO1112/random_forest/resolve/main/ai_model/fitness_model.joblib')
FEATURES_URL = os.getenv('FEATURES_URL', 'https://huggingface.co/ZORO1112/random_forest/resolve/main/ai_model/model_features.json')
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'fitness_model.joblib')
FEATURES_PATH = os.path.join(os.path.dirname(__file__), 'model_features.json')

def download_file(url, filepath):
    """Download file from URL if it doesn't exist locally"""
    if os.path.exists(filepath):
        print(f"✅ File already exists: {filepath}", file=sys.stderr)
        return True
    
    try:
        print(f"📥 Downloading from {url}...", file=sys.stderr)
        urllib.request.urlretrieve(url, filepath)
        print(f"✅ Downloaded successfully: {filepath}", file=sys.stderr)
        return True
    except urllib.error.URLError as e:
        print(f"❌ Download error: {e}", file=sys.stderr)
        return False
    except Exception as e:
        print(f"❌ Error: {e}", file=sys.stderr)
        return False

def load_model():
    """Load the fitness model from local file"""
    try:
        if not os.path.exists(MODEL_PATH):
            print(f"❌ Model file not found: {MODEL_PATH}", file=sys.stderr)
            return None
        
        model = joblib.load(MODEL_PATH)
        print(f"✅ Model loaded successfully", file=sys.stderr)
        return model
    except Exception as e:
        print(f"❌ Error loading model: {e}", file=sys.stderr)
        return None

def load_features():
    """Load feature names from JSON file"""
    try:
        if not os.path.exists(FEATURES_PATH):
            print(f"⚠️  Features file not found: {FEATURES_PATH}", file=sys.stderr)
            return None
        
        with open(FEATURES_PATH, 'r') as f:
            features = json.load(f)
        print(f"✅ Features loaded successfully", file=sys.stderr)
        return features
    except Exception as e:
        print(f"❌ Error loading features: {e}", file=sys.stderr)
        return None

def predict(input_data):
    """
    Make prediction using the loaded model
    
    Args:
        input_data: dict with feature values
    
    Returns:
        dict with prediction results
    """
    try:
        # Download model if not exists
        if not os.path.exists(MODEL_PATH):
            print(f"📥 Downloading model from Hugging Face...", file=sys.stderr)
            if not download_file(MODEL_URL, MODEL_PATH):
                return {'success': False, 'error': 'Failed to download model'}
        
        # Download features if not exists
        if not os.path.exists(FEATURES_PATH):
            print(f"📥 Downloading feature config from Hugging Face...", file=sys.stderr)
            download_file(FEATURES_URL, FEATURES_PATH)
        
        # Load model
        model = load_model()
        if model is None:
            return {'success': False, 'error': 'Failed to load model'}
        
        # Load features configuration
        features_config = load_features()
        
        # Prepare input data
        if isinstance(input_data, str):
            input_data = json.loads(input_data)
        
        # Convert input to feature list (order matters for scikit-learn)
        if features_config and 'features' in features_config:
            feature_names = features_config['features']
            feature_values = [input_data.get(feature, 0) for feature in feature_names]
        else:
            # Fallback: convert dict values to list
            feature_values = list(input_data.values())
        
        # Make prediction
        prediction = model.predict([feature_values])
        probability = model.predict_proba([feature_values]) if hasattr(model, 'predict_proba') else None
        
        # Format response
        result = {
            'success': True,
            'prediction': int(prediction[0]) if hasattr(prediction[0], 'item') else int(prediction[0]),
            'confidence': float(probability[0].max()) if probability is not None else None,
            'model_type': str(type(model).__name__)
        }
        
        return result
    
    except json.JSONDecodeError as e:
        return {'success': False, 'error': f'Invalid JSON input: {e}'}
    except Exception as e:
        print(f"❌ Prediction error: {e}", file=sys.stderr)
        return {'success': False, 'error': str(e)}

def main():
    """Main entry point for CLI usage"""
    if len(sys.argv) < 2:
        print("Usage: python predict_model.py '<json_input>'", file=sys.stderr)
        sys.exit(1)
    
    input_str = sys.argv[1]
    result = predict(input_str)
    print(json.dumps(result))

if __name__ == '__main__':
    main()
