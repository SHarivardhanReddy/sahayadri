const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios');
const fs = require('fs');
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

// --- DOCTOR: get all workers (only allowed for doctor role) ---
app.get('/api/workers', async (req, res) => {
    try {
        const role = req.header('x-user-role') || '';
        const identifier = (req.header('x-user-identifier') || '').toLowerCase();
        // simple validation: role must be 'doctor' and identifier must end with @doctor.ac.in
        if (role !== 'doctor' || !identifier.endsWith('@doctor.ac.in')) {
            return res.status(403).json({ message: 'Forbidden: doctor access only.' });
        }

        const all = await Worker.find({}).lean();
        res.json(all);
    } catch (err) {
        res.status(500).json({ error: 'Server error fetching workers.' });
    }
});

// Debug: echo received body and headers
app.post('/api/debug-body', (req, res) => {
    res.json({ headers: req.headers, body: req.body });
});

// --- DOCTOR: update a worker record (doctor-only) ---
app.put('/api/workers/:id', async (req, res) => {
    try {
        const role = req.header('x-user-role') || '';
        const identifier = (req.header('x-user-identifier') || '').toLowerCase();
        if (role !== 'doctor' || !identifier.endsWith('@doctor.ac.in')) {
            return res.status(403).json({ message: 'Forbidden: doctor access only.' });
        }

        const { id } = req.params;
        const allowed = ['name', 'age', 'homeState', 'contactNumber', 'mobile', 'email', 'healthHistory', 'aadhar'];
        try {
            fs.appendFileSync('create_requests.log', `HEADERS=${JSON.stringify(req.headers)}\nBODY=${JSON.stringify(req.body)}\n---\n`);
        } catch (fsErr) {
            console.error('Failed to write create_requests.log:', fsErr);
        }
        const update = {};
        for (const k of allowed) {
            if (req.body[k] !== undefined) update[k] = req.body[k];
        }

        const updated = await Worker.findByIdAndUpdate(id, update, { new: true });
        if (!updated) return res.status(404).json({ message: 'Worker not found.' });
        res.json(updated);
    } catch (err) {
        console.error('PUT /api/workers/:id error', err);
        res.status(500).json({ error: 'Server error updating worker.' });
    }
});

// --- DOCTOR: create a new worker record (doctor-only) ---
app.post('/api/workers', async (req, res) => {
    try {
        const role = req.header('x-user-role') || '';
        const identifier = (req.header('x-user-identifier') || '').toLowerCase();
        if (role !== 'doctor' || !identifier.endsWith('@doctor.ac.in')) {
            return res.status(403).json({ message: 'Forbidden: doctor access only.' });
        }

        const allowed = ['name', 'age', 'homeState', 'contactNumber', 'mobile', 'email', 'healthHistory', 'aadhar'];
        const payload = {};
        for (const k of allowed) {
            if (req.body[k] !== undefined) payload[k] = req.body[k];
        }

        // If contactNumber is missing but mobile provided, use mobile as contactNumber
        if (!payload.contactNumber && payload.mobile) payload.contactNumber = payload.mobile;

        // Basic required fields check
        if (!payload.name || !payload.age) {
            return res.status(400).json({ message: 'Missing required fields: name and age.' });
        }

        console.log('POST /api/workers payload:', payload);
        try {
            const created = await Worker.create(payload);
            return res.status(201).json(created);
        } catch (eCreate) {
            const errText = `Worker.create failed:\nPAYLOAD=${JSON.stringify(payload)}\nERROR=${eCreate && eCreate.stack ? eCreate.stack : eCreate}\n`;
            console.error(errText);
            try {
                fs.appendFileSync('create_errors.log', errText + '\n');
            } catch (fsErr) {
                console.error('Failed to write log file:', fsErr);
            }
            try {
                const result = await Worker.collection.insertOne(payload);
                const doc = await Worker.findById(result.insertedId).lean();
                return res.status(201).json(doc);
            } catch (e2) {
                const errText2 = `Native insert also failed:\nPAYLOAD=${JSON.stringify(payload)}\nERROR=${e2 && e2.stack ? e2.stack : e2}\n`;
                console.error(errText2);
                try {
                    fs.appendFileSync('create_errors.log', errText2 + '\n');
                } catch (fsErr) {
                    console.error('Failed to write log file:', fsErr);
                }
                return res.status(500).json({ error: 'Server error creating worker.' });
            }
        }
    } catch (err) {
        console.error('POST /api/workers error', err && err.stack ? err.stack : err);
        res.status(500).json({ error: err && err.message ? err.message : 'Server error creating worker.', stack: err && err.stack ? err.stack : null });
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