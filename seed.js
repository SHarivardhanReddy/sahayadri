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
        
        // Generate 20 Fake Workers
        for (let i = 0; i < 20; i++) {
            const randomName = names[Math.floor(Math.random() * names.length)] + " " + lastNames[Math.floor(Math.random() * lastNames.length)];
            const randomState = states[Math.floor(Math.random() * states.length)];
            const randomHealth = healthIssues[Math.floor(Math.random() * healthIssues.length)];
            const randomAadhar = `${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;

            await Worker.create({
                name: randomName,
                age: Math.floor(Math.random() * (55 - 18) + 18), // Random age between 18-55
                homeState: randomState,
                contactNumber: "9" + Math.floor(100000000 + Math.random() * 900000000),
                healthHistory: randomHealth,
                // Add aadhar here if you updated your Schema
            });
            console.log(`Added: ${randomName}`);
        }
        
        console.log("✅ Data Seeding Complete!");
        process.exit();
    })
    .catch(err => console.log(err));