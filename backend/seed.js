const mongoose = require('mongoose');
const Worker = require('./models/Worker');
const Doctor = require('./models/Doctor');
require('dotenv').config();

// Health boolean parameters from CSV structure
const healthBooleans = ['asthma', 'knee_pain', 'leg_injury', 'appendicitis_history', 'hand_injury', 'headache_issue', 'eyesight_issue', 'chest_pain', 'heart_issue', 'kidney_issue', 'smoking', 'alcohol'];

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log("✅ Connected to DB. Initiating Database Reset...");
        
        // 1. Remove all previous records
        await Worker.deleteMany({});
        await Doctor.deleteMany({});
        console.log('🗑️ Cleared workers and doctors.');

        const doctors = [
            { name: 'Dr. Ananya Krishnan', email: 'ananya.krishnan@doctor.ac.in', hospital: 'Sahyadri General Hospital', department: 'Occupational Health' },
            { name: 'Dr. Rohit Mehta', email: 'rohit.mehta@doctor.ac.in', hospital: 'Sahyadri General Hospital', department: 'Cardiology' },
            { name: 'Dr. Priya Nair', email: 'priya.nair@doctor.ac.in', hospital: 'Coastal Medical Centre', department: 'Pulmonology' },
            { name: 'Dr. Vikram Desai', email: 'vikram.desai@doctor.ac.in', hospital: 'Coastal Medical Centre', department: 'Orthopedics' },
            { name: 'Dr. Sunita Reddy', email: 'sunita.reddy@doctor.ac.in', hospital: 'Metro Workers Health Institute', department: 'Occupational Health' }
        ];
        for (const d of doctors) {
            await Doctor.create(d);
            console.log(`✅ Doctor: ${d.name} | ${d.email} | ${d.hospital} | ${d.department}`);
        }

        // 2. Define fresh records with latest parameters, phone, and email for login
        const freshWorkers = [
            { 
                name: 'Arjun Sharma', gender: 'Male', age: 29, homeState: 'Kerala', 
                mobile: '9123456789', contactNumber: '9123456789', email: 'arjun@example.com', 
                aadhar: '1234-5678-9012',
                // Booleans:
                asthma: false, knee_pain: false, leg_injury: false, appendicitis_history: false,
                hand_injury: false, headache_issue: false, eyesight_issue: false, chest_pain: false,
                heart_issue: false, kidney_issue: false, smoking: false, alcohol: false
            },
            { 
                name: 'Vihaan Verma', gender: 'Male', age: 45, homeState: 'Uttar Pradesh', 
                mobile: '9234567890', contactNumber: '9234567890', email: 'vihaan@example.com', 
                aadhar: '2345-6789-0123',
                // Booleans:
                asthma: false, knee_pain: false, leg_injury: false, appendicitis_history: false,
                hand_injury: false, headache_issue: false, eyesight_issue: false, chest_pain: true,
                heart_issue: true, kidney_issue: false, smoking: true, alcohol: true
            },
            { 
                name: 'Kavya Patel', gender: 'Female', age: 34, homeState: 'Gujarat', 
                mobile: '9345678901', contactNumber: '9345678901', email: 'kavya@example.com', 
                aadhar: '3456-7890-1234',
                // Booleans:
                asthma: true, knee_pain: true, leg_injury: true, appendicitis_history: false,
                hand_injury: false, headache_issue: false, eyesight_issue: false, chest_pain: false,
                heart_issue: false, kidney_issue: false, smoking: false, alcohol: false
            },
            { 
                name: 'Ananya Rao', gender: 'Female', age: 24, homeState: 'Karnataka', 
                mobile: '9456789012', contactNumber: '9456789012', email: 'ananya@example.com', 
                aadhar: '4567-8901-2345',
                // Booleans:
                asthma: false, knee_pain: false, leg_injury: false, appendicitis_history: false,
                hand_injury: false, headache_issue: false, eyesight_issue: true, chest_pain: false,
                heart_issue: false, kidney_issue: false, smoking: false, alcohol: false
            },
            { 
                name: 'Manish Gupta', gender: 'Male', age: 52, homeState: 'Bihar', 
                mobile: '9567890123', contactNumber: '9567890123', email: 'manish@example.com', 
                aadhar: '5678-9012-3456',
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