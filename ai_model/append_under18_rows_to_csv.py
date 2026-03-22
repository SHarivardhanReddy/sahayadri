"""
Append synthetic rows with age 16–17 to data/workers_health.csv (no full-file rewrite).

Use before training so the Random Forest sees minority-class examples aligned with
policy (can_work=No for under-18). Safe to run multiple times (adds more rows each time).

Usage (from ai_model/):
  py -3 append_under18_rows_to_csv.py
  py -3 append_under18_rows_to_csv.py --count 1500
"""
import argparse
import csv
import random
from pathlib import Path

random.seed(42)

CSV_PATH = Path(__file__).resolve().parent / "data" / "workers_health.csv"

WORK_TYPES = [
    "construction",
    "weight_lifting",
    "assembly",
    "heavy_lifting",
    "general_labour",
]
BINARY_FIELDS = [
    "asthma",
    "knee_pain",
    "leg_injury",
    "appendicitis_history",
    "hand_injury",
    "headache_issue",
    "eyesight_issue",
    "chest_pain",
    "heart_issue",
    "kidney_issue",
    "smoking",
    "alcohol",
]
GENDERS = ["Male", "Female"]
FIRST = [
    "Ravi",
    "Anita",
    "Manoj",
    "Arjun",
    "Priya",
    "Amit",
    "Neha",
    "Kriti",
    "Vihaan",
    "Ananya",
]
LAST = ["Kumar", "Sharma", "Patel", "Rao", "Singh", "Das", "Nair", "Gupta"]


def main():
    p = argparse.ArgumentParser()
    p.add_argument(
        "--count",
        type=int,
        default=1000,
        help="Number of under-18 rows to append (default: 1000)",
    )
    args = p.parse_args()

    if not CSV_PATH.is_file():
        raise SystemExit(f"Missing CSV: {CSV_PATH}")

    with open(CSV_PATH, newline="", encoding="utf-8") as f:
        reader = csv.reader(f)
        header = next(reader)

    # Expected: name,age,work,...,can_work,gender
    expected_tail = ["can_work", "gender"]
    if header[-2:] != expected_tail:
        raise SystemExit(f"Unexpected CSV header tail {header[-5:]!r}; expected ... {expected_tail}")

    work_i = header.index("work")
    name_i = header.index("name")
    age_i = header.index("age")
    can_i = header.index("can_work")
    gender_i = header.index("gender")

    new_rows = []
    for _ in range(args.count):
        age = random.choice([16, 17])
        work = random.choice(WORK_TYPES)
        gender = random.choice(GENDERS)
        name = f"{random.choice(FIRST)} {random.choice(LAST)}"
        row = [""] * len(header)
        row[name_i] = name
        row[age_i] = str(age)
        row[work_i] = work
        row[gender_i] = gender
        row[can_i] = "No"  # policy: minors not eligible for labour fitness / can_work
        for field in BINARY_FIELDS:
            if field not in header:
                raise SystemExit(f"Missing column {field!r} in CSV")
            idx = header.index(field)
            row[idx] = "Yes" if random.random() < 0.12 else "No"
        new_rows.append(row)

    with open(CSV_PATH, "a", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerows(new_rows)

    print(f"Appended {len(new_rows)} rows (age 16–17, can_work=No) to {CSV_PATH}")


if __name__ == "__main__":
    main()
