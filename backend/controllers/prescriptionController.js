const pool = require('../db');

// --- 1. ADD PRESCRIPTION (Doctor Only) ---
const addPrescription = async (req, res) => {
  const { appointmentId, medicines, instructions } = req.body;

  try {
    // Check if prescription already exists for this appointment
    const check = await pool.query("SELECT * FROM prescriptions WHERE appointment_id = $1", [appointmentId]);
    
    if (check.rows.length > 0) {
      // Update existing
      const updated = await pool.query(
        "UPDATE prescriptions SET medicines = $1, instructions = $2 WHERE appointment_id = $3 RETURNING *",
        [medicines, instructions, appointmentId]
      );
      return res.json(updated.rows[0]);
    }

    // Create new
    const newPrescription = await pool.query(
      "INSERT INTO prescriptions (appointment_id, medicines, instructions) VALUES ($1, $2, $3) RETURNING *",
      [appointmentId, medicines, instructions]
    );

    res.json(newPrescription.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// --- 2. GET PRESCRIPTION (Doctor & Patient) ---
const getPrescription = async (req, res) => {
  const { appointmentId } = req.params;

  try {
    const prescription = await pool.query(
      "SELECT * FROM prescriptions WHERE appointment_id = $1", 
      [appointmentId]
    );

    if (prescription.rows.length === 0) {
      return res.status(404).json({ message: "No prescription found" });
    }

    res.json(prescription.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

module.exports = { addPrescription, getPrescription };