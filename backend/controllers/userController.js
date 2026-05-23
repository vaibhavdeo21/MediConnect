const pool = require('../db');
const bcrypt = require('bcryptjs');

// --- 1. GET USER PROFILE ---
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let user;
    if (role === 'doctor') {
      user = await pool.query(
        "SELECT u.id, u.email, u.role, u.is_premium, d.full_name, d.specialization, d.consultation_fee, d.availability, d.phone_number, d.is_emergency, d.is_emergency_active FROM users u JOIN doctors d ON u.id = d.user_id WHERE u.id = $1",
        [userId]
      );
    } else {
      user = await pool.query(
        "SELECT u.id, u.email, u.role, u.is_premium, p.full_name, p.phone_number, p.address, p.dob FROM users u JOIN patients p ON u.id = p.user_id WHERE u.id = $1",
        [userId]
      );
    }

    if (user.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.rows[0]);
  } catch (err) {
    console.error("Get Profile Error:", err.message);
    res.status(500).send("Server Error");
  }
};

// --- 2. UPDATE USER PROFILE ---
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    let { full_name, phone_number, specialization, consultation_fee, availability, address, dob, is_emergency } = req.body;

    if (dob === "" || dob === " ") {
      dob = null;
    }

    let updatedUser;
    if (role === 'doctor') {
      updatedUser = await pool.query(
        "UPDATE doctors SET full_name = $1, phone_number = $2, specialization = $3, consultation_fee = $4, availability = $5, is_emergency = $6 WHERE user_id = $7 RETURNING *",
        [full_name, phone_number, specialization, consultation_fee, availability, is_emergency, userId]
      );
    } else {
      updatedUser = await pool.query(
        "UPDATE patients SET full_name = $1, phone_number = $2, address = $3, dob = $4 WHERE user_id = $5 RETURNING *",
        [full_name, phone_number, address, dob, userId]
      );
    }

    res.json({ message: "Profile Updated Successfully", user: updatedUser.rows[0] });
  } catch (err) {
    console.error("Update Profile Error:", err.message);
    res.status(500).send("Server Error");
  }
};

// --- 3. GET DASHBOARD STATS ---
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    let stats = {};

    if (role === 'doctor') {
      const doc = await pool.query("SELECT id FROM doctors WHERE user_id = $1", [userId]);
      if (doc.rows.length > 0) {
        const doctorId = doc.rows[0].id;
        const totalAppts = await pool.query("SELECT COUNT(*) FROM appointments WHERE doctor_id = $1", [doctorId]);
        const pending = await pool.query("SELECT COUNT(*) FROM appointments WHERE doctor_id = $1 AND status = 'Pending'", [doctorId]);
        const today = new Date().toISOString().split('T')[0];
        const todays = await pool.query("SELECT COUNT(*) FROM appointments WHERE doctor_id = $1 AND appointment_date = $2", [doctorId, today]);
        const uniquePatients = await pool.query("SELECT COUNT(DISTINCT patient_id) FROM appointments WHERE doctor_id = $1", [doctorId]);
        const revenue = await pool.query("SELECT COALESCE(wallet_balance, 0) as total_revenue FROM doctors WHERE id = $1", [doctorId]);

        stats = {
          total_appointments: totalAppts.rows[0].count,
          pending_requests: pending.rows[0].count,
          today_appointments: todays.rows[0].count,
          total_patients: uniquePatients.rows[0].count,
          total_revenue: parseFloat(revenue.rows[0]?.total_revenue || 0),
        };
      }
    } else {
      const pat = await pool.query("SELECT id FROM patients WHERE user_id = $1", [userId]);
      if (pat.rows.length > 0) {
        const patientId = pat.rows[0].id;
        const total = await pool.query("SELECT COUNT(*) FROM appointments WHERE patient_id = $1", [patientId]);
        const pending = await pool.query("SELECT COUNT(*) FROM appointments WHERE patient_id = $1 AND status = 'Pending'", [patientId]);
        const confirmed = await pool.query("SELECT COUNT(*) FROM appointments WHERE patient_id = $1 AND status = 'Confirmed'", [patientId]);

        stats = {
          total_appointments: total.rows[0].count,
          pending: pending.rows[0].count,
          confirmed: confirmed.rows[0].count
        };
      }
    }
    res.json(stats);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// --- 4. GET REFERRAL DATA ---
const getReferralData = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT referral_code, referral_count, is_premium FROM users WHERE id = $1",
      [req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

// --- 5. GET WALLET BALANCE ---
const getWalletBalance = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT wallet_balance, referral_count, is_premium FROM users WHERE id = $1",
      [req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch wallet data" });
  }
};

// --- 6. GET RECENT ACTIVITY LOGS ---
const getActivityLogs = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      "SELECT id, type, title, description, created_at FROM activity_logs WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5",
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Activity Logs Error:", err.message);
    res.status(500).json({ error: "Failed to fetch activity logs" });
  }
};

// --- 7. UPDATE EMERGENCY ACTIVE STATUS ---
const updateEmergencyStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { active } = req.body;

    const updatedDoctor = await pool.query(
      "UPDATE doctors SET is_emergency_active = $1 WHERE user_id = $2 RETURNING is_emergency_active",
      [active, userId]
    );

    if (updatedDoctor.rows.length === 0) {
      return res.status(404).json({ message: "Doctor record not found" });
    }

    res.json({
      message: `Emergency status set to ${active ? 'Online' : 'Offline'}`,
      active: updatedDoctor.rows[0].is_emergency_active
    });
  } catch (err) {
    console.error("Emergency Status Update Error:", err.message);
    res.status(500).send("Server Error");
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getDashboardStats,
  getReferralData,
  getWalletBalance,
  getActivityLogs,
  updateEmergencyStatus,
};