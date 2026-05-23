const pool = require('./db');
require('dotenv').config();

async function test() {
  const userId = 5; // patient user

  // Test appointments query (the full query from appointmentController)
  try {
    const queryText = `
      SELECT a.id, a.appointment_date, a.appointment_time, a.status, a.is_emergency, 
             a.meeting_link, a.created_at, a.timeout_at, a.responded_at, a.response_time_seconds,
             a.rejection_reason, a.reassignment_count, a.doctor_id,
             p.full_name AS patient_name,
             u_p.is_premium AS is_patient_premium,
             d.full_name AS doctor_name,
             d.address,
             p.phone_number AS patient_phone
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      JOIN patients p ON a.patient_id = p.id
      JOIN users u_p ON p.user_id = u_p.id
      WHERE p.user_id = $1
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
    `;
    const r = await pool.query(queryText, [userId]);
    console.log('Appointments OK, rows:', r.rows.length);
  } catch(e) {
    console.error('Appointments ERROR:', e.message);
  }

  // Test wallet dashboard  
  try {
    const r = await pool.query('SELECT wallet_balance FROM users WHERE id = $1', [userId]);
    console.log('User wallet OK:', r.rows[0]);
  } catch(e) {
    console.error('Wallet user ERROR:', e.message);
  }

  // Test transactions table
  try {
    const r = await pool.query('SELECT COUNT(*) FROM transactions WHERE user_id = $1', [userId]);
    console.log('Transactions count OK:', r.rows[0]);
  } catch(e) {
    console.error('Transactions ERROR:', e.message);
  }

  // Test notifications table
  try {
    const r = await pool.query('SELECT COUNT(*) FROM notifications WHERE user_id = $1', [userId]);
    console.log('Notifications count OK:', r.rows[0]);
  } catch(e) {
    console.error('Notifications ERROR:', e.message);
  }

  // Test admin dashboard query
  try {
    const r = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM users) AS total_users,
        (SELECT COUNT(*) FROM appointments WHERE is_emergency = TRUE AND status = 'Pending') AS active_emergencies,
        (SELECT COUNT(*) FROM doctors WHERE is_online = TRUE) AS online_doctors,
        (SELECT COUNT(*) FROM emergency_violations) AS total_violations,
        (SELECT COALESCE(AVG(response_rate_percentage), 100) FROM doctor_metrics) AS avg_response_rate
    `);
    console.log('Admin dashboard OK:', r.rows[0]);
  } catch(e) {
    console.error('Admin dashboard ERROR:', e.message);
  }

  // Test getAllUsers query (check if users has full_name column)
  try {
    const r = await pool.query('SELECT column_name FROM information_schema.columns WHERE table_name = $1 ORDER BY ordinal_position', ['users']);
    console.log('Users columns:', r.rows.map(x => x.column_name).join(', '));
  } catch(e) {
    console.error('Schema check ERROR:', e.message);
  }

  // Test transactions join in financial analytics
  try {
    const r = await pool.query(`
      SELECT t.id, u.email FROM transactions t
      JOIN users u ON u.id = t.user_id
      ORDER BY t.created_at DESC LIMIT 5
    `);
    console.log('Financial analytics query OK, rows:', r.rows.length);
  } catch(e) {
    console.error('Financial analytics ERROR:', e.message);
  }

  pool.end();
}
test().catch(e => { console.error('FATAL:', e.message); pool.end(); });
