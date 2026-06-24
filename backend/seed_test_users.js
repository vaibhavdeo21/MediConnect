const pool = require('./db');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function setup() {
  // Create admin user
  const adminHash = await bcrypt.hash('Admin@123', 10);
  const admin = await pool.query(
    'INSERT INTO users (email, password_hash, full_name, role, referral_code) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO UPDATE SET role = $4 RETURNING id, email, role',
    ['admin@mediconnect.dev', adminHash, 'MediConnect Admin', 'admin', 'MC-ADMIN1']
  );
  console.log('Admin user:', admin.rows[0]);

  // Create a test doctor user with known password
  const docHash = await bcrypt.hash('Doctor@123', 10);
  const docUser = await pool.query(
    'INSERT INTO users (email, password_hash, full_name, role, referral_code) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO NOTHING RETURNING id',
    ['doctor@mediconnect.dev', docHash, 'Dr. Test Doctor', 'doctor', 'MC-DOC001']
  );

  if (docUser.rows.length > 0) {
    const docId = docUser.rows[0].id;
    await pool.query(
      'INSERT INTO doctors (user_id, full_name, specialization, consultation_fee, is_emergency) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (user_id) DO NOTHING',
      [docId, 'Dr. Test Doctor', 'General Physician', 500, false]
    );
    console.log('Test doctor created with user ID:', docId);
  } else {
    console.log('Doctor email already exists — skipped');
  }

  pool.end();
}

setup().catch(e => { console.error('Setup error:', e.message); pool.end(); });
