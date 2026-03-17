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

    coll = db['doctors']
    docs = list(coll.find({'role': 'doctor'}))
    if not docs:
        print('No doctor documents found to migrate.')
        return

    updated = 0
    for d in docs:
        email = d.get('email', '')
        if '@doctor.ac.in' in email:
            continue
        # create new local part before @ if possible
        local = email.split('@')[0] if '@' in email else d.get('name','').lower().replace(' ','.')
        new_email = f"{local}@doctor.ac.in"
        coll.update_one({'_id': d['_id']}, {'$set': {'email': new_email}})
        print(f"Updated {email} -> {new_email}")
        updated += 1

    print(f"Migration complete. Updated {updated} documents in '{db_name}.doctors'.")


if __name__ == '__main__':
    main()
