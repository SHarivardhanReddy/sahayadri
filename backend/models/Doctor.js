const mongoose = require('mongoose');

/**
 * Institutional doctors: login with domain email only (no mobile stored).
 */
const DoctorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: /@doctor\.ac\.in$/i
    },
    hospital: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true }
});

module.exports = mongoose.model('Doctor', DoctorSchema);
