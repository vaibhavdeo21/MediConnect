const http = require('http');

function req(method, path, data, token) {
  return new Promise((resolve) => {
    const body = data ? JSON.stringify(data) : null;
    const opts = {
      hostname: 'localhost', port: 5000, path, method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': 'Bearer ' + token } : {}),
        ...(body ? { 'Content-Length': Buffer.byteLength(body) } : {})
      }
    };
    const r = http.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ s: res.statusCode, b: d }));
    });
    r.on('error', e => resolve({ s: 0, b: e.message }));
    if (body) r.write(body);
    r.end();
  });
}

async function run() {
  // Login
  const login = await req('POST', '/api/auth/login', { email: 'apitest@test.com', password: 'Test@123' });
  const loginData = JSON.parse(login.b);
  const tok = loginData.token;
  console.log('LOGIN:', login.s, tok ? 'TOKEN OK' : 'NO TOKEN');

  // Run test endpoints
  const tests = [
    ['GET', '/api/users/profile', null, tok],
    ['GET', '/api/users/dashboard-stats', null, tok],
    ['GET', '/api/appointments/my-appointments', null, tok],
    ['GET', '/api/wallet/dashboard', null, tok],
    ['GET', '/api/notifications', null, tok],
    ['GET', '/api/notifications/unread-count', null, tok],
    ['GET', '/api/users/activity-logs', null, tok],
    ['GET', '/api/users/referral-data', null, tok],
    ['GET', '/api/doctors', null, null],
    ['GET', '/api/appointments/active-call', null, tok],
    ['GET', '/api/wallet/transactions', null, tok],
  ];

  for (const [m, p, d, t] of tests) {
    const r = await req(m, p, d, t);
    const preview = r.b.substring(0, 120);
    console.log(`${r.s === 200 ? '✅' : '❌'} ${m} ${p}: ${r.s} — ${preview}`);
  }

  // Test doctor list
  const docList = await req('GET', '/api/doctors', null, null);
  const docId = JSON.parse(docList.b)[0]?.id;
  console.log('\nFirst doctor ID:', docId);

  if (docId) {
    const book = await req('POST', '/api/appointments/book',
      { doctorId: docId, appointmentDate: '2026-07-15', appointmentTime: '10:00 AM', isEmergency: false },
      tok
    );
    console.log('BOOK APPOINTMENT:', book.s, book.b.substring(0, 150));
  }
}

run().catch(e => console.error('FATAL:', e.message));
