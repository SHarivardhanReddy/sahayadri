const mongoose = require('mongoose');
const Worker = require('./models/Worker');
require('dotenv').config();

// Fake Data Arrays
const names = ["Arjun", "Vihaan", "Aditya", "Sai", "Rohan", "Kavya", "Ananya", "Diya", "Ishan", "Manish"];
const lastNames = ["Sharma", "Verma", "Reddy", "Nair", "Patel", "Singh", "Yadav", "Das", "Gupta", "Rao"];
const states = ["Kerala", "Bihar", "West Bengal", "Odisha", "Assam", "Uttar Pradesh", "Rajasthan"];
const healthIssues = ["Fit", "Mild Asthma", "Hypertension", "Recovering Fracture", "Skin Allergy", "Diabetic"];

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log("Connected to DB...");
        
        // Seed a few explicit credentials (email + mobile) for testing
        const seedWorkers = [
            { name: 'Arjun Sharma', age: 29, homeState: 'Kerala', contactNumber: '9123456789', mobile: '9123456789', email: 'arjun.sharma@example.com', healthHistory: 'Fit', aadhar: '1234-5678-9012' },
            { name: 'Vihaan Verma', age: 34, homeState: 'Uttar Pradesh', contactNumber: '9234567890', mobile: '9234567890', email: 'vihaan.verma@example.com', healthHistory: 'Mild Asthma', aadhar: '2345-6789-0123' },
            { name: 'Kavya Patel', age: 27, homeState: 'Rajasthan', contactNumber: '9345678901', mobile: '9345678901', email: 'kavya.patel@example.com', healthHistory: 'Fit', aadhar: '3456-7890-1234' },
            { name: 'Ananya Rao', age: 31, homeState: 'Kerala', contactNumber: '9456789012', mobile: '9456789012', email: 'ananya.rao@example.com', healthHistory: 'Skin Allergy', aadhar: '4567-8901-2345' },
            { name: 'Manish Gupta', age: 40, homeState: 'Bihar', contactNumber: '9567890123', mobile: '9567890123', email: 'manish.gupta@example.com', healthHistory: 'Hypertension', aadhar: '5678-9012-3456' }
        ];

        for (const w of seedWorkers) {
            await Worker.create(w);
            console.log(`Added seeded worker: ${w.name} <${w.email} | ${w.mobile}>`);
        }

        // Additionally generate 10 random workers to populate the collection
        for (let i = 0; i < 10; i++) {
            const randomName = names[Math.floor(Math.random() * names.length)] + " " + lastNames[Math.floor(Math.random() * lastNames.length)];
            const randomState = states[Math.floor(Math.random() * states.length)];
            const randomHealth = healthIssues[Math.floor(Math.random() * healthIssues.length)];
            const randomAadhar = `${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
            const randomMobile = '9' + Math.floor(100000000 + Math.random() * 900000000);

            await Worker.create({
                name: randomName,
                age: Math.floor(Math.random() * (55 - 18) + 18), // Random age between 18-55
                homeState: randomState,
                contactNumber: randomMobile,
                mobile: randomMobile,
                email: `${randomName.replace(/\s+/g, '.').toLowerCase()}@example.com`,
                healthHistory: randomHealth,
                aadhar: randomAadhar
            });
            console.log(`Added: ${randomName}`);
        }
        
        console.log("✅ Data Seeding Complete!");
        process.exit();
    })
    .catch(err => console.log(err));