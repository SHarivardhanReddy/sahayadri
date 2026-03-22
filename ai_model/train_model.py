import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import joblib

# 1. Create a dataset representing health criteria for manual labor
# age, bmi, respiratory_issue (1=Yes, 0=No), health_score (out of 100)
data = {
    'age': [22, 50, 30, 45, 28, 35, 60, 24],
    'bmi': [22.5, 31.2, 24.0, 29.5, 21.0, 26.5, 33.0, 23.5],
    'respiratory_issue': [0, 1, 0, 1, 0, 0, 1, 0],
    'health_score': [90, 40, 85, 55, 95, 80, 30, 88],
    'fit_label': [1, 0, 1, 0, 1, 1, 0, 1] # 1: Fit, 0: Unfit
}

df = pd.DataFrame(data)

# 2. Train the Random Forest Model
X = df.drop('fit_label', axis=1)
y = df['fit_label']

model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X, y)

# 3. Save the "Brain" of the AI
joblib.dump(model, 'fitness_model.joblib')
print("✅ AI Model Trained and 'fitness_model.joblib' has been created!")