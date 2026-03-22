import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import joblib

df = pd.read_csv('data/workers_health.csv')


# Inspect
print('Loaded records:', len(df))

# Columns to use as binary features (Yes/No -> 1/0)
binary_cols = ['asthma','knee_pain','leg_injury','appendicitis_history','hand_injury',
               'headache_issue','eyesight_issue','chest_pain','heart_issue','kidney_issue',
               'smoking','alcohol']

for c in binary_cols:
    df[c] = df[c].str.strip().str.lower().map({'yes':1,'no':0}).fillna(0).astype(int)

# One-hot encode work and gender
work_dummies = pd.get_dummies(df['work'].astype(str).str.strip().str.lower(), prefix='work')
gender_dummies = pd.get_dummies(df['gender'].astype(str).str.strip().str.lower(), prefix='gender')

# Features and label
X = pd.concat([df[['age'] + binary_cols], work_dummies, gender_dummies], axis=1)
# Target: can_work (Yes/No)
df['can_work_bin'] = df['can_work'].str.strip().str.lower().map({'yes':1,'no':0}).fillna(0).astype(int)
y = df['can_work_bin']

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

model = RandomForestClassifier(n_estimators=200, random_state=42)
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
acc = accuracy_score(y_test, y_pred)
print(f'Accuracy on test set: {acc:.3f}')
print(classification_report(y_test, y_pred))

# Save model and feature metadata
joblib.dump(model, 'fitness_model_from_csv.joblib')
# Also overwrite existing fitness_model.joblib for compatibility
joblib.dump(model, 'fitness_model.joblib')

# Save feature columns so inference code can construct proper input
import json
with open('model_features.json','w') as f:
    json.dump({'feature_columns': X.columns.tolist()}, f)

print('Models saved to fitness_model_from_csv.joblib and fitness_model.joblib')
print('Feature columns saved to model_features.json')
