import joblib
import numpy as np

model = joblib.load('fitness_model.joblib')

samples = [
    {'name': 'Sample Fit', 'age': 30, 'bmi': 23.5, 'respiratory_issue': 0, 'health_score': 88},
    {'name': 'Sample Unfit', 'age': 55, 'bmi': 32.0, 'respiratory_issue': 1, 'health_score': 35},
    {'name': 'Arjun Sharma', 'age': 29, 'bmi': 24.5, 'respiratory_issue': 0, 'health_score': 90}
]

for s in samples:
    X = np.array([[s['age'], s['bmi'], s['respiratory_issue'], s['health_score']]])
    pred = model.predict(X)[0]
    status = 'Fit' if pred == 1 else 'Unfit'
    print(f"{s['name']}: {status}")

print('\n✅ Prediction test complete.')
