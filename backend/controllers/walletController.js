const pool = require('../db');

// Get wallet dashboard — unified for doctor and patient
const getWalletDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let balance = 0;

    if (role === 'doctor') {
      const { rows } = await pool.query('SELECT wallet_balance FROM doctors WHERE user_id = $1', [userId]);
      balance = rows[0]?.wallet_balance || 0;
    } else {
      const { rows } = await pool.query('SELECT wallet_balance FROM users WHERE id = $1', [userId]);
      balance = rows[0]?.wallet_balance || 0;
    }

    // Recent transactions
    const { rows: transactions } = await pool.query(
      `SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10`,
      [userId]
    );

    // Totals
    const { rows: [totals] } = await pool.query(
      `SELECT
        COALESCE(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 0) AS total_credits,
        COALESCE(SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END), 0) AS total_debits,
        COALESCE(SUM(CASE WHEN type = 'penalty' THEN ABS(amount) ELSE 0 END), 0) AS total_penalties
      FROM transactions WHERE user_id = $1`,
      [userId]
    );

    res.json({
      balance: parseFloat(balance),
      transactions,
      total_credits: parseFloat(totals.total_credits),
      total_debits: parseFloat(totals.total_debits),
      total_penalties: parseFloat(totals.total_penalties),
    });
  } catch (err) {
    console.error('Wallet dashboard error:', err.message);
    res.status(500).json({ message: 'Failed to load wallet' });
  }
};

// Get transaction history with pagination and filters
const getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const type = req.query.type;

    let query = 'SELECT * FROM transactions WHERE user_id = $1';
    const params = [userId];
    let paramIdx = 2;

    if (type) {
      query += ` AND type = $${paramIdx}`;
      params.push(type);
      paramIdx++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`;
    params.push(limit, offset);

    const { rows } = await pool.query(query, params);

    const { rows: [countResult] } = await pool.query(
      `SELECT COUNT(*) AS total FROM transactions WHERE user_id = $1${type ? ' AND type = $2' : ''}`,
      type ? [userId, type] : [userId]
    );

    res.json({
      transactions: rows,
      total: parseInt(countResult.total),
      page,
      limit,
    });
  } catch (err) {
    console.error('Transaction history error:', err.message);
    res.status(500).json({ message: 'Failed to load transactions' });
  }
};

// Process consultation payment (wallet-based)
const processConsultationPayment = async (req, res) => {
  const client = await pool.connect();
  try {
    const { appointmentId } = req.body;
    const patientUserId = req.user.id;

    await client.query('BEGIN');

    // Get appointment with doctor fee
    const { rows: [appt] } = await client.query(
      `SELECT a.*, d.consultation_fee, d.user_id AS doctor_user_id, d.id AS doc_id
       FROM appointments a
       JOIN doctors d ON d.id = a.doctor_id
       WHERE a.id = $1`,
      [appointmentId]
    );

    if (!appt) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const fee = parseFloat(appt.consultation_fee) || 0;

    // Deduct from patient wallet
    await client.query(
      'UPDATE users SET wallet_balance = wallet_balance - $1 WHERE id = $2',
      [fee, patientUserId]
    );

    const { rows: [patient] } = await client.query(
      'SELECT wallet_balance FROM users WHERE id = $1',
      [patientUserId]
    );

    // Patient transaction
    await client.query(
      `INSERT INTO transactions (user_id, type, amount, balance_after, description, reference_id, reference_type)
       VALUES ($1, 'consultation', $2, $3, $4, $5, 'appointment')`,
      [patientUserId, -fee, patient.wallet_balance, `Consultation fee for appointment #${appointmentId}`, appointmentId]
    );

    // Credit to doctor wallet
    await client.query(
      'UPDATE doctors SET wallet_balance = wallet_balance + $1, total_revenue = total_revenue + $1 WHERE id = $2',
      [fee, appt.doc_id]
    );

    const { rows: [doctor] } = await client.query(
      'SELECT wallet_balance FROM doctors WHERE id = $1',
      [appt.doc_id]
    );

    // Doctor transaction
    await client.query(
      `INSERT INTO transactions (user_id, type, amount, balance_after, description, reference_id, reference_type)
       VALUES ($1, 'consultation', $2, $3, $4, $5, 'appointment')`,
      [appt.doctor_user_id, fee, doctor.wallet_balance, `Consultation fee received for appointment #${appointmentId}`, appointmentId]
    );

    await client.query('COMMIT');

    res.json({ message: 'Payment processed successfully', balance: patient.wallet_balance });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Consultation payment error:', err.message);
    res.status(500).json({ message: 'Payment processing failed' });
  } finally {
    client.release();
  }
};

module.exports = { getWalletDashboard, getTransactionHistory, processConsultationPayment };
