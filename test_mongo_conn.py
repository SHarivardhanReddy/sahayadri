from pymongo import MongoClient
from pathlib import Path
import os

env_path = Path(__file__).resolve().parent / '.env'
if env_path.exists():
    for line in env_path.read_text().splitlines():
        if line.strip().startswith('MONGO_URI='):
            os.environ['MONGO_URI'] = line.split('=', 1)[1].strip()

uri = os.environ.get('MONGO_URI')
if not uri:
    print('MONGO_URI not set')
    raise SystemExit(1)

print('Using URI:', uri[:60] + '...' if len(uri) > 60 else uri)
client = MongoClient(uri, serverSelectionTimeoutMS=5000)
try:
    db = client.get_default_database()
    if db is None:
        # fallback: list database names
        print('Default DB not set in URI; available DBs:')
        print(client.list_database_names())
    else:
        print('Connected to DB:', db.name)
        print('Collections:', db.list_collection_names())
    # also test a simple command
    _ = client.server_info()
    print('Server info fetched successfully')
except Exception as e:
    print('Connection failed:', e)
    print('\nAttempting fallback diagnostic: retry with tlsAllowInvalidCertificates=True (insecure, for debugging)')
    try:
        client2 = MongoClient(uri, tls=True, tlsAllowInvalidCertificates=True, serverSelectionTimeoutMS=5000)
        db2 = client2.get_default_database()
        print('Fallback connected. Default DB:', db2.name if db2 is not None else '(none)')
        print('Collections (fallback):', db2.list_collection_names())
        print('WARNING: tlsAllowInvalidCertificates=True is insecure — use only for debugging')
    except Exception as e2:
        print('Fallback also failed:', e2)
    raise
