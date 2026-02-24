const mongoose = require('mongoose');

const WorkerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    homeState: { type: String, required: true },
    contactNumber: { type: String, required: true },
    email: { type: String, required: false },
    mobile: { type: String, required: false },
    healthHistory: { type: String },
    aadhar: { type: String, default: "Not Provided" } 
});

module.exports = mongoose.model('Worker', WorkerSchema);