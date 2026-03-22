import os
import sys
from pathlib import Path
import joblib
import numpy as np
import pandas as pd

try:
    from pymongo import MongoClient
except Exception:
    print("pymongo is required. Install with: pip install pymongo")
    sys.exit(1)


def load_mongo_uri_from_env():
    env_path = Path(__file__).resolve().parent / '.env'
    if not env_path.exists():
        return os.environ.get('MONGO_URI')
    for line in env_path.read_text().splitlines():
        if line.strip().startswith('MONGO_URI='):
            return line.split('=', 1)[1].strip()
    return os.environ.get('MONGO_URI')


def map_health_to_features(h):
    if not h:
        return 0, 70
    s = h.lower()
    respiratory = 1 if 'asthma' in s or 'respir' in s else 0
    if 'fit' in s and 'mild' not in s:
        score = 90
    elif 'mild' in s:
        score = 70
    elif 'recover' in s:
        score = 65
    elif 'skin' in s:
        score = 75
    elif 'diabet' in s:
        score = 40
    elif 'hyper' in s or 'hypertension' in s:
        score = 45
    else:
        score = 60
    return respiratory, score


def infer_bmi_from_age_and_history(age, health):
    if age is None:
        return 25.0
    if age >= 55:
        return 31.0
    respiratory, score = map_health_to_features(health)
    if respiratory == 1 or score <= 50:
        return 31.0
    return 24.5


def main():
    uri = load_mongo_uri_from_env()
    if not uri:
        print("MONGO_URI not found in .env or environment")
        sys.exit(1)

    client = MongoClient(uri)
    # determine DB name from URI if present, else default to 'sahayadri'
    default_db = client.get_default_database()
    db_name = default_db.name if default_db is not None else 'sahayadri'
    db = client[db_name]
    coll = db['workers']

    docs = list(coll.find({}))
    if not docs:
        print('No worker documents found in `workers` collection.')
        sys.exit(1)

    records = []
    for d in docs:
        age = d.get('age')
        health = d.get('healthHistory') or d.get('health_history') or ''
        resp, score = map_health_to_features(health)
        bmi = d.get('bmi') or infer_bmi_from_age_and_history(age, health)
        # derive label: fit if score >= 70 and respiratory==0 and bmi < 30
        fit_label = 1 if (score >= 70 and resp == 0 and bmi < 30) else 0
        if age is not None and age < 18:
            fit_label = 0
        records.append({'age': age or 30, 'bmi': float(bmi), 'respiratory_issue': int(resp), 'health_score': int(score), 'fit_label': int(fit_label)})

    df = pd.DataFrame(records)
    print(f"Loaded {len(df)} records from DB. Label distribution:\n{df['fit_label'].value_counts().to_dict()}")

    X = df[['age', 'bmi', 'respiratory_issue', 'health_score']]
    y = df['fit_label']

    from sklearn.ensemble import RandomForestClassifier

    model = RandomForestClassifier(n_estimators=200, random_state=42)
    model.fit(X, y)

    joblib.dump(model, 'fitness_model.joblib')
    print('✅ Trained RandomForest on DB data and saved to fitness_model.joblib')
    fi = model.feature_importances_
    for n, v in zip(X.columns, fi):
        print(f" - {n}: {v:.3f}")


if __name__ == '__main__':
    main()
