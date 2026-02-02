const pool = require('../db');

// --- 1. BOOK APPOINTMENT CONTROLLER ---
const bookAppointment = async (req, res) => {
  console.log("--- STARTING BOOKING PROCESS ---"); 
  const { doctorId, appointmentDate, appointmentTime } = req.body;
  const userId = req.user.id; 

  try {
    // A. CHECK IF USER EXISTS IN PATIENTS TABLE
    let patientQuery = await pool.query("SELECT * FROM patients WHERE user_id = $1", [userId]);
    let patientId;

    if (patientQuery.rows.length > 0) {
      patientId = patientQuery.rows[0].id;
    } else {
      console.log("Patient Not Found. Auto-Creating...");
      // GET USER DETAILS
      const userDetails = await pool.query("SELECT full_name, phone_number FROM users WHERE id = $1", [userId]);
      const userName = userDetails.rows[0]?.full_name || 'New Patient';
      const userPhone = userDetails.rows[0]?.phone_number || '0000000000';

      // B. CREATE PATIENT
      const newPatient = await pool.query(
        "INSERT INTO patients (user_id, full_name, phone_number) VALUES ($1, $2, $3) RETURNING id",
        [userId, userName, userPhone]
      );
      patientId = newPatient.rows[0].id;
    }

    // C. INSERT APPOINTMENT
    const newAppointment = await pool.query(
      `INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, status) 
       VALUES ($1, $2, $3, $4, 'Pending') RETURNING *`,
      [patientId, doctorId, appointmentDate, appointmentTime]
    );

    res.json(newAppointment.rows[0]);

  } catch (err) {
    console.error("SERVER ERROR:", err.message);
    res.status(500).send("Server Error: " + err.message);
  }
};

// --- 2. GET MY APPOINTMENTS CONTROLLER ---
const getMyAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role; 

    let query = "";
    let queryParams = [userId];

    if (role === 'doctor') {
      // If Doctor: Show patients
      query = `
        SELECT a.id, a.appointment_date, a.appointment_time, a.status, p.full_name AS patient_name 
        FROM appointments a
        JOIN doctors d ON a.doctor_id = d.id
        JOIN patients p ON a.patient_id = p.id
        WHERE d.user_id = $1
        ORDER BY a.appointment_date, a.appointment_time`;
    } else {
      // If Patient: Show doctors
      query = `
        SELECT a.id, a.appointment_date, a.appointment_time, a.status, d.full_name AS doctor_name, d.address
        FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        JOIN doctors d ON a.doctor_id = d.id
        WHERE p.user_id = $1
        ORDER BY a.appointment_date, a.appointment_time`;
    }

    const appointments = await pool.query(query, queryParams);
    res.json(appointments.rows);

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
const updateAppointmentStatus = async (req, res) => {
  const { id } = req.params; // Appointment ID
  const { status } = req.body; // 'Confirmed' or 'Cancelled'

  try {
    const updatedAppt = await pool.query(
      "UPDATE appointments SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );

    if (updatedAppt.rows.length === 0) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json(updatedAppt.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
module.exports = { bookAppointment, getMyAppointments, updateAppointmentStatus };