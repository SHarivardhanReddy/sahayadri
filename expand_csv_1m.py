import pandas as pd

# Load existing dataset
df = pd.read_csv('ai_model/data/workers_health.csv')

# Verify the target count
target_rows = 1000000
current_rows = len(df)

if current_rows < target_rows:
    needed = target_rows - current_rows
    # Sample randomly with replacement from existing data
    sampled_df = df.sample(n=needed, replace=True, random_state=42)
    # Concatenate original with sampled
    expanded_df = pd.concat([df, sampled_df], ignore_index=True)
    # Target file
    expanded_df.to_csv('ai_model/data/workers_health.csv', index=False)
    print(f"✅ Successfully expanded data from {current_rows} to {len(expanded_df)} records.")
else:
    print(f"Data already has {current_rows} records. No expansion needed.")
