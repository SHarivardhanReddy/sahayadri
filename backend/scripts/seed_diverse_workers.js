/**
 * Inserts additional worker documents with diverse health parameters.
 * Does NOT delete existing records — safe to run multiple times (skips duplicate mobiles).
 *
 *   node scripts/seed_diverse_workers.js
 */
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const Worker = require('../models/Worker');

const healthBooleans = [
  'asthma',
  'knee_pain',
  'leg_injury',
  'appendicitis_history',
  'hand_injury',
  'headache_issue',
  'eyesight_issue',
  'chest_pain',
  'heart_issue',
  'kidney_issue',
  'smoking',
  'alcohol'
];

const states = [
  'Kerala', 'Tamil Nadu', 'Karnataka', 'Maharashtra', 'Gujarat', 'Punjab', 'West Bengal',
  'Bihar', 'Uttar Pradesh', 'Rajasthan', 'Telangana', 'Andhra Pradesh', 'Odisha', 'Assam'
];

const firstNames = [
  'Ravi', 'Suresh', 'Amit', 'Kiran', 'Vijay', 'Rajesh', 'Nikhil', 'Deepak', 'Harish', 'Imran',
  'Lakshmi', 'Meena', 'Pooja', 'Divya', 'Sneha', 'Kavita', 'Ritu', 'Neha', 'Anjali', 'Farah'
];
const lastNames = ['Sharma', 'Patel', 'Nair', 'Reddy', 'Das', 'Khan', 'Singh', 'Bose', 'Ghosh', 'Menon'];

const works = ['construction', 'general_labour', 'assembly', 'heavy_lifting', 'weight_lifting', ''];

function baseWorker(i, overrides) {
  const fn = firstNames[i % firstNames.length];
  const ln = lastNames[Math.floor(i / firstNames.length) % lastNames.length];
  const mobile = `98${String(10000000 + i).slice(-8)}`;
  const o = {
    name: `${fn} ${ln}`,
    gender: i % 3 === 0 ? 'Female' : i % 3 === 1 ? 'Male' : 'Other',
    age: 22 + (i % 44),
    homeState: states[i % states.length],
    contactNumber: mobile,
    mobile,
    email: `worker.diverse.${i}@example.com`,
    aadhar: `${1000 + (i % 9000)}-${2000 + (i % 7000)}-${3000 + (i % 6000)}`,
    work: works[i % works.length] || undefined,
    can_work: true
  };
  healthBooleans.forEach((b) => {
    o[b] = false;
  });
  Object.assign(o, overrides);
  if (o.heart_issue && o.chest_pain) o.can_work = false;
  if (o.kidney_issue && o.heart_issue) o.can_work = false;
  return o;
}

function buildDiverseList() {
  const list = [];
  let idx = 0;

  // 1) Exactly one flag ON per person (covers each parameter in isolation)
  healthBooleans.forEach((flag) => {
    const w = baseWorker(idx++, {});
    w.name = `Single ${flag.replace(/_/g, ' ')}`;
    w[flag] = true;
    w.age = 30 + (idx % 15);
    list.push(w);
  });

  // 2) All flags OFF — several ages / states (clean bills)
  ;[18, 22, 28, 35, 41, 55].forEach((age, j) => {
    const w = baseWorker(idx++, { age, gender: j % 2 === 0 ? 'Male' : 'Female' });
    w.name = `Clear profile ${j + 1}`;
    list.push(w);
  });

  // 3) Respiratory cluster
  list.push(baseWorker(idx++, { name: 'Respiratory duo', asthma: true, chest_pain: true, age: 48 }));
  list.push(baseWorker(idx++, { name: 'Asthma smoker', asthma: true, smoking: true, age: 44 }));

  // 4) Musculoskeletal cluster
  list.push(baseWorker(idx++, { name: 'MSK triple', knee_pain: true, leg_injury: true, hand_injury: true, age: 39 }));
  list.push(baseWorker(idx++, { name: 'Knee only heavy', knee_pain: true, age: 51, work: 'heavy_lifting' }));

  // 5) Cardio-renal serious
  list.push(baseWorker(idx++, {
    name: 'Cardiac panel',
    heart_issue: true,
    chest_pain: true,
    smoking: true,
    age: 58,
    can_work: false
  }));

  // 6) GI / surgical history
  list.push(baseWorker(idx++, { name: 'Post appendectomy', appendicitis_history: true, age: 33 }));
  list.push(baseWorker(idx++, { name: 'Appendix + headache', appendicitis_history: true, headache_issue: true, age: 29 }));

  // 7) Vision + neuro
  list.push(baseWorker(idx++, { name: 'Vision desk', eyesight_issue: true, headache_issue: true, age: 36, work: 'assembly' }));

  // 8) Renal + lifestyle
  list.push(baseWorker(idx++, { name: 'Kidney monitor', kidney_issue: true, alcohol: false, age: 49 }));
  list.push(baseWorker(idx++, { name: 'Kidney + alcohol', kidney_issue: true, alcohol: true, age: 54 }));

  // 9) Mixed occupational risk
  list.push(baseWorker(idx++, {
    name: 'Construction mix',
    hand_injury: true,
    eyesight_issue: true,
    smoking: true,
    age: 42,
    work: 'construction'
  }));

  // 10) Many flags (complex)
  list.push(baseWorker(idx++, {
    name: 'High comorbidity',
    asthma: true,
    knee_pain: true,
    headache_issue: true,
    eyesight_issue: true,
    smoking: true,
    alcohol: true,
    age: 47,
    can_work: false
  }));

  // 11) Young worker minimal issues
  list.push(baseWorker(idx++, { name: 'Young mild', headache_issue: true, age: 19, gender: 'Male' }));

  // 12) Senior, mostly fit
  list.push(baseWorker(idx++, { name: 'Senior fit', age: 63, eyesight_issue: true, gender: 'Female' }));

  // 13) Alcohol only
  list.push(baseWorker(idx++, { name: 'Alcohol flag only', alcohol: true, age: 40 }));

  // 14) Smoking only
  list.push(baseWorker(idx++, { name: 'Smoking flag only', smoking: true, age: 38 }));

  // 15) Leg + construction
  list.push(baseWorker(idx++, { name: 'Leg injury site', leg_injury: true, work: 'construction', age: 44 }));

  return list;
}

async function main() {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI missing');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI);

  const docs = buildDiverseList();
  let inserted = 0;
  let skipped = 0;

  for (const doc of docs) {
    const exists = await Worker.findOne({ mobile: doc.mobile }).lean();
    if (exists) {
      skipped++;
      continue;
    }
    try {
      await Worker.create(doc);
      inserted++;
    } catch (e) {
      console.warn('Skip row:', doc.name, e.message);
      skipped++;
    }
  }

  console.log(`Done. Inserted: ${inserted}, skipped (duplicate mobile or error): ${skipped}`);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
