/**
 * 1) Sets `gender` on every worker document that is missing or invalid.
 * 2) Inserts additional sample workers with explicit gender.
 *
 * Run from backend/:  node scripts/backfill_gender_and_seed.js
 * Requires MONGO_URI in .env
 */
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const Worker = require('../models/Worker');

const VALID = new Set(['Male', 'Female', 'Other']);

/** Rough name hints (first token) — remainder get deterministic Male/Female from id */
const FEMALE_FIRST = new Set([
  'kavya', 'ananya', 'priya', 'lakshmi', 'meena', 'neha', 'sneha', 'divya', 'kavita',
  'anita', 'pooja', 'nisha', 'kriti', 'rekha', 'geeta', 'sunita', 'deepa', 'radha',
  'latha', 'uma', 'shanti', 'swati', 'rani', 'sita', 'gita', 'sarita', 'manisha',
  'kavita', 'anjali', 'shruti', 'tanvi', 'isha', 'disha', 'simran', 'harpreet'
]);

function inferGender(name, idHex) {
  const first = (name || '').trim().split(/\s+/)[0] || '';
  const key = first.toLowerCase();
  if (FEMALE_FIRST.has(key)) return 'Female';
  let sum = 0;
  const s = idHex ? String(idHex) : first;
  for (let i = 0; i < s.length; i++) sum += s.charCodeAt(i);
  return sum % 2 === 0 ? 'Male' : 'Female';
}

const NEW_WORKERS = [
  {
    name: 'Rohit Malhotra',
    gender: 'Male',
    age: 31,
    homeState: 'Maharashtra',
    contactNumber: '9810011122',
    mobile: '9810011122',
    email: 'rohit.m@example.com',
    aadhar: '1111-2222-3333',
    asthma: false,
    knee_pain: false,
    leg_injury: false,
    appendicitis_history: false,
    hand_injury: false,
    headache_issue: false,
    eyesight_issue: false,
    chest_pain: false,
    heart_issue: false,
    kidney_issue: false,
    smoking: false,
    alcohol: false,
    can_work: true
  },
  {
    name: 'Sneha Iyer',
    gender: 'Female',
    age: 28,
    homeState: 'Tamil Nadu',
    contactNumber: '9820033344',
    mobile: '9820033344',
    email: 'sneha.iyer@example.com',
    aadhar: '2222-3333-4444',
    asthma: true,
    knee_pain: false,
    leg_injury: false,
    appendicitis_history: false,
    hand_injury: false,
    headache_issue: false,
    eyesight_issue: false,
    chest_pain: false,
    heart_issue: false,
    kidney_issue: false,
    smoking: false,
    alcohol: false,
    can_work: true
  },
  {
    name: 'Vikram Singh',
    gender: 'Male',
    age: 41,
    homeState: 'Punjab',
    contactNumber: '9830044455',
    mobile: '9830044455',
    email: 'vikram.s@example.com',
    aadhar: '3333-4444-5555',
    asthma: false,
    knee_pain: true,
    leg_injury: false,
    appendicitis_history: false,
    hand_injury: false,
    headache_issue: false,
    eyesight_issue: false,
    chest_pain: false,
    heart_issue: false,
    kidney_issue: false,
    smoking: true,
    alcohol: false,
    can_work: true
  },
  {
    name: 'Meera Nambiar',
    gender: 'Female',
    age: 36,
    homeState: 'Kerala',
    contactNumber: '9840055566',
    mobile: '9840055566',
    email: 'meera.n@example.com',
    aadhar: '4444-5555-6666',
    asthma: false,
    knee_pain: false,
    leg_injury: false,
    appendicitis_history: false,
    hand_injury: false,
    headache_issue: false,
    eyesight_issue: true,
    chest_pain: false,
    heart_issue: false,
    kidney_issue: false,
    smoking: false,
    alcohol: false,
    can_work: true
  },
  {
    name: 'Aditya Joshi',
    gender: 'Male',
    age: 26,
    homeState: 'Rajasthan',
    contactNumber: '9850066677',
    mobile: '9850066677',
    email: 'aditya.j@example.com',
    aadhar: '5555-6666-7777',
    asthma: false,
    knee_pain: false,
    leg_injury: false,
    appendicitis_history: false,
    hand_injury: false,
    headache_issue: false,
    eyesight_issue: false,
    chest_pain: false,
    heart_issue: false,
    kidney_issue: false,
    smoking: false,
    alcohol: true,
    can_work: true
  },
  {
    name: 'Fatima Khan',
    gender: 'Female',
    age: 33,
    homeState: 'Telangana',
    contactNumber: '9860077788',
    mobile: '9860077788',
    email: 'fatima.k@example.com',
    aadhar: '6666-7777-8888',
    asthma: false,
    knee_pain: false,
    leg_injury: false,
    appendicitis_history: true,
    hand_injury: false,
    headache_issue: false,
    eyesight_issue: false,
    chest_pain: false,
    heart_issue: false,
    kidney_issue: false,
    smoking: false,
    alcohol: false,
    can_work: true
  }
];

async function main() {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is not set in backend/.env');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const all = await Worker.find({}).lean();
  let backfilled = 0;
  for (const doc of all) {
    const g = doc.gender;
    if (g && VALID.has(g)) continue;
    const next = inferGender(doc.name, doc._id);
    await Worker.updateOne({ _id: doc._id }, { $set: { gender: next } });
    backfilled++;
    console.log(`  gender: ${doc.name} -> ${next}`);
  }
  console.log(`Backfill complete: updated ${backfilled} / ${all.length} documents.`);

  let inserted = 0;
  for (const w of NEW_WORKERS) {
    const exists = await Worker.findOne({
      name: w.name,
      mobile: w.mobile
    }).lean();
    if (exists) {
      console.log(`Skip (already exists): ${w.name}`);
      continue;
    }
    await Worker.create(w);
    inserted++;
    console.log(`Inserted: ${w.name} (${w.gender})`);
  }
  console.log(`Done. New workers inserted: ${inserted}.`);

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
