const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();
const Worker = require('../models/Worker');

const CSV_PATH = path.join(__dirname, '..', 'data', 'workers_health.csv');

function parseCSV(content) {
  const lines = content.split(/\r?\n/).filter(l => l.trim());
  const header = lines[0].split(',').map(h => h.trim());
  const rows = lines.slice(1).map(line => {
    // simple split (data is generated without quoted commas)
    const cols = line.split(',').map(c => c.trim());
    const obj = {};
    for (let i = 0; i < header.length; i++) {
      obj[header[i]] = cols[i] !== undefined ? cols[i] : '';
    }
    return obj;
  });
  return rows;
}

(async function main(){
  if (!fs.existsSync(CSV_PATH)) {
    console.error('CSV not found at', CSV_PATH);
    process.exit(1);
  }

  const raw = fs.readFileSync(CSV_PATH, 'utf8');
  const rows = parseCSV(raw);
  console.log('Parsed rows:', rows.length);

  // connect
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');

  let updated = 0, created = 0;
  for (const r of rows) {
    try {
      const name = r.name || 'Unknown';
      const age = parseInt(r.age) || 0;
      const work = (r.work || '').trim();

      const payload = {
        name,
        age,
        work,
        asthma: (r.asthma || '').toLowerCase() === 'yes',
        knee_pain: (r.knee_pain || '').toLowerCase() === 'yes',
        leg_injury: (r.leg_injury || '').toLowerCase() === 'yes',
        appendicitis_history: (r.appendicitis_history || '').toLowerCase() === 'yes',
        hand_injury: (r.hand_injury || '').toLowerCase() === 'yes',
        headache_issue: (r.headache_issue || '').toLowerCase() === 'yes',
        eyesight_issue: (r.eyesight_issue || '').toLowerCase() === 'yes',
        chest_pain: (r.chest_pain || '').toLowerCase() === 'yes',
        heart_issue: (r.heart_issue || '').toLowerCase() === 'yes',
        kidney_issue: (r.kidney_issue || '').toLowerCase() === 'yes',
        smoking: (r.smoking || '').toLowerCase() === 'yes',
        alcohol: (r.alcohol || '').toLowerCase() === 'yes',
        can_work: (r.can_work || '').toLowerCase() === 'yes'
      };

      // Upsert by name+age+work (best-effort unique key for synthetic data)
      const filter = { name: payload.name, age: payload.age, work: payload.work };
      const options = { upsert: true, new: true, setDefaultsOnInsert: true };
      const doc = await Worker.findOneAndUpdate(filter, payload, options).lean();
      if (doc) updated++; else created++;

    } catch (e) {
      console.error('Row import error:', e);
    }
  }

  console.log('Import complete. Updated:', updated, 'Created:', created);
  await mongoose.disconnect();
  console.log('Disconnected.');
})();
