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
module.exports = { getUserProfile, updateUserProfile };