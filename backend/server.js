const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { Resend } = require('resend');
const { PythonShell } = require('python-shell');
const Worker = require('./models/Worker');
const Doctor = require('./models/Doctor');

// Load environment variables from .env file
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB connected"))
    .catch(err => console.log("❌ DB Error:", err));

// --- EMAIL CONFIGURATION (Resend) ---
const resend = new Resend(process.env.RESEND_API_KEY);

// Verify email configuration on startup
if (!process.env.RESEND_API_KEY) {
    console.log('⚠️  RESEND_API_KEY not set in environment variables');
    console.log('Email service will not work. Add RESEND_API_KEY to .env file');
} else {
    console.log('✅ Email service ready - Resend API configured');
}

// --- OTP STORAGE WITH EXPIRATION ---
let otpStore = {};

const generateOtp = () => Math.floor(1000 + Math.random() * 9000).toString();

const sendOtpEmail = async (email, otp) => {
    try {
        console.log(`📧 Attempting to send OTP to ${email}...`);
        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: 'Your Sahayadri Health Record OTP',
            html: `
                <div style="font-family: sans-serif; padding: 20px;">
                    <h2>Security Verification</h2>
                    <p>Your one-time password (OTP) is: <strong style="font-size: 1.5em; color: #007bff;">${otp}</strong></p>
                    <p>This code will expire in 10 minutes.</p>
                </div>
            `
        });

        if (error) {
            console.error('❌ Resend Error:', error);
            return false;
        }

        console.log('✅ Email sent successfully:', data.id);
        return true;
    } catch (err) {
        console.error('❌ System Error:', err);
        return false;
    }
}; 

app.post('/api/request-otp', async (req, res) => {
    try {
        const raw = (req.body.identifier || '').trim();
        if (!raw) {
            return res.status(400).json({ success: false, message: 'Email or mobile is required.' });
        }

        const isDoctorEmail = /@mlrit\.ac\.in$/i.test(raw);
        let emailToSend = null;

        if (isDoctorEmail) {
            const doc = await Doctor.findOne({ email: raw.toLowerCase() });
            if (!doc) {
                return res.status(403).json({
                    success: false,
                    message: 'Unknown doctor email. Login with your registered @mlrit.ac.in address only (no mobile).'
                });
            }
            emailToSend = raw.toLowerCase();
        } else {
            const digitsOnly = raw.replace(/\D/g, '');
            const looksLikeMobile = digitsOnly.length >= 10;
            const looksLikeEmail = raw.includes('@');
            
            if (!looksLikeEmail && looksLikeMobile) {
                // Mobile number - find worker's email
                const worker = await Worker.findOne({ mobile: raw });
                if (!worker || !worker.email) {
                    return res.status(404).json({
                        success: false,
                        message: 'Worker not found or email not registered.'
                    });
                }
                emailToSend = worker.email;
            } else if (looksLikeEmail) {
                emailToSend = raw;
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Use a valid mobile number or email for worker login.'
                });
            }
        }

        const otpKey = isDoctorEmail ? raw.toLowerCase() : raw;
        const otp = generateOtp();
        
        // Store OTP with 10-minute expiration
        otpStore[otpKey] = {
            code: otp,
            expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
        };

        const emailSent = await sendOtpEmail(emailToSend, otp);

        if (!emailSent) {
            delete otpStore[otpKey];
            return res.status(500).json({
                success: false,
                message: 'Failed to send OTP. Please try again.'
            });
        }

        res.json({ success: true, message: 'OTP sent to your email.' });
    } catch (err) {
        console.error('request-otp', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

app.post('/api/verify-otp', (req, res) => {
    const id = (req.body.identifier || '').trim();
    const { otp } = req.body;
    const key = /@mlrit\.ac\.in$/i.test(id) ? id.toLowerCase() : id;
    
    if (!otpStore[key]) {
        return res.status(400).json({ success: false, message: 'OTP not found. Request a new one.' });
    }

    if (Date.now() > otpStore[key].expiresAt) {
        delete otpStore[key];
        return res.status(400).json({ success: false, message: 'OTP has expired. Request a new one.' });
    }

    if (otpStore[key].code === otp) {
        delete otpStore[key];
        res.json({ success: true });
    } else {
        res.status(400).json({ success: false, message: 'Invalid OTP' });
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
        // simple validation: role must be 'doctor' and identifier must end with @mlrit.ac.in
        if (role !== 'doctor' || !identifier.endsWith('@mlrit.ac.in')) {
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
        if (role !== 'doctor' || !identifier.endsWith('@mlrit.ac.in')) {
            return res.status(403).json({ message: 'Forbidden: doctor access only.' });
        }

        const { id } = req.params;
        const allowed = ['name', 'gender', 'age', 'homeState', 'contactNumber', 'mobile', 'email', 'aadhar', 'asthma', 'knee_pain', 'leg_injury', 'appendicitis_history', 'hand_injury', 'headache_issue', 'eyesight_issue', 'chest_pain', 'heart_issue', 'kidney_issue', 'smoking', 'alcohol', 'can_work'];
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
        if (role !== 'doctor' || !identifier.endsWith('@mlrit.ac.in')) {
            return res.status(403).json({ message: 'Forbidden: doctor access only.' });
        }

        const allowed = ['name', 'gender', 'age', 'homeState', 'contactNumber', 'mobile', 'email', 'aadhar', 'asthma', 'knee_pain', 'leg_injury', 'appendicitis_history', 'hand_injury', 'headache_issue', 'eyesight_issue', 'chest_pain', 'heart_issue', 'kidney_issue', 'smoking', 'alcohol', 'can_work'];
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
        const pythonExe = process.env.PYTHON_EXECUTABLE || 'python';
        const modelUrl = process.env.MODEL_URL;
        const featuresUrl = process.env.FEATURES_URL;
        
        // Set environment variables for Python script
        const options = {
            pythonPath: pythonExe,
            args: [JSON.stringify(req.body)],
            env: {
                ...process.env,
                MODEL_URL: modelUrl,
                FEATURES_URL: featuresUrl
            }
        };
        
        // Call Python prediction script
        PythonShell.run('predict_model.py', options, (err, results) => {
            if (err) {
                console.error('❌ Python Execution Error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'AI Analysis failed',
                    error: err.message
                });
            }
            
            try {
                // Parse the JSON result from Python script
                const prediction = JSON.parse(results[0]);
                res.json({ success: true, results: prediction });
            } catch (parseErr) {
                console.error('❌ JSON Parse Error:', parseErr);
                res.status(500).json({
                    success: false,
                    message: 'Failed to parse AI response',
                    error: parseErr.message
                });
            }
        });
    } catch (error) {
        console.error('❌ Fitness Evaluation Error:', error.message);
        res.status(500).json({
            success: false,
            message: 'AI Analysis failed',
            error: error.message
        });
    }
});

// Health check endpoint for debugging
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Backend server is running',
        port: PORT,
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Privacy-Enabled Server running on port ${PORT}`);
    console.log(`✅ Server is accessible at http://localhost:${PORT}`);
    console.log(`✅ CORS enabled for all origins`);
    console.log(`📍 Available endpoints:`);
    console.log(`   - GET  /api/health (health check)`);
    console.log(`   - POST /api/request-otp`);
    console.log(`   - POST /api/verify-otp`);
    console.log(`   - GET  /api/workers/me/:identifier`);
    console.log(`   - GET  /api/workers`);
    console.log(`   - POST /api/workers`);
    console.log(`   - PUT  /api/workers/:id`);
    console.log(`   - POST /api/evaluate-fitness`);
});    