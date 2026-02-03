const sendEmail = require('../utils/emailService');
const pool = require('../db');

// --- 1. BOOK APPOINTMENT (With Email & Activity Logging) ---
const bookAppointment = async (req, res) => {
  const { doctorId, appointmentDate, appointmentTime } = req.body;
  const userId = req.user.id; 

  try {
    // A. Check/Create Patient
    let patientQuery = await pool.query("SELECT id, full_name FROM patients WHERE user_id = $1", [userId]);
    let patientId;
    let patientName;

    if (patientQuery.rows.length > 0) {
      patientId = patientQuery.rows[0].id;
      patientName = patientQuery.rows[0].full_name;
    } else {
      const userDetails = await pool.query("SELECT full_name, phone_number FROM users WHERE id = $1", [userId]);
      patientName = userDetails.rows[0]?.full_name || 'Valued Patient';
      const userPhone = userDetails.rows[0]?.phone_number || '';
      const newPatient = await pool.query(
        "INSERT INTO patients (user_id, full_name, phone_number) VALUES ($1, $2, $3) RETURNING id",
        [userId, patientName, userPhone]
      );
      patientId = newPatient.rows[0].id;
    }

    // B. Insert Appointment
    const newAppointment = await pool.query(
      `INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, status) 
       VALUES ($1, $2, $3, $4, 'Pending') RETURNING *`,
      [patientId, doctorId, appointmentDate, appointmentTime]
    );

    // C. Get Doctor Details for Email & Logging
    const doctorUser = await pool.query(
      "SELECT u.email, d.full_name FROM doctors d JOIN users u ON d.user_id = u.id WHERE d.id = $1",
      [doctorId]
    );

    if (doctorUser.rows.length > 0) {
      const doctorEmail = doctorUser.rows[0].email;
      const doctorName = doctorUser.rows[0].full_name;

      // --- LOG ACTIVITY FOR PATIENT ---
      await pool.query(
        "INSERT INTO activity_logs (user_id, type, title, description) VALUES ($1, $2, $3, $4)",
        [
          userId, 
          'appointment_confirmed', // Matches dashboard icon logic
          'Appointment Requested', 
          `You requested a session with Dr. ${doctorName} for ${appointmentDate}`
        ]
      );

      // Email Logic
      const emailSubject = `New Appointment Request from ${patientName}`;
      const emailBody = `
        <h3>Hello Dr. ${doctorName},</h3>
        <p>You have a new appointment request.</p>
        <ul>
          <li><strong>Patient:</strong> ${patientName}</li>
          <li><strong>Date:</strong> ${appointmentDate}</li>
          <li><strong>Time:</strong> ${appointmentTime}</li>
        </ul>
        <p>Please login to your dashboard to Accept or Decline.</p>
      `;
      sendEmail(doctorEmail, emailSubject, emailBody);
    }

    res.json(newAppointment.rows[0]);

  } catch (err) {
    console.error("Booking Error:", err.message);
    res.status(500).send("Server Error");
  }
};

// --- 2. UPDATE STATUS (With Email & Activity Logging) ---
const updateAppointmentStatus = async (req, res) => {
  const { id } = req.params; 
  const { status } = req.body; 

  try {
    const updatedAppt = await pool.query(
      "UPDATE appointments SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );

    if (updatedAppt.rows.length === 0) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const apptDetails = await pool.query(`
      SELECT u.id as user_id, u.email, p.full_name, d.full_name as doctor_name, a.appointment_date, a.appointment_time
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN users u ON p.user_id = u.id
      JOIN doctors d ON a.doctor_id = d.id
      WHERE a.id = $1
    `, [id]);

    if (apptDetails.rows.length > 0) {
      const { user_id, email, full_name, doctor_name, appointment_date, appointment_time } = apptDetails.rows[0];
      
      // --- LOG ACTIVITY FOR PATIENT ---
      await pool.query(
        "INSERT INTO activity_logs (user_id, type, title, description) VALUES ($1, $2, $3, $4)",
        [
          user_id,
          status === 'Confirmed' ? 'appointment_confirmed' : 'alert',
          `Appointment ${status}`,
          `Your visit with Dr. ${doctor_name} has been ${status.toLowerCase()}.`
        ]
      );

      // Email Logic
      const emailSubject = `Appointment ${status}: Dr. ${doctor_name}`;
      const color = status === 'Confirmed' ? 'green' : 'red';
      
      const emailBody = `
        <h3>Hello ${full_name},</h3>
        <p>Your appointment with <strong>Dr. ${doctor_name}</strong> has been <strong style="color:${color}">${status}</strong>.</p>
        <p><strong>When:</strong> ${new Date(appointment_date).toDateString()} at ${appointment_time}</p>
        ${status === 'Confirmed' ? '<p>Please login at the scheduled time to join the video call.</p>' : '<p>Please contact the clinic for more details.</p>'}
      `;

      sendEmail(email, emailSubject, emailBody);
    }

    res.json(updatedAppt.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

const getMyAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role; 

    let queryText = `
      SELECT a.id, a.appointment_date, a.appointment_time, a.status, 
             a.doctor_id,
             p.full_name AS patient_name,
             u_p.is_premium AS is_patient_premium,
             d.full_name AS doctor_name,
             d.address,
             p.phone_number AS patient_phone
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      JOIN patients p ON a.patient_id = p.id
      JOIN users u_p ON p.user_id = u_p.id
    `;

    if (role === 'doctor') {
      queryText += ` WHERE d.user_id = $1`;
      queryText += ` ORDER BY a.status = 'Pending' DESC, u_p.is_premium DESC, a.appointment_date, a.appointment_time`;
    } else {
      queryText += ` WHERE p.user_id = $1`;
      queryText += ` ORDER BY a.appointment_date, a.appointment_time`;
    }

    const appointments = await pool.query(queryText, [userId]);
    res.json(appointments.rows);

  } catch (err) {
    console.error("Fetch Error:", err.message);
    res.status(500).send("Server Error");
  }
};

module.exports = { bookAppointment, getMyAppointments, updateAppointmentStatus };