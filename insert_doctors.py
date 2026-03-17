import os
import sys
from pathlib import Path

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


def main():
    uri = load_mongo_uri_from_env()
    if not uri:
        print('MONGO_URI not found in .env or environment')
        sys.exit(1)

    client = MongoClient(uri)
    default_db = client.get_default_database()
    db_name = default_db.name if default_db is not None else 'sahayadri'
    db = client[db_name]

    doctors = [
        {
            'name': 'Dr. Anil Kumar',
            'email': 'anil.kumar@doctor.ac.in',
            'contactNumber': '9800001111',
            'department': 'General Medicine',
            'hospital': 'Sahayadri',
            'role': 'doctor'
        },
        {
            'name': 'Dr. Priya Sen',
            'email': 'priya.sen@doctor.ac.in',
            'contactNumber': '9800002222',
            'department': 'Pediatrics',
            'hospital': 'Sahayadri',
            'role': 'doctor'
        },
        {
            'name': 'Dr. Rajesh Nair',
            'email': 'rajesh.nair@doctor.ac.in',
            'contactNumber': '9800003333',
            'department': 'Occupational Health',
            'hospital': 'Sahayadri',
            'role': 'doctor'
        }
    ]

    coll = db['doctors']
    res = coll.insert_many(doctors)
    print(f"Inserted {len(res.inserted_ids)} doctor records into DB '{db_name}'.")
    for _id in res.inserted_ids:
        print(' -', _id)

    # show sample
    sample = coll.find_one({'email': 'anil.kumar@hospital.doctor.ac.in'})
    print('\nSample inserted doctor:')
    print(sample)


if __name__ == '__main__':
    main()
