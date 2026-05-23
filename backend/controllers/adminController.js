const pool = require('../db');
const { emitToUser } = require('../socketManager');

// Admin dashboard stats
const getAdminDashboard = async (req, res) => {
  try {
    const { rows: [stats] } = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM users) AS total_users,
        (SELECT COUNT(*) FROM users WHERE role = 'doctor') AS total_doctors,
        (SELECT COUNT(*) FROM users WHERE role = 'patient') AS total_patients,
        (SELECT COUNT(*) FROM appointments) AS total_appointments,
        (SELECT COALESCE(SUM(wallet_balance), 0) FROM doctors WHERE wallet_balance > 0) AS total_revenue,
        (SELECT COALESCE(SUM(ABS(amount)), 0) FROM transactions WHERE type = 'penalty') AS total_penalties,
        (SELECT COUNT(*) FROM appointments WHERE is_emergency = TRUE AND status = 'Pending') AS active_emergencies,
        (SELECT COUNT(*) FROM doctors WHERE is_online = TRUE) AS online_doctors,
        (SELECT COUNT(*) FROM appointments WHERE appointment_date = CURRENT_DATE) AS today_appointments,
        (SELECT COUNT(*) FROM users WHERE created_at >= NOW() - INTERVAL '7 days') AS new_users_week,
        (SELECT COUNT(*) FROM emergency_violations) AS total_violations,
        (SELECT COALESCE(AVG(response_rate_percentage), 100) FROM doctor_metrics) AS avg_response_rate
    `);

    res.json(stats);
  } catch (err) {
    console.error('Admin dashboard error:', err.message);
    res.status(500).json({ message: 'Failed to load admin dashboard' });
  }
};

// Get all doctor metrics with rankings
const getAllDoctorMetrics = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT d.id, d.full_name, d.specialization, d.wallet_balance, d.warning_count,
             d.is_online, d.is_emergency_active, d.reliability_score,
             COALESCE(dm.total_emergency_requests, 0) AS total_emergency_requests,
             COALESCE(dm.accepted_count, 0) AS accepted_count,
             COALESCE(dm.rejected_count, 0) AS rejected_count,
             COALESCE(dm.timeout_count, 0) AS timeout_count,
             COALESCE(dm.avg_response_time_seconds, 0) AS avg_response_time,
             COALESCE(dm.response_rate_percentage, 100) AS response_rate,
             COALESCE(dm.total_penalties, 0) AS total_penalties,
             COALESCE(dm.total_penalty_amount, 0) AS total_penalty_amount,
             dm.last_violation_at
      FROM doctors d
      LEFT JOIN doctor_metrics dm ON dm.doctor_id = d.id
      ORDER BY d.reliability_score DESC, d.warning_count ASC
    `);

    res.json(rows);
  } catch (err) {
    console.error('Doctor metrics error:', err.message);
    res.status(500).json({ message: 'Failed to load doctor metrics' });
  }
};

// Get penalty history for a doctor
const getDoctorPenaltyHistory = async (req, res) => {
  try {
    const { doctorId } = req.params;

    // Get doctor's user_id
    const { rows: [doctor] } = await pool.query('SELECT user_id FROM doctors WHERE id = $1', [doctorId]);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    const { rows } = await pool.query(
      `SELECT t.*, a.appointment_date, a.is_emergency, p.full_name AS patient_name
       FROM transactions t
       LEFT JOIN appointments a ON a.id = t.reference_id AND t.reference_type = 'appointment'
       LEFT JOIN patients p ON p.id = a.patient_id
       WHERE t.user_id = $1 AND t.type = 'penalty'
       ORDER BY t.created_at DESC`,
      [doctor.user_id]
    );

    res.json(rows);
  } catch (err) {
    console.error('Penalty history error:', err.message);
    res.status(500).json({ message: 'Failed to load penalty history' });
  }
};

