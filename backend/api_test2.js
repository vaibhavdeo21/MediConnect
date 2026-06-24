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
  // Test doctor login
  const docLogin = await req('POST', '/api/auth/login', { email: 'arpit@mediconnect.dev', password: 'Doctor@123' });
  console.log('DOCTOR LOGIN:', docLogin.s, docLogin.b.substring(0, 120));
  let docTok = null;
  try { docTok = JSON.parse(docLogin.b).token; } catch(e) {}

  if (docTok) {
    const docTests = [
      ['GET', '/api/users/profile', null, docTok],
      ['GET', '/api/users/dashboard-stats', null, docTok],
      ['GET', '/api/appointments/my-appointments', null, docTok],
      ['GET', '/api/wallet/dashboard', null, docTok],
    ];
    for (const [m, p, d, t] of docTests) {
      const r = await req(m, p, d, t);
      console.log(`${r.s === 200 ? '✅' : '❌'} DOCTOR ${m} ${p}: ${r.s} — ${r.b.substring(0, 100)}`);
    }
    
    // Test emergency status toggle
    const emgStatus = await req('PUT', '/api/users/emergency-status', { active: true }, docTok);
    console.log('EMERGENCY STATUS:', emgStatus.s, emgStatus.b.substring(0, 100));
  }

  // Test forgot password
  const forgot = await req('POST', '/api/auth/forgot-password', { email: 'apitest@test.com' });
  console.log('FORGOT PASSWORD:', forgot.s, forgot.b.substring(0, 100));

  // Test patient token
  const login = await req('POST', '/api/auth/login', { email: 'apitest@test.com', password: 'Test@123' });
  const tok = JSON.parse(login.b).token;

  // Test update profile
  const updateProfile = await req('PUT', '/api/users/profile', { full_name: 'API Patient Test', phone_number: '9999999999', address: 'Test City' }, tok);
  console.log('UPDATE PROFILE:', updateProfile.s, updateProfile.b.substring(0, 100));

  // Test appointment status update
  const appts = await req('GET', '/api/appointments/my-appointments', null, tok);
  const apptList = JSON.parse(appts.b);
  console.log('APPOINTMENTS COUNT:', apptList.length);
  
  if (apptList.length > 0) {
    const apptId = apptList[0].id;
    const deleteAppt = await req('DELETE', `/api/appointments/${apptId}`, null, tok);
    console.log('DELETE APPOINTMENT:', deleteAppt.s, deleteAppt.b.substring(0, 100));
  }

  // Test admin dashboard (with admin credentials)
  const adminLogin = await req('POST', '/api/auth/login', { email: 'admin@mediconnect.dev', password: 'Admin@123' });
  console.log('ADMIN LOGIN:', adminLogin.s, adminLogin.b.substring(0, 100));
  let adminTok = null;
  try { adminTok = JSON.parse(adminLogin.b).token; } catch(e) {}

  if (adminTok) {
    const adminDash = await req('GET', '/api/admin/dashboard', null, adminTok);
    console.log('ADMIN DASHBOARD:', adminDash.s, adminDash.b.substring(0, 200));

    const allUsers = await req('GET', '/api/admin/users', null, adminTok);
    console.log('ADMIN ALL USERS:', allUsers.s, allUsers.b.substring(0, 100));

    const docMetrics = await req('GET', '/api/admin/doctor-metrics', null, adminTok);
    console.log('ADMIN DOCTOR METRICS:', docMetrics.s, docMetrics.b.substring(0, 100));

    const financials = await req('GET', '/api/admin/financial-analytics', null, adminTok);
    console.log('ADMIN FINANCIALS:', financials.s, financials.b.substring(0, 100));
  }
}

run().catch(e => console.error('FATAL:', e.message));
