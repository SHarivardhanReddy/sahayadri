require('dotenv').config();
const mongoose = require('mongoose');
const Worker = require('./models/Worker');

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Mongoose connected');

    const payload = {
      name: 'MongooseInsertTest',
      age: 30,
      homeState: 'Karnataka',
      contactNumber: '9000023456',
      mobile: '9000023456',
      email: 'test.doctor@doctor.ac.in',
      healthHistory: 'Fit',
      aadhar: '1111-2222-3333'
    };

    try {
      const created = await Worker.create(payload);
      console.log('Created via Mongoose:', created);
    } catch (e) {
      console.error('Worker.create error:', e);
    }

    try {
      const result = await Worker.collection.insertOne(payload);
      console.log('Native insert result:', result.insertedId);
    } catch (e) {
      console.error('Native collection insert error:', e);
    }

    process.exit(0);
  } catch (err) {
    console.error('Connection error:', err);
    process.exit(1);
  }
}

run();
