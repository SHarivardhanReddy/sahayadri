/**
 * - Removes healthHistory from all workers (structured flags only).
 * - Removes mobile from all doctors (email-only login).
 *
 *   node scripts/migrate_workers_and_doctors.js
 */
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function main() {
    if (!process.env.MONGO_URI) {
        console.error('MONGO_URI missing');
        process.exit(1);
    }
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;

    const workers = await db.collection('workers').updateMany(
        {},
        { $unset: { healthHistory: '' } }
    );
    console.log('Workers healthHistory unset:', workers.modifiedCount);

    const doctors = await db.collection('doctors').updateMany(
        {},
        { $unset: { mobile: '' } }
    );
    console.log('Doctors mobile unset:', doctors.modifiedCount);

    await mongoose.disconnect();
    process.exit(0);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
