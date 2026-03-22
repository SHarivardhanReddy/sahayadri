import pandas as pd
import numpy as np

print("Loading 1M records CSV...")
df = pd.read_csv('data/workers_health.csv')

print("Adding 'gender' column...")
# Ensure determinism for names if possible, but mostly random
np.random.seed(42)
df['gender'] = np.random.choice(['Male', 'Female'], p=[0.75, 0.25], size=len(df))

# Just to make the data make a bit more sense conceptually
# Some names are obviously female, let's fix a few just for realism (though random is fine for AI testing)
female_names = ['Kavita', 'Neha', 'Anita', 'Kriti', 'Sunita', 'Pooja', 'Priya', 'Lakshmi', 'Divya', 'Nisha', 'Geeta', 'Meena', 'Rekha', 'Sneha']
df.loc[df['name'].str.split().str[0].isin(female_names), 'gender'] = 'Female'

print("Saving modified CSV...")
df.to_csv('data/workers_health.csv', index=False)
print("Complete! Added gender parameter to workers_health.csv.")