// Reverse a penalty
const reversePenalty = async (req, res) => {
  const client = await pool.connect();
  try {
    const { transactionId } = req.params;
    const { reason } = req.body;
    const adminId = req.user.id;

    await client.query('BEGIN');

    // Get the transaction
    const { rows: [txn] } = await client.query(
      'SELECT * FROM transactions WHERE id = $1 AND type = $2 AND reversed = FALSE',
      [transactionId, 'penalty']
    );

    if (!txn) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Penalty not found or already reversed' });
    }

    const refundAmount = Math.abs(txn.amount);

    // Mark original as reversed
    await client.query(
      'UPDATE transactions SET reversed = TRUE, reversed_by = $1, reversed_at = NOW() WHERE id = $2',
      [adminId, transactionId]
    );

    // Credit back to doctor wallet
    const { rows: [doctor] } = await client.query(
      'SELECT id, wallet_balance FROM doctors WHERE user_id = $1',
      [txn.user_id]
    );

    await client.query(
      'UPDATE doctors SET wallet_balance = wallet_balance + $1 WHERE user_id = $2',
      [refundAmount, txn.user_id]
    );

    const newBalance = parseFloat(doctor.wallet_balance) + refundAmount;

    // Create refund transaction
    await client.query(
      `INSERT INTO transactions (user_id, type, amount, balance_after, description, reference_id, reference_type, created_by)
       VALUES ($1, 'refund', $2, $3, $4, $5, 'transaction', 'admin')`,
      [txn.user_id, refundAmount, newBalance,
        `Penalty reversal by admin: ${reason || 'No reason provided'}`, transactionId]
    );

    // Admin audit log
    await client.query(
      `INSERT INTO admin_audit_logs (admin_id, action_type, target_type, target_id, details)
       VALUES ($1, 'penalty_reversal', 'transaction', $2, $3)`,
      [adminId, transactionId, JSON.stringify({ reason, refundAmount, doctorUserId: txn.user_id })]
    );

    // Notify doctor
    await client.query(
      `INSERT INTO notifications (user_id, type, title, message, priority, data) VALUES ($1, $2, $3, $4, $5, $6)`,
      [txn.user_id, 'penalty_reversed', '✅ Penalty Reversed',
        `₹${refundAmount} penalty has been reversed and credited back to your wallet.`, 'high',
        JSON.stringify({ amount: refundAmount, reason })]
    );

    emitToUser(txn.user_id, 'wallet:update', { balance: newBalance, type: 'refund' });

    await client.query('COMMIT');

    res.json({ message: 'Penalty reversed successfully', refundAmount, newBalance });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Reverse penalty error:', err.message);
    res.status(500).json({ message: 'Failed to reverse penalty' });
  } finally {
    client.release();
  }
};

// Financial analytics
const getFinancialAnalytics = async (req, res) => {
  try {
    const { rows: [analytics] } = await pool.query(`
      SELECT
        COALESCE(SUM(CASE WHEN type = 'subscription' THEN amount ELSE 0 END), 0) AS subscription_revenue,
        COALESCE(SUM(CASE WHEN type = 'penalty' THEN ABS(amount) ELSE 0 END), 0) AS total_penalties,
        COALESCE(SUM(CASE WHEN type = 'refund' THEN amount ELSE 0 END), 0) AS total_refunds,
        COALESCE(SUM(CASE WHEN type = 'consultation' AND amount > 0 THEN amount ELSE 0 END), 0) AS consultation_revenue,
        COUNT(*) AS total_transactions
      FROM transactions
    `);

    // Recent transactions
    const { rows: recent } = await pool.query(
      `SELECT t.*, u.full_name, u.email FROM transactions t
       JOIN users u ON u.id = t.user_id
       ORDER BY t.created_at DESC LIMIT 20`
    );

    res.json({ ...analytics, recent_transactions: recent });
  } catch (err) {
    console.error('Financial analytics error:', err.message);
    res.status(500).json({ message: 'Failed to load analytics' });
  }
};

// Get all users with pagination
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const role = req.query.role;
    const search = req.query.search;

    let query = `SELECT u.id, u.email, u.full_name, u.role, u.is_premium, u.wallet_balance, u.created_at,
                         u.last_login_at, u.referral_count
                 FROM users u WHERE 1=1`;
    const params = [];
    let idx = 1;

    if (role) {
      query += ` AND u.role = $${idx}`;
      params.push(role);
      idx++;
    }

    if (search) {
      query += ` AND (u.full_name ILIKE $${idx} OR u.email ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }

    query += ` ORDER BY u.created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`;
    params.push(limit, offset);

    const { rows } = await pool.query(query, params);

    res.json({ users: rows, page, limit });
  } catch (err) {
    console.error('Get all users error:', err.message);
    res.status(500).json({ message: 'Failed to load users' });
  }
};

module.exports = {
  getAdminDashboard,
  getAllDoctorMetrics,
  getDoctorPenaltyHistory,
  reversePenalty,
  getFinancialAnalytics,
  getAllUsers,
};
