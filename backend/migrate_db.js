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
            
            // Intelligently parse healthHistory
            const hist = (worker.healthHistory || '').toLowerCase();
            if (hist) {
                if (hist.includes("asthma") || hist.includes("breath")) { worker.asthma = true; requiresSave = true; }
                if (hist.includes("knee")) { worker.knee_pain = true; requiresSave = true; }
                if (hist.includes("leg")) { worker.leg_injury = true; requiresSave = true; }
                if (hist.includes("appendicitis")) { worker.appendicitis_history = true; requiresSave = true; }
                if (hist.includes("hand")) { worker.hand_injury = true; requiresSave = true; }
                if (hist.includes("headache") || hist.includes("migraine")) { worker.headache_issue = true; requiresSave = true; }
                if (hist.includes("eye") || hist.includes("vision")) { worker.eyesight_issue = true; requiresSave = true; }
                if (hist.includes("chest")) { worker.chest_pain = true; requiresSave = true; }
                if (hist.includes("heart") || hist.includes("cardiac")) { worker.heart_issue = true; requiresSave = true; }
                if (hist.includes("kidney") || hist.includes("renal")) { worker.kidney_issue = true; requiresSave = true; }
                if (hist.includes("smok")) { worker.smoking = true; requiresSave = true; }
                if (hist.includes("alcohol") || hist.includes("drink")) { worker.alcohol = true; requiresSave = true; }
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
