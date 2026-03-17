const fetch = global.fetch || require('node-fetch');

async function run() {
  try {
    const res = await fetch('http://localhost:5000/api/workers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'doctor',
        'x-user-identifier': 'anil.kumar@doctor.ac.in'
      },
      body: JSON.stringify({ name: 'SavedByDoctorClient', age: 35, homeState: 'Kerala', mobile: '9000012351' })
    });
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Response:', text);
  } catch (e) {
    console.error('Request error:', e);
  }
}

run();
