/**
 * Removes all doctor documents and inserts 5 doctors (name, email, hospital, department).
 *   node scripts/ensure_demo_doctors.js
 */
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const Doctor = require('../models/Doctor');

const DOCTORS = [
    { name: 'Dr. Ananya Krishnan', email: 'ananya.krishnan@doctor.ac.in', hospital: 'Sahyadri General Hospital', department: 'Occupational Health' },
    { name: 'Dr. Rohit Mehta', email: 'rohit.mehta@doctor.ac.in', hospital: 'Sahyadri General Hospital', department: 'Cardiology' },
    { name: 'Dr. Priya Nair', email: 'priya.nair@doctor.ac.in', hospital: 'Coastal Medical Centre', department: 'Pulmonology' },
    { name: 'Dr. Vikram Desai', email: 'vikram.desai@doctor.ac.in', hospital: 'Coastal Medical Centre', department: 'Orthopedics' },
    { name: 'Dr. Sunita Reddy', email: 'sunita.reddy@doctor.ac.in', hospital: 'Metro Workers Health Institute', department: 'Occupational Health' }
];

async function main() {
    await mongoose.connect(process.env.MONGO_URI);
    const removed = await Doctor.deleteMany({});
    console.log('Removed doctor documents:', removed.deletedCount);
    await Doctor.insertMany(DOCTORS);
    DOCTORS.forEach((d) => console.log('Inserted:', d.email, '|', d.hospital, '|', d.department));
    await mongoose.disconnect();
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
