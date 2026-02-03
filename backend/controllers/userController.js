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
        "SELECT u.id, u.email, u.role, d.full_name, d.specialization, d.consultation_fee, d.availability, d.phone_number FROM users u JOIN doctors d ON u.id = d.user_id WHERE u.id = $1",
        [userId]
      );
    } else {
      user = await pool.query(
        "SELECT u.id, u.email, u.role, p.full_name, p.phone_number, p.address, p.dob FROM users u JOIN patients p ON u.id = p.user_id WHERE u.id = $1",
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
// --- 2. UPDATE USER PROFILE ---
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    // Get values from body
    let { full_name, phone_number, specialization, consultation_fee, availability, address, dob } = req.body;

    // --- FIX: Prevent Crash on Empty Date ---
    if (dob === "" || dob === " ") {
      dob = null;
    }

    let updatedUser;
    
    if (role === 'doctor') {
      updatedUser = await pool.query(
        "UPDATE doctors SET full_name = $1, phone_number = $2, specialization = $3, consultation_fee = $4, availability = $5 WHERE user_id = $6 RETURNING *",
        [full_name, phone_number, specialization, consultation_fee, availability, userId]
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

// --- GET DASHBOARD STATS ---
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    let stats = {};

    if (role === 'doctor') {
      // 1. Get Doctor ID
      const doc = await pool.query("SELECT id FROM doctors WHERE user_id = $1", [userId]);
      if (doc.rows.length > 0) {
        const doctorId = doc.rows[0].id;

        // 2. Run Counts
        const totalAppts = await pool.query(
          "SELECT COUNT(*) FROM appointments WHERE doctor_id = $1", 
          [doctorId]
        );
        
        const pending = await pool.query(
          "SELECT COUNT(*) FROM appointments WHERE doctor_id = $1 AND status = 'Pending'", 
          [doctorId]
        );

        // Get Today's Date in YYYY-MM-DD
        const today = new Date().toISOString().split('T')[0];
        const todays = await pool.query(
          "SELECT COUNT(*) FROM appointments WHERE doctor_id = $1 AND appointment_date = $2", 
          [doctorId, today]
        );

        const uniquePatients = await pool.query(
            "SELECT COUNT(DISTINCT patient_id) FROM appointments WHERE doctor_id = $1",
            [doctorId]
        );

        stats = {
          total_appointments: totalAppts.rows[0].count,
          pending_requests: pending.rows[0].count,
          today_appointments: todays.rows[0].count,
          total_patients: uniquePatients.rows[0].count
        };
      }
    } else {
      // PATIENT STATS
      const pat = await pool.query("SELECT id FROM patients WHERE user_id = $1", [userId]);
      if (pat.rows.length > 0) {
        const patientId = pat.rows[0].id;

        const total = await pool.query(
          "SELECT COUNT(*) FROM appointments WHERE patient_id = $1", 
          [patientId]
        );

        const pending = await pool.query(
            "SELECT COUNT(*) FROM appointments WHERE patient_id = $1 AND status = 'Pending'", 
            [patientId]
          );

        const confirmed = await pool.query(
          "SELECT COUNT(*) FROM appointments WHERE patient_id = $1 AND status = 'Confirmed'", 
          [patientId]
        );

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
module.exports = { getUserProfile, updateUserProfile, getDashboardStats };