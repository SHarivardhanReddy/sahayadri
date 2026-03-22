const mongoose = require('mongoose');
const Worker = require('./models/Worker');
require('dotenv').config();

const healthBooleans = ['asthma', 'knee_pain', 'leg_injury', 'appendicitis_history', 'hand_injury', 'headache_issue', 'eyesight_issue', 'chest_pain', 'heart_issue', 'kidney_issue', 'smoking', 'alcohol'];

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log("✅ MongoDB connected for migration.");
        const workers = await Worker.find({});
        console.log(`Found ${workers.length} workers. Starting migration...`);

        let updatedCount = 0;
        for (const worker of workers) {
            let requiresSave = false;
            
            // Check if booleans are missing or need initialization
            for (const b of healthBooleans) {
                if (worker[b] === undefined) {
                    worker[b] = false;
                    requiresSave = true;
                }
            }

            if (requiresSave) {
                await worker.save();
                updatedCount++;
            }
        }
        console.log(`🎉 Migration complete! Updated ${updatedCount} legacy documents.`);
        process.exit(0);
    })
    .catch(err => {
        console.log("❌ DB Error:", err);
        process.exit(1);
    });
