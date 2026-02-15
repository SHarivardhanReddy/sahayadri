from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np

app = Flask(__name__)
CORS(app)  # This allows your Node.js backend to talk to this Python server

# Load the trained model we created in the previous step
model = joblib.load('fitness_model.joblib')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        
        # Extract features in the exact order: age, bmi, respiratory_issue, health_score
        features = np.array([[
            data['age'], 
            data['bmi'], 
            data['respiratory_issue'], 
            data['health_score']
        ]])
        
        # Run the prediction (1 = Fit, 0 = Unfit)
        prediction = model.predict(features)
        status = "Fit" if prediction[0] == 1 else "Unfit"
        
        return jsonify({"fitness_status": status})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    print("🚀 AI Fitness Server is running on port 5001...")
    app.run(port=5001)