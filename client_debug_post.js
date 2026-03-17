const fetch = global.fetch || require('node-fetch');

async function run() {
  try {
    const res = await fetch('http://localhost:5000/api/debug-body', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'doctor',
        'x-user-identifier': 'anil.kumar@doctor.ac.in'
      },
      body: JSON.stringify({ name: 'SavedByDoctorDebug', age: 36, homeState: 'Kerala', mobile: '9000012352' })
    });
    const json = await res.json();
    console.log('Status:', res.status);
    console.log('Body received by server:', JSON.stringify(json, null, 2));
  } catch (e) {
    console.error('Request error:', e);
  }
}

run();
