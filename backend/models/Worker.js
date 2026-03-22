const mongoose = require('mongoose');

const WorkerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Male' },
    age: { type: Number, required: true },
    /** Job type from CSV import (e.g. construction); optional for manually created records */
    work: { type: String, required: false },
    homeState: { type: String, required: true },
    contactNumber: { type: String, required: true },
    email: { type: String, required: false },
    mobile: { type: String, required: false },
    aadhar: { type: String, default: "Not Provided" },
    // Stable health flags (booleans)
    asthma: { type: Boolean, default: false },
    knee_pain: { type: Boolean, default: false },
    leg_injury: { type: Boolean, default: false },
    appendicitis_history: { type: Boolean, default: false },
    hand_injury: { type: Boolean, default: false },
    headache_issue: { type: Boolean, default: false },
    eyesight_issue: { type: Boolean, default: false },
    chest_pain: { type: Boolean, default: false },
    heart_issue: { type: Boolean, default: false },
    kidney_issue: { type: Boolean, default: false },
    smoking: { type: Boolean, default: false },
    alcohol: { type: Boolean, default: false },
    can_work: { type: Boolean, default: true }
});

module.exports = mongoose.model('Worker', WorkerSchema);