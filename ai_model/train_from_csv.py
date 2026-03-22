"""
Train RandomForest on data/workers_health.csv.

**Inputs (X):**
  - ``age`` (numeric)
  - Medical flags (binary): asthma, knee_pain, leg_injury, appendicitis_history,
    hand_injury, headache_issue, eyesight_issue, chest_pain, heart_issue,
    kidney_issue, smoking, alcohol
  - ``work`` one-hot encoded (e.g. work_construction, …)
  - ``gender`` one-hot encoded (e.g. gender_male, gender_female)

**Target (y):** ``can_work`` → ``can_work_bin`` (Yes=1, No=0). Rows with age < 18
are forced to 0 (not eligible) before training.

Run from the ``ai_model`` directory. For large files (~2M rows), ensure enough RAM;
optional: append under-18 examples with ``append_under18_rows_to_csv.py`` first.
"""
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import joblib

df = pd.read_csv("data/workers_health.csv", low_memory=False)


# Inspect
print("Loaded records:", len(df))

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
# Policy: age under 18 is always unfit (labour eligibility)
df.loc[df['age'] < 18, 'can_work_bin'] = 0
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
