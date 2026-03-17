const axios = require('axios');

async function run() {
  try {
    const res = await axios.post('http://localhost:5000/api/debug-body', { name: 'SavedByDoctorDebug', age: 36, homeState: 'Kerala', mobile: '9000012352' }, {
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'doctor',
        'x-user-identifier': 'anil.kumar@doctor.ac.in'
      }
    });
    console.log('Status:', res.status);
    console.log('Body received by server:', JSON.stringify(res.data, null, 2));
  } catch (e) {
    if (e.response) {
      console.error('Status:', e.response.status);
      console.error('Data:', e.response.data);
    } else {
      console.error('Request error:', e.message);
    }
  }
}

run();
