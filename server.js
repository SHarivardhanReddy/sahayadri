const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Worker = require('./models/Worker'); 
require('dotenv').config();

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB connected"))
    .catch(err => console.log("❌ DB Error:", err));

// --- ROUTES ---

// 1. GET all workers
app.get('/api/workers', async (req, res) => {
    try {
        const workers = await Worker.find();
        res.json(workers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. POST (Register) a new worker
app.post('/api/workers', async (req, res) => {
    try {
        console.log("Data received:", req.body); // This will show in your terminal
        const newWorker = new Worker(req.body);
        const savedWorker = await newWorker.save();
        res.status(201).json(savedWorker);
    } catch (err) {
        console.error("Post Error:", err.message);
        res.status(400).json({ error: err.message });
    }
});

// 3. Home Route
app.get('/', (req, res) => {
    res.send('Sahayadri Server is running!');
});

// UPDATE a worker record
app.get('/api/workers/:id', async (req, res) => {
    const worker = await Worker.findById(req.params.id);
    res.json(worker);
});

app.put('/api/workers/:id', async (req, res) => {
    try {
        const updatedWorker = await Worker.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true } // This returns the updated version
        );
        res.json(updatedWorker);
    } catch (err) {
        res.status(400).json({ error: "Update failed" });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});