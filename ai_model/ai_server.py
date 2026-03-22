from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import json
import traceback

app = Flask(__name__)
CORS(app)

try:
    model = joblib.load('fitness_model.joblib')
    print(f"✅ Model loaded: {model.n_features_in_} features expected")
except Exception as e:
    print(f"❌ Model load failed: {e}")
    model = None

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
        
        if model is None:
            return jsonify({"error": "Model not ready"}), 500
            
        with open('model_features.json', 'r') as f:
            features_dict = json.load(f)
        feature_cols = features_dict['feature_columns']

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
        print(f"Server error: {traceback.format_exc()}")
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500

if __name__ == '__main__':
    print("🚀 Consolidated Explainable AI Fitness Server running on http://localhost:5001...")
    app.run(port=5001, debug=True)
