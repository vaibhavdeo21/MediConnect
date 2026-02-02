const pool = require('../db');

// --- 1. ADD REVIEW (Patient Only) ---
const addReview = async (req, res) => {
  try {
    const { doctorId, rating, comment } = req.body;
    const userId = req.user.id; // User ID from token (we need to find Patient ID)

    // A. Find Patient ID
    const patientQuery = await pool.query("SELECT id FROM patients WHERE user_id = $1", [userId]);
    if (patientQuery.rows.length === 0) {
      return res.status(403).json({ message: "Only patients can leave reviews" });
    }
    const patientId = patientQuery.rows[0].id;

    // B. Check if already reviewed (Optional: limit 1 review per doctor?)
    // For now, let's allow multiple reviews (one per appointment ideally, but we'll keep it simple)

    // C. Insert Review
    const newReview = await pool.query(
      "INSERT INTO reviews (doctor_id, patient_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *",
      [doctorId, patientId, rating, comment]
    );

    res.json(newReview.rows[0]);

  } catch (err) {
    console.error("Add Review Error:", err.message);
    res.status(500).send("Server Error");
  }
};

// --- 2. GET DOCTOR REVIEWS ---
const getDoctorReviews = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const reviews = await pool.query(`
      SELECT r.id, r.rating, r.comment, r.created_at, p.full_name as patient_name
      FROM reviews r
      JOIN patients p ON r.patient_id = p.id
      WHERE r.doctor_id = $1
      ORDER BY r.created_at DESC
    `, [doctorId]);

    res.json(reviews.rows);

  } catch (err) {
    console.error("Fetch Reviews Error:", err.message);
    res.status(500).send("Server Error");
  }
};

module.exports = { addReview, getDoctorReviews };