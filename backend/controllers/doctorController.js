const pool = require('../db');

// --- 1. GET LOGGED-IN DOCTOR PROFILE ---
const getDoctorProfile = async (req, res) => {
  try {
    // UPDATED: Added is_emergency to SELECT
    const doctor = await pool.query('SELECT * FROM doctors WHERE user_id = $1', [req.user.id]);
    if (doctor.rows.length === 0) return res.status(404).json({ message: "Doctor profile not found" });
    res.json(doctor.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// --- 2. UPDATE DOCTOR PROFILE ---
const updateDoctorProfile = async (req, res) => {
  // ADDED: is_emergency
  const { full_name, specialization, consultation_fee, phone_number, experience_years, bio, address, availability, is_emergency } = req.body;

  try {
    const updateQuery = `
      UPDATE doctors 
      SET full_name = $1, specialization = $2, consultation_fee = $3, 
          phone_number = $4, experience_years = $5, bio = $6, address = $7, availability = $8, is_emergency = $9
      WHERE user_id = $10
      RETURNING *;
    `;

    const updatedDoctor = await pool.query(updateQuery, [
      full_name, 
      specialization, 
      consultation_fee, 
      phone_number, 
      experience_years, 
      bio, 
      address, 
      availability,
      is_emergency, // New Field
      req.user.id
    ]);

    res.json({ message: "Profile Updated Successfully", doctor: updatedDoctor.rows[0] });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// --- 3. GET ALL DOCTORS ---
const getAllDoctors = async (req, res) => {
  try {
    // Ensure is_emergency is returned for the frontend listing
    const doctors = await pool.query('SELECT * FROM doctors ORDER BY id ASC');
    res.json(doctors.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

const getDoctorWallet = async (req, res) => {
  try {
    const userId = req.user.id;

    const balanceResult = await pool.query(
      'SELECT wallet_balance FROM users WHERE id = $1', 
      [userId]
    );

    const transactionsResult = await pool.query(
      'SELECT id, amount, type, description, created_at as date FROM transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20',
      [userId]
    );

    res.json({
      balance: balanceResult.rows[0]?.wallet_balance || 0,
      transactions: transactionsResult.rows
    });

  } catch (err) {
    console.error("Wallet Sync Error:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { getDoctorProfile, updateDoctorProfile, getAllDoctors, getDoctorWallet };