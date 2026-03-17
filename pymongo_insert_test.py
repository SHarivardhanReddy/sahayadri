from pymongo import MongoClient
from pathlib import Path
import os

env_path = Path(__file__).resolve().parent / '.env'
if env_path.exists():
    for line in env_path.read_text().splitlines():
        if line.strip().startswith('MONGO_URI='):
            os.environ['MONGO_URI'] = line.split('=',1)[1].strip()

uri = os.environ.get('MONGO_URI')
client = MongoClient(uri)
default_db = client.get_default_database()
db = default_db if default_db is not None else client['sahayadri']
coll = db['workers']
doc = {
    'name': 'DirectPyInsert',
    'age': 28,
    'homeState': 'Kerala',
    'contactNumber': '9000012350',
    'mobile': '9000012350',
    'healthHistory': 'Fit',
    'aadhar': '0000-0000-0000'
}
try:
    res = coll.insert_one(doc)
    print('Inserted id', res.inserted_id)
    print(coll.find_one({'_id': res.inserted_id}))
except Exception as e:
    print('Insert failed:', type(e).__name__, str(e))
