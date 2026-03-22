import csv
import random

random.seed(42)

first_names = [
    'Ravi','Lakshmi','Suresh','Anita','Manoj','Pooja','Ramesh','Kavita','Venkatesh','Sunita',
    'Arjun','Meena','Kiran','Sunil','Rekha','Vijay','Geeta','Mohammed','Nisha','Kamal',
    'Deepak','Priya','Rahul','Sneha','Amit','Neha','Rohit','Divya','Sanjay','Kriti'
]
last_names = [
    'Kumar','Devi','Babu','Reddy','Singh','Sharma','Patel','Rao','K','Gupta','Khan','Iyer','Nair','Das'
]
work_types = ['construction','weight_lifting','assembly','heavy_lifting','general_labour']

binary_fields = [
    'asthma','knee_pain','leg_injury','appendicitis_history','hand_injury',
    'headache_issue','eyesight_issue','chest_pain','heart_issue','kidney_issue',
    'smoking','alcohol'
]

NUM_ROWS = 10000
OUT_CSV = 'data/workers_health_10000.csv'

with open(OUT_CSV, 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    # Match ai_model/data/workers_health.csv column order (can_work before gender)
    header = ['name', 'age', 'work'] + binary_fields + ['can_work', 'gender']
    writer.writerow(header)

    for i in range(NUM_ROWS):
        fname = random.choice(first_names)
        lname = random.choice(last_names)
        name = f"{fname} {lname}"
        # Age distribution: majority 20-50, some older; some minors 16-17 for policy-aligned labels
        age = int(random.gauss(36, 10))
        if age > 70:
            age = random.randint(65, 70)
        elif age < 18:
            age = random.randint(16, 17) if random.random() < 0.35 else random.randint(18, 22)
        work = random.choices(work_types, weights=[0.35,0.15,0.25,0.15,0.10])[0]

        # Probabilities influenced by age and work type
        p_age = max(0, (age - 25) / 50)  # increases with age
        # injury risk higher for heavy lifting and construction
        work_risk = 0.0
        if work in ('construction','heavy_lifting','weight_lifting'): work_risk = 0.15
        if work == 'assembly': work_risk = 0.05

        row = [name, age, work]
        flags = {}
        for field in binary_fields:
            base_p = 0.03  # baseline low probability
            if field in ('knee_pain','hand_injury','leg_injury'):
                base_p += 0.08 + work_risk
            if field in ('chest_pain','heart_issue','kidney_issue'):
                base_p += 0.02 + p_age * 0.25
            if field == 'asthma':
                base_p += 0.02
            if field == 'eyesight_issue':
                base_p += 0.05 + p_age*0.15
            if field in ('smoking','alcohol'):
                base_p += 0.10
                # slightly higher in heavy jobs
                base_p += work_risk * 0.5

            # random event
            val = 'Yes' if random.random() < base_p else 'No'
            flags[field] = val
            row.append(val)

        # Decide can_work using rules: serious cardiac/chest/kidney issues => No
        # multiple injuries or age+injury in heavy work => No
        critical = 0
        if flags['heart_issue'] == 'Yes' or flags['chest_pain'] == 'Yes' or flags['kidney_issue'] == 'Yes':
            critical = 1
        injury_count = sum(1 for f in ['knee_pain','leg_injury','hand_injury'] if flags[f]=='Yes')
        serious_conditions = 0
        if critical:
            serious_conditions = 1
        if injury_count >= 2 and work in ('construction','heavy_lifting','weight_lifting'):
            serious_conditions = 1
        if flags['asthma']=='Yes' and work in ('heavy_lifting','weight_lifting'):
            serious_conditions = 1
        if flags['smoking']=='Yes' and flags['heart_issue']=='Yes':
            serious_conditions = 1
        if age >= 60 and (injury_count>=1 or flags['heart_issue']=='Yes' or flags['chest_pain']=='Yes'):
            serious_conditions = 1

        if age < 18:
            can_work = 'No'
        else:
            can_work = 'No' if serious_conditions == 1 else 'Yes'

        gender = random.choice(['Male', 'Female'])
        row.append(can_work)
        row.append(gender)
        writer.writerow(row)

print(f"Generated {NUM_ROWS} rows to {OUT_CSV}")
