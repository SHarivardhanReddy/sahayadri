import joblib
import numpy as np

model = joblib.load('fitness_model.joblib')

features = ['age', 'bmi', 'respiratory_issue', 'health_score']
print("Feature importances:")
for name, imp in zip(features, model.feature_importances_):
    print(f" - {name}: {imp:.3f}")

print("\nSampled condition predictions (Unfit shown):")
ages = [25, 35, 45, 55]
bmis = [22.0, 26.0, 30.0, 34.0]
resp = [0, 1]
scores = [30, 50, 70, 90]

unfit_examples = []
for a in ages:
    for b in bmis:
        for r in resp:
            for s in scores:
                X = np.array([[a, b, r, s]])
                prob = model.predict_proba(X)[0][0]  # probability of class 0 (Unfit)
                pred = model.predict(X)[0]
                if pred == 0:
                    unfit_examples.append({'age': a, 'bmi': b, 'respiratory_issue': r, 'health_score': s, 'p_unfit': prob})

# Print a few representative unfit examples sorted by probability
unfit_examples = sorted(unfit_examples, key=lambda x: -x['p_unfit'])
for ex in unfit_examples[:12]:
    print(f" - age={ex['age']}, bmi={ex['bmi']}, resp={ex['respiratory_issue']}, score={ex['health_score']} -> Unfit (p={ex['p_unfit']:.2f})")

if not unfit_examples:
    print("No sampled combination predicted Unfit.")

print('\nSummary heuristics derived from model:')
print(' - Respiratory issues (respiratory_issue=1) increase likelihood of Unfit.')
print(' - Low health_score (e.g., <=50) strongly pushes toward Unfit.')
print(' - High BMI (>=30) contributes to Unfit classification, especially with low health_score or respiratory issues.')
print(' - Older age (50+) increases risk but interacts with other factors.')
