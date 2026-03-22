const mongoose = require('mongoose');
const Worker = require('./models/Worker');
require('dotenv').config();

// Health boolean parameters from CSV structure
const healthBooleans = ['asthma', 'knee_pain', 'leg_injury', 'appendicitis_history', 'hand_injury', 'headache_issue', 'eyesight_issue', 'chest_pain', 'heart_issue', 'kidney_issue', 'smoking', 'alcohol'];

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log("✅ Connected to DB. Initiating Database Reset...");
        
        // 1. Remove all previous records
        await Worker.deleteMany({});
        console.log("🗑️ Cleared all legacy MongoDB records.");

        // 2. Define fresh records with latest parameters, phone, and email for login
        const freshWorkers = [
            { 
                name: 'Arjun Sharma', age: 29, homeState: 'Kerala', 
                mobile: '9123456789', contactNumber: '9123456789', email: 'arjun@example.com', 
                healthHistory: 'Perfectly fit.', aadhar: '1234-5678-9012',
                // Booleans:
                asthma: false, knee_pain: false, leg_injury: false, appendicitis_history: false,
                hand_injury: false, headache_issue: false, eyesight_issue: false, chest_pain: false,
                heart_issue: false, kidney_issue: false, smoking: false, alcohol: false
            },
            { 
                name: 'Vihaan Verma', age: 45, homeState: 'Uttar Pradesh', 
                mobile: '9234567890', contactNumber: '9234567890', email: 'vihaan@example.com', 
                healthHistory: 'Smoker, occasional chest pain and high blood pressure.', aadhar: '2345-6789-0123',
                // Booleans:
                asthma: false, knee_pain: false, leg_injury: false, appendicitis_history: false,
                hand_injury: false, headache_issue: false, eyesight_issue: false, chest_pain: true,
                heart_issue: true, kidney_issue: false, smoking: true, alcohol: true
            },
            { 
                name: 'Kavya Patel', age: 34, homeState: 'Gujarat', 
                mobile: '9345678901', contactNumber: '9345678901', email: 'kavya@example.com', 
                healthHistory: 'Past knee injury and asthma.', aadhar: '3456-7890-1234',
                // Booleans:
                asthma: true, knee_pain: true, leg_injury: true, appendicitis_history: false,
                hand_injury: false, headache_issue: false, eyesight_issue: false, chest_pain: false,
                heart_issue: false, kidney_issue: false, smoking: false, alcohol: false
            },
            { 
                name: 'Ananya Rao', age: 24, homeState: 'Karnataka', 
                mobile: '9456789012', contactNumber: '9456789012', email: 'ananya@example.com', 
                healthHistory: 'Minor vision issue, wears glasses.', aadhar: '4567-8901-2345',
                // Booleans:
                asthma: false, knee_pain: false, leg_injury: false, appendicitis_history: false,
                hand_injury: false, headache_issue: false, eyesight_issue: true, chest_pain: false,
                heart_issue: false, kidney_issue: false, smoking: false, alcohol: false
            },
            { 
                name: 'Manish Gupta', age: 52, homeState: 'Bihar', 
                mobile: '9567890123', contactNumber: '9567890123', email: 'manish@example.com', 
                healthHistory: 'Chronic kidney issues, hand injury previously.', aadhar: '5678-9012-3456',
                // Booleans:
                asthma: false, knee_pain: true, leg_injury: false, appendicitis_history: false,
                hand_injury: true, headache_issue: true, eyesight_issue: false, chest_pain: false,
                heart_issue: false, kidney_issue: true, smoking: false, alcohol: true
            }
        ];

        // 3. Insert into DB
        for (const w of freshWorkers) {
            await Worker.create(w);
            console.log(`✅ Seeded: ${w.name} | Login Mobile: ${w.mobile} | Email: ${w.email}`);
        }

        console.log("\n🚀 Database Reset & Seeding Complete! You can now login with these new credentials.");
        process.exit();
    })
    .catch(err => {
        console.error("❌ Seeding Error:", err);
        process.exit(1);
    });