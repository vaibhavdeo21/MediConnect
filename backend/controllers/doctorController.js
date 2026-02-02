const pool = require('../db');

// --- 1. GET LOGGED-IN DOCTOR PROFILE ---
const getDoctorProfile = async (req, res) => {
  try {
    // req.user.id comes from the authMiddleware
    const doctor = await pool.query(
      'SELECT * FROM doctors WHERE user_id = $1',
      [req.user.id]
    );

    if (doctor.rows.length === 0) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }

    res.json(doctor.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// --- 2. UPDATE DOCTOR PROFILE ---
const updateDoctorProfile = async (req, res) => {
  const { full_name, specialization, consultation_fee, phone_number, experience_years, bio, address } = req.body;

  try {
    const updateQuery = `
      UPDATE doctors 
      SET full_name = $1, specialization = $2, consultation_fee = $3, 
          phone_number = $4, experience_years = $5, bio = $6, address = $7
      WHERE user_id = $8
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
      req.user.id
    ]);

    res.json({ message: "Profile Updated Successfully", doctor: updatedDoctor.rows[0] });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// --- 3. GET ALL DOCTORS (For Patients to see) ---
const getAllDoctors = async (req, res) => {
  try {
    const doctors = await pool.query('SELECT * FROM doctors ORDER BY id ASC');
    res.json(doctors.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

module.exports = { getDoctorProfile, updateDoctorProfile, getAllDoctors };