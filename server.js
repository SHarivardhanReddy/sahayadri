const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios');
const Worker = require('./models/Worker'); 
require('dotenv').config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB connected"))
    .catch(err => console.log("❌ DB Error:", err));

// --- INTERNAL LOCAL OTP MECHANISM ---
let localOtpStore = {}; 

app.post('/api/request-otp', (req, res) => {
    const { identifier } = req.body;
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
    localOtpStore[identifier] = generatedOtp;

    // SIMULATE DELIVERY: Check your terminal for this box!
    console.log(`\n=========================================`);
    console.log(`🔐 NEW OTP REQUEST FOR: ${identifier}`);
    console.log(`👉 YOUR LOGIN CODE IS: [ ${generatedOtp} ]`);
    console.log(`=========================================\n`);

    res.json({ success: true, message: "Check your server terminal for the code!" });
});

app.post('/api/verify-otp', (req, res) => {
    const { identifier, otp } = req.body;
    if (localOtpStore[identifier] && localOtpStore[identifier] === otp) {
        delete localOtpStore[identifier]; 
        res.json({ success: true });
    } else {
        res.status(400).json({ success: false, message: "Invalid OTP" });
    }
});

// --- PRIVACY-FILTERED PROFILE ROUTE ---
app.get('/api/workers/me/:identifier', async (req, res) => {
    const { identifier } = req.params;
    try {
        // Find worker matching email OR mobile for privacy
        const worker = await Worker.findOne({
            $or: [{ email: identifier }, { mobile: identifier }]
        });
        if (!worker) return res.status(404).json({ message: "No record found." });
        res.json(worker);
    } catch (err) {
        res.status(500).json({ error: "Server error fetching profile." });
    }
});

app.post('/api/evaluate-fitness', async (req, res) => {
    try {
        const response = await axios.post('http://127.0.0.1:5001/predict', req.body);
        res.json({ success: true, fitnessStatus: response.data.fitness_status });
    } catch (error) {
        res.status(500).json({ success: false, message: "AI Analysis failed" });
    }
});

app.listen(PORT, () => console.log(`🚀 Privacy-Enabled Server running on port ${PORT}`));